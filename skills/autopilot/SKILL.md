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

Issues arrive by message, such as "run #42". Start an issue once it is
`ready-for-agent` and its blockers are closed; until then, say why it waits.

## Issue sessions

Start one cloud session per issue, visible to the owner, titled
"#<number> <issue title>", and replace `ready-for-agent` with `in-progress`.
Its brief: the issue, the facts it needs from earlier work, and "follow the
`implement` skill, open a pull request, keep it mergeable (merge the default
branch on conflict; a conflict can stop CI from running), fix red CI, and
watch your pull request. Green means every check, deploy builds included, ran
on the current head and passed. Ask the owner directly, in your session,
anything only they can answer (decisions, wording, setup steps such as secrets
and dashboards); never route it through me. Message session <your ID> only short status: `#<pr> green, <owner steps
before merge>`, `blocked: <reason>`, or the outcome of an owner answer
(`owner chose X`). When green, add a few short lines on what you learned
(surprises, mistakes, missing docs or rules, what the owner could learn)".
Run issues in parallel unless one must wait for another. Do not subscribe to
pull request activity; issue sessions watch their own.

## Merge

When every check on a pull request's current head, deploy builds included,
has run and passed and it has no conflict, tell the owner "#<pr> is ready to
merge"; you do not review. Merge only with the owner's explicit approval, or
without asking if the owner explicitly asked for auto-merge. Merge per the
`git` skill and confirm the merge's deploy build started (tell the owner if
not). Then tell the other open pull requests' sessions about conflicts and
start the issues now unblocked.

## Owner messages

Issue sessions ask the owner directly. Message the owner only when something
changes (a pull request is ready to merge, an issue is unblocked, something
broke), batched into one message; never echo session messages or repeat
unchanged status.

## Running

While work is in flight, check again every 15 minutes and say so ("Checking
again in 15 minutes: #42 CI running"). When the owner says stop, end with a
summary: merged, still open, waiting on the owner, and all the learnings
for the owner to review together.

On each check, read your context size (`get_session` without an ID,
`context_usage.used_tokens`). Once it reaches 150,000 tokens, tell the owner
once: "Context is at <n> tokens: please compact this conversation (`/compact`)
so autopilot can keep running." Repeat only after compaction has happened
and the size reaches 150,000 again. Keep the compacted context to what the
coordinator needs: open pull requests, the queue, pending owner decisions,
ordering constraints such as migration numbers, and the learnings so far.
