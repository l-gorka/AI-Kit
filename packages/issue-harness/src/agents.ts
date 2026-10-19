import { Agent, CursorAgentError } from "@cursor/sdk";
import type { HarnessModels } from "./types";

export type AgentRunOutcome =
  | { ok: true; text: string; agentId: string; runId: string }
  | { ok: false; kind: "startup" | "run"; message: string; runId?: string };

export async function promptOnce(
  prompt: string,
  options: { apiKey: string; cwd: string; model: string },
): Promise<AgentRunOutcome> {
  try {
    const result = await Agent.prompt(prompt, {
      apiKey: options.apiKey,
      model: { id: options.model },
      local: { cwd: options.cwd, settingSources: [] },
    });
    if (result.status === "error") {
      return {
        ok: false,
        kind: "run",
        message: "Agent run failed",
        runId: result.id,
      };
    }
    return {
      ok: true,
      text: result.result ?? "",
      agentId: "",
      runId: result.id,
    };
  } catch (err) {
    if (err instanceof CursorAgentError) {
      return { ok: false, kind: "startup", message: err.message };
    }
    throw err;
  }
}

export async function createExecutor(
  options: { apiKey: string; cwd: string; model: string },
): Promise<Awaited<ReturnType<typeof Agent.create>>> {
  return Agent.create({
    apiKey: options.apiKey,
    model: { id: options.model },
    local: { cwd: options.cwd, settingSources: [] },
  });
}

export async function sendAndWait(
  agent: Awaited<ReturnType<typeof Agent.create>>,
  prompt: string,
): Promise<AgentRunOutcome> {
  try {
    const run = await agent.send(prompt);
    const result = await run.wait();
    if (result.status === "error") {
      return {
        ok: false,
        kind: "run",
        message: "Agent run failed",
        runId: result.id,
      };
    }
    return {
      ok: true,
      text: result.result ?? "",
      agentId: agent.agentId,
      runId: result.id,
    };
  } catch (err) {
    if (err instanceof CursorAgentError) {
      return { ok: false, kind: "startup", message: err.message };
    }
    throw err;
  }
}

export function modelsForStage(
  models: HarnessModels,
  stage: "triage" | "easy" | "plan" | "execute" | "review",
): string {
  switch (stage) {
    case "triage":
      return models.triage;
    case "easy":
      return models.easy;
    case "plan":
      return models.plan;
    case "execute":
      return models.execute;
    case "review":
      return models.review;
  }
}
