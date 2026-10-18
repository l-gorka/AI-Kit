# Agent workflow

This document defines the default operating procedure for implementation work.
It applies to every workspace in the repository unless the issue narrows the
scope. Project-specific facts (stack, commands, conventions) live in the
project's `CONTEXT.md`, not here.

## Modes

### Implementation mode

Use this mode when working on an assigned issue.

1. Read `CONTEXT.md`, `GLOSSARY.md`, relevant specifications and ADRs, the
   assigned issue, and relevant knowledge notes. Read any design or
   convention documents that `CONTEXT.md` points to for the area you touch.
2. Confirm that the issue states an outcome, acceptance criteria, boundaries,
   and test expectations. Ask focused questions before coding when a material
   decision is missing.
3. Start from the current local default branch (usually `main`) unless the
   user specifies a different base. Create a new implementation branch for
   every task. If the preferred branch name already exists locally, append
   `-v2`, then `-v3`, and so on until the name is unused.
4. Follow `git-workflow.md` when creating the implementation branch.
5. Implement the smallest coherent change that satisfies the issue.
6. Keep the diff scoped. Surface adjacent improvements, bugs, spec/implementation
   mismatches, TODOs, and tech debt as follow-up issues (see "Filing follow-up
   issues" below) rather than expanding the current diff. Follow the
   project-specific conventions listed in `CONTEXT.md`.
7. Verify the change using the risk-based test strategy below.
8. Review the resulting diff for scope, acceptance criteria, error handling,
   and documentation impact.
9. Follow `git-workflow.md` when preparing the local commit.
10. Hand substantive code/configuration changes to a separate review agent after
    the implementation diff is verified. Review agents inspect the diff,
    acceptance criteria, scope, and supplied verification evidence; they do not
    rerun lint, build, or test commands. The implementation agent owns
    verification.
11. Address review findings and repeat verification/review as needed.

Implementation mode may read the assigned issue but does not create, edit,
label, comment on, or close issues or PR metadata — except for filing
follow-up issues as described in "Filing follow-up issues" below. Git remote
changes remain governed by `git-workflow.md`.

### Issue-management mode

Use this mode only when the task explicitly asks for issue or PR management.
This mode may create, edit, label, comment on, or close tracker items using
the repository's issue-tracker conventions (`issue-tracker.md`).

## Filing follow-up issues

Implementation mode may file follow-up issues for work it discovers but does
not do itself. File an issue when you encounter any of:

- an adjacent improvement that is out of scope for the current ticket,
- a bug found while working on something else,
- a specification/implementation mismatch that needs a contract change,
- a TODO/FIXME discovered in code,
- tech debt or a refactor opportunity.

**Policy: propose, then create on approval.** Do not create the issue
automatically. Summarize each proposed issue (title + one-line "what to build" +
the trigger that surfaced it) and wait for the user to approve, edit, or drop it
before creating it. Batch multiple proposals into one message when several come
up in a single task.

Write every filed issue per `issue-authoring.md` and apply the `ready-for-agent`
label. Drive the tracker per `issue-tracker.md`.

## Scope and specifications

Specifications describe desired behavior. If implementation work reveals a
mismatch between a specification and the existing system, record it as explicit
follow-up work unless the current issue already authorizes the change. Do not
silently change a contract while implementing an unrelated task.

When a requirement is materially ambiguous, ask a focused question and pause
that part of the implementation. Do not turn an unconfirmed assumption into a
new product rule.

## Testing strategy

Choose tests by risk:

- Use focused unit or component tests for local logic and UI state.
- Use integration tests for persistence, security, and API boundaries.
- Use end-to-end tests for critical user journeys that cross system boundaries.
- Preserve existing tests and add regression coverage for fixed behavior.

The baseline verification commands are defined in the project's `CONTEXT.md`.
Run the relevant commands locally before handoff.

If verification fails, diagnose the cause and fix it within scope. Preserve the
test's intent; do not weaken or remove a check merely to make it pass. If the
failure is blocked by environment or external access, report the evidence and
stop at that boundary.

## Documentation and memory

Update durable documentation in the same change when a term, architecture
decision, or workflow rule is resolved:

- Add shared product terms to `GLOSSARY.md`.
- Add durable architectural trade-offs to `docs/adr/`.
- Add stable navigation information to `CONTEXT.md`.
- Add operating rules to this file (or to the project's `AGENTS.md` when they
  are project-specific).

Before solving a recurring or environment-specific problem, read relevant
notes in the project's knowledge directory (see `knowledge.md`). Add a knowledge
note only after the solution is verified and likely to help a future agent.
Include symptoms, cause, fix, verification, and references. Never include
credentials, tokens, or other secrets. Update or supersede stale notes only
when the replacement is verified.

## Completion

Work is complete when the acceptance criteria are met, the relevant tests and
lint/build checks pass, the diff is scoped, durable documentation is updated,
and the separate review-agent pass is complete or its findings are explicitly
accepted by a human.
