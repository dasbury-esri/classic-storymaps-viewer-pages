# Phase 5 S10g - Targeted Follow-up (Top-10 Fails)

Date: 2026-03-17
Viewer Base: https://classicstorymaps.com/viewers
Source Inputs:
- docs/testing/phase5-s10f-top10-browser-runtime-validation-2026-03-17.md
- docs/testing/artifacts/phase5-s10f-top10-browser-runtime-validation-2026-03-17.json

## Scope
- Re-tested only the 3 failing appids from S10f.
- Used direct HTTP checks for failing URLs and failing static assets.
- Re-ran browser navigation attempts for the swipe URL to test reproducibility.
- Compared failures to packaged runtime structure under publish/viewers/cascade.

## Targeted Matrix
| Runtime | App ID | S10f Result | Follow-up Result | Classification | Evidence Summary |
|---|---|---|---|---|---|
| swipe | 97ae55e015774b7ea89fd0a52ca551c2 | FAIL | PASS on 3/3 browser retries | transient browser/network artifact | URL returns HTTP 200 by curl; browser retries returned status 200 each run |
| cascade | 8811af6a8038442da5e2242eebe29fdd | FAIL | FAIL confirmed | deployment/package drift | viewer page 200, but required /viewers/cascade/lib/* assets return 404 |
| cascade | 5605867ba55e4b929689a20892c26b36 | FAIL | FAIL confirmed | deployment/package drift | same missing /viewers/cascade/lib/* assets and page errors |

## Evidence

### 1) URL reachability checks
- https://classicstorymaps.com/viewers/swipe/index.html?appid=97ae55e015774b7ea89fd0a52ca551c2 -> HTTP 200
- https://classicstorymaps.com/viewers/cascade/index.html?appid=8811af6a8038442da5e2242eebe29fdd -> HTTP 200
- https://classicstorymaps.com/viewers/cascade/index.html?appid=5605867ba55e4b929689a20892c26b36 -> HTTP 200

### 2) Cascade missing asset checks
- https://classicstorymaps.com/viewers/cascade/lib/jquery/dist/jquery.min.js -> HTTP 404
- https://classicstorymaps.com/viewers/cascade/lib/fastclick/lib/fastclick.js -> HTTP 404
- https://classicstorymaps.com/viewers/cascade/lib/font-awesome/css/font-awesome.css -> HTTP 404
- https://classicstorymaps.com/viewers/cascade/lib/calcite-bootstrap/css/calcite-bootstrap-open.min.css -> HTTP 404

### 3) Swipe browser reproducibility
- Headless Chrome retries against swipe URL (same environment) returned:
  - try1: status=200
  - try2: status=200
  - try3: status=200

### 4) Packaging structure confirmation
- Cascade runtime bootstraps a Dojo package named `lib` at `.../cascade/lib` in publish bundle:
  - publish/viewers/cascade/app/main-config.js
- Cascade app requires `lib/jquery/dist/jquery.min` at startup:
  - publish/viewers/cascade/app/main-app.js
- Published cascade directory currently contains no top-level `lib` folder:
  - publish/viewers/cascade/
- Published cascade includes `resources/lib/` with font packages only, not the required `jquery` and `fastclick` module paths.

## Conclusion
- The two cascade failures are reproducible and are not app-specific content issues.
- They indicate a packaging/deployment mismatch for the cascade runtime at source-of-truth.
- The swipe failure from S10f is not currently reproducible and should be treated as intermittent until observed again.

## Phase 5 Verification Decision
- `cascade` launch verification: **blocked** pending packaging fix for `/viewers/cascade/lib/*` module paths.
- `swipe` launch verification for tested appid: **provisionally pass** after successful retries.
