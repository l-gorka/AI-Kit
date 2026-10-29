---
name: autopilot
description: Work through a project's `ready-for-agent` issues in waves, from issue to merged pull request, handing back to the owner only what is theirs. Use only when the owner starts it, in a cloud session of the project's environment.
disable-model-invocation: true
---

# Autopilot

You are the orchestrator. You pick waves of ready issues, run each wave as a
Workflow whose agents open one pull request per issue, drive those pull
requests to merged, and repeat until nothing is ready. The owner answers only
what is theirs: `ready-for-human` issues, questions, and access to their
computer.

The owner starting this skill is their opt-in to two things otherwise
gated: running Workflows (multi-agent orchestration) for every wave, and
merging pull requests that meet "Merge" below without asking each time
(`guides/git-workflow.md` → "Remote changes"). It is not approval for anything
else.

Drive the tracker per the `issues` skill. Every other rule of the kit and the
project's `RULES.md` still applies.

## Settings

A project changes a default with a rule in its `RULES.md`; the owner can also
override one when starting the skill. `squash` and `rebase` rewrite the
branch's commits, so choosing either is a deviation from
`guides/git-workflow.md` → "Commits" that only the owner makes.

| Setting | Default | Meaning |
| --- | --- | --- |
| Wave size | 3 | Most issues in progress at once, across waves |
| Attempts per PR | 3 | CI fix attempts before handing a PR back |
| Merge method | `merge` | `merge`, `squash`, or `rebase`, as GitHub names them |
| Tracking issue | none | Issue that holds the status comment; without one, create `Autopilot status` |

## Where the work runs

Workflows run inside this session and its container. Chosen because the
orchestrator then sees every result directly and the wave shares one
checkout, keys, and setup. If a wave outlives the session (the container is
reclaimed mid-wave), switch to one cloud session per issue, started with the
same prompt as the wave's agents, and record the switch and its reason in the
status comment.

## Loop

### 1. Pick the wave

List the open issues. An issue is ready when all of these hold:

- it is labeled `ready-for-agent` and not `ready-for-human` or `needs-info`;
- every blocker is closed (native dependencies first, then the "Blocked by"
  section; `issues` skill → "Blocking edges");
- no open pull request closes it.

Order ready issues by number and take as many as keep the issues in progress
(running agents plus open pull requests from this run that are not handed
back) within the wave size. For every open issue you skip, write one line
saying why (its label, which blocker is open, which pull request is open).
Put those lines in the status comment.

A conditional issue ("only needed if …") is decided before it can join a
wave: read the result its blocker recorded (the merged PR, its issue's
closing comment). If the condition is false, close it as not planned with a
comment quoting that result. If true, it is ready. If the result is unclear,
hand it back (see "Handing back").

### 2. Run the wave

Run one Workflow with one agent per issue. Give each agent:

- its issue number and the instruction to follow `guides/workflow.md` →
  "Implementation mode" in its own worktree, through the separate review-agent
  pass, to an open pull request that closes the issue
  (`guides/git-workflow.md`);
- that it cannot ask in chat: on a material decision the issue does not
  settle (implementation mode, step 2), it stops and returns the question
  and the options it sees, without opening a pull request;
- that it does not wait for CI.

Each agent returns the pull request link, or the reason it stopped with its
evidence. You turn every stop into a handback (see "Handing back"); the
agents do not comment on or label issues. Follow-up
issues an agent would propose go in its pull request body under "Proposed
follow-ups"; list them in the status comment for the owner to approve.

An issue whose work must run on the owner's computer (local hardware, local
credentials, a local-only service) is not given to the Workflow. Request the
computer through Remote Control and do it from this session. If the computer
is unavailable, hand the issue back and continue with the rest.

### 3. Drive the pull requests to merged

Watch every open pull request from this run through PR activity events, with
a periodic check-in as a safety net. On each event or check-in, look at the
whole pull request on its current head.

- **Merge** when CI on the current head is green, the review left nothing
  blocking, and there is no merge conflict. Use the merge method setting and
  delete the branch. Without merge rights, enable auto-merge on the pull
  request with the same method instead.
- **CI red**: run a fix (one agent, or a small Workflow) that root-causes the
  failure, fixes it, verifies, and pushes a new commit. Count the attempt.
  When the attempts are used up, hand the pull request back and stop
  watching it.
- **Merge conflict**: merge the default branch into the pull request branch,
  verify, and push. This is not a CI attempt.
- **Review comments** on the pull request (from people or review bots): fix
  blocking findings and push, without counting an attempt; answer the rest on
  their thread.

### 4. Repeat

After each merge or handback, recompute the ready set and start the next
wave; do not wait for the whole wave to merge. Stop when nothing is ready and
every pull request from this run is merged or handed back; then update the status comment with the final
summary.

## Handing back

You post every handback: a comment saying exactly what is needed, and the
issue's `ready-for-agent` label replaced with the label below. Then move on.
The owner puts `ready-for-agent` back once they have answered.

- **Material decision the issue does not settle**: comment the agent's
  question and options on the issue; `needs-info`.
- **Agent stopped without a pull request** (verification fails, environment
  or access blocked): comment the evidence on the issue; `ready-for-human`.
- **Pull request still red after the attempts setting**: comment on the pull
  request with the failing check, what fails, why, and what was tried; its
  issue gets `ready-for-human`.
- **Conditional issue with an unclear result**: comment what the blocker
  recorded and what is unclear; `needs-info`.
- **Computer unavailable**: comment which computer and folder the issue
  needs; `needs-info`.

## Never

- Merge with red or missing CI.
- Force-push, or rewrite another branch's history.
- Skip, disable, or weaken a test.
- Print or commit a key, token, or secret.
- Work on a `ready-for-human` issue.

## Status comment

Keep one comment on the tracking issue and edit it after every wave and every
merge. Sections:

- **Merged**: issue, pull request.
- **In progress**: issue, pull request, CI state, attempts used.
- **Waiting on the owner**: issue, label, what is needed.
- **Skipped**: one line per open issue not picked, with the reason.
- **Proposed follow-ups**: from the agents' pull requests.
