# 0008. Pin TypeScript 5.9 and dependency-cruiser 16

- Status: accepted
- Date: 2026-09-30

## Context

The challenge specifies Node 18. At the time of writing the latest releases are TypeScript 7 (native compiler) and dependency-cruiser 18, and dependency-cruiser 17 and later drop support for Node 18. Test runners and analyzers use the TypeScript JavaScript API, whose compatibility with TypeScript 7 has not been verified for this project.

## Decision

Pin TypeScript 5.9.3 and dependency-cruiser 16.10.4, both exact. Verify the whole toolchain on Node 18.20 and 22. CI runs both.

## Consequences

Contributors on Node 18 can run everything. Cost: not on the newest compiler. Revisit when the test tooling supports TypeScript 7 and the Node 18 requirement is lifted.
