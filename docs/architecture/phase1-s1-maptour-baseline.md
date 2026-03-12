# S1 Baseline: Map Tour Runtime at /templates/classic-storymaps/maptour

## Purpose
Capture a reproducibility target for the currently working Map Tour runtime before import-first implementation work starts.

## Baseline Route
- Canonical route: `/templates/classic-storymaps/maptour`
- Compatibility route: `/templates/classic-storymaps/maptour/index.html`

## Known-Good Launch Behavior
- Input precedence: `appid` is authoritative when present.
- Example known-good URL: `/templates/classic-storymaps/maptour?appid=20fd39888a444629bc8e40d9b6ac38cc`
- Expected result: runtime loads in viewer mode and resolves the referenced Map Tour app content.

## Negative-Path Behavior Expectations
- Missing `appid`: show actionable guidance with a valid URL example and an org content search link.
- Malformed `appid` (not 32-hex): show validation guidance and do not attempt app launch.
- Unsupported query patterns: ignore unsupported parameters and continue with `appid` when valid.
- Broken/unknown appid: show not-found style guidance and recovery steps.

## Viewer-Only Expectations
- Builder and edit flows are blocked.
- No launch path should redirect to a builder/editor endpoint.
- Any edit action surfaced by upstream UI must be disabled or intercepted by patch policy.

## Reproducibility Target
- Runtime source of truth must be upstream import + pinned ref, not FTP/manual host state.
- Local fixture files under `classic-apps/` are catalog fixtures only, not runtime source.
- Baseline for import verification: known-good launch and negative-path behavior in this document.

## Evidence Notes
- Fixture appid used for baseline examples is sourced from `classic-apps/json_schemas/maptour/v2.8.1/tour1-20fd39888a444629bc8e40d9b6ac38cc.json`.
- Product owner approval status: Pending.
