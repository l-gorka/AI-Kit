import { join } from "node:path";
import type { HarnessConfig } from "./types";

const DEFAULT_CONFIG: HarnessConfig = {
  baseBranch: "main",
  branchType: "feature",
  testCommands: ["bun test"],
  maxTestFixAttempts: 3,
  models: {
    triage: "composer-2.5",
    easy: "composer-2.5",
    plan: "composer-2.5",
    execute: "composer-2.5",
    review: "composer-2.5",
  },
};

async function readConfigFile(path: string): Promise<Partial<HarnessConfig> | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return null;
  }
  return (await file.json()) as Partial<HarnessConfig>;
}

export async function loadHarnessConfig(cwd: string): Promise<HarnessConfig> {
  const raw =
    (await readConfigFile(join(cwd, "harness.json"))) ??
    (await readConfigFile(join(cwd, ".ai-kit", "harness.json")));
  if (!raw) {
    return { ...DEFAULT_CONFIG, models: { ...DEFAULT_CONFIG.models } };
  }
  return {
    baseBranch: raw.baseBranch ?? DEFAULT_CONFIG.baseBranch,
    branchType: raw.branchType ?? DEFAULT_CONFIG.branchType,
    testCommands: raw.testCommands ?? DEFAULT_CONFIG.testCommands,
    maxTestFixAttempts:
      raw.maxTestFixAttempts ?? DEFAULT_CONFIG.maxTestFixAttempts,
    models: { ...DEFAULT_CONFIG.models, ...raw.models },
  };
}
