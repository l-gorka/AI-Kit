import { runShell } from "./shell";

export type TestRunResult = {
  ok: boolean;
  combinedOutput: string;
};

export async function runTestCommands(
  cwd: string,
  commands: string[],
): Promise<TestRunResult> {
  const chunks: string[] = [];
  for (const command of commands) {
    chunks.push(`$ ${command}\n`);
    const result = await runShell(command, cwd);
    chunks.push(result.stdout);
    if (result.stderr) {
      chunks.push(result.stderr);
    }
    if (result.code !== 0) {
      return { ok: false, combinedOutput: chunks.join("") };
    }
  }
  return { ok: true, combinedOutput: chunks.join("") };
}
