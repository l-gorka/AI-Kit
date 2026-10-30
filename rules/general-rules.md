# General rules

Decisions the owner has stated for every project. The project's rules file
overrides any of them. How they apply, which rules belong here, and how rules
are added: the `rules` skill.

## Build each repository as a simple modular monolith

Keep one repository with three top-level parts: `web/` for the client,
`server/` for the backend, and `shared/` for code both use; split each part
into feature modules, and add no extra packages, services, or layers until a
real need appears.
Why: one deployable codebase with clear module boundaries stays simple to
read, run, and change.

## Split complex components into smaller ones

Give each distinct part of a complex component its own component and file.
Why: small components are easier to read, test, and reuse.

## Layer server features as routes, domain, and persistence

Split each server feature into routes, a domain layer of business rules with
no bindings or I/O, and a persistence layer for storage access; name each file
after its concept, and never let the domain import routes or persistence.
Why: the levels stay apart, so a growing feature adds files inside a layer,
and the domain is testable without I/O.

## Coordinate a use case in one place

Put each use case's orchestration (calling domain rules, saving state,
publishing side effects) in one coordinator, such as a service or a stateful
object, and never add a layer that only forwards calls.
Why: the coordinator shows the whole flow in one file, and pass-through layers
add files without adding meaning.

## Share schemas and types between server and client

Define the types and validation schemas that both the server and the client
use once, in `shared/`, and validate every request body with its
shared schema.
Why: one schema means one validation rule on both sides.

## Keep UI primitives self-contained

Export shared UI primitives through one index; primitives take all content
and state through props and never import from a feature slice.
Why: every slice can use them unchanged.

## Style the UI through theme tokens

Define colors, fonts, spacing, radii, and shadows once as semantic theme
tokens (such as `surface` or `muted`, not raw palette values like `gray-100`),
and style screens only through those tokens and the shared UI primitives.
Why: a new design changes the token values and the primitives, not every
screen.

## Keep presentational components free of data and routing

Give presentational components a handful of props in domain vocabulary, and
never let them fetch data, route, or handle the session.
Why: they render the same in tests as in the app.

## Mirror source folders in tests

Inside each `__tests__` folder, mirror the source folders it covers, give
every component and tested logic module exactly one test file named after it
(one per component when a file defines two), and keep fixtures shared within
a slice in its `__tests__/fixtures.ts`.
Why: each test is found from its source path.

## Keep a folder's exported types in its `types.ts`

Keep the exported types of each feature slice and shared folder in one
`types.ts` at its root with no runtime imports; the slice's `index.ts`
re-exports the public ones, types used by one file stay inline, and types
derived from a value use a type-only import or stay beside that value.
Why: types are found in one place and never pull in runtime code.
