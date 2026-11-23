# Repository context

<!--
Facts only: what exists, where it is, and how to run it. Conventions and other
"do this" statements belong in RULES.md; link to them instead of restating
them here.
-->

<One or two sentences: what this product is.>

The repository contains:

- `<dir>/` — <what it owns>.

## Documentation map

- `GLOSSARY.md` — canonical shared product and domain vocabulary.
- `docs/specs/` — desired user-facing behavior and integration capabilities.
- `docs/adr/` — durable architectural trade-offs and their rationale.
- `docs/knowledge/` — verified, reusable solutions to recurring problems.

Design documents (tokens, components, screenshots to compare against):
`<path>`.

## Services

What the agent's credentials can and cannot do in each external service.

| Service | Agent can | Agent can't (owner does it) |
| --- | --- | --- |
| `<service>` | <actions> | <actions> |

## Verification commands

The agent workflow reads this section for the baseline checks to run before
handoff.

```text
<workspace>: <test command>
<workspace>: <lint command>
<workspace>: <build command>
```
