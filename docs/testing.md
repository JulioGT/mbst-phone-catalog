# Testing

Tests describe behavior, not implementation. A good test name reads as a requirement: `keeps the add button disabled until a color is chosen`.

## What is tested where

| Level | What | Tools | Doubles |
|---|---|---|---|
| Domain (both apps) | Pure rules: cart add/remove/total, money, selection rules | Mocha + Chai (BFF), Jest (web) | none needed |
| BFF use cases | Orchestration and flag behavior | Mocha + Chai | in-memory adapters |
| BFF adapters | Upstream HTTP adapter: success, 404, 401, timeout, malformed payload, duplicates, `http` images | Mocha + Chai + local stub server | stub server on a random port |
| BFF routes | Status codes, validation, error bodies | Mocha + Chai + supertest | in-memory catalog |
| Web hooks and components | Rendering, interaction, accessibility, states | Jest + React Testing Library + user-event + jest-axe | in-memory gateway and storage |
| Architecture | Layer rules fire on violations | `node:test` (`pnpm test:arch`) | fixture projects |
| End to end | Happy path in a real browser | Cypress | BFF pointed at a local stub of the upstream API |

The end-to-end suite stubs the **upstream** API (behind the BFF), not the browser's requests: once pages are server-rendered, the server makes the data calls and browser-side interception cannot see them.

BFF tests live in `apps/bff/test/` (mirroring `src/`) and run with `pnpm test`. Web tests are co-located (`*.test.ts(x)` next to the code); shared helpers and test doubles (`renderApp`, `aCartLine`, `InMemoryCartStorage`) live in `apps/web/test/`, outside the layers. A domain test may import only the domain, so it defines its own builders. Jest runs in `test/jsdom-environment.cjs`, a jsdom environment that lends Node's standard `Request`, `Response`, `fetch`, `AbortController` and `TextEncoder`, which real browsers have and jsdom lacks. It also teaches jsdom the `<search>` element (supported by all current browsers), so React does not warn about it; Testing Library cannot query it by role yet, so tests find it by tag. Shared test data comes from builders such as `aProductSummary()` in `apps/bff/test/builders.ts`, and in-memory doubles of the ports from `apps/bff/test/doubles/`.

## Rules

- **Query by what users perceive**: `getByRole`, `getByLabelText`, `getByText`. Use test ids only as a last resort.
- **Interact like a user**: `userEvent`, not `fireEvent`.
- **No implementation details**: no assertions on state variables, hook internals or CSS class names.
- **No snapshot tests** as a primary strategy.
- **Arrange, Act, Assert**, one behavior per test. Build data with small builders (`aProduct({ brand: 'XIAOMI' })`), not giant literals.
- **Time**: use fake timers for debounce; never `sleep`.
- **No real network** in unit or integration tests. The only test that may touch the real API is the manual `pnpm check:contract`.
- **Fix the cause of a flaky test**; never add retries.

## Guards

- The Jest setup fails any test that calls `console.error` or `console.warn` (the challenge requires a clean console). Introduced in chunk 4.
- Every component test includes a `jest-axe` assertion.
- CI runs `pnpm verify` on Node 20 and Node 22.

## Coverage

No global percentage gate: numbers reward the wrong behavior. Instead, review asks: is every rule, state (loading, empty, error) and edge case (single option, corrupt storage, out-of-order responses) covered by a named test?

## Manual quality checks (chunk 8, 2026-09-30)

Run against the **production** build (`pnpm preview`, with the BFF on the live API). Repeat before a release.

| Check | How | Result |
|---|---|---|
| Console | Fresh tab; search, open a phone, add, open the cart, remove, unknown URL | No messages at all |
| Production assets | `apps/web/dist` | Minified, content-hashed JS and CSS; one API call per search (StrictMode double effects are development-only) |
| Accessibility engine | axe-core 4.10 in the real browser on list, no results, detail before/after choosing, cart, not found | 0 violations, including color contrast (which jsdom cannot measure) |
| Keyboard | Tab through the detail page | Skip link, logo, cart, BACK, storage, color, AÑADIR, similar cards; focus always visible |
| Responsive | Every page at 320, 767, 768, 1199, 1200 and 1920 px | No horizontal page scroll; grid switches at exactly 768 and 1200 |
| Language of parts | Spanish text inside the English page (`AÑADIR`, `Eliminar`, API descriptions) | Marked `lang="es"` so screen readers pronounce it correctly (WCAG 3.1.2) |
