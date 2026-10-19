#!/usr/bin/env bun
import { resolve } from "node:path";
import { runIssue } from "./runIssue";
import { resolveProjectRoot } from "./projectRoot";

function printUsage(): void {
  console.error(`Usage: issue-harness run <issue-number> [--cwd <path>]

Environment:
  CURSOR_API_KEY   Required Cursor user or service-account API key

Project:
  The harness always targets one host repository (your app), not AI-Kit.
  It resolves the root by walking up from the current directory (or --cwd)
  until it finds harness.json or .ai-kit/packages/issue-harness/.

  gh issue/pr commands run with that root as cwd, so GitHub maps to that
  clone's origin remote.

Config:
  harness.json at the host repo root (see .ai-kit/templates/harness.json)`);
}

function parseArgs(argv: string[]): {
  command: string | undefined;
  issueArg: string | undefined;
  cwdFlag: string | undefined;
} {
  const rest = argv.slice(2);
  const command = rest[0];
  let issueArg: string | undefined;
  let cwdFlag: string | undefined;

  for (let i = 1; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === "--cwd") {
      cwdFlag = rest[i + 1];
      i += 1;
      continue;
    }
    if (!issueArg && token !== undefined && !token.startsWith("-")) {
      issueArg = token;
    }
  }

  return { command, issueArg, cwdFlag };
}

async function main(): Promise<void> {
  const { command, issueArg, cwdFlag } = parseArgs(process.argv);
  if (command !== "run" || !issueArg) {
    printUsage();
    process.exit(1);
  }

  const issueNumber = Number.parseInt(issueArg, 10);
  if (!Number.isFinite(issueNumber) || issueNumber < 1) {
    console.error("Issue number must be a positive integer.");
    process.exit(1);
  }

  const startDir = cwdFlag ? resolve(cwdFlag) : process.cwd();
  const projectRoot = await resolveProjectRoot(startDir);

  try {
    await runIssue(projectRoot, issueNumber);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

await main();
