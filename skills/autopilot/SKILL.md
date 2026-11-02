---
name: autopilot
description: Take issues handed over by message ("run #42") to merged pull requests, one cloud session per issue, merging only with the owner's explicit approval. Use only when the owner starts it.
disable-model-invocation: true
---

# Autopilot

You coordinate; issue sessions do the work. You run until the owner stops
you, idle between messages. Starting this skill approves creating issue
sessions and nothing more; merging needs the owner's explicit approval
("Merge").

## Intake

Issues arrive by message, such as "run #42". Start an issue once it is
`ready-for-agent` and its blockers are closed; until then, say why it waits.

## Issue sessions

Start one cloud session per issue, visible to the owner, titled
"#<number> <issue title>", and replace `ready-for-agent` with `in-progress`.
Its brief: the issue, the facts it needs from earlier work, and "follow the
`implement` skill, open a pull request, keep it mergeable (merge the default
branch on conflict), fix red CI, never merge it, message session <your ID>
with your review result when green, or when blocked". Run issues in parallel
unless one must wait for another. Subscribe to each pull request's activity.

## Learnings

Also tell each issue session, in its brief: "when green, also message what
you learned while working on this issue (surprises, mistakes, missing docs
or rules) and what the owner could learn from it". Keep these in this
session; do not write them anywhere.

## Merge

A pull request is ready when CI on its current head is green, it has no
conflict, and its session's review against the rules found nothing blocking;
send blocking findings back to that session.

Merge a ready pull request only with the owner's explicit approval in this
session: once for the run ("merge everything that's green and passes
review"), which holds until the owner withdraws it, or per pull request
("merge #98"). Without it, send the owner the pull request link, its CI
state, the review result, and any owner steps that must come first (such as
a migration applied before merge), then wait. Merge per the `git` skill,
then tell the other open pull requests' sessions about conflicts and start
the issues now unblocked.

## Owner steps

Collect what only the owner can do (dashboard settings, secrets, sign-ins,
decisions) into one plain-language message with exact steps. Keep working on
everything that does not depend on it.

## Running

While work is in flight, check again every 15 minutes and say so ("Checking
again in 15 minutes: #42 CI running"). When the owner says stop, end with a
summary: merged, still open, waiting on the owner, and all the learnings
for the owner to review together.
