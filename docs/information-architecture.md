# Information architecture

**Information architecture (IA)** is how content is organized, named and connected so that people can find things and know where they are. It is the layer between the content (the catalog) and the interface (the pages). Good IA shows up in URLs, labels, page structure and navigation, not only in the visual design.

## What the catalog gives us to organize

The API exposes a flat list of products with brand and name. There are **no categories, filters or facets**, so the only findability mechanisms are the grid and search by brand or name. We do not invent a taxonomy the data cannot support (see "Out of scope").

## Site map

```
MBST
├── Product list          /              (search state: /?q=samsung)
│   └── Product detail    /products/:id
│       └── Similar products -> other product details
└── Cart                  /cart
```

Three page types, one level of depth. The header (logo and cart) appears on every page.

## URLs

| Page | URL | Notes |
|---|---|---|
| Product list | `/` | The search term is a query parameter: `/?q=samsung`. Back/Forward restore it, and links can be shared |
| Product detail | `/products/SMG-A35` | The API `id` is used as the slug; readable and stable |
| Cart | `/cart` | |
| Unknown route / unknown product | shows a "not found" page with a way back | Unknown products return HTTP 404 in SSR |

## Navigation model

| Control | Where | Goes to |
|---|---|---|
| Logo | every page | `/` (product list) |
| Bag icon with count | every page except the cart | `/cart`. Hidden on the cart page (already there; matches the desktop and mobile designs) |
| `BACK` | detail page | Previous page in history when it came from this site (restores the search), otherwise `/` |
| Product card | list, similar items | `/products/:id` |
| `CONTINUE SHOPPING` | cart | `/` |

## Labels

- Section and control labels are uppercase and short (`SPECIFICATIONS`, `SIMILAR ITEMS`, `TOTAL`); brand and product names are displayed in caps via CSS but stored as delivered.
- The same thing always has the same name everywhere. Vocabulary is defined in `product-language.md`.
- Prices are always printed `<amount> EUR`.

## Page structure

Content order follows the shopper's decision path: recognize, choose, verify, discover.

**List**: search box -> result count -> grid. Each card: image, brand, name, price.

**Detail**: back link -> image and buying options (name, price, storage, color, add button) -> specifications -> similar products. Buying options come before technical detail because they are what most visitors act on; specs are for verification.

**Cart**: title with count -> lines (image, name, "storage | color", price, remove) -> total and actions.

## Accessibility structure

- One `h1` per page: the app name on the list, the product name on detail, "Cart" on the cart page.
- `h2` for `Specifications` and `Similar items`; the specifications are a real table.
- Landmarks: `header`, `nav`, `main`.
- The document `title` changes per page: `Phones | MBST`, `{Brand} {Name} | MBST`, `Cart (n) | MBST`. Navigation moves focus to the page heading so screen-reader users notice the change.

## States are content too

Each page defines what it says when loading, empty, and failed (list: skeletons / "No results for ..." / retry; detail: skeleton / "Product not found" / retry; cart: "Your cart is empty" with the continue button). Exact strings are in `copy.ts` and flagged as our additions in `product-language.md`.

## Out of scope (and why)

Categories, brand filters, sorting and pagination: the API provides no taxonomy, facets or total count, and the design has none. If they were needed, the first step would be a brand filter derived from the list, then a `total` in the API response.
