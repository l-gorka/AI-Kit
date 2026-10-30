# Workflow rules

How to work on any task, in the same format as a project's rules file.

## Let the project's rules file win

Follow the project's rules file (default: `RULES.md` at the repo root) over
every kit rule and skill, and when two statements at the same level conflict,
ask the owner which holds before acting on either.
Why: each project can deviate from the kit without editing the kit.

## Load a skill before the work it covers

Load the matching skill from `.claude/skills/` before its work: `git` before
any branch, commit, push, pull request, or merge; `implement` when working on
an issue; `issues` before any tracker operation; `knowledge` before solving a
recurring or environment-specific problem; `rules` before adding or changing
a rule.
Why: skills hold the procedures, and the agent's built-in habits differ from
them.

## Read the project's documents first

Before changing code, read `CONTEXT.md`, `GLOSSARY.md`, the rules, and the
specifications, ADRs, and design documents for the area you touch.
Why: the change then fits the existing system and vocabulary.

## Keep the diff scoped

Make the smallest coherent change that does the task, and propose adjacent
improvements, bugs, TODOs, and tech debt as follow-up issues (`issues`
skill) instead of fixing them.
Why: small diffs are easy to review and revert.

## Verify before handing off

Run the relevant verification commands from `CONTEXT.md`, fix failures within
scope, and never weaken or remove a check to make it pass; when the
environment blocks verification, report the evidence and stop.
Why: the owner relies on the handoff being checked.

## Change no contract silently

When work reveals a mismatch with a specification or contradicts an ADR, say
so and record it as follow-up work unless the task authorizes the change;
when a requirement is materially ambiguous, ask instead of assuming.
Why: specifications and ADRs change only by decision, never as a side effect.

## Use the glossary's terms

Name domain concepts in issues, proposals, code, and tests as `GLOSSARY.md`
defines them, never with a synonym it avoids.
Why: one name per concept keeps code, docs, and tracker searchable.

## Touch the tracker only when asked

Create, edit, label, comment on, or close issues and pull requests only when
the task asks for it or a skill says to.
Why: tracker changes notify people and are hard to undo.

## Ask before editing agent documents

Before changing `AGENTS.md`, `CONTEXT.md`, `GLOSSARY.md`, the rules file,
`docs/adr/`, `docs/knowledge/`, or this kit, show the owner the exact text
and the reason, and wait for approval; batch proposals from one task.
Why: these documents steer every future session.

## Give each statement one home

Write each statement in exactly one document and link to it elsewhere; keep
`CONTEXT.md` to facts (what exists, where, how to run it) and put every "do
this" statement in the rules.
Why: a statement in two places drifts into a contradiction.

## Announce scripts that change files

Prefer the file-edit tools; before running a script or shell command that
changes files, say which files it changes, what it changes, and why a script.
Why: edit tools show every change as a diff, scripts do not.
