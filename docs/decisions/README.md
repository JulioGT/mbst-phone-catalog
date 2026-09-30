# Architecture decision records

Short records of decisions that are costly to reverse, written when the decision is made. Format: context, decision, consequences. Do not edit an accepted record to change history: add a new one that supersedes it and mark the old one as superseded.

| # | Decision |
|---|---|
| 0001 | Monorepo with pnpm workspaces and Turborepo |
| 0002 | Hexagonal architecture in both apps, enforced automatically |
| 0003 | The BFF owns the API key and the upstream API's quirks |
| 0004 | Rsbuild, React 19 and Express; SPA first, then SSR |
| 0005 | CSS Modules and CSS custom properties as design tokens |
| 0006 | Money as integer cents; cart lines are snapshots |
| 0007 | Preselect options when only one exists |
| 0008 | Pin TypeScript 5.9 and dependency-cruiser 16 |
| 0009 | Planned runtime dependencies |
