# `wrangler deploy` fails from a Claude cloud session

## Symptoms

`wrangler deploy` of a Worker with static assets fails during the asset
upload: every `POST /accounts/<id>/workers/assets/upload` returns
`401 Unauthorized`. Commands that only call the Cloudflare API with the
account token (`wrangler d1`, `r2`, `queues`, `vectorize`, `whoami`) work.

## Cause

The session's egress proxy injects the account API token into every request
to `api.cloudflare.com`, replacing any `Authorization` header. The asset
upload authenticates with a short-lived upload token from the upload session,
so the proxy overwrites it and Cloudflare rejects the request.

## Fix

Don't deploy from the session. Connect the repository to Cloudflare Workers
Builds, so every merge to the default branch deploys. See
`cloudflare-workers-builds-setup.md`. For testing against real resources
before merge, `wrangler dev` with remote bindings works from the session.

## Verification

After connecting Workers Builds, a merge produced a deployment (source
`wrangler`) within about a minute, and the Worker's health route answered.

## Links

- l-gorka/yt-knowledge-base#5, l-gorka/yt-knowledge-base#21
