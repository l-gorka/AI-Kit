export type Route = "easy" | "planned" | "human";

export type RunStage =
  | "triage"
  | "plan"
  | "execute"
  | "test"
  | "review"
  | "publish"
  | "done";

export type HarnessModels = {
  triage: string;
  easy: string;
  plan: string;
  execute: string;
  review: string;
};

export type HarnessConfig = {
  baseBranch: string;
  branchType: string;
  testCommands: string[];
  maxTestFixAttempts: number;
  models: HarnessModels;
};

export type RunState = {
  issueNumber: number;
  branch: string;
  route?: Route;
  stage: RunStage;
  executorAgentId?: string;
  testFixAttempt: number;
  plan?: string;
  updatedAt: string;
};

export type GitHubIssue = {
  number: number;
  title: string;
  body: string;
  labels: string[];
  url: string;
};
