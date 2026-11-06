---
name: triage
description: Turn a rough idea, bug report, or existing issue into ready issues: file simple ones directly, investigate and grill the owner on complex ones. Use when the owner says "triage <something>" or "triage #<n>".
---

# Triage

Follow the `issues` skill for writing, labeling, and filing.

## Steps

1. **Input.** Free text, or an existing issue (`triage #<n>`): read it with
   its comments.
2. **Check for duplicates.** Search open issues; if one already covers it,
   say so and stop.
3. **Classify.** Simple: one outcome, no decision for the owner, the area of
   the code is obvious. Otherwise it is complex. State the call in one line.
4. **Simple.** File the issue, or update the existing one, with labels. No
   questions. Give the link.
5. **Complex.**
   1. Investigate: read the code, specifications, ADRs, and `GLOSSARY.md`
      for the area. Do not reproduce bugs.
   2. Grill the owner with the `grilling` skill until nothing is open.
   3. Record the outcomes: propose `GLOSSARY.md`, ADR, or `RULES.md` updates
      per the workflow rules, and write the decisions into the issue.
   4. One outcome: file or update one issue. More than one: hand off to
      `/to-tickets`.

An existing issue that gets refined is relabeled from `needs-triage` to
`ready-for-agent`, `ready-for-human`, or `needs-info`.
