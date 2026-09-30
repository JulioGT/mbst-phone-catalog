# Remote catalog API

What we know about the upstream API, separated into **observed** (seen in real responses on 2026-09-29/30) and **to verify** (checked by `pnpm check:contract`, chunk 3). Base URL and key come from the environment (`.env.example`). Every request needs the `x-api-key` header; a bad key returns `401`.

Interactive docs: `<base url>/docs/` (Swagger UI).

## Endpoints

### `GET /products`

Query: `search` (matches brand or name), `limit`, `offset`. Returns a JSON array of:

```json
{ "id": "APL-IP13-128", "brand": "Apple", "name": "iPhone 13", "basePrice": 619, "imageUrl": "http://.../APL-IP13-128-medianoche.webp" }
```

### `GET /products/{id}`

Returns one product, or `404 { "error": string, "message": string }`.

```jsonc
{
  "id": "MTE-EDGE50PRO",
  "brand": "Motorola",
  "name": "edge 50 Pro",
  "description": "...",                 // Spanish prose
  "basePrice": 649,
  "rating": 3.8,                        // not shown in the design
  "specs": {
    "screen": "6.67\" Super HD (1220p)",
    "resolution": "2712 x 1220 pixels",
    "processor": "Snapdragon® 7 Gen 3",
    "mainCamera": "50 MP",
    "selfieCamera": "50 MP",
    "battery": "4500 mAh",
    "os": "Android 14",
    "screenRefreshRate": "No especificado"   // placeholder text, not null
  },
  "colorOptions":   [{ "name": "Negro", "hexCode": "#000000", "imageUrl": "http://..." }],
  "storageOptions": [{ "capacity": "512 GB", "price": 649 }],
  "similarProducts": [ /* same shape as a list item, 6 seen */ ]
}
```

## Observed behavior and how we handle it

| Observation | Handling |
|---|---|
| `imageUrl` values use `http://` although the host serves `https://` (list, `colorOptions`, `similarProducts`) | BFF rewrites to `https://` to avoid mixed-content warnings |
| Brand casing is inconsistent (`Xiaomi` / `XIAOMI`, `SONY`, `OPPO`, `realme`); names too (`14`, `g24`, `edge 50 Pro`) | Keep raw values; display casing is CSS (`text-transform`); comparisons are case-insensitive |
| Prices can have decimals (`553.31`, `959.42`) | Converted to integer cents at the BFF boundary; printed without decimals when they are zero (`1219 EUR`) |
| `id` is a unique string SKU (`SMG-A35`, `XMI-13TPro`) | Used as-is in URLs (URL-encoded) |
| `storageOptions[].price` equals `basePrice` when there is one option | Treated as the **absolute** price of that capacity, consistent with the Figma cart (512 GB = 1199, 256 GB = 1099). With several options, `basePrice` is not always the lowest (see below) |
| A product may have a single storage option or a single color | The single option is preselected (ADR 0007) |
| `specs.screenRefreshRate` may be `"No especificado"` | Rendered verbatim so the specifications table keeps its fixed rows |
| Search is case-insensitive (`iphone` matched `iPhone 13`) | UI sends the term as typed (trimmed) |
| `limit` is honored | List uses `limit=20`; search also uses `limit=20` |
| List returns no total count | "N results" is the number of items returned (at most 20) |
| `access-control-allow-origin: *`, `cache-control: public, max-age=300` | CORS would not block browsers, but the key must stay server-side, hence the BFF |
| Host may respond slowly on first request (cold start) | BFF timeout, UI loading and retry states |

## Verified against the live API (2026-09-30)

Checked with `pnpm check:contract` (repeatable) and a one-off probe of every product. 24 list items, 23 unique products.

| Question | Finding | Handling |
|---|---|---|
| Does `search` match brand as well as name? | Yes, case-insensitive (`samsung`, `SAMSUNG`, `xiaomi` all work). A term with surrounding spaces matches nothing | The BFF trims the term before sending it |
| Duplicates in the list? | Yes: `XMI-RN13P5G` appears twice, inside the first 20 | The adapter asks for `limit + 5`, drops repeats (first wins, logged as a warning) and returns `limit`, so the list still shows 20 phones |
| Is `basePrice` the cheapest storage price? | **No**, on 5 of 23 (for example `SMG-S24U`: base 1329, storage 1229 / 1329 / 1529) | Passed through unchanged. How the detail page words the price before a storage is chosen is decided in chunk 6 |
| Does every product have a color and a storage option? | Yes | Arrays are still not required to be non-empty; the UI handles empty |
| Similar products: empty, missing, or self? | Never empty or missing, never the product itself, but duplicated on 1-2 products | Duplicates dropped; a missing list is treated as empty |
| Are all spec attributes present? | No: `APL-IP13-128` has no `screenRefreshRate` and an extra `storage` key | Every spec attribute is optional; unknown keys are dropped |
| Color codes | Mostly `#RRGGBB`; `SNY-XPERIA1V` uses `#000` | Both forms accepted |
| `limit=0` or negative | Returns everything | The BFF never sends them (its own limit is 1..50) |
| `offset` | Ignores `limit` when present | Unused |
| Errors | `401 { "error": "UNAUTHORIZED", "message": "Invalid API key" }`, `404 { "error": "NOT-FOUND", "message": "Product not found" }` | Mapped to domain errors in the adapter |
| `https` images | The same paths are served over `https` | Rewritten in the adapter |

`pnpm check:contract` exits non-zero only when a payload breaks the schemas or the key is rejected; the other findings print as `note` lines because the adapter already absorbs them.
