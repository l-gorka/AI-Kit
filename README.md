# ai-kit

Reusable, project-agnostic instructions for AI coding agents: workflow, Git
rules, issue-tracker conventions, and documentation boundaries. It contains no
product or domain knowledge.

## Layout

```text
agents/                 Generic operating procedures (referenced by AGENTS.md)
  workflow.md
  git-workflow.md
  issue-tracker.md
  issue-authoring.md
  triage-labels.md
  domain.md
  knowledge.md
  rules.md
  unit-testing.md
  vertical-slices.md
templates/              Skeletons for project-owned files
  CONTEXT.md
  GLOSSARY.md
  RULES.md
  adr-template.md
AGENTS.template.md      Entry point to copy into a project as AGENTS.md
```

## What stays in the project

These are never part of the kit:

- `GLOSSARY.md`, `docs/adr/`, `docs/specs/`, `docs/design/`
- `CONTEXT.md` (repo map, verification commands, project conventions)
- `RULES.md` (decisions the project owner has stated)
- `docs/knowledge/` (verified notes for that repo's problems)
- CI configuration

## Using it in a project

1. Mount the kit, either as a submodule (stays in sync) or a plain copy:

   ```sh
   git submodule add <kit-repo-url> .ai-kit
   ```

2. Copy `.ai-kit/AGENTS.template.md` to `AGENTS.md` and replace `<KIT>` with
   `.ai-kit`.
3. Copy `.ai-kit/templates/CONTEXT.md`, `GLOSSARY.md`, and `RULES.md` to the
   project root and fill them in (at minimum the "Verification commands"
   section of `CONTEXT.md`; replace `<KIT>` in `RULES.md`).

## Overriding

To deviate (for example a non-GitHub tracker), edit the file's reference in the
project's `AGENTS.md` to point at a project-local replacement instead of the
kit's version. Don't edit kit files for a single project.

## Skills

Skills (`/tdd`, `/to-tickets`, `/triage`, ...) are installed globally under
`~/.agents/skills` and are not part of this kit. The kit's docs reference them
by name only.
