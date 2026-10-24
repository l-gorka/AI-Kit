# Labels

The label vocabulary the skills and the workflow use in the issue tracker. A
project with a different vocabulary maps it in its rules file (see
`rules.md`).

Every open issue carries one type label and one triage label.

## Type labels

What kind of work the issue is.

| Label | Meaning |
| --- | --- |
| `feature` | A new capability users can see |
| `bug` | Existing behavior is broken or wrong |
| `polish` | Works, but copy, layout, visual design, accessibility, or a small UX detail needs fixing |
| `refactor` | Internal restructuring with no user-visible change |
| `test` | Test coverage or test reliability |
| `chore` | Dependencies, CI, tooling, or configuration |

When two fit, pick the one for the outcome a user would notice: a refactor
that fixes broken behavior is a `bug`, and so is a flaky test caused by a race
in product code.

## Triage labels

Where the issue stands.

| Label | Meaning |
| --- | --- |
| `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | Requires human implementation |
| `wontfix` | Will not be actioned |
