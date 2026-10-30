# Vectorize: new vectors are not searchable right away

## Symptoms

A vector upserted a moment ago does not appear in a query, even one
filtered to its metadata; `vectorCount` lags behind the number upserted.

## Cause

Vectorize indexes writes asynchronously.

## Fix

Don't assume a vector is queryable right after `upsert`. Checks that read
back their own writes poll for up to about two minutes; indexing marks work
done on the upsert result, not on a query.

## Verification

Measured 50–63 s until a new vector appeared in a `channel_id`-filtered
query, and 1–2 min until `vectorCount` matched.

## Links

- l-gorka/yt-knowledge-base#6, l-gorka/yt-knowledge-base#15
