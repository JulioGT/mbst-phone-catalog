# Product language (ubiquitous language)

One vocabulary for the design, the API, the code, the tests and the copy. If a word is not here, add it here first. Where a term differs between the remote API and our code, the mapping is given.

## Glossary

| Term | Meaning | In code | UI copy (Figma) |
|---|---|---|---|
| **Catalog** | The set of phones we sell | `catalog` | none |
| **Product** | One phone model | `Product` | none |
| **Product summary** | The short form used in the grid and in similar items: id, brand, name, base price, image | `ProductSummary` | card |
| **Product detail** | The full form: description, specs, color options, storage options, similar products | `ProductDetail` | detail page |
| **Brand** | The manufacturer, shown in caps | `brand` | `APPLE` |
| **Base price** | The catalog's headline price for a product, shown on cards. Usually, but not always, the cheapest storage option (`api-contract.md`) | `basePrice` (wire: `basePriceInCents`) | `From 1099 EUR` |
| **Storage option** | A capacity with its own absolute price | `StorageOption { capacity, price }` | `256 GB` |
| **Color option** | A named color with a swatch color and its own image | `ColorOption { name, hexCode, imageUrl }` | swatch + name |
| **Selection** | The storage and color a shopper has chosen so far (either may be missing) | `ProductSelection` | none |
| **Specifications** | Fixed table of technical attributes | `specs` | `SPECIFICATIONS` |
| **Similar products** | Products suggested on a detail page | `similarProducts` | `SIMILAR ITEMS` |
| **Product query** | What to list: an optional search term and a limit (default 20) | `ProductQuery` | none |
| **Search term** | Text typed in the search box, matched against brand or name | `searchTerm` (URL param `q`) | `Search for a smartphone...` |
| **Result count** | Number of products currently listed | `resultCount` | `20 RESULTS` |
| **Cart** | What the shopper intends to buy; persisted in the browser | `Cart` | `CART (n)` |
| **Cart line** | One product with a chosen storage and color, plus a snapshot of name, brand, image and unit price at the time it was added. Every add creates its own line | `CartLine` (`lineId`) | one row |
| **Cart count** | Number of lines in the cart | `count` | number next to the bag icon |
| **Cart total** | Sum of the unit prices of all lines | `total` | `TOTAL` |
| **Money** | An amount in integer cents, currency EUR | `Money` | `1219 EUR` |
| **Feature flag** | A named switch controlling a capability | `FeatureFlag` | none |

## Words we avoid

| Avoid | Use | Why |
|---|---|---|
| item, SKU | product / cart line / `id` | "item" is ambiguous between a product and a cart line |
| variant | selection | the API has options, not variants |
| basket, bag | cart | the icon is a bag; the concept is the cart |
| quantity | (nothing) | no quantity exists: each add is its own line |

## Copy (verbatim from Figma)

Search placeholder `Search for a smartphone...` · results `N RESULTS` · back `BACK` · storage prompt `STORAGE ¿HOW MUCH SPACE DO YOU NEED?` · color prompt `COLOR. PICK YOUR FAVOURITE.` · add `AÑADIR` · sections `SPECIFICATIONS`, `SIMILAR ITEMS` · cart `CART (n)`, `Eliminar`, `CONTINUE SHOPPING`, `TOTAL`, `PAY`.

Spec row labels, in this order: `BRAND`, `NAME`, `DESCRIPTION`, `SCREEN`, `RESOLUTION`, `PROCESSOR`, `MAIN CAMERA`, `SELFIE CAMERA`, `BATTERY`, `OS`, `SCREEN REFRESH RATE`.

The design mixes English and Spanish (`AÑADIR`, `Eliminar`, `¿HOW MUCH...`). We reproduce it as designed and keep every string in `copy.ts`, so normalizing the language is a one-file change.

### Copy we add (not in the designs)

Marked here so nobody mistakes them for Figma text: `Skip to content`, the cart link's accessible name (`Cart, 2 phones`), the hidden list heading (`MBST phones`), document titles (`Phones | MBST`, `Cart (n) | MBST`), the not-found page (`Page not found`, `Back to all phones`), the search input's label (`Search for a smartphone`) and clear button (`Clear search`), the singular `1 RESULT`, `Loading phones`, the add hints (`Choose a storage and a color to add this phone.` and variants), the confirmation (`Added to your cart: …`), `Not available` for a missing spec, `Loading phone`, `We could not load this phone.`, `This phone is not in our catalog.`, `Your cart is empty.`, the `Eliminar` accessible names (`Eliminar {name}, {storage}, {color}`), the removal announcement (`Removed from your cart: …`), `Payment is not available in this demo.`, no-results message (`No phones match "…"` plus a hint), error and retry messages, "Product not found", loading labels for screen readers, add-to-cart confirmation, the reason the add button is disabled, and the disabled state label of `PAY`.
