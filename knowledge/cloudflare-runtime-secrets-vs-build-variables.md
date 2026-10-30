# Cloudflare: a Worker reads runtime secrets, not build variables

## Symptoms

A secret added in the dashboard is missing in the running Worker (`env.X` is
undefined). `wrangler secret list` and
`GET /accounts/<id>/workers/scripts/<name>/secrets` return `[]`, and no new
Worker version appears after saving.

## Cause

The Worker's Settings page has two places for variables:

- **Variables and Secrets** at the top: runtime values the running Worker
  reads. Saving one creates a new deployed version.
- **Build → Variables and secrets**: values that exist only while Workers
  Builds runs the build. The running Worker never sees them, even after a
  rebuild.

## Fix

Add the value under the top **Variables and Secrets**, type **Secret**, and
deploy. Remove the copy under Build if it was added there by mistake. No
rebuild is needed. Adding a value as a plain variable first and then
switching it to a secret leaves the plain value readable in that version's
history; rotate the key if that matters.

## Verification

`GET /accounts/<id>/workers/scripts/<name>/secrets` lists the name with type
`secret_text`, and the current version's bindings include it.

## Links

- l-gorka/yt-knowledge-base#12
