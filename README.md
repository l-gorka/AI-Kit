# ai-kit

Reusable instructions for AI coding agents: workflow, Git rules, general code
conventions, issue-tracker conventions, and documentation boundaries. It
contains no product or domain knowledge.

## Layout

```text
guides/                 Procedures for nearly every session (indexed by AGENTS.md)
  workflow.md
  git-workflow.md
  rules.md
rules/                  General rules for every project (indexed by AGENTS.md)
  unit-testing.md
  vertical-slices.md
skills/                 Procedures loaded on demand (symlinked into projects)
  issues/SKILL.md
  knowledge/SKILL.md
hooks/                  Claude Code hooks a project wires into its settings
  run-record/
templates/              Skeletons for project-owned files
  CONTEXT.md
  RULES.md
AGENTS.template.md      Entry point to copy into a project as AGENTS.md
.claude/skills/         Skills for maintaining this kit (not for projects)
```

## What stays in the project

These are never part of the kit:

- `GLOSSARY.md`, `docs/adr/`, `docs/specs/`, `docs/design/`
- `CONTEXT.md` (facts: repo map, verification commands, environment notes)
- `RULES.md` (decisions the project owner has stated: project-specific
  conventions and every deviation from this kit; see `guides/rules.md`)
- `docs/knowledge/` (verified notes for that repo's problems)
- CI configuration

## Using it in a project

1. Mount the kit as a submodule:

   ```sh
   git submodule add <kit-repo-url> .ai-kit
   ```

2. Copy `.ai-kit/AGENTS.template.md` to `AGENTS.md` and replace `<KIT>` with
   `.ai-kit`.
3. Copy `.ai-kit/templates/CONTEXT.md` and `RULES.md` to the project root and
   fill them in (at minimum the "Verification commands" section of
   `CONTEXT.md`; replace `<KIT>` in `RULES.md`). `GLOSSARY.md` and
   `docs/adr/` are created by the `domain-modeling` skill when the first term
   or decision is resolved.
4. Link the kit's skills into the project and commit the links:

   ```sh
   mkdir -p .claude/skills
   for s in .ai-kit/skills/*/; do
     ln -s "../../${s%/}" ".claude/skills/$(basename "$s")"
   done
   ```

5. Wire in the run-record hook (see "Run records" below).

To deviate from the kit in one project, see `guides/rules.md` → "Precedence".

## Run records

`hooks/run-record/` records one metadata record per agent session: identity,
models, time, tokens (each API request counted once, subagents included),
Claude Code's cost estimate, tool and skill use, subagents with their own
tokens and cost, tool failures, review rounds, repo size, and the issue and
PR links. `schema.json` defines the shape; a record that fails it is reported
and not stored. Prompt text and tool inputs are never stored.

### Wiring a project

Add both hooks to the project's `.claude/settings.json` and commit it:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.ai-kit/hooks/run-record/record.mjs\"", "timeout": 60 }] }
    ],
    "SessionEnd": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.ai-kit/hooks/run-record/record.mjs\"", "timeout": 60 }] }
    ]
  }
}
```

`Stop` rewrites the record after every turn, because a cloud container can
be discarded before `SessionEnd` runs; `SessionEnd` writes the final version
where it does run.

Needs Node.js 18+ and `git` on the `PATH`, push access to the remote, and
network access to it. No secret is needed when the session can already push
to `origin` (cloud sessions use the GitHub proxy). Optional environment
variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `AI_KIT_RUN_LOG_REMOTE` | `origin` | Remote name or URL that receives the records |
| `AI_KIT_RUN_LOG_BRANCH` | `run-log` | Branch that holds the records |
| `AI_KIT_RUN_LOG_DISABLE` | unset | `1` skips recording |

### Storage

Each session is one file, `runs/<YYYY-MM>/<session_id>.json` (one JSON line),
on the `run-log` branch. The hook commits with Git plumbing and a temporary
index, so the checkout, index, and `HEAD` are never touched. The branch
shares no history with product branches; never merge it.

Query it with DuckDB from a worktree of the branch:

```sh
git fetch origin run-log && git worktree add ../run-log FETCH_HEAD
duckdb -c "SELECT identity.project, count(*) AS runs, sum(cost.total_usd) AS usd
           FROM read_json('../run-log/runs/**/*.json') GROUP BY 1"
```

### Sources and limits

- Tokens, tool calls, skills, subagents, and failures come from the session
  transcript (`~/.claude/projects/…`), which is not a documented API; the
  record keeps `claude_code_version` so format changes can be traced.
- Cost, model wait, tool time, and line counts come from the transcript's
  last `cost-state` entry, which Claude Code writes only at some points. When
  it is older than the last activity, the record says so in `warnings`.
  Subagent cost is the model's reported cost split by price-weighted tokens.
- Review rounds, findings, issue and PR links, and `extras` come from the
  agent's `run-summary` block (`guides/workflow.md` → "Run summary"); without
  one they are `null`.
- If storing fails, the hook prints a `run-record:` message in the session
  and exits 0; it never blocks the session.

Tests: `node --test hooks/run-record/__tests__/*.test.mjs`.

## Skills

The kit's own skills live in `skills/` and reach a project through the
symlinks from step 4, so they update with the submodule:

- `issues` — writing, labeling, and filing issues; tracker operations.
- `knowledge` — the project's knowledge notes.

Other skills (`/grill-with-docs`, `/to-tickets`, `domain-modeling`, ...) are
not part of this kit. Install them per machine: locally in the user skills
directory, and in the cloud environment's setup script. The kit's docs
reference them by name only.
