import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRecord, parseRunSummary, validate } from '../lib.mjs';

const schema = JSON.parse(readFileSync(new URL('../schema.json', import.meta.url), 'utf8'));

const usage = (input, output, thinking, cacheWrite, cacheRead) => ({
  input_tokens: input,
  output_tokens: output,
  output_tokens_details: { thinking_tokens: thinking },
  cache_creation_input_tokens: cacheWrite,
  cache_read_input_tokens: cacheRead,
  cache_creation: { ephemeral_5m_input_tokens: cacheWrite, ephemeral_1h_input_tokens: 0 },
});

// One request whose two content blocks each repeat the request's usage.
function assistant(requestId, model, u, content, timestamp) {
  return content.map((block) => ({
    type: 'assistant',
    requestId,
    timestamp,
    version: '2.1.0',
    entrypoint: 'cli',
    effort: 'high',
    message: { model, usage: u, content: [block] },
  }));
}

function toolResult(id, extra = {}, entryExtra = {}) {
  return {
    type: 'user',
    timestamp: '2026-01-01T00:00:05.000Z',
    message: { content: [{ type: 'tool_result', tool_use_id: id, content: 'ok', ...extra }] },
    ...entryExtra,
  };
}

const summaryText = [
  'Done.',
  '```run-summary',
  '{"issue": "https://github.com/o/r/issues/1", "pull_request": "https://github.com/o/r/pull/2", "review_findings": [3, 0], "extras": {"k": 1}}',
  '```',
].join('\n');

const main = [
  { type: 'user', timestamp: '2026-01-01T00:00:00.000Z', permissionMode: 'default', message: { content: 'secret prompt' } },
  ...assistant('req_1', 'model-a', usage(10, 100, 40, 1000, 0), [
    { type: 'thinking', thinking: 'x' },
    { type: 'tool_use', id: 't1', name: 'Bash', input: { command: 'ls' } },
  ], '2026-01-01T00:00:01.000Z'),
  toolResult('t1', { is_error: true }),
  ...assistant('req_2', 'model-a', usage(5, 50, 0, 0, 1000), [
    { type: 'tool_use', id: 't2', name: 'Skill', input: { skill: 'issues' } },
    { type: 'tool_use', id: 't3', name: 'Bash', input: { command: 'sleep 9' } },
    { type: 'tool_use', id: 't4', name: 'Agent', input: { subagent_type: 'Explore', prompt: 'p' } },
  ], '2026-01-01T00:00:02.000Z'),
  toolResult('t2'),
  toolResult('t3', { content: '[Request interrupted by user for tool use]' }),
  toolResult('t4'),
  ...assistant('req_3', 'model-a', usage(1, 10, 0, 0, 0), [{ type: 'text', text: summaryText }], '2026-01-01T00:01:00.000Z'),
  {
    type: 'cost-state',
    totalCostUSD: 1.5,
    totalAPIDuration: 30000,
    totalToolDuration: 2000,
    totalLinesAdded: 7,
    totalLinesRemoved: 2,
    startTime: Date.parse('2026-01-01T00:00:00.000Z'),
    totalDuration: 60000,
    modelUsage: { 'model-a': { costUSD: 1.0 }, 'model-b': { costUSD: 0.5 } },
  },
];

const subagent = {
  agentId: 'abc',
  type: null,
  toolUseId: 't4',
  entries: [
    ...assistant('req_s1', 'model-b', usage(2, 20, 5, 100, 0), [
      { type: 'tool_use', id: 's1', name: 'Glob', input: {} },
      { type: 'text', text: 'hi' },
    ], '2026-01-01T00:00:03.000Z'),
    toolResult('s1'),
  ],
};

const context = {
  now: '2026-01-01T00:02:00.000Z',
  event: 'SessionEnd',
  endReason: 'logout',
  sessionId: 'sess-1',
  sessionLink: null,
  project: 'o/r',
  branch: 'feat/1-x',
  repo: { packedBytes: 2048, trackedFiles: 3, commits: 4, shallow: false },
};

test('counts each API request once, subagents included', () => {
  const record = buildRecord({ main, subagents: [subagent], context });
  assert.deepEqual(record.tokens, { input: 18, output: 180, thinking: 45, cache_write: 1100, cache_read: 1000 });
  assert.equal(record.steps.api_requests, 4);
  assert.deepEqual(record.subagents[0].tokens, { input: 2, output: 20, thinking: 5, cache_write: 100, cache_read: 0 });
  assert.equal(record.subagents[0].api_requests, 1);
});

test('reports cost per model and allocates it to subagents', () => {
  const record = buildRecord({ main, subagents: [subagent], context });
  assert.equal(record.cost.total_usd, 1.5);
  assert.deepEqual(record.cost.per_model_usd, { 'model-a': 1, 'model-b': 0.5 });
  // The subagent made every model-b request, so it carries all of model-b's cost.
  assert.equal(record.subagents[0].cost_usd, 0.5);
  assert.equal(record.subagents[0].type, 'Explore');
});

test('counts tools, skills, and failed or interrupted tool calls', () => {
  const record = buildRecord({ main, subagents: [subagent], context });
  assert.equal(record.steps.tool_calls, 5);
  assert.deepEqual(record.steps.per_tool, { Bash: 2, Skill: 1, Agent: 1, Glob: 1 });
  assert.deepEqual(record.skills, { issues: 1 });
  assert.deepEqual(record.tool_failures, { total: 2, per_tool: { Bash: 2 } });
});

test('reads time, agent, review, links, and extras', () => {
  const record = buildRecord({ main, subagents: [subagent], context });
  assert.deepEqual(record.time, {
    start: '2026-01-01T00:00:00.000Z',
    end: '2026-01-01T00:01:00.000Z',
    duration_ms: 60000,
    model_wait_ms: 30000,
    tool_ms: 2000,
  });
  assert.deepEqual(record.agent, { models: ['model-a', 'model-b'], effort: 'high', permission_mode: 'default' });
  assert.deepEqual(record.review, { rounds: 2, findings_per_round: [3, 0] });
  assert.deepEqual(record.links, { issue: 'https://github.com/o/r/issues/1', pull_request: 'https://github.com/o/r/pull/2' });
  assert.deepEqual(record.extras, { k: 1 });
  assert.deepEqual(record.changes, { lines_added: 7, lines_removed: 2 });
  assert.deepEqual(record.warnings, []);
});

test('the record matches the schema and holds no prompt text', () => {
  const record = buildRecord({ main, subagents: [subagent], context });
  assert.deepEqual(validate(record, schema), []);
  const json = JSON.stringify(record);
  assert.ok(!json.includes('secret prompt'));
  assert.ok(!json.includes('sleep 9'));
});

test('fields that do not apply are null, not missing', () => {
  const bare = main.filter((entry) => entry.type !== 'cost-state' && !JSON.stringify(entry).includes('run-summary'));
  const record = buildRecord({ main: bare, subagents: [], context: { ...context, repo: undefined } });
  assert.deepEqual(validate(record, schema), []);
  assert.equal(record.cost.total_usd, null);
  assert.equal(record.links.pull_request, null);
  assert.deepEqual(record.review, { rounds: null, findings_per_round: null });
  assert.equal(record.repo.packed_bytes, null);
  assert.match(record.warnings[0], /no cost-state/);
});

test('warns when the reported cost is older than the transcript', () => {
  const stale = main.map((entry) => (entry.type === 'cost-state' ? { ...entry, startTime: entry.startTime - 600_000 } : entry));
  const record = buildRecord({ main: stale, subagents: [], context });
  assert.match(record.warnings.join('\n'), /miss later activity/);
});

test('a malformed run summary is ignored with a warning', () => {
  const warnings = [];
  const summary = parseRunSummary('```run-summary\n{"review_findings": [-1], "issue": 5}\n```', warnings);
  assert.deepEqual(summary, { issue: null, pull_request: null, findings: null, extras: null });
  assert.equal(warnings.length, 2);
  assert.deepEqual(parseRunSummary('```run-summary\nnot json\n```', []).findings, null);
});

test('the schema rejects a record of another shape', () => {
  const record = buildRecord({ main, subagents: [], context });
  delete record.links;
  record.tokens.input = -1;
  record.surprise = true;
  const errors = validate(record, schema);
  assert.ok(errors.includes('$.links: missing'));
  assert.ok(errors.includes('$.tokens.input: below 0'));
  assert.ok(errors.includes('$.surprise: not allowed'));
});
