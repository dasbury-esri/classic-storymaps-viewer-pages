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
- `runtimes/maptour/build/web.config`

Deploy parity verification against known-working runtime:
- File list parity: `d1=573`, `d2=573`, `only_d1=0`, `only_d2=0`
- Recursive byte-level comparison (`diff -rq`) reported no differences.

## Patch Verification
- Explicit patch set recorded for production alignment:
   - `runtimes/maptour/patches/0001-production-behavior-align.patch`
   - `runtimes/maptour/patches/0002-iis-web-config-addition.patch`

## Acceptance Mapping
- Reproducible import from pinned upstream source: Pass
- Reproducible deploy output generated in monorepo build path: Pass
- Explicit patch list tracked: Pass (production alignment patch set)
- Functional equivalence with known-working deploy artifacts: Pass

## Conclusion
S4 acceptance criteria are satisfied for import-first reproducibility and known-working deploy parity.
