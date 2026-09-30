---
name: add-component
description: Create or modify a React component, page or UI piece in apps/web (cards, selectors, buttons, header, cart rows, forms). Use for any request that changes what the user sees or interacts with, including "add a button", "make the layout responsive" and "match the Figma", so that styling tokens, accessibility, copy and tests are done consistently.
---

# Add a component

## Steps

1. **Check the design first**: `docs/design-system.md` (tokens, breakpoints, states) and `docs/information-architecture.md` (headings, landmarks, labels). List all states the component can be in, including loading, empty and error.
2. **Files, co-located in `apps/web/src/ui/components/<name>/`**: `<name>.tsx`, `<name>.module.css`, `<name>.test.tsx`. Kebab-case file names, `PascalCase` export, named export.
3. **Data comes from hooks in `application/`**. A component never fetches, never touches `localStorage`, never imports from `infrastructure/`.
4. **Strings come from `copy.ts`.** New strings not in Figma are marked as our additions in `docs/product-language.md`.
5. **Style with tokens only** (`var(--space-4)`, `var(--color-text)`). Mobile first, then `@media (min-width: 768px)` and `(min-width: 1200px)`. No hard-coded colors or sizes.
6. **Semantic HTML first**; ARIA only where HTML has no equivalent. Follow the accessibility checklist in `docs/frontend.md`: keyboard, visible focus, names for icon-only controls, selected state exposed, live regions for counts.
7. **SSR-safe**: no `window`/`document`/`localStorage` at module scope.
8. **Tests**: render with React Testing Library, query by role or label, interact with `userEvent`, include a `jest-axe` assertion, cover each state. See `docs/testing.md`.
9. **Run `pnpm verify`.**

## Checklist

- [ ] Works with keyboard only.
- [ ] No console errors or warnings (the test setup fails on them).
- [ ] Any deviation from Figma is listed in `docs/design-system.md`.

## Do not

Use inline styles for anything but a truly dynamic value passed through a CSS variable, add a dependency without a note in the PR, or test implementation details (state, class names).
