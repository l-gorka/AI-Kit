# Rules

Rules are code conventions and other "do this" statements: code layout,
module boundaries, naming, test placement. They live at two levels:

- **General rules** in the kit's `rules/` directory apply to every project
  that mounts the kit.
- **Project rules** in the project's rules file (default: `RULES.md` at the
  repo root) are decisions and preferences the project owner has stated. They
  add rules or override general ones for that project.

`CONTEXT.md` describes what exists and links to the rules; it never restates
a rule.

## Precedence

The project's rules file takes precedence over the kit's general rules and
every other document in this kit. To deviate from the kit in one project (a
different tracker, label vocabulary, code layout, or test placement), add a
rule to that project's rules file; never edit kit files for one project.

When two statements still conflict — two kit documents, or two rules at the
same level — ask the owner which one holds before acting on either.

## Format

General rules: one file per topic in `rules/`, each stating its default and
its scope.

Project rules: one `##` heading per rule, then one imperative sentence and a
one-line `Why:`. No examples; keep the file short, since agents read it on
every task.

## How rules apply

Rules are defaults, not mechanical checks. Implementing agents follow them and
state any deliberate deviation, with its reason, in the handoff. Review
agents read the general rules and the rules file and report unexplained
deviations as findings.

## Adding or changing a rule

When the owner states a decision that should outlive the current task, draft
the rule and propose it: in the project's rules file when it is specific to
that project, as a change to the kit's `rules/` when it applies to every
project. Write it only after the owner approves the wording. Never add, edit,
or delete a rule without approval.
