# Technical proposal

## Context

Build a phone catalog web app for the Inditex/Zara frontend challenge: list with real-time search (filtered by the API), product detail with color/storage selection and similar products, and a persistent cart. Requirements include responsive layout following Figma, accessibility, tests, linters/formatters, a clean browser console, separate development and production modes, and a detailed README.

## Scope

**In:** the three views; search with result count; persistent cart (`localStorage`); responsive layout (mobile, tablet, desktop); WCAG 2.1 AA target; unit, component, BFF and end-to-end tests; dev (unminified) and production (concatenated, minified) modes; SSR for list and detail; a minimal feature-flag seam.

**Out:** checkout and payment (the `PAY` button is present but inert), authentication, quantity per line, categories/filters/pagination (the API offers none), a full GrowthBook integration, internationalization beyond centralizing copy.

## Approach

- **Monorepo** (pnpm workspaces + Turborepo): `apps/bff`, `apps/web`, `packages/contracts`. ADR 0001.
- **Hexagonal architecture** in both apps, enforced by an automated check. ADR 0002.
- **BFF** holds the API key and absorbs the upstream API's quirks. ADR 0003.
- **Rsbuild + React 19 + Express**, SPA first, SSR added afterwards. ADR 0004.
- **CSS Modules + CSS custom properties** as design tokens. ADR 0005.
- **Money in integer cents; cart lines are snapshots.** ADR 0006.
- **UX rule:** single options are preselected. ADR 0007.
- Full list of decisions: `decisions/`.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Remote API cold starts or timeouts | BFF timeout, skeleton and retry states, no test depends on the real host |
| Remote data is inconsistent (casing, `http` images, decimals, placeholders) | Validate and normalize once, in the BFF adapter, with tests per quirk |
| Figma could not be inspected programmatically | Values isolated in `tokens.css`; deviations documented; replace estimates with Inspect values |
| SSR hydration mismatches (cart count, browser-only APIs) | SSR-safety rules from the first web chunk; hydration test in chunk 9 |
| Console warnings (for example duplicate React keys) | Jest guard fails on `console.error`/`console.warn`; de-duplication at the adapter |
| Tooling drift across Node versions | CI matrix on Node 18 and 22; ADR 0008 |

## Delivery plan and estimate

Effort is for one engineer familiar with the stack, excluding waiting time for review. It is an estimate, not a commitment.

| # | Chunk | Estimate | Status |
|---|---|---|---|
| 1 | Foundation: monorepo, tooling, architecture guardrail, docs and agent files | 3-4 h | delivered |
| 2 | BFF core: domain, use cases, ports, in-memory adapters | 4-6 h | delivered |
| 3 | BFF edges: contracts (DTOs + schemas), upstream HTTP adapter, Zod validation, routes, error mapping, `check:contract` | 4-6 h | planned |
| 4 | Web foundation: Rsbuild dev/prod, tokens, layout, routing, cart domain and context, storage adapter, test setup | 5-7 h | planned |
| 5 | List and search | 5-7 h | planned |
| 6 | Detail | 6-8 h | planned |
| 7 | Cart | 3-4 h | planned |
| 8 | Quality pass: accessibility audit, console guard review, responsive polish | 4-5 h | planned |
| 9 | SSR for list and detail | 6-8 h | planned |
| 10 | Cypress end-to-end | 3-4 h | planned |
| 11 | README, final documentation, checklist (Docker if time allows) | 3-4 h | planned |
| | **Total** | **46-63 h** | |

## Open questions and assumptions

- Exact colors, spacing and type sizes are estimated from screenshots (see `design-system.md`).
- The MBST logo is a text placeholder until an SVG export is provided.
- Checked against real responses: `search` is case-insensitive and `limit` works. Still to be verified live: brand search, duplicates, and whether `basePrice` equals the cheapest storage price (`api-contract.md`).
