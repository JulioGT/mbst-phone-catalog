# 0010. Raise the minimum Node version to 20.19

- Status: accepted (supersedes the Node 18 part of ADR 0008)
- Date: 2026-09-30

## Context

The challenge statement asks for "Backend: Node 18". Node 18 reached end of life in April 2025 and no longer receives security fixes. The current releases of the web toolchain require newer Node: Rsbuild 2 needs 20.19 or later, and React Router 7 needs 20 (React Router 8 needs 22). Staying on Node 18 would mean Rsbuild 1, React Router 6 and older test helpers, and a harder upgrade later.

## Decision

Support Node 20.19 and later (`engines.node: ">=20.19"`, `.nvmrc` 22). CI runs `pnpm verify` on Node 20 and 22. Use React Router 7 (not 8) so Node 20 keeps working. TypeScript 5.9 and dependency-cruiser 16 stay pinned as in ADR 0008.

## Consequences

Current, supported tools and runtime. The BFF itself uses nothing newer than Node 20. Cost: a literal reading of the challenge's "Node 18" is not met; the README explains why (an end-of-life runtime is a security risk in production).
