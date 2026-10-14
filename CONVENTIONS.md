# Project Conventions

The tracking contract is in
[.github/copilot-instructions.md](.github/copilot-instructions.md). Both agents
follow [AGENTS.md](AGENTS.md); hybrid status is declared in
[STATUS.md](STATUS.md) under `extra.agents`.

## Document Roles

- `README.md`: project purpose, repository map and operating guidance.
- `STATUS.md`: current state and the owner's next action.
- `session-logs/`: append-only, attributed session outcomes.
- `docs/decisions/`: local decisions when needed; active decisions are immutable.
- `docs/testing/`: verification evidence with explicit scope and limits.

Use repository-relative, OS-independent paths. Do not move application or
runtime directories to match a tracking template. Preserve other authors'
changes and stage only the paths belonging to the current task.

## Boundary and Publication

Work-domain routing and the confidentiality boundary are not relaxed by hybrid
designation. Keep private findings, credentials and proprietary content out of
this repository; follow the shared instructions for both agents.

A push may start the Pages workflow. For tracking-only changes without deployment
approval, use `[skip ci]` and verify publication was not triggered. Do not include
pending runtime or notice changes merely to make the working tree clean.
