# Owner rules

Convention for the project's rules file (default: `RULES.md` at the repo
root): decisions and preferences the project owner has stated. The rules are
project-specific and live in the project, not in this kit.

The rules file is the only home for the project's conventions: code layout,
module boundaries, naming, test placement, and other "do this" statements.
`CONTEXT.md` describes what exists and links here; it never restates a rule.

## Precedence

The rules file takes precedence over every document in this kit. To deviate
from the kit in one project (a different tracker, label vocabulary, code
layout, or test placement), add a rule to that project's rules file; never
edit kit files for one project.

When two statements still conflict — two kit documents, or two rules — ask
the owner which one holds before acting on either.

## Format

One `##` heading per rule, then one imperative sentence and a one-line
`Why:`. No examples; keep the file short, since agents read it on every task.

## How rules apply

Rules are defaults, not mechanical checks. Implementing agents follow them and
state any deliberate deviation, with its reason, in the handoff. Review
agents read the rules file and report unexplained deviations as findings.

## Adding or changing a rule

When the owner states a decision that should outlive the current task, draft
the rule and propose it. Write it only after the owner approves the wording.
Never add, edit, or delete a rule without approval.
