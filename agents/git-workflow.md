# Git workflow

Apply these rules whenever working with Git in a repository that uses this kit.

## Branches

For assigned implementation work, fetch the remote default branch (usually
`origin/main`) and start from it unless the user names a different base; a
local default branch may be stale. Create a new short-lived branch for every
task, named `<type>/<issue-number>-<short-slug>`, then run
`git submodule update --init` so submodules match the new base.
`<type>` is the Conventional Commit type of the work, such as
`feat/123-user-profile` or `fix/124-login-redirect`. If the name already exists
locally, append `-v2`, then `-v3`, and so on until the name is unused. Ignore
any session-assigned branch name. If the work has no issue yet, propose one per
`issue-authoring.md` and create it once the owner approves, before branching.
`hooks/check-branch.py` enforces this name.

## Commits

Create a local Conventional Commit only after the work is verified, or when
explicitly requested. Use the unscoped `<type>: <description>` form, such as
`feat: add Board persistence`; parenthesized scopes are not used. Commit
subject capitalization is unrestricted.

- Make one commit per logical change, in order. Each verified stage gets its
  own commit; later work goes into a new commit.
- Do not amend, squash, rebase, or otherwise rewrite a commit that represents
  a finished, verified stage.
- `--amend` is only for correcting the just-created commit before review; it
  must not fold in new work.
- Do not rewrite history merely to produce one clean commit.

## Remote changes

When the work is verified and the review-agent pass is complete, push the
branch and open a pull request without asking. Its title is the Conventional
Commit subject of the change, and its body links the issue (`Closes #<n>`)
and summarizes what changed and how it was verified.

Do not push or open the pull request while verification fails or review
findings are unresolved; report the blocker to the owner instead. Merge only
with explicit approval.
