---
name: write-tests
description: Write or fix tests in this repo (Mocha and Chai for the BFF, Jest and React Testing Library for the web app, Cypress for end to end). Use whenever code is added or changed, when a test is failing or flaky, or when the user asks about coverage, test naming or what to test, so tests describe behavior and follow the project's guards.
---

# Write tests

Read `docs/testing.md` first; this is the short version.

## Choose the level

| Change | Test at |
|---|---|
| Pure rule (cart, money, selection) | domain unit test |
| Orchestration or flag behavior | use case test with in-memory adapters |
| Talking to the upstream API | adapter test against a local stub server |
| HTTP status codes and error bodies | route test with supertest |
| Rendering, interaction, accessibility | React Testing Library + `jest-axe` |
| A whole user journey | Cypress (few, only the important paths) |

## Rules

1. Name tests as requirements: `keeps the add button disabled until a color is chosen`.
2. Arrange, Act, Assert. One behavior per test. Build data with builders such as `aProduct()`.
3. Query by role, label or text. Use `userEvent`. Never assert on state variables, hooks or CSS classes. No snapshot-driven tests.
4. Use fake timers for debounce; never sleep. No real network anywhere except the manual `pnpm check:contract`.
5. Cover the awkward cases explicitly: loading, empty, error, single option, corrupt `localStorage`, out-of-order responses, duplicate ids, `http` images.
6. The Jest setup fails on `console.error` and `console.warn`. Fix the cause; never silence it.
7. A flaky test is a bug: find the race instead of adding retries.

## Before finishing

Break the code on purpose and confirm the test fails for the right reason, then restore it. Run `pnpm verify`.
