# 0000 No Runtime Patches

## Patch Set
- patchSetId: `maptour-initial-import-no-runtime-patches`
- runtime: `maptour`
- upstream ref: `2e56c7e08801fc6bbfc2bc27e0d220688a7120a6`

## Decision
No source patches are required for the initial import reproducibility baseline.

## Rationale
- Upstream runtime imports and builds successfully from pinned source.
- Runtime artifact staging for IIS package output is handled by monorepo build orchestration script, not upstream source edits.
- Viewer-only and nested-path guard rules remain documented constraints for future patch introduction if behavior drift is observed.

## Notes
- Any future runtime source changes must be captured as numbered patch artifacts in this folder and listed in `runtimes/maptour/runtime-manifest.json`.
