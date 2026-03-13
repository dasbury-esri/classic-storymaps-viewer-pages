# S9 IIS Route, Cache, and Fallback Checklist

## Objective

Capture the IIS configuration and validation checklist required to host the assembled package reliably under `/templates/classic-storymaps`.

## Inputs

- Publish root: `publish/templates/classic-storymaps`
- Package boundary reference: `docs/deployment/phase4-s8-package-boundary-and-assembly.md`
- Runtime manifests:
  - `runtimes/maptour/runtime-manifest.json`
  - `runtimes/swipe/runtime-manifest.json`
  - `runtimes/mapjournal/runtime-manifest.json`

## Route and Asset Checklist

- [ ] Site/app root in IIS maps to package root for `/templates/classic-storymaps`
- [ ] Default document includes `index.html`
- [ ] Canonical landing route resolves:
  - `/templates/classic-storymaps/`
- [ ] Launcher routes resolve:
  - `/templates/classic-storymaps/maptour-launcher.html`
  - `/templates/classic-storymaps/swipe-launcher.html`
  - `/templates/classic-storymaps/mapjournal-launcher.html`
- [ ] Runtime routes resolve:
  - `/templates/classic-storymaps/maptour/index.html`
  - `/templates/classic-storymaps/swipe/index.html`
  - `/templates/classic-storymaps/mapjournal/index.html`

## Compatibility and Fallback Checklist

- [ ] Compatibility redirect rule from `/templates/classic-stories/*` to `/templates/classic-storymaps/*` is active
- [ ] Invalid launcher input produces guided error UX (no blank/500 fallback)
- [ ] Missing/invalid runtime query parameters fail gracefully without IIS-level errors

## Cache Policy Checklist

- [ ] HTML documents use conservative cache policy (for example no-cache or short max-age)
- [ ] Static assets (`js`, `css`, `png`, `jpg`, `svg`, `woff*`) use long-lived cache policy
- [ ] Cache policy does not break legacy runtime boot/loading behavior

## Security/Header Baseline Checklist

- [ ] Content type mappings are valid for runtime asset types
- [ ] Compression enabled for text assets where appropriate
- [ ] Header rules do not block same-site runtime resource loading

## Validation Output

Record execution results in:

- `docs/testing/phase4-s9-iis-validation-transcript-template.md`
