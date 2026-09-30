# Frontend (React 19)

> Status: conventions for chunks 4 to 9. Nothing here is implemented yet.

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
  pages/          ProductListPage, ProductDetailPage, CartPage
  components/     Header, SearchBox, ProductCard, ProductGrid, ...
  styles/         tokens.css, base.css
copy.ts           All user-facing strings (verbatim from Figma)
main.tsx          composition root
```

## State

- **Server data** (products) lives in hooks that call the `CatalogGateway` port. Loading, error and empty states are modeled explicitly, never inferred from `undefined`.
- **Cart** lives in one Context. Cart rules are pure functions in `domain`; the Context holds state, calls those functions and persists through the `CartStorage` port. Stored data is validated when loaded, so corrupt `localStorage` cannot crash the app.
- **Search term** lives in the URL (`?q=samsung`), so Back/Forward and shared links behave. The input is debounced (about 300 ms). Each new request aborts the previous one with `AbortController`, so a slow old response can never overwrite a newer one.
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
- Nothing chosen yet: "From X EUR" and the first color's image. After choosing a storage: that storage's price, without "From".
- After adding to the cart the user gets confirmation, announced to assistive technology.
- Removing a cart line moves focus somewhere sensible (next line, or the continue button when empty).
- Search: skeletons while loading, a clear "No results" message, a retry action on errors.

## SSR-safety

Follow the rules at the end of `architecture.md`. Chunk 9 adds server rendering for the list and detail pages; code written before then must not need rewriting for it.

## Testing

See `testing.md`. Every component test includes an accessibility assertion (`jest-axe`), and the Jest setup fails any test that logs `console.error` or `console.warn`.
