# Captured API responses

Real response bodies captured from the remote catalog API on 2026-09-29/30 (no credentials). Use them as the basis for test fixtures and for the contract check.

| File | Request |
|---|---|
| `product-detail-MTE-EDGE50PRO.json` | `GET /products/MTE-EDGE50PRO` (complete) |
| `products-search-iphone-limit-2.json` | `GET /products?search=iphone&limit=2` (complete) |
| `products-list-partial.json` | tail of `GET /products` (the first item was cut off in the capture, so this is partial) |

Kept verbatim on purpose: quirks such as `http://` image URLs, `XIAOMI` casing and decimal prices are part of what the adapter must handle. Excluded from Biome so they stay byte-for-byte as captured.
