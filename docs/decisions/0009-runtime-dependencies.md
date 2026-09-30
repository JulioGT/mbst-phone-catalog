# 0009. Planned runtime dependencies

- Status: accepted
- Date: 2026-09-30

## Context

New runtime dependencies are a review item. Listing the intended ones up front avoids surprises.

## Decision

BFF: `express`, `zod`, `helmet`. Web: `react`, `react-dom`, `react-router`, `zod` (parse BFF responses). Contracts: `zod`. Dev: Rsbuild, Jest and React Testing Library (`@testing-library/react`, `user-event`, `jest-axe`), Mocha, Chai, supertest, Cypress. Anything else needs a new ADR or a note in the PR.

## Consequences

A small, known dependency surface. Each addition is justified where it is first used.
