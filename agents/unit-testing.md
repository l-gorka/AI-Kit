# Unit testing

Default layout for automated tests. Test runner choice and commands live in
the project's `CONTEXT.md`; this file only covers **where test files go**.

## Test file location

Put test files in **`__tests__` directories**, separate from production source.

- **Do:** `src/__tests__/board.test.ts` for `src/board.ts`
- **Do not:** `src/board.test.ts` beside `src/board.ts`

Co-locate tests with the feature they cover: each feature slice (see
`vertical-slices.md`) has its own `__tests__` folder at the slice root.

- **Do:** `src/features/board/__tests__/board.test.ts` for code in
  `src/features/board/`
- **Do not:** collect feature tests in a shared root folder such as
  `src/__tests__/`

Tests for code outside any slice (app entry, shell wiring, cross-slice
configuration) go in the `__tests__` folder of the directory that owns that
code, for example `src/__tests__/` for `src/main.ts`.

## Imports

From a file inside `__tests__/`, import the module under test with a relative
path into source (for example `../board`, `../App`).

## Discovery

Vitest and Jest pick up `*.test.*` and `*.spec.*` under `__tests__` by default.
If the project uses another runner, record where its tests go in the rules
file.

## Overrides

Repository-specific rules (different folder name, e2e-only paths, shared test
helpers) belong in the project's **rules file** (see `rules.md`). When the
rules file conflicts with this file, **the rules file wins** for that repo.
