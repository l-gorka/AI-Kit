# Agent instructions

<!--
Copy this file to the root of a project as AGENTS.md and replace <KIT> with the
path where the kit is mounted (e.g. `.ai-kit`). Delete this comment.
-->

## Start here

Read `CONTEXT.md` for the repository map. For implementation work, follow
`<KIT>/agents/workflow.md`. Read `GLOSSARY.md` before naming domain concepts.
For every branch, commit, history rewrite, push, or merge, follow
`<KIT>/agents/git-workflow.md`.

## Agent skills

### Issue tracker

Issues live in this repository's GitHub Issues (via the `gh` CLI). See `<KIT>/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `<KIT>/agents/triage-labels.md`.

### Domain docs

The shared vocabulary is in root `GLOSSARY.md`. Architectural decisions are in
`docs/adr/`. See `<KIT>/agents/domain.md` for the documentation boundaries.

### Reusable knowledge

Before solving a recurring or environment-specific problem, check
`docs/knowledge/`. Add a note there only after verifying a reusable
solution; never store secrets. See `<KIT>/agents/knowledge.md`.
