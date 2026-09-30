# BFF (Express)

> Status: implemented (chunks 2 and 3). Run it with `pnpm dev` (needs `.env`); check the live API with `pnpm check:contract`.

The BFF exists for three reasons: keep `x-api-key` out of the browser, give the UI a clean and stable API, and contain the remote API's quirks in one place.

## Public API (what the web app calls)

| Method and path | Query | Success | Errors |
|---|---|---|---|
| `GET /api/products` | `search` (optional, trimmed, max 100 chars), `limit` (1..50, default 20) | `200` `ProductSummaryDto[]` | `400` invalid query, `502`/`504` upstream problem |
| `GET /api/products/:id` | none | `200` `ProductDetailDto` | `404` unknown id, `502`/`504` upstream problem |
| `GET /health` | none | `200` `{ status: "ok" }` | none |

Error bodies always have the shape `{ "error": ApiErrorCode, "message": string }` (the same shape the upstream API uses). Codes and statuses:

| Code | Status | When |
|---|---|---|
| `INVALID_QUERY` | 400 | `limit` not a whole number from 1 to 50, `search` repeated or longer than 100 characters |
| `NOT_FOUND` | 404 | unknown product id, or unknown `/api/*` route |
| `UPSTREAM_TIMEOUT` | 504 | the remote API did not answer within `CATALOG_API_TIMEOUT_MS` |
| `UPSTREAM_ERROR` | 502 | the remote API failed, rejected our key (logged as an error) or sent a payload that breaks our schemas |
| `INTERNAL_ERROR` | 500 | anything unexpected (logged) |

Wire types and schemas live in `packages/contracts` (`ProductSummaryDto`, `ProductDetailDto`, `ApiErrorDto`, `API_PATHS`). Prices travel as integer cents (`basePriceInCents`, `priceInCents`).

## Layout (`apps/bff/src`)

```
domain/           ProductSummary, ProductDetail, ColorOption, StorageOption, errors
application/
  list-products.ts, get-product-detail.ts
  ports/          ProductCatalogPort, FeatureFlagsPort, Logger
infrastructure/
  catalog/        HTTP adapter + upstream schemas (+ in-memory adapter for tests)
  config/         loadConfig: validates the environment
  flags/          EnvFeatureFlags (+ in-memory adapter for tests)
  http/           createApp (Express), DTO mapping, error mapping
  logging/        JSON-line logger (+ in-memory logger for tests)
main.ts           composition root: reads config, builds adapters, starts the server
scripts/          check-contract.ts (manual check against the live API)
```

Tests live in `apps/bff/test/`, mirroring `src/`. They are kept out of `src/` because a domain test imports Chai, which the `domain-is-pure` rule forbids inside `src/domain/`.

The list query is a domain rule (`domain/product-query.ts`): the search term is trimmed (blank means no search), `limit` defaults to 20 and must be 1..50, and the term is at most 100 characters. `ListProducts` also caps the result at `limit` even if the catalog returns more. Routes (chunk 3) turn `InvalidProductQueryError` into `400`.

## Configuration

Read once, at startup, in `main.ts`, and validated. The process refuses to start on invalid configuration. See `.env.example`.

| Variable | Purpose |
|---|---|
| `CATALOG_API_BASE_URL` | Remote API base URL |
| `CATALOG_API_KEY` | Sent as `x-api-key`. Never logged, never returned. |
| `CATALOG_API_TIMEOUT_MS` | Upstream timeout |
| `PORT` | Listen port |
| `FEATURE_FLAGS` | Comma-separated flags that are ON |

## Upstream adapter responsibilities

Everything the remote API does that we don't want to inherit is handled here (details in `api-contract.md`):

1. Add the `x-api-key` header and enforce a timeout with `AbortController`.
2. Validate every response with a Zod schema. Unknown or malformed data becomes a typed error, not a partial object.
3. Rewrite `http://` image URLs to `https://` (in list items, color options and similar products).
4. Convert decimal prices to integer cents.
5. De-duplicate list items by `id` (first wins) and log a warning server-side when it happens.
6. Map upstream statuses to domain errors (see the error model in `architecture.md`).

Display concerns (upper-casing brands and names) are **not** done here; that is CSS.

## Logging

A tiny `Logger` port with a JSON-line adapter writing to stdout. `console.*` is banned by lint in application code. Never log the API key or full upstream payloads.

## Security notes

- The API key exists only in the BFF process environment.
- Responses set conservative headers (`helmet`), and no CORS is enabled because the browser only calls its own origin.
- Input from the query string is validated before it is forwarded upstream.
- `helmet`'s default Content-Security-Policy allows images only from the BFF's own origin. When the BFF serves the web app (chunk 4), `img-src` must also allow the catalog's image host.
- `pnpm dev` loads `.env` with Node's `--env-file` flag, which needs Node 20.6 or later. On Node 18, export the variables in the shell instead. Production hosts (Render) set them directly.

## Testing

Mocha and Chai. Use cases run against the in-memory catalog adapter. The HTTP adapter is tested against a local stub server (success, 404, 401, timeout, malformed payload, duplicates, `http` images). Routes are tested with supertest. `pnpm check:contract` (chunk 3) compares the real API with our schemas and is run manually, since CI must not depend on a third-party host.
