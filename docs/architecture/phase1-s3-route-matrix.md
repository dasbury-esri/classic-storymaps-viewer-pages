# S3 Import-First Route Matrix and URL Precedence Contract

## Route Contract Principles
- Canonical routes are clean folder paths under `/viewers`.
- Legacy `/templates/classic-storymaps` paths are compatibility routes that preserve deep links.
- Compatibility routes using `index.html` remain valid but are not canonical.
- Query precedence is `appid-first` across onboarded runtimes.
- `webmap` is optional and runtime-specific.

## Route Matrix

| Runtime | Support Stage | Canonical Route | Compatibility Route | Query Support | Notes |
| --- | --- | --- | --- | --- | --- |
| Landing | supported | `/viewers` | `/templates/classic-storymaps` and `/viewers/index.html` | none | Catalog shell with support-state messaging |
| Map Tour | supported | `/viewers/maptour` | `/templates/classic-storymaps/maptour` and `.../index.html` variants | `appid`, optional `webmap` | Baseline runtime and first import target |
| Swipe | queued | `/viewers/swipe` | `/templates/classic-storymaps/swipe` and `.../index.html` variants | `appid`, optional `webmap` | Second onboarding target |
| Map Journal | queued | `/viewers/mapjournal` | `/templates/classic-storymaps/mapjournal` and `.../index.html` variants | `appid`, optional `webmap` (subject to embed policy) | Onboard after Swipe constraints are approved |

## URL Precedence Contract
- If `appid` is present and valid, launch behavior is driven by `appid`.
- If both `appid` and `webmap` are present, `appid` wins and `webmap` is advisory/runtime-specific.
- If `appid` is missing and runtime allows `webmap`, use runtime-specific guidance flow.
- Unsupported parameters must not break route loading.

## Valid URL Examples
- `/viewers`
- `/viewers/index.html`
- `/viewers/maptour?appid=20fd39888a444629bc8e40d9b6ac38cc`
- `/viewers/maptour/index.html?appid=20fd39888a444629bc8e40d9b6ac38cc`
- `/viewers/swipe?appid=<swipe-appid>`
- `/viewers/mapjournal?appid=<journal-appid>&webmap=<webmap-id>`
- `/templates/classic-storymaps/maptour?appid=20fd39888a444629bc8e40d9b6ac38cc` (legacy compatibility)

## Invalid URL Examples
- `/viewers/maptour?appid=` (missing value)
- `/viewers/maptour?appid=abc123` (malformed appid)
- `/viewers/maptour?webmap=<webmap-id>` when runtime policy requires appid
- `/viewers/unknownapp?appid=<id>` (unsupported route)

## Phase 1 Alignment
- S1 baseline behavior and viewer-only expectations feed runtime launch behavior.
- S2 manifest contract is the source of truth for route/query metadata.
- This matrix governs landing and runtime routing until runtime-specific overrides are approved.

## Redirect Compatibility Contract
- Canonical route family: `/viewers*`
- Legacy route family: `/templates/classic-storymaps*`
- Expected behavior in production:
	- HTTP redirect from legacy to canonical when rewrite control exists.
	- Query string preservation is required.
- Expected behavior on GitHub Pages:
	- Static redirect stubs (HTML + meta refresh + JS fallback) are used because server-side rewrite rules are unavailable.
	- Stub pages should preserve query/hash when forwarding to canonical URLs.
