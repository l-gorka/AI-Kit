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
  autopilot/SKILL.md
  issues/SKILL.md
  knowledge/SKILL.md
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

To deviate from the kit in one project, see `guides/rules.md` → "Precedence".

## Skills

The kit's own skills live in `skills/` and reach a project through the
symlinks from step 4, so they update with the submodule:

- `autopilot` — works through the project's `ready-for-agent` issues in
  waves until their pull requests are merged; the owner starts it with
  `/autopilot`.
- `issues` — writing, labeling, and filing issues; tracker operations.
- `knowledge` — the project's knowledge notes.

### What `autopilot` needs from a project

- Merge rights for the agent's GitHub access, or auto-merge enabled on the
  repository.
- CI that runs on pull requests; `autopilot` never merges without it.
- A cloud environment for the project with its keys as environment secrets
  and its setup script installing the toolchain.
- The labels from the `issues` skill, including `needs-info` and
  `ready-for-human`.

Other skills (`/grill-with-docs`, `/to-tickets`, `domain-modeling`, ...) are
not part of this kit. Install them per machine: locally in the user skills
directory, and in the cloud environment's setup script. The kit's docs
reference them by name only.
