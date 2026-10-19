import { join } from "node:path";

const HARNESS_RULES = `You are running inside an automated issue harness.

Hard constraints:
- Do NOT run git or GitHub CLI commands.
- Do NOT run test, lint, build, or package-manager verification commands unless explicitly asked to fix code based on prior failure output supplied in this chat.
- Only edit files in the workspace when your role is implementer.

The harness runs deterministic tests and owns all git operations (commit, push, PR).`;

async function readOptional(path: string): Promise<string | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return null;
  }
  return file.text();
}

export async function loadKitContext(cwd: string): Promise<string> {
  const parts: string[] = [HARNESS_RULES];
  const agentsDir = join(cwd, ".ai-kit", "agents");
  for (const name of ["workflow.md", "git-workflow.md", "unit-testing.md"]) {
    const text = await readOptional(join(agentsDir, name));
    if (text) {
      parts.push(`\n## ${name}\n\n${text}`);
    }
  }
  for (const name of ["CONTEXT.md", "GLOSSARY.md"]) {
    const text = await readOptional(join(cwd, name));
    if (text) {
      parts.push(`\n## ${name}\n\n${text}`);
    }
  }
  return parts.join("\n");
}

export function formatIssueBlock(issue: {
  number: number;
  title: string;
  body: string;
  url: string;
}): string {
  return `# Issue #${issue.number}: ${issue.title}

URL: ${issue.url}

${issue.body}`;
}
