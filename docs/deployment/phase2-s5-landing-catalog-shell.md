# S5 Landing Catalog Shell Implementation

## Objective
Implement the Classic Storymaps landing catalog at the canonical route `/templates/classic-storymaps` using classic app reference metadata and thumbnails.

## Implementation Outputs
- Source shell:
  - `apps/classic-storymaps-site/index.html`
- Source image assets:
  - `apps/classic-storymaps-site/assets/images/*`
- Publish assembly output:
  - `publish/templates/classic-storymaps/index.html`
  - `publish/templates/classic-storymaps/assets/images/*`
- Build helper:
  - `scripts/build-classic-storymaps-landing.sh`

## UI and Behavior
- Responsive card grid for desktop and mobile.
- Explicit support-state badges per card:
  - `Supported`
  - `Queued`
  - `Reference`
- Canonical deep links for supported runtime cards.
- Non-supported cards render clear status messaging and do not expose launch links.

## Route and Link Contract in Landing
- Landing canonical route: `/templates/classic-storymaps`
- Supported deep-link route currently enabled:
  - `/templates/classic-storymaps/maptour`
- Queued routes are displayed for transparency, but launch actions are disabled until onboarding tasks complete.

## Build Command
- `bash scripts/build-classic-storymaps-landing.sh`

## Acceptance Mapping
- All classic app cards render with clear support-state messaging: Pass
- Supported cards deep-link to canonical routes: Pass (Map Tour)

## Notes
- This task intentionally uses `classic-apps` as fixture/catalog input only.
- Runtime onboarding and launch support for Swipe and Map Journal remain tracked in S6/S7.
