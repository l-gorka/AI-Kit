import { Agent } from "@cursor/sdk";
import type { GitHubIssue, Route } from "./types";

export type TriageResult = { route: Route; reason: string };

function heuristicTriage(issue: GitHubIssue): TriageResult | null {
  const labels = new Set(issue.labels.map((l) => l.toLowerCase()));
  if (labels.has("ready-for-human") || labels.has("wontfix")) {
    return {
      route: "human",
      reason: `Label set (${[...labels].join(", ")}) indicates no agent implementation.`,
    };
  }
  if (labels.has("good first issue")) {
    return { route: "easy", reason: "Label good first issue." };
  }
  const words = issue.body.trim().split(/\s+/).filter(Boolean).length;
  if (words > 0 && words < 120 && labels.has("ready-for-agent")) {
    return {
      route: "easy",
      reason: "Short ready-for-agent issue with clear scope.",
    };
  }
  return null;
}

export async function triageIssue(
  issue: GitHubIssue,
  options: { apiKey: string; cwd: string; model: string },
): Promise<TriageResult> {
  const heuristic = heuristicTriage(issue);
  if (heuristic) {
    return heuristic;
  }

  const prompt = `Classify this GitHub issue for an coding agent pipeline.

Reply with JSON only, no markdown fences:
{"route":"easy"|"planned"|"human","reason":"one sentence"}

- easy: small, localized change; one implementer pass is enough
- planned: needs a written plan before implementation
- human: not suitable for agents (ambiguous, needs product decision, infra secrets, etc.)

${issue.title}

${issue.body}`;

  const result = await Agent.prompt(prompt, {
    apiKey: options.apiKey,
    model: { id: options.model },
    local: { cwd: options.cwd, settingSources: [] },
  });

  if (result.status === "error") {
    return {
      route: "planned",
      reason: "Triage agent failed; defaulting to planned.",
    };
  }

  const text = result.result?.trim() ?? "";
  try {
    const parsed = JSON.parse(text) as { route?: Route; reason?: string };
    if (
      parsed.route === "easy" ||
      parsed.route === "planned" ||
      parsed.route === "human"
    ) {
      return {
        route: parsed.route,
        reason: parsed.reason ?? "LLM triage.",
      };
    }
  } catch {
    // fall through
  }
  return { route: "planned", reason: "Unparseable triage output; defaulting to planned." };
}
