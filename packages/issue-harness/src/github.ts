import { runCommand } from "./shell";
import type { GitHubIssue } from "./types";

export async function fetchIssue(
  cwd: string,
  issueNumber: number,
): Promise<GitHubIssue> {
  const { stdout } = await runCommand(
    "gh",
    [
      "issue",
      "view",
      String(issueNumber),
      "--json",
      "number,title,body,labels,url",
    ],
    { cwd },
  );
  const data = JSON.parse(stdout) as {
    number: number;
    title: string;
    body: string;
    url: string;
    labels: { name: string }[];
  };
  return {
    number: data.number,
    title: data.title,
    body: data.body ?? "",
    url: data.url,
    labels: data.labels.map((l) => l.name),
  };
}

export async function commentIssue(
  cwd: string,
  issueNumber: number,
  body: string,
): Promise<void> {
  await runCommand(
    "gh",
    ["issue", "comment", String(issueNumber), "--body", body],
    { cwd },
  );
}

export async function createPullRequest(
  cwd: string,
  options: {
    title: string;
    body: string;
    base: string;
    head: string;
  },
): Promise<string> {
  const { stdout } = await runCommand(
    "gh",
    [
      "pr",
      "create",
      "--title",
      options.title,
      "--body",
      options.body,
      "--base",
      options.base,
      "--head",
      options.head,
    ],
    { cwd },
  );
  return stdout.trim();
}
