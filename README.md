# ai-kit

Reusable instructions for AI coding agents: workflow, Git rules, general code
conventions, issue-tracker conventions, and documentation boundaries. It
contains no product or domain knowledge.

## Layout

```text
rules/                  Rules read on every task (indexed by AGENTS.md)
  workflow.md
  general-rules.md
  unit-testing.md
  vertical-slices.md
skills/                 Procedures loaded on demand (symlinked into projects)
  autopilot/SKILL.md
  git/SKILL.md
  implement/SKILL.md
  issues/SKILL.md
  knowledge/SKILL.md
  rules/SKILL.md
knowledge/              Verified notes on stack and environment problems
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
  conventions and every deviation from this kit; see the `rules` skill)
- `docs/knowledge/` (verified notes for that repo's own problems; notes that
  hold in any project on the same stack go in the kit's `knowledge/`)
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

To deviate from the kit in one project, add a rule to its `RULES.md`; see the
`rules` skill → "Precedence".

## Skills

The kit's own skills live in `skills/` and reach a project through the
symlinks from step 4, so they update with the submodule:

- `autopilot` — the standing orchestrator for an `orchestrator` issue: one
  session per ready sub-issue, merges only with approval (started by the
  owner).
- `git` — branches, commits, pushes, pull requests, merges.
- `implement` — taking an assigned issue to an open pull request.
- `issues` — writing, labeling, and filing issues; tracker operations.
- `knowledge` — knowledge notes in the kit and the project.
- `rules` — adding, changing, or moving a rule.

Other skills (`/grill-with-docs`, `/to-tickets`, `domain-modeling`, ...) are
not part of this kit. Install them per machine: locally in the user skills
directory, and in the cloud environment's setup script. The kit's docs
reference them by name only.
