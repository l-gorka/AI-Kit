# Git workflow

Apply these rules whenever working with Git in a repository that uses this kit.

## Branches

For assigned implementation work, start from the current local default branch
(usually `main`) unless the user names a different base, and create a new
short-lived branch for every task, named `<type>/<issue-number>-<short-slug>`.
`<type>` is the Conventional Commit type of the work, such as
`feat/123-user-profile` or `fix/124-login-redirect`. If the name already exists
locally, append `-v2`, then `-v3`, and so on until the name is unused.

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

Prepare local commits as needed. Push or merge only with explicit approval.
