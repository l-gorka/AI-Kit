import { dirname, join, resolve } from "node:path";

/**
 * Host repository root (e.g. drawing-board), not the AI-Kit submodule root.
 * Walks up from `start` until it finds harness config or a mounted issue-harness package.
 */
export async function resolveProjectRoot(start: string): Promise<string> {
  let dir = resolve(start);

  for (;;) {
    if (await Bun.file(join(dir, "harness.json")).exists()) {
      return dir;
    }

    const mountedHarness = join(
      dir,
      ".ai-kit",
      "packages",
      "issue-harness",
      "package.json",
    );
    if (await Bun.file(mountedHarness).exists()) {
      return dir;
    }

    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  throw new Error(
    "Could not find a project root. cd into your app repository (the repo with CONTEXT.md and .ai-kit/), or pass --cwd /path/to/repo.",
  );
}
