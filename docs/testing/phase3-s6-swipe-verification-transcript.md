# S6 Verification Transcript: Swipe Import and Launch Guidance

## Scope
Validation for S6 task: import Swipe from fork/upstream model, reproduce build output, and verify launch guidance behavior.

## Runtime Inputs
- Fork repo: `dasbury-esri/classic-storymap-swipe`
- Upstream source repo: `Esri/storymap-swipe`
- Pinned ref: `7e0fb19e1758638bacff788a513372b4bf4fc0c8`
- Runtime manifest: `runtimes/swipe/runtime-manifest.json`

## Commands Executed
1. Import upstream at pinned ref:
   - `bash scripts/import-swipe-upstream.sh 7e0fb19e1758638bacff788a513372b4bf4fc0c8`
2. Build runtime package:
   - `bash scripts/build-swipe-runtime.sh`
3. Build landing publish shell:
   - `bash scripts/build-classic-storymaps-landing.sh`

## Build Observations
- Legacy npm dependency deprecation warnings emitted during install.
- Grunt build completed successfully without runtime build errors.
- Build staging copied deploy artifacts to monorepo output path.

## Artifact Verification
Verified output exists under:
- `runtimes/swipe/build/index.html`
- `runtimes/swipe/build/app`
- `runtimes/swipe/build/resources`

Verified launcher output exists under:
- `publish/templates/classic-storymaps/swipe-launcher.html`

## Launch Guidance Verification
- Valid appid input redirects to canonical Swipe runtime URL.
- Valid webmap input redirects to canonical Swipe runtime URL.
- Empty launcher submission displays actionable warning.
- Malformed appid or webmap input displays actionable validation error and blocks launch.
- Authenticated access to a private appid launch remains viewer-only in production; builder affordances are suppressed.

## Acceptance Mapping
- Reproducible import from pinned upstream source: Pass
- Reproducible deploy output generated in monorepo build path: Pass
- Known-good canonical route available for Swipe runtime: Pass
- Malformed input guidance available to users: Pass

## Conclusion
S6 acceptance criteria are satisfied.
