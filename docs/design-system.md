# Design system

Source of truth: the Figma file supplied with the challenge (desktop, tablet and mobile frames). It could not be opened programmatically, so this document is built from screenshots. **Values marked "estimated" must be replaced with the numbers from Figma's Inspect panel**; because everything goes through `tokens.css`, that is a one-file change.

## Principles

Monochrome, editorial, dense typography, thin borders, no shadows or rounded corners. Uppercase for labels, names and brands. Color is used only for the single destructive action (`Eliminar`).

## Tokens (`apps/web/src/ui/styles/tokens.css`)

Two tiers only: primitives, then semantic names that components use.

| Token | Value | Source |
|---|---|---|
| `--font-family-base` | `Helvetica, Arial, sans-serif` | challenge statement |
| `--color-black` | `#000000` | estimated |
| `--color-ink` (primary button) | `#151515` | estimated |
| `--color-white` | `#ffffff` | estimated |
| `--color-grey-100` (disabled button) | `#eeeeee` | estimated |
| `--color-grey-600` (muted text) | `#6b6b6b` | estimated, chosen for AA contrast |
| `--color-border` | `#4d4d4d` | estimated |
| `--color-danger` (`Eliminar`) | `#d0021b` | estimated |
| Semantic: `--color-text`, `--color-text-muted`, `--color-border`, `--color-action`, `--color-action-text`, `--color-danger` | map to the above | |
| Spacing | 4px scale: `--space-1` (4px) ... `--space-12` (48px) | estimated |
| Type sizes | `--font-size-xs`, `-sm`, `-md`, `-lg` | estimated |
| `--color-text-inverse`, `--color-text-inverse-muted` | white, `#b3b3b3` (21:1 and 10:1 on black) | card hover state |
| `--ease-spring`, `--duration-spring` | `linear(…)` sampled from the prototype's spring (mass 1, stiffness 80, damping 20), 1.34 s | Figma prototype; `cubic-bezier` fallback for browsers without `linear()` |

## Breakpoints

Custom properties cannot be used inside media queries, so these are literal values, listed here as the single reference.

| Name | Range | Grid columns | Detail layout |
|---|---|---|---|
| Mobile | < 768px | 1 | image above buying options |
| Tablet | 768px to 1199px | 2 | image left, buying options right |
| Desktop | >= 1200px | 5 | same as tablet, wider |

Product cards are **square** at every width: 344 x 344 in the 1920 px desktop frame ((1920 - 2 x 100) / 5), 377 x 377 in the 834 px tablet frame. The image takes the space left by the text.

The tablet frame is 834px wide. The 768px and 1200px boundaries are our inference; the phone frame width is not in the screenshots.

## Component inventory

| Component | States to implement |
|---|---|
| Header (logo, cart bag + count) | bag outline at 0, bag filled above 0; hidden bag on the cart page |
| Search box | empty, typing, with clear button, focused |
| Product card | default, hover, focus, loading skeleton |
| Storage selector | unselected, selected, focus, single option (preselected) |
| Color selector | unselected, selected (name shown below), focus, near-white swatch |
| Add button | disabled (with reason), enabled, focus |
| Specifications table | fixed rows |
| Similar products carousel | horizontal scroll with progress indicator |
| Cart line | default, remove |
| Buttons | primary (dark), secondary (outlined), text (danger) |

## Deviations from the design (deliberate)

1. **Muted text is darker** than in the frames so brand labels reach 4.5:1 contrast.
2. **Near-white swatches get a visible border** (for example `Lavanda #E6E6FA`), otherwise they disappear on white.
3. **Focus is always visible** (`:focus-visible` outline); the design shows none.
4. **Minimum text size 12px.** If Inspect shows smaller sizes, we raise them.
5. **Results and cart counts are real**, not the placeholders in the frames ("20 RESULTS" beside two products, "CART (9)" with one line).
6. **The cart page has no bag icon** (two of three cart frames omit it).
7. **The disabled add button states what is missing** ("Select a color"), instead of only being grey.
8. **`PAY` is present but disabled and labeled**: checkout is outside the challenge. It keeps the design's black look, uses `aria-disabled`, and a small note under it says "Payment is not available in this demo."
9. **The clear-search "x" has an accessible name.**
10. **States the design omits** (loading, no results, error, not found) are ours; see `information-architecture.md`.

11. **The logo is a text stand-in** ("MBST" in bold) until the SVG export is available.
12. **The bag link has a 44x44px touch target**, larger than the drawn icon, for touch accessibility (WCAG 2.5.5).
13. **A "Skip to content" link** appears on the first Tab press; it is invisible otherwise.
14. **Product card hover follows the prototype** ("Hover" variant, Smart Animate spring): black fills the card from the bottom and the text turns white. Keyboard focus shows the same state (with a white focus ring), the effect is skipped on touch screens (`hover: hover`), and it is instant when the system asks for reduced motion. The whole card is one link.
15. **The search underline thickens on focus**, which is the input's focus indicator.
16. **The clear "x" has a 44x44px touch target** around the small icon.
17. **Brand labels on cards are 12px** (the frames look smaller; deviation 4 sets our minimum).
18. **A confirmation line appears under `AÑADIR`** after adding ("Added to your cart: ..."); the design shows only the bag count changing.
19. **A missing specification shows "—"** (read as "Not available") instead of an empty cell.
20. **The chosen storage segment and color swatch get a black outline**; unchosen ones a light grey border.
21. **The empty cart says "Your cart is empty."** above CONTINUE SHOPPING; the design shows only the heading and the button.
22. **The cart footer sits at the bottom of the window** (as in the frames) using the viewport height, and moves below the lines when they are taller than the window.

Every new deviation is added to this list in the same commit that introduces it.
