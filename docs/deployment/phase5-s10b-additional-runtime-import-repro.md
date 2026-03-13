# S10b Additional Runtime Import and Reproducibility

## Objective

Onboard and validate five additional Classic Storymaps runtimes before S11:

- Map Series (`mapseries`)
- Cascade (`cascade`)
- Shortlist (`shortlist`)
- Crowdsource (`crowdsource`)
- Basic (`basic`)

## Runtime Paths

- `runtimes/mapseries/{upstream,patches,build,runtime-manifest.json}`
- `runtimes/cascade/{upstream,patches,build,runtime-manifest.json}`
- `runtimes/shortlist/{upstream,patches,build,runtime-manifest.json}`
- `runtimes/crowdsource/{upstream,patches,build,runtime-manifest.json}`
- `runtimes/basic/{upstream,patches,build,runtime-manifest.json}`

## Pinned Upstream Refs

- Map Series (`Esri/storymap-series`): `109e94458da8f297cd21b7ed877832b8a8ce9867`
- Cascade (`Esri/storymap-cascade`): `df47322cf31bbf1d72768c829349477fce0514a9`
- Shortlist (`Esri/storymap-shortlist`): `882acb573fc415a04f5fb56c63ccb58bfcba15c9`
- Crowdsource (`Esri/storymap-crowdsource`): `878ba358c12a3f3d1b6da5c8fd7b40dbcffbac07`
- Basic (`Esri/basic-viewer`): `7e8a3bf18a411923fcda6c1c063f401650480c70`

## Import Commands

- `bash scripts/import-mapseries-upstream.sh 109e94458da8f297cd21b7ed877832b8a8ce9867`
- `bash scripts/import-cascade-upstream.sh df47322cf31bbf1d72768c829349477fce0514a9`
- `bash scripts/import-shortlist-upstream.sh 882acb573fc415a04f5fb56c63ccb58bfcba15c9`
- `bash scripts/import-crowdsource-upstream.sh 878ba358c12a3f3d1b6da5c8fd7b40dbcffbac07`
- `bash scripts/import-basic-upstream.sh 7e8a3bf18a411923fcda6c1c063f401650480c70`

## Build Commands

- `bash scripts/build-mapseries-runtime.sh`
- `bash scripts/build-cascade-runtime.sh`
- `bash scripts/build-shortlist-runtime.sh`
- `bash scripts/build-crowdsource-runtime.sh`
- `bash scripts/build-basic-runtime.sh`

## Crowdsource Toolchain Caveat

`storymap-crowdsource` has legacy dependency constraints (`node-sass`/`node-gyp`) that are not reliably compatible with modern Node toolchains.

To keep reproducible deploy output available on current environments, `scripts/build-crowdsource-runtime.sh` now falls back to copying runtime assets from `src/` when npm/grunt build fails, then materializes `index.html` from `index.ejs` when needed.

This preserves viewer deployability without introducing runtime source patches.

## Publish Assembly

- `scripts/build-classic-storymaps-runtime-publish.sh` includes:
  - `maptour`, `swipe`, `mapjournal` (existing)
  - `mapseries`, `cascade`, `shortlist`, `crowdsource`, `basic` (new)

The publish step verifies `index.html` for every runtime and copies each runtime folder to:

- `publish/templates/classic-storymaps/<app-id>/`

## Status

S10b import/build/publish onboarding completed on 2026-03-13.
Testing evidence is recorded in `docs/testing/phase5-s10b-additional-runtime-verification-transcript.md`.
