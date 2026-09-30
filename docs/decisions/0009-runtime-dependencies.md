# 0009. Planned runtime dependencies

- Status: accepted
- Date: 2026-09-30

## Context

New runtime dependencies are a review item. Listing the intended ones up front avoids surprises.

## Decision

BFF: `express`, `zod`, `helmet`. Web: `react`, `react-dom`, `react-router`, `zod` (parse BFF responses). Contracts: `zod`. Dev: Rsbuild, Jest and React Testing Library (`@testing-library/react`, `user-event`, `jest-axe`), Mocha, Chai, supertest, Cypress. Anything else needs a new ADR or a note in the PR.

## Consequences

A small, known dependency surface. Each addition is justified where it is first used.

## Additions

- Chunk 2 (dev only): `tsx`, so Mocha can load TypeScript tests directly. It brings `esbuild`, whose install script pnpm blocks by default; it is denied explicitly in `pnpm-workspace.yaml` (`allowBuilds`) because esbuild ships its binary as an optional dependency and works without the script.
- Chunk 3: runtime `express` 5, `helmet`, `zod` 4 (BFF) and `zod` (contracts), as planned. Dev: `supertest` and its types, `@types/express`, and `@types/node` pinned to 18 so the BFF cannot use Node APIs newer than the lowest supported runtime.
- Chunk 4: runtime `react` and `react-dom` 19, `react-router` 7 (8 needs Node 22, see ADR 0010), `zod` (validating the stored cart). Dev: Rsbuild 2 with its React plugin; Jest 30 with `jest-environment-jsdom`, `@swc/jest` (fast TypeScript transform), `identity-obj-proxy` (CSS Modules in tests), React Testing Library, `user-event`, `jest-axe`, and `@testing-library/jest-dom` 6.9 (readable DOM assertions; 7 needs Node 22). `@swc/core` is pinned to 1.16.12 because 1.16.13 was younger than pnpm's minimum release age; we did not add an exception to that supply-chain rule. Install scripts of `@swc/core`, `unrs-resolver` and `@parcel/watcher` are denied in `pnpm-workspace.yaml`: each ships prebuilt binaries and was checked to work without its script.
- After chunk 8 (dev only): `simple-git-hooks`, a dependency-free way to install a pre-commit hook that runs `biome check --staged`. Its own install script is denied (`allowBuilds`); the root `prepare` script installs the hook explicitly, so nothing writes to `.git/hooks` without being declared in `package.json`.
- Deployment (dev only): `esbuild`, already present through `tsx`, declared directly to bundle the BFF into `dist/main.js` so production runs plain `node` without a TypeScript loader.
