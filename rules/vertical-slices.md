# Vertical slices

Default code layout for the modular monolith (see `general-rules.md`). Group
code by **slice** (one product capability, such as `quiz` or `auth`), then by
kind of file inside the slice. A capability keeps the same slice name in
`web/`, `server/`, and `shared/`.

## Layout

```text
web/src/
  main.tsx                entry
  App.tsx                 shell: providers, routing, slice composition
  <slice>/
    index.ts              public API of the slice
    types.ts
    components/
    hooks/
    api/                  calls to the server
    utils/                pure helpers
    __tests__/            see unit-testing.md
  shared/                 code two or more web slices use
    ui/  hooks/  utils/  api/
server/src/
  main.ts                 entry: app setup, mounts slice routes
  <slice>/
    index.ts              public API of the slice
    types.ts
    routes/
    domain/
    persistence/
    __tests__/
  shared/                 code two or more server slices use
    db/  middleware/  config/
shared/                   code both web and server use
  <domain>/               types, schemas, constants, pure rules
  utils/                  domain-free helpers
e2e/                      end-to-end tests, one spec per user flow
```

Create a folder only when it has a file.

## Rules

- A slice exports through its `index.ts`; other code imports the slice, never
  its inner files.
- A web slice does not import another slice; the shell composes them. A
  server slice may import another server slice's `index.ts`, as long as no
  two slices import each other.
- Put code at the lowest level all its users share: one slice → inside the
  slice; two or more slices on one side → that side's `src/shared/`; web and
  server → root `shared/`. Move it up when the second user appears, not
  before.
- Root `shared/` is grouped by domain, each folder named after the slice it
  serves, and holds only code that runs on both sides: types, schemas,
  constants, and pure functions, with no DOM, Node, database, or framework
  imports.
- A side's `src/shared/` is grouped by kind, like a slice, and never imports
  a slice.
- Imports flow one way: shell → slice → side `shared/` → root `shared/`.
  `web/` and `server/` never import each other.
- `e2e/` holds one `<flow>.spec.ts` per user flow, drives the running app,
  and imports no source except root `shared/`.
