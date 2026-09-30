# 0004. Rsbuild, React 19 and Express; SPA first, then SSR

- Status: accepted
- Date: 2026-09-30

## Context

The challenge names Next.js for the optional SSR. The target role uses Rsbuild, Express BFFs and SSR. Development must serve unminified assets and production must serve minified ones.

## Decision

Use Rsbuild (Rspack-based) for bundling, which gives unminified development builds and minified, hashed production builds by default, and Express for the BFF. Build a working SPA first, then add server rendering for the list and detail pages.

## Consequences

The repository shows the stack the role uses. Cost: SSR takes more setup than Next.js would. Mitigation: SSR-safety rules apply from the first web chunk and SSR is a separate chunk, so a working demo exists before it starts.
