# ai-kit

Reusable instructions for AI coding agents: workflow, Git rules,
issue-tracker conventions, and documentation boundaries. It contains no
product or domain knowledge.

## Layout

```text
agents/                 Operating procedures (indexed by AGENTS.md)
  workflow.md
  git-workflow.md
  issue-tracker.md
  issue-authoring.md
  triage-labels.md
  knowledge.md
  rules.md
  unit-testing.md
  vertical-slices.md
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
- `RULES.md` (decisions the project owner has stated, including all project
  conventions and every deviation from this kit; see `agents/rules.md`)
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

To deviate from the kit in one project, see `agents/rules.md` → "Precedence".

## Skills

Skills (`/grill-with-docs`, `/to-tickets`, `domain-modeling`, ...) are not part
of this kit. Install them per machine: locally in the user skills directory,
and in the cloud environment's setup script. The kit's docs reference them by
name only.
