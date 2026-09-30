# AGENTS.md

Instructions for AI coding agents and human contributors. Keep this file short; details live in `docs/`.

## What this is

A phone catalog web app for the Inditex/Zara frontend challenge: product list with real-time search, product detail with color/storage selection, and a persistent cart. A React 19 app is served by an Express **BFF** (backend for frontend) that proxies a remote catalog API and keeps its API key server-side. Both apps use **hexagonal architecture**.

## Status

Work is delivered in chunks (table in `docs/technical-proposal.md`). Implement only the current chunk unless told otherwise. Do not build features from later chunks "while you are there".

## Commands

```bash
pnpm install        # Node >= 18.18, pnpm 12 via `npm install -g pnpm@12.8.1`
pnpm verify         # lint + architecture check + architecture tests + typecheck. Must pass before every commit.
pnpm lint           # Biome check (lint + format + import order)
pnpm lint:fix       # apply safe fixes
pnpm typecheck      # tsc --noEmit in every workspace, via Turborepo
pnpm check:arch     # hexagonal layering rules (dependency-cruiser)
pnpm test:arch      # proves those rules fire
```

`test`, `dev`, `build` and `start` scripts are added by the chunk that introduces them; this file is updated in the same commit.

## Repo map

```
apps/bff/            Express BFF (hexagonal)          -> docs/bff.md
apps/web/            React 19 app (hexagonal-lite)    -> docs/frontend.md
packages/contracts/  Wire types + runtime schemas shared by both apps
tools/architecture/  Tests for the architecture rules
docs/                Architecture, language, IA, testing, ADRs
.claude/skills/      Task recipes for agents
```

## Architecture in five rules

1. Layers: `domain` <- `application` <- (`infrastructure` | `ui`). Dependencies point inward only. `pnpm check:arch` enforces it.
2. `domain` is plain TypeScript: no packages, no I/O, no framework, no other layer.
3. The outside world is reached through **ports** (interfaces owned by `application`) implemented by **adapters** in `infrastructure`.
4. Every quirk of the remote API (http images, inconsistent casing, decimals, placeholder values) is handled in the BFF catalog adapter and nowhere else.
5. Wiring happens only in the composition roots (`src/main.ts`, `src/main.tsx`), which sit outside the layers.

Full rationale: `docs/architecture.md`.

## Conventions

- TypeScript `strict` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. No `any`, no `!` non-null assertions, no `console.*` (Biome errors on all three).
- Relative imports carry **no file extension** (`'../domain/cart'`). Named exports only, except where a framework requires a default.
- Files are `kebab-case`. React components are `PascalCase` exports in kebab-case files.
- Money is integer cents inside the code and is formatted only at the UI edge.
- Use the terms in `docs/product-language.md` exactly, in code, tests and copy keys. Add a term there before inventing a new one.
- All user-facing strings live in one copy file, verbatim from the Figma designs (which mix English and Spanish on purpose; do not "fix" them silently).
- Code, comments, docs and commits are in English.
- Commits follow Conventional Commits (`docs/git-workflow.md`). Keep them small and single-purpose.

## Boundaries

**Always**
- Run `pnpm verify` before proposing a commit.
- Write or update tests in the same change as the code.
- Handle loading, empty and error states, not just the happy path.
- Update the relevant doc or ADR when a decision changes.

**Ask first**
- Adding a runtime dependency.
- Changing `packages/contracts/` (it is a public API between two apps).
- Editing `.dependency-cruiser.cjs` or Biome rules.
- Deviating from the Figma design (list every deviation in `docs/design-system.md`).

**Never**
- Commit `.env` or any real secret. `CATALOG_API_KEY` must never reach the browser bundle or the repo.
- Silence a lint rule, skip a test or weaken a type to make a check pass. Fix the cause.
- Import across layers to "save time". Add a port instead.
- Edit `pnpm-lock.yaml` by hand.

## Definition of done

Tests cover the behavior, `pnpm verify` passes, the console stays free of errors and warnings, keyboard and screen-reader use works for anything interactive, and docs are current.

## Docs index

| Read this | When |
|---|---|
| `docs/architecture.md` | Deciding where code goes |
| `docs/bff.md` | Working on the Express BFF or the upstream adapter |
| `docs/frontend.md` | Working on React components, state, styling, SSR-safety |
| `docs/api-contract.md` | Anything touching the remote catalog API |
| `docs/product-language.md` | Naming things, writing copy |
| `docs/information-architecture.md` | Routes, navigation, page structure |
| `docs/design-system.md` | Tokens, breakpoints, Figma deviations |
| `docs/testing.md` | Writing tests |
| `docs/feature-flags.md` | Adding or reading a flag |
| `docs/git-workflow.md` | Branches, commits, reviews |
| `docs/decisions/` | Why things are the way they are |
