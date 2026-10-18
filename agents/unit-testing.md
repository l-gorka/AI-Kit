# Unit testing

Default layout for automated tests. Test runner choice and commands live in
the project's `CONTEXT.md`; this file only covers **where test files go**.

## Test file location

Put test files in **`__tests__` directories**, separate from production source.

- **Do:** `src/__tests__/board.test.ts` for `src/board.ts`
- **Do not:** `src/board.test.ts` beside `src/board.ts`

Use one `__tests__` folder per package or workspace root (for example
`shared/src/__tests__/`, `web/src/__tests__/`). For a deep tree, you may add
nested `__tests__` next to the code they cover; follow the layout already used
in that package.

## Imports

From a file inside `__tests__/`, import the module under test with a relative
path into source (for example `../board`, `../App`).

## Discovery

Vitest and Jest pick up `*.test.*` and `*.spec.*` under `__tests__` by default.
If the project uses another runner, document its layout in `CONTEXT.md`.

## Overrides

Repository-specific rules (different folder name, e2e-only paths, shared test
helpers) belong in **`CONTEXT.md`** under "Project conventions". When
`CONTEXT.md` conflicts with this file, **`CONTEXT.md` wins** for that repo.
