# MBST phone catalog

Phone catalog web app built for the Inditex/Zara frontend challenge: product list with real-time search, product detail with color and storage selection, and a persistent cart.

> **Status: work in progress, delivered in chunks.** Chunk 1 (foundation) is done: the repository, tooling, architecture guardrails and documentation exist, but **the application does not run yet**. The full README (how to run, architecture walkthrough, decisions, deviations from the design) is written in the final chunk. The plan and status are in [`docs/technical-proposal.md`](docs/technical-proposal.md).

## Stack

React 19, TypeScript (strict), Rsbuild, Express BFF, CSS Modules with CSS custom properties, pnpm workspaces, Turborepo, Biome, Jest and React Testing Library (web), Mocha and Chai (BFF), Cypress (end to end).

## Getting started

Requirements: Node 18.18 or newer and pnpm (`corepack enable` picks up the pinned version).

```bash
pnpm install
cp .env.example .env     # then set CATALOG_API_KEY to the key from the challenge statement
pnpm verify              # lint + architecture rules + typecheck
```

## Repository layout

```
apps/bff/            Express backend-for-frontend
apps/web/            React application
packages/contracts/  Wire types shared by both apps
tools/architecture/  Tests proving the architecture rules work
docs/                Architecture, language, IA, testing and decision records
```

Start with [`docs/architecture.md`](docs/architecture.md) and [`AGENTS.md`](AGENTS.md).
