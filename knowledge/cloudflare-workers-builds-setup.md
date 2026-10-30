# Workers Builds: build before deploy, and match the Worker name

## Symptoms

- The deployed Worker serves the unbuilt `index.html` (it loads
  `/src/main.tsx`), and API routes return 404.
- Or the build log shows `npx wrangler deploy` failing with
  "The `assets` property in your configuration is missing the required
  `directory` property".
- Or a deploy goes to an unexpected Worker, or fails on a name mismatch.

## Cause

- With the Cloudflare Vite plugin, `wrangler.jsonc` has no asset directory;
  `vite build` writes the deployable config. A deploy command without a
  build step deploys nothing usable.
- Workers Builds is connected to one Worker by name. The `name` in
  `wrangler.jsonc` must be that Worker's name.

## Fix

In the Worker's Settings → Build:

- Root directory: the folder with `wrangler.jsonc` and `package.json`.
- Deploy command: a script that builds and then deploys, e.g.
  `npm run deploy` with `"deploy": "vite build && wrangler deploy"`. This
  works even if the build command field is empty.
- Keep `name` in `wrangler.jsonc` equal to the connected Worker's name.

## Verification

The build log shows `vite build` output before `wrangler deploy`; the
deployed page loads hashed `/assets/index-*.js`; the API health route
answers.

## Links

- l-gorka/yt-knowledge-base#26
