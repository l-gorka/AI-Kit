import { join } from "node:path";
import type { RunState } from "./types";

/** Project-local harness data (never inside the AI-Kit submodule mount). */
export const HARNESS_DIR = ".harness";

function runsDir(cwd: string): string {
  return join(cwd, HARNESS_DIR, "runs");
}

function runPath(cwd: string, issueNumber: number): string {
  return join(runsDir(cwd), `issue-${issueNumber}.json`);
}

export async function loadRunState(
  cwd: string,
  issueNumber: number,
): Promise<RunState | null> {
  const path = runPath(cwd, issueNumber);
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return null;
  }
  return (await file.json()) as RunState;
}

export async function saveRunState(cwd: string, state: RunState): Promise<void> {
  const path = runPath(cwd, state.issueNumber);
  await Bun.$`mkdir -p ${runsDir(cwd)}`.quiet();
  await Bun.write(
    path,
    `${JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
}
