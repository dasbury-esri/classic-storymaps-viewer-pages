# S7b Verification Transcript: Map Journal Import and Launch Guidance

## Scope

Validation for S7b task: import Map Journal from fork/upstream model, reproduce build output, and verify launch guidance behavior.

## Runtime Inputs

- Fork repo: dasbury-esri/classic-storymap-journal
- Upstream source repo: Esri/storymap-journal
- Pinned ref: 2a51369e8e0e90c10ac0340a6496219df218b73e
- Runtime manifest: runtimes/mapjournal/runtime-manifest.json

## Commands Executed

1. Import upstream at pinned ref:
   - bash scripts/import-mapjournal-upstream.sh 2a51369e8e0e90c10ac0340a6496219df218b73e
2. Build runtime package:
   - bash scripts/build-mapjournal-runtime.sh

## Build Observations

- Legacy npm dependency deprecation warnings emitted during install.
- Grunt build completed successfully without runtime build errors.
- Build staging copied deploy artifacts to monorepo output path.

## Artifact Verification

Verified output exists under:

- runtimes/mapjournal/build/index.html
- runtimes/mapjournal/build/app
- runtimes/mapjournal/build/resources

Verified launcher output exists under:

- publish/templates/classic-storymaps/mapjournal-launcher.html

## Launch Guidance Verification

- Valid appid input redirects to canonical Map Journal runtime URL.
- Empty launcher submission displays actionable warning.
- Malformed appid input displays actionable validation error and blocks launch.
- Embedded Swipe launch guidance points to canonical local Swipe runtime route.

## Acceptance Mapping

- Reproducible import from pinned upstream source: Pass
- Reproducible deploy output generated in monorepo build path: Pass
- Known-good canonical route available for Map Journal runtime: Pass
- Malformed input guidance available to users: Pass

## Conclusion

S7b acceptance criteria are satisfied.
