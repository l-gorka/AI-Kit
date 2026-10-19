import { join } from "node:path";

/**
 * Bun only auto-loads .env from the process cwd (often this package dir).
 * Host secrets live at the app repo root — load them after resolving projectRoot.
 */
export async function loadProjectEnv(projectRoot: string): Promise<void> {
  for (const name of [".env.local", ".env"]) {
    const path = join(projectRoot, name);
    const file = Bun.file(path);
    if (!(await file.exists())) {
      continue;
    }
    const text = await file.text();
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const eq = trimmed.indexOf("=");
      if (eq === -1) {
        continue;
      }
      const key = trimmed.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) {
        continue;
      }
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}
