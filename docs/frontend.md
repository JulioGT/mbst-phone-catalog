# Frontend (React 19)

> Status: all three pages are implemented (chunks 4-7): list with search, detail, cart. Next: quality pass (chunk 8) and SSR (chunk 9).

Development: `pnpm dev` serves the app on http://localhost:3001 (unminified, with source maps and hot reload) and proxies `/api` to the BFF on :3000. Production: `pnpm build` writes minified, hashed bundles to `apps/web/dist`; `pnpm --filter @mbst/web preview` serves them.

## Stack

React 19 with function components and hooks only, TypeScript, Rsbuild for bundling (unminified in development, minified and hashed in production), CSS Modules plus CSS custom properties, React Context for state, React Router for navigation. Tests: Jest and React Testing Library.

## Layout (`apps/web/src`)

```
domain/           Money, Cart, CartLine, selection rules (pure functions, no React)
application/
  ports/          CatalogGateway, CartStorage
  cart/           CartProvider, useCart
  catalog/        useProductSearch, useProductDetail
infrastructure/   HttpCatalogGateway, LocalStorageCartStorage
ui/
  app-layout.tsx  skip link, header, <main>; moves focus to the h1 after navigation
  routes.tsx      route table shared by the browser router (and the server renderer, chunk 9)
  pages/          ProductListPage, ProductDetailPage, CartPage, NotFoundPage
  components/     Header, PageHeading, icons, SearchBox, ProductCard, ProductGrid, ...
  styles/         tokens.css, base.css
copy.ts           All user-facing strings (verbatim from Figma)
main.tsx          composition root
test/             renderApp, builders, test doubles, Jest setup (outside the layers)
```

## State

- **Server data** (products) lives in hooks that call the `CatalogGateway` port. Loading, error and empty states are modeled explicitly, never inferred from `undefined`.
- **Document title** is set with React 19's `<title>` element inside each page (hoisted into `<head>`; works with SSR too).
- **Cart** lives in one Context. Cart rules are pure functions in `domain`; the Context holds state, calls those functions and persists through the `CartStorage` port. Stored data is validated when loaded, so corrupt `localStorage` cannot crash the app. The cart is read after mount and never saved before it is read, so a first render cannot wipe the stored cart. The storage key is `mbst.cart`, with a `version` field for future migrations.
- **Search term** lives in the URL (`?q=samsung`), so Back/Forward and shared links behave. `SearchBox` keeps the text being typed in local state and commits the trimmed term to the URL after 300 ms without typing, on Enter, or when cleared (with `replace`, so typing does not add history steps). When the URL changes from outside, the box follows it without discarding text being typed. `useProductSearch` aborts the previous request with `AbortController` and ignores late answers, so a slow old response can never overwrite a newer one.
- **Prices** are formatted only in `ui/format-price.ts`, Spanish style: `1219 EUR`, `553,31 EUR` (no decimals when whole, comma for cents).
- **Detail selection** (storage, color) is local component state.

## Components

- One component per file, co-located `*.module.css` and `*.test.tsx`.
- Props are small and explicit; no prop spreading of unknown objects.
- Components never fetch. They use hooks from `application`.
- Prefer semantic HTML (`button`, `a`, `ul`, `table`, `h1`..`h3`) over ARIA. Add ARIA only where HTML has no equivalent.

## Styling

- CSS Modules for component styles; design tokens as CSS custom properties in `styles/tokens.css` (see `design-system.md`).
- No hard-coded colors, spacing or font sizes in component CSS: use a token.
- Mobile first. Breakpoints are literal values in `@media` rules (custom properties cannot be used inside media queries): tablet from 768px, desktop from 1200px.
- Font stack: `Helvetica, Arial, sans-serif`.
- Inline styles only for genuinely dynamic values (a color swatch's `hexCode`), passed through a CSS variable.

## Accessibility checklist (applies to every interactive component)

- Everything reachable and operable by keyboard; visible `:focus-visible` outline.
- Controls have accessible names. Icon-only controls (cart, clear search, back) have `aria-label`.
- Selected state is exposed (`aria-pressed` or radio semantics for storage/color), not conveyed by color alone.
- Result count and cart changes are announced through a polite live region.
- The disabled add button explains what is missing.
- Color contrast meets WCAG 2.1 AA (see deviations in `design-system.md`).
- Images have meaningful `alt` text (`"{brand} {name}, {color}"`).
- One `h1` per page and no skipped heading levels.

## Behavior decisions (UX)

- A single available option is preselected and shown as selected.
- Nothing chosen yet: "From X EUR" (the catalog's `basePrice`, as designed; product owner decision, see `api-contract.md`) and the first color's image. After choosing a storage: that storage's price, without "From", announced through a polite live region.
- All color images of a phone are preloaded when its page opens, so switching colors never shows the previous image while the new one loads.
- Storage and color are native radio groups (`fieldset` + `legend`): arrow keys, and "selected" announced without ARIA.
- `AÑADIR` uses `aria-disabled` (not `disabled`) so it stays focusable and its hint (what is missing) is read with it.
- The detail hook scopes its state to the product id, so moving to a similar phone shows the loading state at once instead of the previous phone.
- Focus after navigation: if the new page is still loading, focus waits on `<main>` and moves to the h1 when it appears (`ui/heading-focus.tsx`).
- After adding to the cart the user gets confirmation, announced to assistive technology.
- Removing a cart line moves focus to the next line's `Eliminar`, else the previous one, else `CONTINUE SHOPPING` when the cart is empty; the removal is announced in a polite live region. Each `Eliminar` has an accessible name that starts with the visible word and names the line (`Eliminar Galaxy S24 Ultra, 512 GB, Negro`).
- Search: skeletons while loading, a clear "No results" message, a retry action on errors.

## SSR-safety

Follow the rules at the end of `architecture.md`. Chunk 9 adds server rendering for the list and detail pages; code written before then must not need rewriting for it.

## Testing

See `testing.md`. Every component test includes an accessibility assertion (`jest-axe`), and the Jest setup fails any test that logs `console.error` or `console.warn`.
