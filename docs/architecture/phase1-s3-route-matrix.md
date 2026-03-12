# S3 Import-First Route Matrix and URL Precedence Contract

## Route Contract Principles
- Canonical routes are clean folder paths under `/templates/classic-storymaps`.
- Compatibility routes using `index.html` remain valid but are not canonical.
- Query precedence is `appid-first` across onboarded runtimes.
- `webmap` is optional and runtime-specific.

## Route Matrix

| Runtime | Support Stage | Canonical Route | Compatibility Route | Query Support | Notes |
| --- | --- | --- | --- | --- | --- |
| Landing | supported | `/templates/classic-storymaps` | `/templates/classic-storymaps/index.html` | none | Catalog shell with support-state messaging |
| Map Tour | supported | `/templates/classic-storymaps/maptour` | `/templates/classic-storymaps/maptour/index.html` | `appid`, optional `webmap` | Baseline runtime and first import target |
| Swipe | queued | `/templates/classic-storymaps/swipe` | `/templates/classic-storymaps/swipe/index.html` | `appid`, optional `webmap` | Second onboarding target |
| Map Journal | queued | `/templates/classic-storymaps/mapjournal` | `/templates/classic-storymaps/mapjournal/index.html` | `appid`, optional `webmap` (subject to embed policy) | Onboard after Swipe constraints are approved |

## URL Precedence Contract
- If `appid` is present and valid, launch behavior is driven by `appid`.
- If both `appid` and `webmap` are present, `appid` wins and `webmap` is advisory/runtime-specific.
- If `appid` is missing and runtime allows `webmap`, use runtime-specific guidance flow.
- Unsupported parameters must not break route loading.

## Valid URL Examples
- `/templates/classic-storymaps`
- `/templates/classic-storymaps/index.html`
- `/templates/classic-storymaps/maptour?appid=20fd39888a444629bc8e40d9b6ac38cc`
- `/templates/classic-storymaps/maptour/index.html?appid=20fd39888a444629bc8e40d9b6ac38cc`
- `/templates/classic-storymaps/swipe?appid=<swipe-appid>`
- `/templates/classic-storymaps/mapjournal?appid=<journal-appid>&webmap=<webmap-id>`

## Invalid URL Examples
- `/templates/classic-storymaps/maptour?appid=` (missing value)
- `/templates/classic-storymaps/maptour?appid=abc123` (malformed appid)
- `/templates/classic-storymaps/maptour?webmap=<webmap-id>` when runtime policy requires appid
- `/templates/classic-storymaps/unknownapp?appid=<id>` (unsupported route)

## Phase 1 Alignment
- S1 baseline behavior and viewer-only expectations feed runtime launch behavior.
- S2 manifest contract is the source of truth for route/query metadata.
- This matrix governs landing and runtime routing until runtime-specific overrides are approved.
