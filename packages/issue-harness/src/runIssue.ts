import { loadHarnessConfig } from "./config";
import {
  commentIssue,
  createPullRequest,
  fetchIssue,
} from "./github";
import {
  commitAll,
  diffAgainstBase,
  prepareBranch,
  pushBranch,
} from "./git";
import {
  createExecutor,
  modelsForStage,
  promptOnce,
  sendAndWait,
} from "./agents";
import { formatIssueBlock, loadKitContext } from "./prompts";
import { loadRunState, saveRunState } from "./runState";
import { runTestCommands } from "./tests";
import { triageIssue } from "./triage";
import type { RunState } from "./types";

function requireApiKey(): string {
  const key = process.env.CURSOR_API_KEY?.trim();
  if (!key) {
    throw new Error("CURSOR_API_KEY is required");
  }
  return key;
}

export async function runIssue(cwd: string, issueNumber: number): Promise<void> {
  const apiKey = requireApiKey();
  const config = await loadHarnessConfig(cwd);
  const issue = await fetchIssue(cwd, issueNumber);
  const kitContext = await loadKitContext(cwd);

  let state =
    (await loadRunState(cwd, issueNumber)) ??
    ({
      issueNumber,
      branch: "",
      stage: "triage",
      testFixAttempt: 0,
      updatedAt: new Date().toISOString(),
    } satisfies RunState);

  if (!state.branch) {
    state.branch = await prepareBranch(cwd, {
      baseBranch: config.baseBranch,
      branchType: config.branchType,
      issueNumber,
      title: issue.title,
      existingBranch: undefined,
    });
    await saveRunState(cwd, state);
  } else {
    state.branch = await prepareBranch(cwd, {
      baseBranch: config.baseBranch,
      branchType: config.branchType,
      issueNumber,
      title: issue.title,
      existingBranch: state.branch,
    });
  }

  await commentIssue(
    cwd,
    issueNumber,
    `Issue harness run started on branch \`${state.branch}\`.`,
  );

  if (!state.route) {
    const triage = await triageIssue(issue, {
      apiKey,
      cwd,
      model: modelsForStage(config.models, "triage"),
    });
    state.route = triage.route;
    state.stage = triage.route === "human" ? "done" : state.stage;
    await saveRunState(cwd, state);
    await commentIssue(
      cwd,
      issueNumber,
      `**Triage:** \`${triage.route}\` — ${triage.reason}`,
    );
    if (triage.route === "human") {
      return;
    }
  }

  const issueBlock = formatIssueBlock(issue);

  if (state.route === "planned" && !state.plan) {
    const planPrompt = `${kitContext}

You are the planner. Produce a markdown implementation plan only.
Do not edit any files. Include steps, files to touch, and test expectations.

${issueBlock}`;

    const planResult = await promptOnce(planPrompt, {
      apiKey,
      cwd,
      model: modelsForStage(config.models, "plan"),
    });
    if (!planResult.ok) {
      throw new Error(`Planner failed: ${planResult.message}`);
    }
    state.plan = planResult.text;
    state.stage = "execute";
    await saveRunState(cwd, state);
    await commentIssue(cwd, issueNumber, `**Plan**\n\n${state.plan}`);
  }

  const implementPromptBase = `${kitContext}

You are the implementer. Implement the issue in the workspace.

${issueBlock}`;

  const implementPrompt =
    state.route === "planned" && state.plan
      ? `${implementPromptBase}

Follow this plan:

${state.plan}`
      : implementPromptBase;

  await using executor = state.executorAgentId
    ? await (async () => {
        const { Agent } = await import("@cursor/sdk");
        return Agent.resume(state.executorAgentId!, {
          apiKey,
          local: { cwd, settingSources: [] },
        });
      })()
    : await createExecutor({
        apiKey,
        cwd,
        model: modelsForStage(
          config.models,
          state.route === "easy" ? "easy" : "execute",
        ),
      });

  if (!state.executorAgentId) {
    const first = await sendAndWait(executor, implementPrompt);
    if (!first.ok) {
      throw new Error(`Implementer failed: ${first.message}`);
    }
    state.executorAgentId = executor.agentId;
    state.stage = "test";
    await saveRunState(cwd, state);
  }

  while (state.testFixAttempt < config.maxTestFixAttempts) {
    state.testFixAttempt += 1;
    await saveRunState(cwd, state);

    const tests = await runTestCommands(cwd, config.testCommands);
    if (tests.ok) {
      break;
    }

    if (state.testFixAttempt >= config.maxTestFixAttempts) {
      await commentIssue(
        cwd,
        issueNumber,
        `**Tests failed** after ${config.maxTestFixAttempts} attempt(s). No PR opened.\n\n\`\`\`\n${tests.combinedOutput.slice(0, 12000)}\n\`\`\``,
      );
      return;
    }

    const fix = await sendAndWait(
      executor,
      `Deterministic tests failed. Fix the code. Do not run tests yourself.

\`\`\`
${tests.combinedOutput.slice(0, 12000)}
\`\`\``,
    );
    if (!fix.ok) {
      throw new Error(`Test-fix pass failed: ${fix.message}`);
    }
  }

  const diff = await diffAgainstBase(cwd, config.baseBranch);
  const reviewPrompt = `${kitContext}

You are the review agent (advisory). Do not run tests or git.

Review the diff against the issue. List findings by severity.

${issueBlock}

\`\`\`diff
${diff.slice(0, 100000)}
\`\`\``;

  const review = await promptOnce(reviewPrompt, {
    apiKey,
    cwd,
    model: modelsForStage(config.models, "review"),
  });

  const reviewText = review.ok
    ? review.text
    : `(Review agent failed: ${review.message})`;

  const commitSubject =
    issue.title.length > 72 ? `${issue.title.slice(0, 69)}...` : issue.title;
  await commitAll(cwd, `fix: ${commitSubject}`);
  await pushBranch(cwd, state.branch);

  const prBody = `Closes #${issueNumber}

## Summary
Automated issue harness implementation for #${issueNumber}.

## Advisory review
${reviewText}`;

  const prUrl = await createPullRequest(cwd, {
    title: issue.title,
    body: prBody,
    base: config.baseBranch,
    head: state.branch,
  });

  state.stage = "done";
  await saveRunState(cwd, state);
  await commentIssue(
    cwd,
    issueNumber,
    `**Done.** PR: ${prUrl}\n\nAdvisory review was attached to the PR body.`,
  );
}
