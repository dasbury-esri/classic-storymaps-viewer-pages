# S5 Landing Catalog Shell Implementation

## Objective
Implement the Classic Storymaps landing catalog at the canonical route `/viewers` using classic app reference metadata and thumbnails.

Refinement: keep `/viewers` canonical and preserve `/templates/classic-storymaps` and `/templates/classic-stories` as compatibility paths.

## Implementation Outputs
- Source shell:
  - `apps/classic-storymaps-site/index.html`
  - `apps/classic-storymaps-site/maptour-launcher.html`
- Source image assets:
  - `apps/classic-storymaps-site/assets/images/*`
- Publish assembly output:
  - `publish/viewers/index.html`
  - `publish/viewers/maptour-launcher.html`
  - `publish/viewers/assets/images/*`
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
- Landing canonical route: `/viewers`
- Supported launch route currently enabled:
  - `/viewers/maptour-launcher.html`
- Map Tour canonical viewer route:
  - `/viewers/maptour/index.html?appid=<appid>`
- Compatibility redirects:
  - `/templates/classic-storymaps/*` -> `/viewers/{mapped-path}`
  - `/templates/classic-stories/*` -> `/viewers/{mapped-path}`
- Queued routes are displayed for transparency, but launch actions are disabled until onboarding tasks complete.

## GitHub Pages Redirect Strategy (Primary)
Because GitHub Pages does not support server-side rewrite rules, compatibility redirects are delivered as static HTML stubs in legacy paths.

Each stub should:
- Render a short message that the path moved.
- Redirect to canonical `/viewers` target via meta refresh.
- Use JavaScript fallback to preserve query/hash if present.

Example compatibility stub pattern:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0;url=/viewers/maptour-launcher.html" />
  <script>
    (function () {
      var target = '/viewers/maptour-launcher.html' + window.location.search + window.location.hash;
      window.location.replace(target);
    })();
  </script>
</head>
<body>
  <p>Redirecting to <a href="/viewers/maptour-launcher.html">/viewers/maptour-launcher.html</a>.</p>
</body>
</html>
```

## IIS Redirect Rules (Historical/Optional)
Use IIS URL Rewrite rules only for non-GitHub Pages deployments that require true HTTP 301/302 responses.

Example rule for `/templates/classic-storymaps/*`:

```xml
<rule name="classic-storymaps-to-viewers" stopProcessing="true">
  <match url="^templates/classic-storymaps/(.*)$" />
  <action type="Redirect"
          url="/viewers/{R:1}"
          appendQueryString="true"
          redirectType="Permanent" />
</rule>
```

Example rule for `/templates/classic-stories/*`:

```xml
<rule name="classic-stories-to-viewers" stopProcessing="true">
  <match url="^templates/classic-stories/(.*)$" />
  <action type="Redirect"
          url="/viewers/{R:1}"
          appendQueryString="true"
          redirectType="Permanent" />
</rule>
```

Optional companion rules for bare folders:

```xml
<rule name="classic-storymaps-root-to-viewers" stopProcessing="true">
  <match url="^templates/classic-storymaps/?$" />
  <action type="Redirect"
          url="/viewers/index.html"
          appendQueryString="true"
          redirectType="Permanent" />
</rule>
<rule name="classic-stories-root-to-viewers" stopProcessing="true">
  <match url="^templates/classic-stories/?$" />
  <action type="Redirect"
          url="/viewers/index.html"
          appendQueryString="true"
          redirectType="Permanent" />
</rule>
```

## Build Command
- `bash scripts/build-classic-storymaps-landing.sh`

## Acceptance Mapping
- All classic app cards render with clear support-state messaging: Pass
- Supported cards deep-link to canonical routes: Pass (`/viewers`, Map Tour launcher)
- Supported card opens guided launcher and then redirects to canonical runtime route with validated appid: Pass

## Notes
- This task intentionally uses `classic-apps` as fixture/catalog input only.
- Runtime onboarding and launch support for Swipe and Map Journal remain tracked in S6/S7.
