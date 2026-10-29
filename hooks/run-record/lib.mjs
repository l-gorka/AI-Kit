// Builds a run record from Claude Code session transcripts and validates it
// against schema.json. Pure functions only: no I/O, so tests can feed fixtures.
//
// The transcript format is not a documented API. Every field read here is
// optional; a missing field yields null plus a warning, never an exception.

export const SCHEMA_VERSION = 1;

// Price ratios relative to the input-token price, used only to split a
// model's reported cost between the main thread and its subagents.
const COST_WEIGHTS = { input: 1, output: 5, cache_read: 0.1, cache_write_5m: 1.25, cache_write_1h: 2 };

// A cost-state entry this much older than the last transcript entry is stale.
const STALE_COST_MS = 60_000;

const SUMMARY_FENCE = /```run-summary[^\n]*\n([\s\S]*?)```/g;

export function parseJsonl(text) {
  const entries = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      // A torn last line (the session is still writing) is skipped.
    }
  }
  return entries;
}

function emptyTokens() {
  return { input: 0, output: 0, thinking: 0, cache_write: 0, cache_read: 0 };
}

function addTokens(into, from) {
  for (const key of Object.keys(into)) into[key] += from[key];
}

function increment(counts, key) {
  counts[key] = (counts[key] ?? 0) + 1;
}

function usageTokens(usage) {
  return {
    input: usage.input_tokens ?? 0,
    output: usage.output_tokens ?? 0,
    thinking: usage.output_tokens_details?.thinking_tokens ?? 0,
    cache_write: usage.cache_creation_input_tokens ?? 0,
    cache_read: usage.cache_read_input_tokens ?? 0,
  };
}

function usageWeight(usage) {
  const write = usage.cache_creation_input_tokens ?? 0;
  const write1h = usage.cache_creation?.ephemeral_1h_input_tokens ?? 0;
  const write5m = usage.cache_creation?.ephemeral_5m_input_tokens ?? write - write1h;
  return (
    (usage.input_tokens ?? 0) * COST_WEIGHTS.input +
    (usage.output_tokens ?? 0) * COST_WEIGHTS.output +
    (usage.cache_read_input_tokens ?? 0) * COST_WEIGHTS.cache_read +
    write5m * COST_WEIGHTS.cache_write_5m +
    write1h * COST_WEIGHTS.cache_write_1h
  );
}

function textOf(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((block) => block?.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

function isInterrupted(entry, block) {
  if (entry.toolUseResult?.interrupted === true) return true;
  return textOf(block.content).startsWith('[Request interrupted');
}

// Reads one transcript (main thread or one subagent). API requests are keyed
// by requestId: the transcript writes one entry per content block, each
// repeating the usage of the whole request.
export function summarizeTranscript(entries) {
  const requests = new Map();
  const toolNames = new Map();
  const perTool = {};
  const failures = {};
  const skills = {};
  const agentCalls = [];
  const models = new Set();
  const timestamps = [];
  let toolCalls = 0;
  let effort = null;
  let permissionMode = null;
  let version = null;
  let entrypoint = null;
  let branch = null;
  let costState = null;
  let lastSummaryText = null;

  for (const entry of entries) {
    if (entry.timestamp) timestamps.push(entry.timestamp);
    if (entry.version) version = entry.version;
    if (entry.entrypoint) entrypoint = entry.entrypoint;
    if (entry.gitBranch) branch = entry.gitBranch;
    if (entry.permissionMode) permissionMode = entry.permissionMode;
    if (entry.type === 'cost-state') costState = entry;

    if (entry.type === 'assistant' && entry.message) {
      const message = entry.message;
      if (entry.effort) effort = entry.effort;
      if (message.model && message.model !== '<synthetic>') models.add(message.model);
      const requestKey = entry.requestId ?? message.id;
      if (requestKey && message.usage && message.model !== '<synthetic>') {
        requests.set(requestKey, { model: message.model, usage: message.usage });
      }
      for (const block of Array.isArray(message.content) ? message.content : []) {
        if (block?.type === 'text' && block.text.includes('```run-summary')) {
          lastSummaryText = block.text;
        }
        if (block?.type !== 'tool_use') continue;
        toolCalls += 1;
        toolNames.set(block.id, block.name);
        increment(perTool, block.name);
        if (block.name === 'Skill' && typeof block.input?.skill === 'string') {
          increment(skills, block.input.skill);
        }
        if (block.name === 'Agent' || block.name === 'Task') {
          agentCalls.push({ id: block.id, type: block.input?.subagent_type ?? null });
        }
      }
    }

    if (entry.type === 'user' && Array.isArray(entry.message?.content)) {
      for (const block of entry.message.content) {
        if (block?.type !== 'tool_result') continue;
        if (block.is_error === true || isInterrupted(entry, block)) {
          increment(failures, toolNames.get(block.tool_use_id) ?? 'unknown');
        }
      }
    }
  }

  const tokens = emptyTokens();
  const weightByModel = {};
  for (const { model, usage } of requests.values()) {
    addTokens(tokens, usageTokens(usage));
    weightByModel[model] = (weightByModel[model] ?? 0) + usageWeight(usage);
  }

  timestamps.sort();
  return {
    tokens,
    weightByModel,
    apiRequests: requests.size,
    toolCalls,
    perTool,
    failures,
    skills,
    agentCalls,
    models: [...models].sort(),
    start: timestamps[0] ?? null,
    end: timestamps.at(-1) ?? null,
    effort,
    permissionMode,
    version,
    entrypoint,
    branch,
    costState,
    lastSummaryText,
  };
}

// Reads the last ```run-summary block the agent wrote. The format is
// defined in guides/workflow.md → "Run summary".
export function parseRunSummary(text, warnings) {
  const empty = { issue: null, pull_request: null, findings: null, extras: null };
  if (!text) return empty;
  const matches = [...text.matchAll(SUMMARY_FENCE)];
  if (matches.length === 0) return empty;
  let summary;
  try {
    summary = JSON.parse(matches.at(-1)[1]);
  } catch {
    warnings.push('run-summary block is not valid JSON; ignored');
    return empty;
  }
  if (summary === null || typeof summary !== 'object' || Array.isArray(summary)) {
    warnings.push('run-summary block is not a JSON object; ignored');
    return empty;
  }
  const result = { ...empty };
  for (const key of ['issue', 'pull_request']) {
    if (summary[key] == null) continue;
    if (typeof summary[key] === 'string') result[key] = summary[key];
    else warnings.push(`run-summary.${key} is not a string; ignored`);
  }
  const findings = summary.review_findings;
  if (findings != null) {
    if (Array.isArray(findings) && findings.every((n) => Number.isInteger(n) && n >= 0)) {
      result.findings = findings;
    } else {
      warnings.push('run-summary.review_findings is not a list of counts; ignored');
    }
  }
  if (summary.extras != null) {
    if (typeof summary.extras === 'object' && !Array.isArray(summary.extras)) {
      result.extras = summary.extras;
    } else {
      warnings.push('run-summary.extras is not an object; ignored');
    }
  }
  return result;
}

function round(value) {
  return Math.round(value * 1e6) / 1e6;
}

function msBetween(start, end) {
  if (!start || !end) return null;
  const ms = Date.parse(end) - Date.parse(start);
  return Number.isFinite(ms) && ms >= 0 ? ms : null;
}

// Splits a model's reported cost by each transcript's price-weighted tokens.
function allocateCost(costPerModel, totalWeight, weightByModel) {
  let cost = 0;
  for (const [model, weight] of Object.entries(weightByModel)) {
    const modelCost = costPerModel[model];
    if (modelCost == null || !totalWeight[model]) return null;
    cost += (modelCost * weight) / totalWeight[model];
  }
  return round(cost);
}

/**
 * @param {object} input
 * @param {object[]} input.main       parsed main transcript entries
 * @param {{agentId: string, type: string|null, entries: object[]}[]} input.subagents
 * @param {object} input.context      facts from outside the transcript
 */
export function buildRecord({ main, subagents, context }) {
  const warnings = [];
  const mainSummary = summarizeTranscript(main);
  const subSummaries = subagents.map((sub) => ({ ...sub, summary: summarizeTranscript(sub.entries) }));
  const all = [mainSummary, ...subSummaries.map((sub) => sub.summary)];

  const tokens = emptyTokens();
  const perTool = {};
  const failures = {};
  const skills = {};
  const totalWeight = {};
  const models = new Set();
  let apiRequests = 0;
  let toolCalls = 0;
  for (const summary of all) {
    addTokens(tokens, summary.tokens);
    apiRequests += summary.apiRequests;
    toolCalls += summary.toolCalls;
    for (const [tool, n] of Object.entries(summary.perTool)) perTool[tool] = (perTool[tool] ?? 0) + n;
    for (const [tool, n] of Object.entries(summary.failures)) failures[tool] = (failures[tool] ?? 0) + n;
    for (const [skill, n] of Object.entries(summary.skills)) skills[skill] = (skills[skill] ?? 0) + n;
    for (const [model, w] of Object.entries(summary.weightByModel)) totalWeight[model] = (totalWeight[model] ?? 0) + w;
    for (const model of summary.models) models.add(model);
  }

  const costState = mainSummary.costState;
  const costPerModel = {};
  if (costState) {
    for (const [model, usage] of Object.entries(costState.modelUsage ?? {})) {
      if (typeof usage?.costUSD === 'number') costPerModel[model] = round(usage.costUSD);
    }
    if (costState.hasUnknownModelCost) warnings.push('Claude Code reported a model with unknown cost');
    const reportedAt = (costState.startTime ?? NaN) + (costState.totalDuration ?? NaN);
    const lastEntryAt = Date.parse(mainSummary.end);
    if (Number.isFinite(reportedAt) && lastEntryAt - reportedAt > STALE_COST_MS) {
      warnings.push(
        `cost, model wait, tool time and line counts were last reported at ${new Date(reportedAt).toISOString()} and miss later activity`,
      );
    }
  } else {
    warnings.push('no cost-state entry in the transcript; cost, model wait, tool time and line counts are null');
  }

  const agentTypes = new Map(mainSummary.agentCalls.map((call) => [call.id, call.type]));
  const subagentRecords = subSummaries.map((sub) => {
    const costUsd = costState ? allocateCost(costPerModel, totalWeight, sub.summary.weightByModel) : null;
    if (costState && costUsd === null && sub.summary.apiRequests > 0) {
      warnings.push(`no reported cost for the model(s) of subagent ${sub.agentId}`);
    }
    return {
      agent_id: sub.agentId,
      type: sub.type ?? agentTypes.get(sub.toolUseId) ?? null,
      models: sub.summary.models,
      api_requests: sub.summary.apiRequests,
      tool_calls: sub.summary.toolCalls,
      tokens: sub.summary.tokens,
      cost_usd: costUsd,
    };
  });

  const runSummary = parseRunSummary(mainSummary.lastSummaryText, warnings);
  const failureTotal = Object.values(failures).reduce((sum, n) => sum + n, 0);
  const costTotal = costState && typeof costState.totalCostUSD === 'number' ? round(costState.totalCostUSD) : null;

  return {
    schema_version: SCHEMA_VERSION,
    recorded_at: context.now,
    recorded_on: context.event,
    end_reason: context.endReason ?? null,
    identity: {
      session_id: context.sessionId,
      session_link: context.sessionLink ?? null,
      project: context.project ?? null,
      branch: context.branch ?? mainSummary.branch ?? null,
      claude_code_version: mainSummary.version ?? null,
      entrypoint: mainSummary.entrypoint ?? null,
    },
    agent: {
      models: [...models].sort(),
      effort: mainSummary.effort,
      permission_mode: mainSummary.permissionMode,
    },
    time: {
      start: mainSummary.start,
      end: mainSummary.end,
      duration_ms: msBetween(mainSummary.start, mainSummary.end),
      model_wait_ms: costState?.totalAPIDuration ?? null,
      tool_ms: costState?.totalToolDuration ?? null,
    },
    tokens,
    cost: { total_usd: costTotal, per_model_usd: costPerModel },
    steps: { api_requests: apiRequests, tool_calls: toolCalls, per_tool: perTool },
    skills,
    subagents: subagentRecords,
    tool_failures: { total: failureTotal, per_tool: failures },
    review: {
      rounds: runSummary.findings ? runSummary.findings.length : null,
      findings_per_round: runSummary.findings,
    },
    repo: {
      packed_bytes: context.repo?.packedBytes ?? null,
      tracked_files: context.repo?.trackedFiles ?? null,
      commits: context.repo?.commits ?? null,
      shallow: context.repo?.shallow ?? null,
    },
    changes: {
      lines_added: costState?.totalLinesAdded ?? null,
      lines_removed: costState?.totalLinesRemoved ?? null,
    },
    links: { issue: runSummary.issue, pull_request: runSummary.pull_request },
    extras: runSummary.extras,
    warnings: [...warnings, ...(context.warnings ?? [])],
  };
}

// Validates against the subset of JSON Schema that schema.json uses: type,
// enum, required, properties, additionalProperties, items, minimum, $ref.
export function validate(value, schema, root = schema, path = '$') {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/$defs/', '');
    return validate(value, root.$defs[name], root, path);
  }
  const errors = [];
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(value, type))) {
      return [`${path}: expected ${types.join(' or ')}`];
    }
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: not one of ${JSON.stringify(schema.enum)}`);
  if (typeof value === 'number' && schema.minimum != null && value < schema.minimum) {
    errors.push(`${path}: below ${schema.minimum}`);
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => errors.push(...validate(item, schema.items, root, `${path}[${i}]`)));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${path}.${key}: missing`);
    }
    for (const [key, item] of Object.entries(value)) {
      const propertySchema = schema.properties?.[key];
      if (propertySchema) errors.push(...validate(item, propertySchema, root, `${path}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${path}.${key}: not allowed`);
      else if (typeof schema.additionalProperties === 'object') {
        errors.push(...validate(item, schema.additionalProperties, root, `${path}.${key}`));
      }
    }
  }
  return errors;
}

function matchesType(value, type) {
  switch (type) {
    case 'null': return value === null;
    case 'array': return Array.isArray(value);
    case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'integer': return Number.isInteger(value);
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    default: return typeof value === type;
  }
}
