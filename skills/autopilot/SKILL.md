---
name: autopilot
description: Run as the standing orchestrator for one `orchestrator` issue: start one cloud session per ready sub-issue in blocking order, keep their pull requests mergeable, and merge only with the owner's approval. Use only when the owner starts it.
disable-model-invocation: true
---

# Autopilot

You orchestrate; issue sessions do the work. You stay until the owner stops
you, sleeping between events. Starting this skill approves creating issue
sessions and the hourly wake-up below. It approves no merge.

## Start

The owner names the orchestrator issue. Label it `orchestrator` and record
this session's link and ID in its body under "Orchestrator session",
replacing older ones. Create a scheduled task that fires into this session
every hour with "autopilot: run a pass", and record its ID there too.

## Scope

Work only on open sub-issues of the orchestrator issue. When results suggest
a bigger change, stop and ask.

## State lives on GitHub

Keep no state only in your context. When you start an issue session, replace
`ready-for-agent` with `in-progress` and comment the session link on the
sub-issue. Blocking edges give the order. Each pass rebuilds the picture from
GitHub, so a successor can take over from the orchestrator issue alone.

## The pass

Run on every wake-up: a message from triage or an issue session, a pull
request event, the hourly scheduled task, or the owner.

1. Read the sub-issues: labels, blockers, sessions, pull requests.
2. Start an issue session for each `ready-for-agent` sub-issue whose blockers
   are closed; run them in parallel unless they change the same files.
3. Subscribe to each new pull request's activity.
4. When a pull request's CI on the current head is green, it has no conflict,
   and a review against the rules found nothing blocking, tell the owner and
   comment on the orchestrator issue: "#<pr> is ready to merge". Send
   blocking findings back to the issue's session.
5. End the turn. Never poll or wait in a loop; the next event wakes you.

## Issue sessions

Start one cloud session per sub-issue, visible to the owner, titled with the
issue number. Its brief: the issue, the facts it needs from earlier work, and
"follow the `implement` skill, open a pull request, keep it mergeable (merge
the default branch on conflict), fix red CI, message session <your ID> when
green or blocked".

## Merge

Merge only with the owner's approval: a `merge` comment on the pull request,
a message in this session, or a standing approval in the orchestrator issue
body (such as "merge when green"). Merge per the `git` skill, then tell the
other open pull requests' sessions about conflicts and start the sub-issues
that are now unblocked.

## Owner steps

Collect what only the owner can do (dashboard settings, secrets, sign-ins,
decisions) into one plain-language message with exact steps, also posted on
the orchestrator issue. Keep working on everything that does not depend on it.

## Handoff and stop

When your context grows heavy, start a fresh session with "follow the
`autopilot` skill for #<orchestrator issue>"; once it has recorded itself,
delete your scheduled task, tell the owner, and stop. When the owner says
stop, delete your scheduled task, remove your session from the orchestrator
issue body, and comment a summary there: merged, still open, waiting on the
owner.

## Triage feeding this skill

New sub-issues reach `ready-for-agent` through a scheduled task the owner
creates in claude.ai (GitHub trigger: issue opened) with this prompt:

> /mattpocock-skills:triage Triage the newest open issue that has no triage
> label and isn't labelled `orchestrator`. If no decisions are open, apply
> the outcome without waiting for me. If you need my answers, first comment
> this session's link on the issue, then grill me here. When the issue
> reaches `ready-for-agent` and its parent is labelled `orchestrator`,
> message the session recorded in the parent's body: "#<n> is
> ready-for-agent".
