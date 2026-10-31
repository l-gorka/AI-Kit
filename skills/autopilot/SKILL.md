---
name: autopilot
description: Work through the sub-issues of one autopilot issue: start one cloud session per ready-for-agent sub-issue in blocking order, keep their pull requests mergeable, and merge only with the owner's approval. Use only when the owner starts it.
disable-model-invocation: true
---

# Autopilot

You coordinate; issue sessions do the work. You run until the owner stops
you, idle between events. Starting this skill approves creating issue
sessions. It approves no merge.

## Start

The owner gives you an autopilot issue: a GitHub issue whose sub-issues are
the work. Label it `autopilot` and comment this session's link on it.

When a sub-issue gets the `ready-for-agent` label, the project's wake-up
workflow messages the session linked on the autopilot issue with "run a
pass", so keep your link there.

## Scope

Work only on open sub-issues of the autopilot issue that are
`ready-for-agent`. Triage gets them there; you never triage. When results
suggest a bigger change, stop and ask.

## State lives on GitHub

When you start an issue session, replace `ready-for-agent` with
`in-progress` and comment the session link on the sub-issue. Blocking edges
give the order. Read the state from GitHub on every pass, not from memory.

## The pass

Run on every wake-up: the wake-up message, a message from an issue session,
a pull request event, or the owner.

1. Read the sub-issues: labels, blockers, sessions, pull requests.
2. Start an issue session for each `ready-for-agent` sub-issue whose blockers
   are closed; run them in parallel unless they change the same files.
3. Subscribe to each new pull request's activity.
4. When a pull request's CI on the current head is green, it has no conflict,
   and a review against the rules found nothing blocking, tell the owner and
   comment on the autopilot issue: "#<pr> is ready to merge". Send blocking
   findings back to the issue's session.
5. End the turn. Never poll or wait in a loop; the next event wakes you.

## Issue sessions

Start one cloud session per sub-issue, visible to the owner, titled with the
issue number. Its brief: the issue, the facts it needs from earlier work, and
"follow the `implement` skill, open a pull request, keep it mergeable (merge
the default branch on conflict), fix red CI, message session <your ID> when
green or blocked".

## Merge

Merge only with the owner's approval: a `merge` comment on the pull request,
a message in this session, or a standing approval in the autopilot issue
body (such as "merge when green"). Merge per the `git` skill, then tell the
other open pull requests' sessions about conflicts and start the sub-issues
that are now unblocked.

## Owner steps

Collect what only the owner can do (dashboard settings, secrets, sign-ins,
decisions) into one plain-language message with exact steps, also posted on
the autopilot issue. Keep working on everything that does not depend on it.

## Stop

When the owner says stop or closes the autopilot issue, comment a summary on
it: merged, still open, waiting on the owner.
