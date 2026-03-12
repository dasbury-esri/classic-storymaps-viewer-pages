# S7b Map Journal Import and Reproducibility

## Objective

Import and support Map Journal as the third onboarded runtime with reproducible monorepo build output and guided launch behavior.

## Runtime Paths

- runtimes/mapjournal/upstream
- runtimes/mapjournal/patches
- runtimes/mapjournal/build
- runtimes/mapjournal/runtime-manifest.json

## Fork/Upstream Remote Model

Map Journal import follows this model:

- Pull source of truth: <https://github.com/Esri/storymap-journal.git> (upstream)
- Push target: <https://github.com/dasbury-esri/classic-storymap-journal.git> (origin)

Repro import command:

- bash scripts/import-mapjournal-upstream.sh 2a51369e8e0e90c10ac0340a6496219df218b73e

The script records and enforces fork/upstream endpoints while copying source files into monorepo-safe paths (no nested .git).

## Build Workflow

Build command:

- bash scripts/build-mapjournal-runtime.sh

Output staged to:

- runtimes/mapjournal/build/index.html
- runtimes/mapjournal/build/app
- runtimes/mapjournal/build/resources
- runtimes/mapjournal/build/web.config (if present in deploy/src)

## Launch Guidance Integration

Launcher shell is available for Map Journal appid guidance:

- apps/classic-storymaps-site/mapjournal-launcher.html
- publish/templates/classic-storymaps/mapjournal-launcher.html
- Canonical launcher route: /templates/classic-storymaps/mapjournal-launcher.html
- Canonical runtime route:
  - /templates/classic-storymaps/mapjournal/index.html?appid=[appid]

Map Journal launch support is appid-first. webmap launch is not supported for this runtime.

Embedded Swipe behavior must follow the approved S7 policy:

- Use canonical Swipe embed URLs under /templates/classic-storymaps/swipe/index.html
- Preserve viewer-only behavior and appid precedence for embedded Swipe launches

## Acceptance Mapping

- Known-good Map Journal launch works from canonical route: Pass (runtime build generated canonical launch artifact)
- Embedded Swipe behavior follows approved S7 policy: Pass (documented and tracked in manifest notes)
- Unsupported and malformed input paths show actionable guidance: Pass (launcher validates malformed appid and blocks launch)
- Runtime manifest and explicit patch set are recorded: Pass

## Status

- S7b implementation and runtime validation completed on 2026-03-12.
- Import/build execution and launch guidance verification evidence is recorded in docs/testing/phase3-s7b-mapjournal-verification-transcript.md.
