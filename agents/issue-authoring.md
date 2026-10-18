# Issue authoring conventions

How issues should be written. Read this before creating an issue, whether the
issue comes from a planned breakdown (`/to-tickets`) or an opportunistic
follow-up filed mid-implementation (see `workflow.md` → "Filing follow-up
issues"). Mechanics for driving the tracker live in `issue-tracker.md`; this
file is only about *what a good ticket looks like*.

## Title

- One imperative sentence, lowercase or Capitalized — your call, but be
  consistent within a batch.
- Use the domain term from `GLOSSARY.md` for the concept. Don't invent synonyms
  the glossary avoids.
- No issue numbers, no status prefixes, no `[bug]` tags — labels carry that.
- Specific enough to distinguish from siblings, short enough to scan a list.

  - Good: `add password reset request form`
  - Bad: `improve UX`, `Issue: login`, `fix the thing`

## Body

Every issue has three sections, in this order:

1. **What to build** — the end-to-end behaviour from the user's perspective, not
   a layer-by-layer implementation list. State the outcome, not the steps.
2. **Acceptance criteria** — a checklist, each item verifiable on its own.
3. **Blocked by** — references to the blocking tickets, or
   `None (can start immediately)`.

For follow-up issues filed mid-implementation, add a short **Context** line at
the top: which task/PR surfaced it and why it's out of scope for that task.

Avoid specific file paths or code snippets unless they encode a decision more
precisely than prose (a state machine, schema, or type shape from a prototype).
Paths go stale; reference the glossary term or ADR instead.

## Labels

- Apply `ready-for-agent` on creation for any ticket that is fully specified
  and intended for an AFK agent. See `triage-labels.md` for the full vocabulary.
- Do not apply `needs-triage` to tickets you authored — you already triaged them
  by writing them.

## Blocking edges

Prefer the tracker's native issue dependencies (see `issue-tracker.md` →
"Blocking"). Where dependencies aren't available, fall back to a
`Blocked by: #<n>, #<n>` line at the top of the body. A ticket is unblocked when
every blocker is closed.

## Sizing (planned breakdowns only)

Each ticket from `/to-tickets` is a tracer-bullet vertical slice: narrow but
complete through every layer, demoable on its own, sized to fit a single fresh
context window. Single follow-up issues don't need to be slices — they're one
piece of work — but keep them scoped to one verifiable outcome.
