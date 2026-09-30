# 0005. CSS Modules and CSS custom properties as design tokens

- Status: accepted
- Date: 2026-09-30

## Context

The challenge allows CSS, SASS or styled components and lists CSS variables as optional. SSR with runtime CSS-in-JS adds complexity.

## Decision

CSS Modules for component styles and one `tokens.css` of CSS custom properties (primitives, then semantic names). Components never hard-code colors, spacing or font sizes.

## Consequences

No runtime cost, straightforward SSR, and design values change in one file. Cost: media queries cannot use custom properties, so breakpoints are documented literals.
