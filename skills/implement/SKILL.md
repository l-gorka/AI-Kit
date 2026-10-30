---
name: implement
description: Take an assigned issue to an open pull request: check the issue, branch, implement, test, review, and hand off. Use when the owner assigns an issue or asks to implement one.
---

# Implement an issue

The kit's `rules/workflow.md` applies throughout; this skill adds the steps
for taking an issue to a pull request.

## Steps

1. Read the issue and its linked specifications and ADRs. Confirm it states
   an outcome, acceptance criteria, boundaries, and test expectations; ask
   focused questions before coding when a material decision is missing.
2. Create a new branch per the `git` skill, even when the session already put
   you on one.
3. Implement the smallest coherent change that satisfies the issue.
4. Test by risk (see "Testing") and run the verification commands.
5. Review your own diff for scope, acceptance criteria, error handling, and
   documentation impact.
6. Commit per the `git` skill.
7. Hand substantive code or configuration changes to a separate review agent
   (see "Review").
8. Address the findings, repeating verification and review as needed.
9. Push and open the pull request per the `git` skill.

## Testing

Where tests go: the kit's `rules/unit-testing.md`.

- Use focused unit or component tests for local logic and UI state.
- Use integration tests for persistence, security, and API boundaries.
- Use end-to-end tests for critical user journeys that cross system
  boundaries.
- Preserve existing tests and add regression coverage for fixed behavior.

## Review

The review agent inspects the diff, the acceptance criteria, the scope, and
the verification evidence you supply; it does not rerun lint, build, or test
commands. It checks the diff against the kit's rules and the project's rules
file and reports unexplained deviations. State any deliberate deviation, with
its reason, in the handoff.

Scope the review to the repository's own source. Do not read installed,
vendored, or generated third-party code (`node_modules`, lockfiles, bundled
output). If a dependency's behavior is load-bearing and unverified, report
that as a finding instead of reading its internals.

## Documentation

When the work resolves a term, decision, or convention, propose the update in
the same change: owner decisions in the rules file (`rules` skill), product
terms in `GLOSSARY.md`, architectural trade-offs in `docs/adr/`, navigation
facts in `CONTEXT.md`.

## Done

The work is done when the acceptance criteria are met, the relevant checks
pass, the diff is scoped, durable documentation is updated (proposed per
`rules/workflow.md`), the review findings are resolved or accepted by the
owner, and the pull request is open.
