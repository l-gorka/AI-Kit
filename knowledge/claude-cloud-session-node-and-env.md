# Claude cloud sessions: Node fetch, environment variables, network policy

## Symptoms

- Node scripts using `fetch` fail with TLS or connection errors, while
  `curl` works.
- Environment variables added to the cloud environment are missing in the
  running session.
- Requests to a site fail with `CONNECT tunnel failed, response 403`.

## Cause

- Outbound traffic goes through a proxy with its own CA. Node's `fetch` does
  not use the proxy or trust that CA by default.
- A session reads the environment's variables when it starts.
- The environment's network policy allows only listed hosts.

## Fix

- Run Node with `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.
- After adding or changing variables, start a new session for work that
  needs them.
- Add blocked hosts in the environment's settings (Network access →
  Allowed domains), or choose a broader access level.
- `curl -sS "$HTTPS_PROXY/__agentproxy/status"` lists recent denials.

## Verification

With the two variables set, Node `fetch` reached the AI Gateway and other
hosts; a new session saw the added variables; YouTube loaded after its host
was allowed.

## Links

- l-gorka/yt-knowledge-base#3
