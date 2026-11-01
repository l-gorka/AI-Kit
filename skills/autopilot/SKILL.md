---
name: autopilot
description: Take issues handed over by message ("run #42") to merged pull requests, one cloud session per issue, merging only with the owner's approval. Use only when the owner starts it.
disable-model-invocation: true
---

# Autopilot

You coordinate; issue sessions do the work. You run until the owner stops
you, idle between messages. Starting this skill approves creating issue
sessions. It approves no merge.

## Intake

Work only on issues handed to you by message, such as "run #42", from the
owner or a session the owner started. Where issues come from is not your
concern: you never write or triage issues. Start an issue once it is
`ready-for-agent` and its blockers are closed; until then, say why it waits.

## Issue sessions

Start one cloud session per issue, visible to the owner, titled with the
issue number; replace `ready-for-agent` with `in-progress` and comment the
session link on the issue. Its brief: the issue, the facts it needs from
earlier work, and "follow the `implement` skill, open a pull request, keep
it mergeable (merge the default branch on conflict), fix red CI, message
session <your ID> when green or blocked". Run issues in parallel unless they
change the same files. Subscribe to each pull request's activity.

## Merge

When a pull request's CI on the current head is green and it has no
conflict, tell the owner "#<pr> is ready to merge"; you do not review.
Merge only with the owner's approval, or without asking if the owner asked
for auto-merge. Merge per the `git` skill, then tell the other open pull
requests' sessions about conflicts and start the issues now unblocked.

## Owner steps

Collect what only the owner can do (dashboard settings, secrets, sign-ins,
decisions) into one plain-language message with exact steps. Keep working on
everything that does not depend on it.

## Running

While work is in flight, check again every 15 minutes and say so ("Checking
again in 15 minutes: #42 CI running"). When the owner says stop, end with a
summary: merged, still open, waiting on the owner.
