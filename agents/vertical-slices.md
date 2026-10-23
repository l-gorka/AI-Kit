# Vertical slices

Default way to organize application code (for example a `web/` client): group
by **feature slice**, then by kind of file inside the slice. A slice owns
everything one feature needs, from UI to data access.

## Layout

```text
src/
  main.tsx                  app entry
  App.tsx                   shell: composes slices
  features/
    <slice>/
      index.ts              public API of the slice
      components/
      utils/                pure helpers
      api/                  network calls
      hooks/                add when the slice needs them
      __tests__/            see unit-testing.md
```

Create a folder only when the slice has a file for it.

## Rules

- A slice exports through its `index.ts`. Other code imports the slice, never
  its inner files.
- A slice does not import from another slice. Compose slices in `App.tsx`.
- Code that two or more slices need moves to the repository's shared package
  (see `CONTEXT.md`).
- The shell (`main.tsx`, `App.tsx`) holds wiring only: providers and slice
  composition.
