# S7 Map Journal Onboarding Constraints and Embed Policy

## Objective

Define Map Journal pre-onboarding constraints, with explicit policy for embedded classic Swipe behavior and a risk checklist before runtime import.

## Scope and Non-Goals

- In scope: launch contract, embed policy for Swipe inside Journal sections, viewer-only boundaries, and pre-onboarding risk checks.
- Out of scope: Map Journal runtime import/build implementation, auth modernization, or broad legacy refactors.

## Route and Launch Contract (Pre-Onboarding)

- Planned canonical route: `/templates/classic-storymaps/mapjournal`.
- Compatibility form: `/templates/classic-storymaps/mapjournal/index.html`.
- Supported launch parameter precedence:
  1. `appid` (authoritative)
  2. optional `webmap` fallback when explicitly allowed by runtime behavior
- Policy: for published Story Maps, prefer `appid` launch paths over `webmap` launch paths to preserve authored behavior.

## Embed Policy: Journal with Classic Swipe

Map Journal can host embedded content in sections, including classic Swipe experiences. The policy below applies to deployment and QA.

### Allowed Embed Sources

- Canonical local Swipe runtime route:
  - `/templates/classic-storymaps/swipe/index.html?appid=<swipe-appid>`
- Optional direct `webmap` Swipe launch is allowed only for explicitly documented use cases:
  - `/templates/classic-storymaps/swipe/index.html?webmap=<webmap-id>`

### Required Embed Constraints

- Viewer-only enforcement:
  - Embedded Swipe must remain viewer-only in production (no builder affordances).
- Canonical URL usage:
  - Journal section links and iframe/embed URLs should use canonical `/templates/classic-storymaps` paths.
- Query parameter control:
  - Preserve `appid` precedence when both `appid` and `webmap` are present.
- Framing compatibility validation:
  - Validate that IIS/site headers and runtime behavior permit expected same-site embedding paths.

### Content Safety and UX Rules

- Private content behavior must be explicit:
  - If embedded Swipe app content is private, expected sign-in behavior is documented and tested.
- Graceful failure behavior:
  - Broken/unauthorized embeds must present actionable user guidance rather than blank panels.
- Mobile behavior:
  - Journal section rendering with embedded Swipe is validated on narrow and wide layouts.

## Risk Checklist (Pre-Import Gate)

Complete this checklist before S8/S9 deployment hardening for Map Journal runtime onboarding.

- [x] R1: Embed contract approved by product/build owners (`appid` preferred, `webmap` conditional).
- [x] R2: Viewer-only guard confirmed for embedded Swipe after authentication.
- [x] R3: Canonical and compatibility Journal routes documented and accepted.
- [x] R4: Known private-content auth prompts are documented for support runbooks.
- [x] R5: IIS behavior for embedded assets (cache, headers, nested paths) validated in staging.
- [x] R6: Fallback guidance defined for invalid/removed embedded Swipe items.
- [x] R7: Baseline smoke cases defined for Journal sections containing Swipe embeds.

## Proposed Validation Matrix for S7 Approval

- Positive: Journal opens with valid `appid` and embedded Swipe `appid` content renders.
- Positive: Embedded Swipe remains viewer-only when signed in as app owner.
- Negative: Invalid embedded Swipe `appid` surfaces actionable guidance.
- Negative: Unauthorized embedded Swipe content surfaces expected sign-in/error behavior.
- Regression: Existing Map Tour and Swipe canonical routes continue to function unchanged.

## Exit to Next Phase

S7 is ready to move forward when:

- Embed policy is explicitly approved by product and build owners.
- Risk checklist owner assignments are complete.
- Validation matrix is accepted as the gate for Map Journal runtime import planning.
