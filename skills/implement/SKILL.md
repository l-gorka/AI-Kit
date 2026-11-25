---
name: implement
description: Take an assigned issue to a reviewed pull request: check the issue, branch, implement, test, open a pull request, and get it through the spec and quality reviews. Use when the owner assigns an issue or asks to implement one.
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
5. Commit per the `git` skill.
6. Push and open the pull request per the `git` skill.
7. Run the spec review, then the quality review, until both pass (see
   "Review").

## Testing

Where tests go: the kit's `rules/unit-testing.md`.

- Use focused unit or component tests for local logic and UI state.
- Use integration tests for persistence, security, and API boundaries.
- Use end-to-end tests for critical user journeys that cross system
  boundaries.
- Preserve existing tests and add regression coverage for fixed behavior.

## Review

Hand the pull request to the `spec-reviewer` agent, and once it passes, to
the `quality-reviewer` agent. Give each the repository, the pull request
number, and the verification evidence; give the spec reviewer the issue
number, and the quality reviewer every deliberate
deviation from the rules with its reason. Each posts its review on the pull
request and returns a verdict.

For every inline comment, fix it or reply with your reason, reply in its
thread with the commit that fixes it, and resolve the thread. Apply or answer
nits without another round. After fixing `blocking` findings, rerun
verification, push, and run the same reviewer again. After two rounds of one
reviewer that still end in `changes needed`, stop and ask the owner, listing
the open findings.

The pull request passes review when the latest spec review and quality review
both end in `Verdict: pass` and every review thread is resolved.

## Documentation

When the work resolves a term, decision, or convention, propose the update in
the same change: owner decisions in the rules file (`rules` skill), product
terms in `GLOSSARY.md`, architectural trade-offs in `docs/adr/`, navigation
facts in `CONTEXT.md`.

## Done

The work is done when the acceptance criteria are met, the relevant checks
pass, the diff is scoped, durable documentation is updated (proposed per
`rules/workflow.md`), the pull request is open, and it passes review or the
owner accepted the open findings.
