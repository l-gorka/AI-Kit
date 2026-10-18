# Repository context

<One or two sentences: what this product is.>

The repository contains:

- `<dir>/` — <what it owns>.

## Documentation map

- `GLOSSARY.md` — canonical shared product and domain vocabulary.
- `docs/specs/` — desired user-facing behavior and integration capabilities.
- `docs/adr/` — durable architectural trade-offs and their rationale.
- `docs/knowledge/` — verified, reusable solutions to recurring problems.

When sources conflict, use the glossary for terminology, the specifications
for desired behavior, ADRs for architectural rationale, and the current issue
for task scope. Record unresolved specification/implementation mismatches as
explicit follow-up work.

## Verification commands

The agent workflow reads this section for the baseline checks to run before
handoff.

```text
<workspace>: <test command>
<workspace>: <lint command>
<workspace>: <build command>
```

## Project conventions

Rules the agent workflow applies in step 6 of implementation mode, for example
shared-component usage, test file locations, or module boundaries.

- <convention>
