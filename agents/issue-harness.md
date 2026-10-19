# Issue harness

When AI-Kit is mounted as `.ai-kit/` in a **host repository**, that repo can run
[`packages/issue-harness`](../packages/issue-harness/) against itself. The
harness resolves the host root (parent of `.ai-kit/`), runs `gh`/git/tests there,
and stores run state in the host’s `.harness/` directory — not inside AI-Kit.

Project-specific commands live in `harness.json` at the host repo root (copy from
`templates/harness.json`). See the package README for `CURSOR_API_KEY`, `gh`, and
CLI usage.
