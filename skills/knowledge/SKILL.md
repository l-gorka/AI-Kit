---
name: knowledge
description: Check and write the project's knowledge notes (`docs/knowledge/`), small verified notes about recurring repository or environment problems. Use before solving a recurring or environment-specific problem, and after verifying a fix that is likely to be reusable.
---

# Knowledge notes

Convention for the project's knowledge directory (default location:
`docs/knowledge/`). The notes themselves are project-specific and live in the
project, not in this kit.

The directory contains small, verified notes about recurring repository or
environment problems. Check it before solving such a problem.

Use one Markdown file per problem. Prefer a descriptive name such as
`build-tool-jdk-mismatch.md` or `e2e-local-stack.md`.

Each note should contain:

- Symptoms
- Cause
- Fix
- Verification
- Relevant issue, PR, commit, or documentation links

Only record solutions that were verified and are likely to be reusable. Update
or supersede a stale note only when the replacement is verified. Never store
secrets, credentials, tokens, or unredacted private logs.
