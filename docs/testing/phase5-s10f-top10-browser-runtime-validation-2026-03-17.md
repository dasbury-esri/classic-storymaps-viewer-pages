# Phase 5 S10f - Top 10 Browser Runtime Validation

Date: 2026-03-17T01:50:38.075Z
Viewer Base: https://classicstorymaps.com/viewers
Source Artifact: docs/testing/artifacts/storymaps-org-viewer-probe-2026-03-17.json

## Scope
- Selected top 10 highest-view records from the latest ready-for-manual-runtime set.
- Per record, loaded the viewer URL in headless Chromium and observed document status, app-data traffic, and runtime script errors.

## Summary
- Total tested: 10
- Pass: 8
- Fail: 2

## Pass/Fail Matrix
| Result | Runtime | App ID | Views | Document HTTP | App Data Request | Page Errors | Console Errors | Viewer URL |
|---|---|---|---:|---:|---|---:|---:|---|
| PASS | maptour | d79e17055aa14e119c9c6e8621b23a6a | 1370012 | 200 | yes | 0 | 0 | https://classicstorymaps.com/viewers/maptour/index.html?appid=d79e17055aa14e119c9c6e8621b23a6a |
| PASS | swipe | 97ae55e015774b7ea89fd0a52ca551c2 | 407130 | 200 | yes | 0 | 0 | https://classicstorymaps.com/viewers/swipe/index.html?appid=97ae55e015774b7ea89fd0a52ca551c2 |
| PASS | mapseries | e93cf59405144cb9904327ebe3a305dd | 361395 | 200 | yes | 0 | 0 | https://classicstorymaps.com/viewers/mapseries/index.html?appid=e93cf59405144cb9904327ebe3a305dd |
| PASS | mapjournal | 4c77a56bbcd743b69232cf3fd9c7a61c | 350727 | 200 | yes | 0 | 0 | https://classicstorymaps.com/viewers/mapjournal/index.html?appid=4c77a56bbcd743b69232cf3fd9c7a61c |
| FAIL | cascade | 8811af6a8038442da5e2242eebe29fdd | 310532 | 200 | yes | 2 | 6 | https://classicstorymaps.com/viewers/cascade/index.html?appid=8811af6a8038442da5e2242eebe29fdd |
| PASS | mapjournal | 8cb27cf4d3b64f1e8cd9791211620a4d | 291835 | 200 | yes | 0 | 0 | https://classicstorymaps.com/viewers/mapjournal/index.html?appid=8cb27cf4d3b64f1e8cd9791211620a4d |
| PASS | mapjournal | 8ff1d1534e8c41adb5c04ab435b7974b | 277032 | 200 | yes | 0 | 0 | https://classicstorymaps.com/viewers/mapjournal/index.html?appid=8ff1d1534e8c41adb5c04ab435b7974b |
| FAIL | cascade | 5605867ba55e4b929689a20892c26b36 | 255460 | 200 | yes | 2 | 6 | https://classicstorymaps.com/viewers/cascade/index.html?appid=5605867ba55e4b929689a20892c26b36 |
| PASS | mapseries | 79798a56715c4df183448cc5b7e1b999 | 205136 | 200 | yes | 0 | 0 | https://classicstorymaps.com/viewers/mapseries/index.html?appid=79798a56715c4df183448cc5b7e1b999 |
| PASS | mapseries | 597d573e58514bdbbeb53ba2179d2359 | 204375 | 200 | yes | 0 | 1 | https://classicstorymaps.com/viewers/mapseries/index.html?appid=597d573e58514bdbbeb53ba2179d2359 |

## Failure Details
- cascade 8811af6a8038442da5e2242eebe29fdd: pageError
  - pageErrors: load.error is not a function | load.error is not a function
  - failedRequests: GET https://classicstorymaps.com/viewers/cascade/lib/jquery/dist/jquery.min.js (net::ERR_ABORTED) | GET https://classicstorymaps.com/viewers/cascade/lib/fastclick/lib/fastclick.js (net::ERR_ABORTED) | GET https://classicstorymaps.com/viewers/cascade/lib/font-awesome/css/font-awesome.css (net::ERR_ABORTED) | GET https://classicstorymaps.com/viewers/cascade/lib/calcite-bootstrap/css/calcite-bootstrap-open.min.css (net::ERR_ABORTED)
  - consoleErrors: Failed to load resource: the server responded with a status of 404 () | Error: scriptError: /viewers/cascade/lib/jquery/dist/jquery.min.js
    at e (https://js.arcgis.com/3.41/init.js:11:13)
    at HTMLScriptElement.<anonymous> (https://js.arcgis.com/3.41/init.js:36:384) | Failed to load resource: the server responded with a status of 404 () | Error: scriptError: /viewers/cascade/lib/fastclick/lib/fastclick.js
    at e (https://js.arcgis.com/3.41/init.js:11:13)
    at HTMLScriptElement.<anonymous> (https://js.arcgis.com/3.41/init.js:36:384) | Failed to load resource: the server responded with a status of 404 () | Failed to load resource: the server responded with a status of 404 ()
- cascade 5605867ba55e4b929689a20892c26b36: pageError
  - pageErrors: load.error is not a function | load.error is not a function
  - failedRequests: GET https://classicstorymaps.com/viewers/cascade/lib/jquery/dist/jquery.min.js (net::ERR_ABORTED) | GET https://classicstorymaps.com/viewers/cascade/lib/fastclick/lib/fastclick.js (net::ERR_ABORTED) | GET https://classicstorymaps.com/viewers/cascade/lib/font-awesome/css/font-awesome.css (net::ERR_ABORTED) | GET https://classicstorymaps.com/viewers/cascade/lib/calcite-bootstrap/css/calcite-bootstrap-open.min.css (net::ERR_ABORTED)
  - consoleErrors: Failed to load resource: the server responded with a status of 404 () | Error: scriptError: /viewers/cascade/lib/jquery/dist/jquery.min.js
    at e (https://js.arcgis.com/3.41/init.js:11:13)
    at HTMLScriptElement.<anonymous> (https://js.arcgis.com/3.41/init.js:36:384) | Failed to load resource: the server responded with a status of 404 () | Error: scriptError: /viewers/cascade/lib/fastclick/lib/fastclick.js
    at e (https://js.arcgis.com/3.41/init.js:11:13)
    at HTMLScriptElement.<anonymous> (https://js.arcgis.com/3.41/init.js:36:384) | Failed to load resource: the server responded with a status of 404 () | Failed to load resource: the server responded with a status of 404 ()

## Notes
- Pass criteria: document HTTP 200, at least one successful app-data response containing the appid, and zero uncaught page errors.
- This validation is browser-level and stronger than reachability checks, but it is still synthetic automation, not human UX verification.
