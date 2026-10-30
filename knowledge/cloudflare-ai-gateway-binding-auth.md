# Authenticated AI Gateway: call it through the AI binding

## Symptoms

Calls from a Worker to an AI Gateway with `fetch` fail with 401 unless a
`cf-aig-authorization: Bearer <token>` header is sent, so the Worker seems
to need an extra Cloudflare API token as a secret.

## Cause

New AI Gateways are created with authentication on. HTTP calls must carry a
Cloudflare token with AI Gateway permission. Calls through the Worker's AI
binding are authenticated by the binding itself.

## Fix

Call the gateway through the binding:
`env.AI.gateway("<gateway-id>").run({ provider, endpoint, headers, query })`.
Only the provider's key (for example the OpenRouter key) is needed as a
secret. Keep `fetch` with `cf-aig-authorization` only for calls from outside
a Worker, such as Node scripts.

## Verification

With no gateway token configured, a request through the binding returned 200,
and the call appeared in the gateway's logs.

## Links

- l-gorka/yt-knowledge-base#36
