---
name: knowledge
description: Check and write knowledge notes, small verified notes about recurring problems, in the kit's `knowledge/` (stack and environment) and the project's `docs/knowledge/`. Use before solving a recurring or environment-specific problem, and after verifying a fix that is likely to be reusable.
---

# Knowledge notes

Small, verified notes about recurring problems, at two levels:

- **Kit knowledge** in the kit's `knowledge/` directory: problems with a
  stack, a tool, or the agent environment that would recur in any project
  using them. Written without project paths, domain terms, or product names;
  links to the evidence may name a project.
- **Project knowledge** in the project's knowledge directory (default:
  `docs/knowledge/`): problems that involve that project's code, data, or
  third-party services.

Check both before solving a recurring or environment-specific problem.

Use one Markdown file per problem. Prefer a descriptive name such as
`build-tool-jdk-mismatch.md` or `e2e-local-stack.md`.

Each note should contain:

- Symptoms
- Cause
- Fix
- Verification
- Relevant issue, PR, commit, or documentation links

Only record solutions that were verified and are likely to be reusable. Write
a note in the kit when it holds without the project; otherwise in the project,
and move it to the kit when it turns out to hold elsewhere too. Changing
`knowledge/` is a change to this kit. Update or supersede a stale note only
when the replacement is verified. Never store secrets, credentials, tokens,
or unredacted private logs.
