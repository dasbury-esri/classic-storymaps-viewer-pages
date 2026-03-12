# S5 Landing Catalog Shell Implementation

## Objective
Implement the Classic Storymaps landing catalog at the canonical route `/templates/classic-storymaps` using classic app reference metadata and thumbnails.

Refinement: keep `/templates/classic-storymaps` canonical and use an IIS redirect rule for `/templates/classic-stories` compatibility.

## Implementation Outputs
- Source shell:
  - `apps/classic-storymaps-site/index.html`
  - `apps/classic-storymaps-site/maptour-launcher.html`
- Source image assets:
  - `apps/classic-storymaps-site/assets/images/*`
- Publish assembly output:
  - `publish/templates/classic-storymaps/index.html`
  - `publish/templates/classic-storymaps/maptour-launcher.html`
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
- Guided launcher flow for supported runtime cards.
- Non-supported cards render clear status messaging and do not expose launch links.

## Route and Link Contract in Landing
- Landing canonical route: `/templates/classic-storymaps`
- Supported launch route currently enabled:
  - `/templates/classic-storymaps/maptour-launcher.html`
- Map Tour canonical viewer route:
  - `/templates/classic-storymaps/maptour/index.html?appid=<appid>`
- Compatibility redirect (IIS rule):
  - `/templates/classic-stories/*` -> `/templates/classic-storymaps/{R:1}` (preserve query string)
- Queued routes are displayed for transparency, but launch actions are disabled until onboarding tasks complete.

## IIS Redirect Rule (Compatibility)
Use an IIS URL Rewrite rule at the templates site level so mistyped `classic-stories` routes resolve to canonical `classic-storymaps` routes.

Example rule:

```xml
<rule name="classic-stories-to-classic-storymaps" stopProcessing="true">
  <match url="^templates/classic-stories/(.*)$" />
  <action type="Redirect"
          url="/templates/classic-storymaps/{R:1}"
          appendQueryString="true"
          redirectType="Permanent" />
</rule>
```

Optional companion rule for the bare folder:

```xml
<rule name="classic-stories-root-to-canonical" stopProcessing="true">
  <match url="^templates/classic-stories/?$" />
  <action type="Redirect"
          url="/templates/classic-storymaps/index.html"
          appendQueryString="true"
          redirectType="Permanent" />
</rule>
```

## Build Command
- `bash scripts/build-classic-storymaps-landing.sh`

## Acceptance Mapping
- All classic app cards render with clear support-state messaging: Pass
- Supported cards deep-link to canonical routes: Pass (Map Tour)
- Supported card opens guided launcher and then redirects to canonical runtime route with validated appid: Pass

## Notes
- This task intentionally uses `classic-apps` as fixture/catalog input only.
- Runtime onboarding and launch support for Swipe and Map Journal remain tracked in S6/S7.
