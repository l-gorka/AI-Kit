# GitHub: CI does not run on a pull request with merge conflicts

## Symptoms

A pull request shows no check runs at all, and its `mergeable_state` is
`dirty`.

## Cause

`pull_request` workflows run on the merge of the branch into the base. When
the branch conflicts with the base, there is no merge commit, so no workflow
runs.

## Fix

Update the pull request branch with the base as the `git` skill says,
resolve the conflicts, and push; CI then runs. When several pull requests
are open in parallel, check `mergeable_state` after each merge and update the
ones that went `dirty`.

## Verification

After updating the branch with `main` and pushing, the check ran and passed.

## Links

- l-gorka/yt-knowledge-base#23, l-gorka/yt-knowledge-base#24
