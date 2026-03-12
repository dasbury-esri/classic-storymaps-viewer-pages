# S6 Swipe Import and Reproducibility

## Objective
Import and support Swipe as the second onboarded runtime with reproducible monorepo build output and guided launch behavior.

## Runtime Paths
- `runtimes/swipe/upstream`
- `runtimes/swipe/patches`
- `runtimes/swipe/build`
- `runtimes/swipe/runtime-manifest.json`

## Fork/Upstream Remote Model
Swipe import follows this model:
- Pull source of truth: `https://github.com/Esri/storymap-swipe.git` (`upstream`)
- Push target: `https://github.com/dasbury-esri/classic-storymap-swipe.git` (`origin`)

Repro import command:
- `bash scripts/import-swipe-upstream.sh 7e0fb19e1758638bacff788a513372b4bf4fc0c8`

The script records and enforces fork/upstream endpoints while copying source files into monorepo-safe paths (no nested `.git`).

## Build Workflow
Build command:
- `bash scripts/build-swipe-runtime.sh`

Output staged to:
- `runtimes/swipe/build/index.html`
- `runtimes/swipe/build/app`
- `runtimes/swipe/build/resources`
- `runtimes/swipe/build/web.config` (if present in deploy/src)

## Launch Guidance Integration
Landing shell now includes a Swipe launcher with appid validation:
- `apps/classic-storymaps-site/swipe-launcher.html`
- Canonical launcher route: `/templates/classic-storymaps/swipe-launcher.html`
- Canonical runtime route: `/templates/classic-storymaps/swipe/index.html?appid=<appid>`

## Acceptance Mapping
- Known-good Swipe launch works from canonical route: Pass (`/templates/classic-storymaps/swipe`)
- Unsupported and malformed input paths show actionable guidance: Pass (launcher validates malformed appid and blocks launch)

## Status
- S6 implementation completed on 2026-03-12.
