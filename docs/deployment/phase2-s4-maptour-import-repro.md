# S4 Map Tour Import and Reproducibility Scaffold

## Objective
Provide deterministic onboarding steps for Map Tour from upstream source into monorepo-managed runtime folders.

## Scaffolded Paths
- runtimes/maptour/upstream
- runtimes/maptour/patches
- runtimes/maptour/build
- runtimes/maptour/runtime-manifest.json

## Import Workflow
1. Pin upstream ref (commit/tag).
2. Run:
   - `./scripts/import-maptour-upstream.sh <pinned-ref>`
3. Record resolved commit SHA in manifest fields:
   - `upstream.ref`
   - `releaseMetadata.upstreamRefAtRelease`

Pinned ref currently used:
- `2e56c7e08801fc6bbfc2bc27e0d220688a7120a6`

## Build Workflow
1. Run:
   - `./scripts/build-maptour-runtime.sh`
   - Behavior: uses `npm ci` when lockfile exists; otherwise falls back to `npm install --no-package-lock --no-audit --no-fund`.
   - Behavior: runs `grunt --force` to tolerate legacy lint warnings in vendored upstream sources while still producing runtime artifacts.
2. Verify expected runtime output exists in `runtimes/maptour/build`:
   - `index.html`
   - `app/**`
   - `resources/**`
   - `web.config`
   - Note: when grunt generates `deploy/`, staging is sourced from `deploy/index.html`, `deploy/app`, `deploy/resources`, and `deploy/web.config` (with fallback to `src/web.config`).

## Patch Workflow
- Place patch files in `runtimes/maptour/patches`.
- Update `patches.patchSetId` and `patches.files` in manifest.
- Keep patches constrained to:
  - Nested IIS path compatibility
   - Viewer-only guard behavior
   - Known-working runtime parity deltas captured explicitly

## Verification Targets
- Known-good launch:
  - `/templates/classic-storymaps/maptour?appid=20fd39888a444629bc8e40d9b6ac38cc`
- Negative-path checks:
  - missing appid
  - malformed appid
  - unsupported parameters

## Status
- Scaffold created on 2026-03-12.
- Upstream import executed at pinned ref `2e56c7e08801fc6bbfc2bc27e0d220688a7120a6`.
- Runtime build execution completed; staged output verified at `runtimes/maptour/build/{index.html,app,resources}`.
- Runtime build execution completed; staged output verified at `runtimes/maptour/build/{index.html,app,resources,web.config}`.
- Known build caveat: legacy upstream lint warnings are expected and tolerated via `grunt --force`.
- Explicit patch set recorded:
   - `runtimes/maptour/patches/0001-production-behavior-align.patch`
   - `runtimes/maptour/patches/0002-iis-web-config-addition.patch`
- Verification transcript recorded: `docs/testing/phase2-s4-maptour-verification-transcript.md`.
- S4 status: Completed.
