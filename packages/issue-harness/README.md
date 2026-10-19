# issue-harness

Proof-of-concept orchestrator: fetch a GitHub issue, route it (heuristics + cheap
triage agent), run local Cursor SDK agents (planner / implementer / advisory
review), run deterministic tests and git **outside** the agents, open a PR.

## How it attaches to *your* repository

AI-Kit is a **submodule** inside the app repo (e.g. `drawing-board/.ai-kit/`).
The harness code lives there, but every run targets the **host repo** — the
parent directory that contains `.ai-kit/` and `CONTEXT.md`.

Nothing in AI-Kit stores your product issues or run history. Per project:

| What | Where |
| --- | --- |
| Config (`testCommands`, models) | Host repo `harness.json` |
| Run manifests | Host repo `.harness/runs/` (gitignored) |
| Git + `gh` | Host repo clone (`origin` = GitHub repo for issues/PRs) |
| SDK agents `local.cwd` | Same host repo root |

**Which GitHub repo?** The harness runs `gh` with the host repo as working
directory. `gh` uses that clone’s `origin` — no separate `owner/repo` setting
required if you’re authenticated and cloned the right project.

**Which directory is the host repo?** On startup the CLI walks up from your
current directory (or `--cwd`) until it finds `harness.json` or
`.ai-kit/packages/issue-harness/`. That directory is the project root.

```text
drawing-board/                    ← host repo (harness target)
├── harness.json
├── CONTEXT.md
├── .harness/runs/                ← local run state
└── .ai-kit/                      ← submodule (AI-Kit)
    └── packages/issue-harness/   ← this package
```

## Prerequisites

- [Bun](https://bun.sh)
- `gh` authenticated for the **host** repository
- `CURSOR_API_KEY` in the host repo `.env.local` or shell ([Cursor Integrations](https://cursor.com/dashboard/integrations)). The CLI loads `.env.local` / `.env` from the **host root**, even when you run the script from inside `.ai-kit/packages/issue-harness/`.

## Host repo setup

1. Mount AI-Kit as `.ai-kit/` (submodule or copy).
2. Copy `.ai-kit/templates/harness.json` → `harness.json` at the host repo root.
3. Add `.harness/` to the host repo `.gitignore`.

Optional: add a root script so you don’t memorize paths:

```json
"scripts": {
  "issue-harness": "bun run .ai-kit/packages/issue-harness/src/cli.ts"
}
```

Then: `bun run issue-harness -- run 42`

## Usage

From the **host repository root** (recommended):

```sh
cd /path/to/drawing-board
export CURSOR_API_KEY="cursor_..."
bun run .ai-kit/packages/issue-harness/src/cli.ts run 42
```

From anywhere inside the host repo (paths are resolved upward):

```sh
cd /path/to/drawing-board/web
bun run ../.ai-kit/packages/issue-harness/src/cli.ts run 42
```

Explicit root:

```sh
bun run .ai-kit/packages/issue-harness/src/cli.ts run 42 --cwd /path/to/drawing-board
```

Do **not** rely on running only from inside `.ai-kit/` without `--cwd` pointing
at the host repo — that clone is the AI-Kit submodule, not your app.

## Pipeline

1. Comment on issue — run started
2. Triage — `easy` | `planned` | `human` (human stops without coding)
3. **planned:** planner agent → plan comment → implementer
4. **easy:** single implementer agent
5. Harness runs `testCommands`; on failure, implementer follow-up (same agent), up to `maxTestFixAttempts`
6. Advisory review agent — issue + `git diff` only (no tests in agent)
7. Harness commit, push, `gh pr create` with `Closes #N`

Agents receive `.ai-kit/agents/workflow.md`, `git-workflow.md`, and project
`CONTEXT.md` / `GLOSSARY.md` in prompts but must not run git or tests themselves.
