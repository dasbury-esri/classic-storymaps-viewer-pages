# S8 IIS Package Boundary and Deterministic Publish Assembly

## Objective

Define a repeatable package boundary and assembly process for the landing shell and imported runtimes under `/viewers`.

## Canonical Deploy Root

- `publish/viewers`

All deployable output for landing and onboarded runtimes is staged under this root.

Legacy compatibility stubs are staged under:

- `publish/templates/classic-storymaps`
- `publish/templates/classic-stories`

## Package Boundary

### Include in IIS package

- Landing shell
  - `index.html`
  - `assets/**`
  - `maptour-launcher.html`
  - `swipe-launcher.html`
  - `mapjournal-launcher.html`
- Runtime folders
  - `maptour/**`
  - `swipe/**`
  - `mapjournal/**`
- Legacy compatibility redirect stubs
  - `../templates/classic-storymaps/**` (mapped stubs only)
  - `../templates/classic-stories/**` (mapped stubs only)

### Exclude from IIS package

- Source and build orchestration files
  - `apps/**` (source-only)
  - `runtimes/**` (source/build inputs)
  - `docs/**` (documentation)
  - `scripts/**` (build orchestration)
  - `node_modules/**`, test fixtures, local tooling files

Runtime-specific deploy include/exclude policy is also defined in:

- `runtimes/maptour/runtime-manifest.json`
- `runtimes/swipe/runtime-manifest.json`
- `runtimes/mapjournal/runtime-manifest.json`

## Deterministic Assembly Order

Run in this order from repo root:

1. `bash scripts/build-classic-storymaps-landing.sh`
2. `bash scripts/build-classic-storymaps-runtime-publish.sh`

Reason:

- Step 1 resets and rebuilds the landing shell output root.
- Step 2 copies runtime build artifacts into the same output root without removing landing files.
- Compatibility stubs are generated after canonical assets exist so redirect targets are stable.

## Expected Output Topology

After assembly:

- `publish/viewers/index.html`
- `publish/viewers/assets/`
- `publish/viewers/maptour-launcher.html`
- `publish/viewers/swipe-launcher.html`
- `publish/viewers/mapjournal-launcher.html`
- `publish/viewers/maptour/index.html`
- `publish/viewers/swipe/index.html`
- `publish/viewers/mapjournal/index.html`
- `publish/templates/classic-storymaps/index.html` (compatibility redirect stub)
- `publish/templates/classic-stories/index.html` (compatibility redirect stub)

## Acceptance Mapping

- Package excludes source-only files: Pass
  - Enforced by assembling only the curated publish tree under `publish/viewers` plus generated compatibility stubs.
- Nested-path assets resolve correctly for landing and onboarded runtimes: Pass
  - Verified by assembled folder topology and runtime subfolder asset placement.

## Evidence

- `scripts/build-classic-storymaps-landing.sh`
- `scripts/build-classic-storymaps-runtime-publish.sh`
- `docs/testing/phase4-s8-package-boundary-verification-transcript.md`
