---
name: git
description: Branch, commit, push, pull request, and merge rules for this project. Load before creating a branch, committing, rewriting history, pushing, opening a pull request, or merging; these rules replace the agent's built-in Git habits.
---

# Git

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
any session-assigned branch name.

Two kinds of work need no issue: changes to this kit's own repository, and
bumping the kit submodule in a project. When such work has an issue anyway,
keep its number in the name; without one, name the branch
`<type>/<short-slug>`, such as `chore/bump-ai-kit`. Any other work without an
issue gets one first: propose it per the `issues` skill and create it once
the owner approves, before branching.

## Commits

Create a local Conventional Commit only after the work is verified, or when
explicitly requested. Use the unscoped `<type>: <description>` form, such as
`feat: add Board persistence`; parenthesized scopes are not used. Commit
subject capitalization is unrestricted.

- Make one commit per logical change, in order. Each verified stage gets its
  own commit; later work goes into a new commit.
- Do not amend, squash, or reorder a commit that represents a finished,
  verified stage; rebasing the branch onto the default branch (below) is the
  only allowed rewrite.
- `--amend` is only for correcting the just-created commit before review; it
  must not fold in new work.
- Do not rewrite history merely to produce one clean commit.

## Remote changes

When the work is verified and the review-agent pass is complete, push the
branch and open a pull request without asking. Its title becomes the commit
on the default branch, so write it as `<type>: <issue title>` with the
title's first letter lowercased and `<type>` taken from the issue's type
label (`feature` is `feat`); reword it only when the work's scope changed.
Without an issue, the title is the Conventional Commit subject of the change.
The body links the issue (`Closes #<n>`) and summarizes what changed and how
it was verified.

Do not push or open the pull request while verification fails or review
findings are unresolved; report the blocker to the owner instead.

## Keeping the branch current

Never create a merge commit: no `git merge`, no plain `git pull`, no "Update
branch" merge button. To take in the default branch or resolve a conflict,
run `git fetch origin` and `git rebase origin/main`, resolve each conflict,
re-run verification, and push with `git push --force-with-lease`. Force-push
only your own pull request branch, never the default branch.

## Merging

Merge only with explicit approval, and only by squash (`merge_method:
squash`), with the pull request title as the commit title and GitHub's
`(#<n>)` suffix. Never use the merge or rebase methods.
