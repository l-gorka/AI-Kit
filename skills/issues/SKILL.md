---
name: issues
description: How to write, file, label, and link issues in the issue tracker (GitHub via `gh`). Use before creating, reading, editing, labeling, commenting on, or closing an issue, including follow-up issues filed mid-implementation and tickets from a planned breakdown.
---

# Issues

What a good issue looks like and how to drive the tracker. A project on a
different tracker or label vocabulary records it in its `RULES.md` (see the
kit's `guides/rules.md`).

## Writing an issue

Read this before creating an issue, whether it comes from a planned breakdown
(`/to-tickets`) or a follow-up filed mid-implementation (see the kit's
`guides/workflow.md` → "Filing follow-up issues").

### Title

- One imperative sentence, lowercase or Capitalized — your call, but be
  consistent within a batch.
- Use the domain term from `GLOSSARY.md` for the concept. Don't invent synonyms
  the glossary avoids.
- No issue numbers, no status prefixes, no `[bug]` tags — labels carry that.
- Specific enough to distinguish from siblings, short enough to scan a list.

  - Good: `add password reset request form`
  - Bad: `improve UX`, `Issue: login`, `fix the thing`

### Body

Every issue has four sections, in this order:

1. **What to build** — the end-to-end behaviour from the user's perspective, not
   a layer-by-layer implementation list. State the outcome, not the steps.
2. **Acceptance criteria** — a checklist, each item verifiable on its own.
3. **Blocked by** — references to the blocking tickets, or
   `None (can start immediately)`.
4. **Defined by** — links to every product specification, technical
   architecture document, or ADR that owns the ticket's behavior or durable
   constraints. Link to those documents instead of copying their rules into the
   issue. Use stable GitHub document URLs for tracker issues; the referenced
   documents must be committed before their links can resolve.

For follow-up issues filed mid-implementation, add a short **Context** line at
the top: which task/PR surfaced it and why it's out of scope for that task.

Avoid specific file paths or code snippets unless they encode a decision more
precisely than prose (a state machine, schema, or type shape from a prototype).
Paths go stale; reference the glossary term or ADR instead.

### Labeling a new issue

- Apply one type label on creation.
- Apply `ready-for-agent` on creation for any ticket that is fully specified
  and intended for an AFK agent.
- Do not apply `needs-triage` to tickets you authored — you already triaged them
  by writing them.

### Sizing (planned breakdowns only)

Each ticket from `/to-tickets` is a tracer-bullet vertical slice: narrow but
complete through every layer, demoable on its own, sized to fit a single fresh
context window. Single follow-up issues don't need to be slices — they're one
piece of work — but keep them scoped to one verifiable outcome.

## Labels

The label vocabulary the skills and the workflow use. Every open issue carries
one type label and one triage label.

### Type labels

What kind of work the issue is.

| Label | Meaning |
| --- | --- |
| `feature` | A new capability users can see |
| `bug` | Existing behavior is broken or wrong |
| `polish` | Works, but copy, layout, visual design, accessibility, or a small UX detail needs fixing |
| `refactor` | Internal restructuring with no user-visible change |
| `test` | Test coverage or test reliability |
| `chore` | Dependencies, CI, tooling, or configuration |

When two fit, pick the one for the outcome a user would notice: a refactor
that fixes broken behavior is a `bug`, and so is a flaky test caused by a race
in product code.

### Triage labels

Where the issue stands.

| Label | Meaning |
| --- | --- |
| `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | Requires human implementation |
| `wontfix` | Will not be actioned |

## Tracker: GitHub

Issues and specs live as GitHub issues. Use the `gh` CLI for all operations.

- **Create an issue**: `gh issue create --title "..." --body "..." --label "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`. A label must exist before it can be applied: `gh label create <name>` creates a missing one.
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

When a skill says "publish to the issue tracker", create a GitHub issue. When
a skill says "fetch the relevant ticket", run `gh issue view <number> --comments`.

### Blocking edges

Use GitHub's native issue dependencies, the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric database id (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only, the live gate).

Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the issue body. An issue is unblocked when every blocker is closed.
