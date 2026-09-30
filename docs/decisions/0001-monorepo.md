# 0001. Monorepo with pnpm workspaces and Turborepo

- Status: accepted
- Date: 2026-09-30

## Context

The challenge requires one public repository. The BFF and the web app must agree on a wire format, and the role's stack names pnpm workspaces and Turborepo. A single package with `server/` and `client/` folders would also work.

## Decision

One repository with three workspaces: `apps/bff`, `apps/web` and `packages/contracts` (plus `apps/e2e` later). Turborepo orchestrates tasks and caches results.

## Consequences

A contract change is a compile error on both sides and lands in one commit; one command (`pnpm verify`) checks everything. Cost: more configuration files and more to explain than a single package.
