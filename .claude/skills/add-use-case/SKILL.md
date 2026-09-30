---
name: add-use-case
description: Add a new use case (application-layer behavior) to the BFF or the web app following this repo's hexagonal architecture. Use whenever the user asks for new business behavior, a new rule, a new endpoint's logic, or anything that decides or orchestrates something (listing, searching, adding to the cart, computing a price), even if they do not say "use case".
---

# Add a use case

A use case is one thing the system does, expressed without any framework. Follow the steps in order and stop at the first failing check.

## Steps

1. **Name it in the product language.** Check `docs/product-language.md`. If a term is missing, add it there first.
2. **Model the rule in `domain/`** when it is a pure rule (cart maths, selection rules, price display). Pure functions, no imports from other layers, no packages.
3. **Define or reuse a port in `application/ports/`** for anything outside the process (catalog, flags, storage). The port is an interface written in domain terms, never in HTTP or storage terms.
4. **Write the use case in `application/`.** It receives its ports through parameters (BFF: constructor or function arguments; web: hooks that read them from context). In the BFF, `application/` must not import any package.
5. **Write tests first or alongside**, against in-memory adapters. Cover the happy path, every error the port can raise, and each edge case named in `docs/`.
6. **Wire it in the composition root** (`src/main.ts` or `src/main.tsx`) and nowhere else.
7. **Run `pnpm verify`.** If `check:arch` fails, add a port; do not add an exception.

## Checklist

- [ ] The use case does one thing and has a verb name (`ListProducts`, `AddToCart`).
- [ ] No `any`, no `!`, no `console.*`.
- [ ] Errors are typed domain errors, not strings.
- [ ] Docs (`docs/`) and ADRs updated if a decision changed.

## Do not

Reach into `infrastructure/` or `ui/` from `application/`, read `process.env` or `window` outside a composition root or adapter, or return the upstream API's raw objects.
