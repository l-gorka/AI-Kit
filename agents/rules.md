# Owner rules

Convention for the project's rules file (default: `RULES.md` at the repo
root): decisions and preferences the project owner has stated. The rules are
project-specific and live in the project, not in this kit; rules for every
project live in `general-rules.md` (see "Project rule or general rule").

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

## Project rule or general rule

`general-rules.md` is the kit document for rules that hold in every project,
written in the same format; like every kit document, it yields to the
project's rules file. Choose the home when drafting a rule:

- **Project rules file**: the rule names the project's paths, domain terms,
  or stack, or the owner stated it for this project only.
- **`general-rules.md`**: the rule would still hold in a new project with a
  different product. Write it without project names.

A new rule starts in the project's rules file. Propose moving it to
`general-rules.md` when the owner says it applies to every project, or states
it again in a second project. The move deletes it from the project's rules
file, which keeps only the project-specific detail an agent still needs.
Changing `general-rules.md` is a change to this kit.
