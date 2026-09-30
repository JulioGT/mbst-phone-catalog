# 0002. Hexagonal architecture in both apps, enforced automatically

- Status: accepted
- Date: 2026-09-30

## Context

Business rules (selection rules, cart maths, flag behavior) should be testable without React, Express, the network or `localStorage`, and remote-API problems must not leak into the UI. Architecture documents alone drift.

## Decision

Both apps use domain / application / infrastructure layers (plus ui in the web app) with ports and adapters, and dependencies point inward. Each app owns its domain model; `packages/contracts` defines only the wire format. Layering is enforced by dependency-cruiser (`pnpm check:arch`), and the rules are themselves tested (`pnpm test:arch`).

## Consequences

Fast, honest tests and replaceable details. Cost: some type duplication between BFF and web models, and a few more files per feature. A violation fails the build instead of a code review.
