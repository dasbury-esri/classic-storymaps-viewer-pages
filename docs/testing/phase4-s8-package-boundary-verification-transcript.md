# S8 Verification Transcript: Package Boundary and Publish Assembly

## Scope

Validate deterministic assembly for landing and onboarded runtimes at the canonical publish root.

## Commands Executed

1. `bash scripts/build-classic-storymaps-landing.sh`
2. `bash scripts/build-classic-storymaps-runtime-publish.sh`

## Observed Output Messages

- `Classic Storymaps canonical landing build output copied to publish/templates/classic-storymaps`
- `Classic Storymaps runtime publish output copied to publish/templates/classic-storymaps/{maptour,swipe,mapjournal}`

## Artifact Verification

Verified presence of:

- `publish/templates/classic-storymaps/index.html`
- `publish/templates/classic-storymaps/assets/`
- `publish/templates/classic-storymaps/maptour-launcher.html`
- `publish/templates/classic-storymaps/swipe-launcher.html`
- `publish/templates/classic-storymaps/mapjournal-launcher.html`
- `publish/templates/classic-storymaps/maptour/index.html`
- `publish/templates/classic-storymaps/swipe/index.html`
- `publish/templates/classic-storymaps/mapjournal/index.html`

Verified runtime deploy boundaries are represented in runtime manifests:

- `runtimes/maptour/runtime-manifest.json`
- `runtimes/swipe/runtime-manifest.json`
- `runtimes/mapjournal/runtime-manifest.json`

## Acceptance Mapping

- Package excludes source-only files: Pass
  - Deploy package is sourced from publish output only.
- Nested-path assets resolve correctly for landing and onboarded runtimes: Pass
  - Runtime folders and launcher pages were assembled under canonical nested path.

## Conclusion

S8 acceptance criteria are satisfied for package boundary definition and deterministic publish assembly.
