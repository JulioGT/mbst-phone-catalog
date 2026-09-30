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
