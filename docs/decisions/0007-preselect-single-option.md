# 0007. Preselect options when only one exists

- Status: accepted
- Date: 2026-09-30

## Context

Some products have one storage option or one color. Making the shopper click the only choice, before an inert-looking button turns on, is friction with no benefit. The specification says the add button needs a color and a storage.

## Decision

When a product has exactly one storage option or one color, it is preselected and shown as selected. The add button still requires both to be selected, which is satisfied automatically in that case.

## Consequences

Fewer clicks and no dead-end state; the requirement is still met. Cost: a deliberate deviation from the most literal reading, listed in the README.
