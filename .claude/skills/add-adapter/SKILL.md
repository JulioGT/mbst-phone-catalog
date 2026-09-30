---
name: add-adapter
description: Implement or change an adapter (infrastructure code that fulfils a port) such as the BFF's upstream catalog HTTP client, feature-flag providers, Express routes, the web CatalogGateway, or the localStorage cart storage. Use whenever code touches the network, storage, environment variables, or a third-party library, even if the user only says "call the API" or "persist the cart".
---

# Add or change an adapter

Adapters live in `infrastructure/` and implement an interface that `application/` owns. They are the only code allowed to know about HTTP, storage, Express or vendor SDKs.

## Steps

1. **Start from the port** in `application/ports/`. If it needs to change, change it first and update the in-memory adapter.
2. **Implement the adapter in `infrastructure/`.** Translate to and from domain types at this boundary; never let raw external data cross it.
3. **Validate external data with a schema** (Zod). Malformed input becomes a typed error, not a partially filled object.
4. **Normalize known quirks here and only here** (see `docs/api-contract.md`): `http` to `https` image URLs, decimal prices to cents, duplicates by `id`.
5. **Map failures to domain errors** using the table in `docs/architecture.md` (not found, unavailable, invalid response). Never leak upstream auth details or the API key.
6. **Test the adapter for real behavior**: a local stub server for HTTP, an in-memory `Storage` for browser storage. Cover success, not found, unauthorized, timeout, malformed payload, and each quirk.
7. **Keep an in-memory twin** for use-case and component tests.
8. **Run `pnpm verify`.**

## Checklist

- [ ] The adapter imports `application` and `domain`, never `ui`.
- [ ] Timeouts and aborts are handled (`AbortController`).
- [ ] The adapter never logs secrets or whole payloads.
- [ ] New quirks are recorded in `docs/api-contract.md`.

## Do not

Read configuration inside the adapter (it receives it through its constructor), add retries without a decision record, or put display concerns (upper-casing) here; those belong to CSS.
