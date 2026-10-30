# Cloudflare Access: let scripts through with a service token

## Symptoms

A script calling an Access-protected app gets a 302 to
`<team>.cloudflareaccess.com`, or still gets it after a service token was
created.

## Cause

A service token is accepted only when the Access application has a policy
with action **Service Auth** that includes that token. A policy created as a
reusable policy but not attached to the application has no effect (its page
shows "Used by applications: --").

## Fix

1. Zero Trust → Access → Service auth → create a service token. The secret
   is shown once.
2. Open the application → Policies → create the policy there (Action:
   Service Auth; Include: Service Token → the token), and save the
   application.
3. The script sends `CF-Access-Client-Id` and `CF-Access-Client-Secret`
   headers, read from environment variables; never commit them.

Creating tokens and changing Access policies is the owner's step: an agent's
safety checks block changes to who can pass the login wall.

## Verification

`GET /accounts/<id>/access/apps/<app-id>` lists the Service Auth policy with
the token; a request with the two headers returns 200 instead of a 302.

## Links

- l-gorka/yt-knowledge-base#9, l-gorka/yt-knowledge-base#11
