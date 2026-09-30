# 0006. Money as integer cents; cart lines are snapshots

- Status: accepted
- Date: 2026-09-30

## Context

Upstream prices are JSON numbers with decimals (for example 553.31); summing floats produces rounding errors. The remote price can also change after a phone is in the cart, and the cart must not depend on the network.

## Decision

Prices become integer cents at the BFF boundary and stay integers until formatted for display. Each cart line stores a snapshot (product id, brand, name, image, chosen storage and color, unit price) taken when it was added. Every add creates its own line; there is no quantity.

## Consequences

Correct totals and an offline-capable cart that survives reloads. Cost: the cart can show a stale price; documented in the README, and out of scope to reconcile.
