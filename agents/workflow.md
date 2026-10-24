# Agent workflow

This document defines the default operating procedure for implementation work.
It applies to every workspace in the repository unless the issue narrows the
scope. Project-specific facts (repository map, stack, commands) live in the
project's `CONTEXT.md`, and the project's conventions live in its rules file
(see `rules.md`), not here.

## Modes

### Implementation mode

Use this mode when working on an assigned issue.

1. Read `CONTEXT.md`, `GLOSSARY.md`, the rules file (see `rules.md`), relevant
   specifications and ADRs, the assigned issue, and relevant knowledge notes.
   Read any design or convention documents that `CONTEXT.md` points to for the
   area you touch.
2. Confirm that the issue states an outcome, acceptance criteria, boundaries,
   and test expectations. Ask focused questions before coding when a material
   decision is missing.
3. Create a new branch for the task per `git-workflow.md`, even when the
   session already put you on a branch: fetch the remote default branch,
   branch from it, and name the branch by the kit's convention.
4. Implement the smallest coherent change that satisfies the issue.
5. Keep the diff scoped. Surface adjacent improvements, bugs, spec/implementation
   mismatches, TODOs, and tech debt as follow-up issues (see "Filing follow-up
   issues" below) rather than expanding the current diff. Follow the
   rules file and the code layout in `vertical-slices.md`.
6. Verify the change using the risk-based test strategy below.
7. Review the resulting diff for scope, acceptance criteria, error handling,
   and documentation impact.
8. Follow `git-workflow.md` when preparing the local commit.
9. Hand substantive code/configuration changes to a separate review agent after
   the implementation diff is verified. Review agents inspect the diff,
   acceptance criteria, scope, and supplied verification evidence; they do not
   rerun lint, build, or test commands. They also check the diff against the
   rules file and report unexplained deviations. The implementation agent owns
   verification.
10. Scope every review to the repository's own source. Do not read installed,
    vendored, or generated third-party code (`node_modules`, dependency
    lockfiles, bundled output) or other tools that are not part of this project.
    Reason about dependency behavior from the project's own source and the
    assumptions already recorded in the issue, specification, or context; if a
    dependency's behavior is load-bearing and unverified, report that as a
    finding instead of reading the dependency's internals.
11. Address review findings and repeat verification/review as needed.

Implementation mode may read the assigned issue but does not create, edit,
label, comment on, or close issues or PR metadata — except for filing
follow-up issues as described in "Filing follow-up issues" below, the
task's own issue when it has none, and the task's pull request (both per
`git-workflow.md`).

### Issue-management mode

Use this mode only when the task explicitly asks for issue or PR management.
This mode may create, edit, label, comment on, or close tracker items using
the repository's issue-tracker conventions (`issue-tracker.md`).

## Editing files

Prefer the agent's file-edit tools, which show every change as a diff. A
script or shell command (Python, `sed`, `awk`, heredocs, redirects, or
similar) may change files when it is the better tool, but say so before
running it: in plain words, which files it changes, what it changes, and why
a script instead of the edit tools.

## Filing follow-up issues

Implementation mode may file follow-up issues for work it discovers but does
not do itself. File an issue when you encounter any of:

- an adjacent improvement that is out of scope for the current ticket,
- a bug found while working on something else,
- a specification/implementation mismatch that needs a contract change,
- a TODO/FIXME discovered in code,
- tech debt or a refactor opportunity.

**Policy: propose, then create on approval.** Do not create the issue
automatically. Summarize each proposed issue (title + type label + one-line
"what to build" + the trigger that surfaced it) and wait for the user to
approve, edit, or drop it before creating it. Batch multiple proposals into one
message when several come up in a single task.

Write every filed issue per `issue-authoring.md`. Drive the tracker per
`issue-tracker.md`.

## Scope and specifications

Specifications describe desired behavior. If implementation work reveals a
mismatch between a specification and the existing system, record it as explicit
follow-up work unless the current issue already authorizes the change. Do not
silently change a contract while implementing an unrelated task.

When sources disagree, use the glossary for terminology, the specifications
for desired behavior, ADRs for architectural rationale, and the current issue
for task scope. For conflicts between the rules file and this kit, see
`rules.md`.

When a requirement is materially ambiguous, ask a focused question and pause
that part of the implementation. Do not turn an unconfirmed assumption into a
new product rule.

### Domain vocabulary and ADRs

When your output names a domain concept (an issue title, a proposal, a test
name), use the term as `GLOSSARY.md` defines it, not a synonym it avoids. If
your output contradicts an existing ADR, say so explicitly instead of silently
overriding it. Changing the glossary or ADRs is the `domain-modeling` skill's
job.

## Testing strategy

See `unit-testing.md` for where test files live.

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

### Ask before editing agent documents

Agent documents are `AGENTS.md`, `CONTEXT.md`, `GLOSSARY.md`, the rules file,
`docs/adr/`, `docs/knowledge/`, and this kit. Before changing any of them,
show the owner the exact proposed text and the reason, then wait for
approval. Batch proposals from one task into one message. This applies even
when another step of this workflow says to update the document.

### What to update

Update durable documentation in the same change when a term, architecture
decision, or workflow rule is resolved:

- Add project conventions and owner decisions to the rules file (see
  `rules.md`). `AGENTS.md` is only the entry point; it holds no rules.
- Add shared product terms to `GLOSSARY.md`.
- Add durable architectural trade-offs to `docs/adr/`.
- Add stable navigation information to `CONTEXT.md`.
- Propose rules that apply to every project as a change to this kit.

### One home per statement

Each statement lives in exactly one document; elsewhere, link to it instead of
restating it. `CONTEXT.md` holds facts only: what exists, where it is, and how
to run it. Anything an agent should or must do — a convention, a layout, a
boundary — is a decision and belongs in the rules file, never in
`CONTEXT.md`.

### Knowledge notes

Before solving a recurring or environment-specific problem, check the
project's knowledge directory. When and how to add a note: `knowledge.md`.

## Completion

Work is complete when the acceptance criteria are met, the relevant tests and
lint/build checks pass, the diff is scoped, durable documentation is updated,
the separate review-agent pass is complete or its findings are explicitly
accepted by a human, and the pull request is open (see `git-workflow.md`).
