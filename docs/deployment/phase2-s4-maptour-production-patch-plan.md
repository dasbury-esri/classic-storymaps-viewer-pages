# S4 Formal Patch Plan: Map Tour Production Behavior Alignment

## Purpose
Align import-first Map Tour runtime behavior with the known-working deployed runtime while preserving upstream provenance and explicit patch boundaries.

## Baseline Gap Summary
Comparison against known-working deploy identified:
- Additional production config flags in `src/index.html`
- Viewer-only production guard in `src/app/main-app.js`
- Additional runtime hardening deltas in `src/app/storymaps/utils/Helper.js`, `src/app/storymaps/core/Core.js`, `src/app/storymaps/maptour/ui/desktop/PicturePanel.js`, `src/app/storymaps/ui/crossfader/CrossFader.js`, and `src/lib/jquery.exif.js`
- One deploy-only IIS artifact: `web.config`

## Patch Set Definition
- patchSetId: `maptour-production-alignment-v1`
- Scope: minimal runtime behavior alignment for production launch and viewer-only constraints.

## Planned Patch Artifacts
1. `runtimes/maptour/patches/0001-production-behavior-align.patch`
   - Add `defaultAppId`, `allowAnyAppIdInProd`, `allowAnyWebmapInProd`, `viewerOnlyInProd` in `src/index.html`
   - Enforce viewer-only mode in production in `src/app/main-app.js`
   - Align legacy app/webmap fallback and production URL handling in `src/app/storymaps/utils/Helper.js` and `src/app/storymaps/core/Core.js`
   - Apply known-working defensive UI null checks and async-safe EXIF VBScript injection behavior
2. `runtimes/maptour/patches/0002-iis-web-config-addition.patch`
   - Add deploy-level `web.config` parity with known-working IIS deployment profile.

## Execution Steps
1. Apply source-level production behavior deltas (0001).
2. Rebuild runtime deploy output.
3. Compare deploy output against known-working deploy by file list and hashes.
4. If `web.config` remains the only gap, extract and capture as 0002.
5. Update runtime manifest patch metadata and verification transcript.

## Acceptance Targets
- Functional equivalence for app launch behavior under production profile.
- Viewer-only guard behavior enforced in production.
- Explicit patch artifacts documented and referenced by runtime manifest.
- Deploy comparison reduced to approved and documented diffs only.

## Current Status
- 0001 extraction and application: Complete.
- 0002 IIS artifact extraction: Complete.
- Rebuild and parity verification: Complete (directory parity achieved).
