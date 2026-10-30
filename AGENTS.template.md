# Agent instructions

<!--
Copy this file to the root of a project as AGENTS.md and replace <KIT> with the
path where the kit is mounted (e.g. `.ai-kit`). Delete this comment. Keep this
file an index: project rules go in RULES.md.
-->

## Read on every task

- `CONTEXT.md` — repository map and verification commands.
- `RULES.md` — the owner's rules for this project; they win over the kit.
- `<KIT>/rules/workflow.md` — how to work on any task.
- `<KIT>/rules/general-rules.md` — the owner's rules for every project.
- `<KIT>/rules/vertical-slices.md` — code layout.
- `<KIT>/rules/unit-testing.md` — where tests go.
- `GLOSSARY.md` — product vocabulary.

## Skills

Loaded on demand from `.claude/skills/` (symlinked from `<KIT>/skills/`):

- `autopilot` — driving a set of issues to merged pull requests (owner-started).
- `git` — branches, commits, pushes, pull requests, merges.
- `implement` — taking an assigned issue to an open pull request.
- `issues` — writing, labeling, and filing issues; tracker operations.
- `knowledge` — knowledge notes in `<KIT>/knowledge/` and `docs/knowledge/`.
- `rules` — adding, changing, or moving a rule.
