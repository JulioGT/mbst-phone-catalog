@AGENTS.md

## Claude Code

- If `.handoff/handoff.md` exists (local and git-ignored), **read it first**: it holds the background of the project, the working agreement with the user, and the current status.
- Project skills live in `.claude/skills/` (`add-use-case`, `add-adapter`, `add-component`, `write-tests`). Use them when the task matches.
- Prefer plan mode before changing anything under `packages/contracts/` or `.dependency-cruiser.cjs`: both affect every other part of the repo.
