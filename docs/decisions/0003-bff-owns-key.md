# 0003. The BFF owns the API key and the upstream API's quirks

- Status: accepted
- Date: 2026-09-30

## Context

Every upstream call needs an `x-api-key`. A key in a browser bundle is public. The API also returns `http` image URLs, inconsistent casing, decimal prices and placeholder values, and it has slow cold starts.

## Decision

The browser only calls its own origin. The BFF adds the key, applies a timeout, validates responses with schemas, and normalizes data (https images, cents, de-duplication) in one adapter.

## Consequences

The key never reaches the client, and the UI depends on a clean, stable API. Cost: one more process to run and a small proxy layer to maintain. The API's permissive CORS would have allowed direct browser calls; we choose the BFF for security and control.
