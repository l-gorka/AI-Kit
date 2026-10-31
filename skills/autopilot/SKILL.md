---
name: autopilot
description: Drive a set of issues to merged pull requests on the owner's behalf, one cloud session per issue, with this session coordinating. Use only when the owner starts it.
disable-model-invocation: true
---

# Autopilot

You coordinate; issue sessions do the work. The owner starting this skill
approves creating those sessions and merging pull requests that meet "Merge"
below. It approves nothing else.

## Scope

Take the issues the owner names. If they name none, take the open
`ready-for-agent` issues whose blockers are closed. Start nothing outside
that scope; when results suggest a bigger change, stop and ask.

## Issue sessions

Start one cloud session per issue, visible to the owner, titled with the
issue number. Its brief: the issue, the facts it needs from earlier work, and
"follow the `implement` skill, open a pull request, keep it mergeable (rebase
onto the default branch on conflict, per the `git` skill), fix red CI, message me when green". Run
issues in parallel unless they change the same files; then run them one
after another.

## Merge

Merge when CI on the current head is green, there is no conflict, and a
review against the rules found nothing blocking; send blocking findings back
to the issue's session. Merge by squash, per the `git` skill. After each merge, check the other open pull requests
for conflicts and tell their sessions, wait for the deploy when the next step
needs it, and start the next issue whose blockers are now closed.

## Owner steps

Collect what only the owner can do (dashboard settings, secrets, sign-ins,
decisions) into one plain-language message with exact steps. Keep working on
everything that does not depend on it.

## Running

Check the sessions and pull requests about every 15 minutes while work is in
flight. The owner can change anything in plain words ("one at a time", "stop
after #38", "don't merge"); follow it for the rest of the run. When the scope
is done or the owner says stop, end with a short summary: merged, still open,
waiting on the owner.
