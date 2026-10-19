import { runCommand } from "./shell";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function prepareBranch(
  cwd: string,
  options: {
    baseBranch: string;
    branchType: string;
    issueNumber: number;
    title: string;
    existingBranch?: string;
  },
): Promise<string> {
  await runCommand("git", ["fetch", "origin", options.baseBranch], { cwd });
  if (options.existingBranch) {
    await runCommand("git", ["checkout", options.existingBranch], { cwd });
    await runCommand("git", ["merge", "--ff-only", `origin/${options.baseBranch}`], {
      cwd,
    }).catch(() => undefined);
    return options.existingBranch;
  }

  const slug = slugify(options.title) || "issue";
  let branch = `${options.branchType}/${options.issueNumber}-${slug}`;
  let suffix = 2;
  while (true) {
    try {
      await runCommand("git", ["show-ref", "--verify", `refs/heads/${branch}`], {
        cwd,
      });
      branch = `${options.branchType}/${options.issueNumber}-${slug}-v${suffix}`;
      suffix += 1;
    } catch {
      break;
    }
  }

  await runCommand("git", ["checkout", options.baseBranch], { cwd });
  await runCommand("git", ["pull", "--ff-only", "origin", options.baseBranch], {
    cwd,
  });
  await runCommand("git", ["checkout", "-b", branch], { cwd });
  return branch;
}

export async function diffAgainstBase(
  cwd: string,
  baseBranch: string,
): Promise<string> {
  const { stdout } = await runCommand(
    "git",
    ["diff", `${baseBranch}...HEAD`],
    { cwd },
  );
  return stdout;
}

export async function commitAll(cwd: string, message: string): Promise<void> {
  await runCommand("git", ["add", "-A"], { cwd });
  const { stdout: status } = await runCommand(
    "git",
    ["status", "--porcelain"],
    { cwd },
  );
  if (!status.trim()) {
    return;
  }
  await runCommand("git", ["commit", "-m", message], { cwd });
}

export async function pushBranch(cwd: string, branch: string): Promise<void> {
  await runCommand("git", ["push", "-u", "origin", branch], { cwd });
}
