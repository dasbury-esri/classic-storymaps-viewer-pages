# S4 Verification Transcript: Map Tour Import and Reproducibility

## Scope
Validation for S4 task: import and reproduce Map Tour runtime from upstream source in monorepo-managed paths.

## Runtime Inputs
- Upstream repo: `dasbury-esri/classic-storymap-tour`
- Pinned ref: `2e56c7e08801fc6bbfc2bc27e0d220688a7120a6`
- Runtime manifest: `runtimes/maptour/runtime-manifest.json`

## Commands Executed
1. Import upstream at pinned ref:
   - `./scripts/import-maptour-upstream.sh 2e56c7e08801fc6bbfc2bc27e0d220688a7120a6`
2. Build runtime package:
   - `./scripts/build-maptour-runtime.sh`

## Build Observations
- Upstream legacy lint warnings are emitted during grunt execution.
- Build pipeline completes with `grunt --force` and produces deploy artifacts.
- Build staging copies artifacts to monorepo output path.

## Artifact Verification
Verified output exists under:
- `runtimes/maptour/build/index.html`
- `runtimes/maptour/build/app`
- `runtimes/maptour/build/resources`

## Patch Verification
- Explicit patch set recorded as no-source-patch baseline:
  - `runtimes/maptour/patches/0000-no-runtime-patches.md`

## Acceptance Mapping
- Reproducible import from pinned upstream source: Pass
- Reproducible deploy output generated in monorepo build path: Pass
- Explicit patch list tracked: Pass (no-source-patch baseline)

## Conclusion
S4 acceptance criteria are satisfied for import-first baseline.
