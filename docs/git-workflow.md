# Git workflow

## Branches

Trunk-based: `main` is always releasable. Work happens on short-lived branches named `<type>/<short-description>`, where type is `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`. Example: `feat/product-search`. Merge through pull requests, squash or rebase, no direct pushes to `main`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`.

- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`.
- Scopes: `repo`, `bff`, `web`, `contracts`, `e2e`, `docs`.
- Imperative, lower-case summary under about 72 characters. Explain **why** in the body when it is not obvious.
- One logical change per commit; tests travel with the code they test. Every commit should pass `pnpm verify`.

Examples: `feat(bff): add product catalog port and use cases` · `test(web): cover cart persistence with corrupt storage` · `docs: record ADR for single-option preselection`.

## Pull requests

Small and focused. Use the template in `.github/pull_request_template.md`. The author self-reviews the diff before asking for review.

### Reviewer checklist

- Does the change do what the description says, and only that?
- Are layer boundaries respected (`pnpm check:arch` green) and is logic in the right layer?
- Are loading, empty and error states handled?
- Do tests describe behavior and fail for the right reason?
- Is it keyboard accessible, with sensible names, focus and contrast?
- Any secret, `console.*`, `any`, or silenced check?
- Are docs, ADRs and `copy.ts` updated where needed?

## Delivery mapping

This project is built in chunks (`technical-proposal.md`). Each chunk lands as one to three commits with the messages suggested at delivery time.
