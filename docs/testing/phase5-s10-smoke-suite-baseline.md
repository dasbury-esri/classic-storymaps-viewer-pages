# S10 Smoke Suite Baseline: Map Tour, Swipe, Map Journal

## Objective

Define the minimum release smoke matrix that must pass after each publish to `/templates/classic-storymaps`.

## Execution Context

- Environment: production host or production-equivalent IIS host
- Base URL: `https://storymaps.esri.com/templates/classic-storymaps`
- Operator: `<name>`
- Date (UTC): `<yyyy-mm-dd>`
- Monorepo SHA: `<sha>`

## Smoke Matrix

| Area | Check | URL Pattern | Required | Pass/Fail | Notes |
|---|---|---|---|---|---|
| Landing | Landing route loads | `/templates/classic-storymaps/` | Yes |  |  |
| Landing | Support-state cards visible | `/templates/classic-storymaps/` | Yes |  |  |
| Map Tour | Launcher loads | `/templates/classic-storymaps/maptour-launcher.html` | Yes |  |  |
| Map Tour | Known-good app launch (appid) | `/templates/classic-storymaps/maptour/index.html?appid=<sample>` | Yes |  |  |
| Map Tour | Invalid appid fails gracefully | `/templates/classic-storymaps/maptour/index.html?appid=bad` | Yes |  |  |
| Swipe | Launcher loads | `/templates/classic-storymaps/swipe-launcher.html` | Yes |  |  |
| Swipe | Known-good app launch (appid) | `/templates/classic-storymaps/swipe/index.html?appid=<sample>` | Yes |  |  |
| Swipe | Invalid appid fails gracefully | `/templates/classic-storymaps/swipe/index.html?appid=bad` | Yes |  |  |
| Map Journal | Launcher loads | `/templates/classic-storymaps/mapjournal-launcher.html` | Yes |  |  |
| Map Journal | Known-good app launch (appid) | `/templates/classic-storymaps/mapjournal/index.html?appid=<sample>` | Yes |  |  |
| Map Journal | Invalid appid fails gracefully | `/templates/classic-storymaps/mapjournal/index.html?appid=bad` | Yes |  |  |
| Compatibility | Redirect from classic-stories path | `/templates/classic-stories/*` -> `/templates/classic-storymaps/*` | Yes |  |  |
| Headers | HTML conservative cache | landing + runtime html | Yes |  |  |
| Headers | Static long-lived cache | js/css/png/svg/woff* samples | Yes |  |  |
| Headers | Text asset compression present | js/css samples with `Accept-Encoding: gzip` | Yes |  |  |

## Targeted Regression Checks (Post-S10b)

| Area | Check | URL Pattern | Required | Pass/Fail | Notes |
|---|---|---|---|---|---|
| Map Tour | Public app with inaccessible optional context layers does not show generic ArcGIS sign-in prompt | `/templates/classic-storymaps/maptour/index.html?appid=d3fd1deb014f4d9f99b58221463abbf0` | Yes |  | Should load tour without blocked context layers |
| Cascade | Deleted appid shows deleted-item specific error message | `/templates/classic-storymaps/cascade/index.html?appid=5fdca0f47f1a46498002f39894fcd26f` | No (pending verification) |  | Follow-up hardening patch landed on 2026-03-13; rerun this check to confirm deleted-item message |
| Cascade | Deleted appid shows deleted-item specific error message | `/templates/classic-storymaps/cascade/index.html?appid=a8a18aaa2dee41dc98ae5eee3a2e4259` | No (pending verification) |  | Follow-up hardening patch landed on 2026-03-13; rerun this check to confirm deleted-item message |
| Map Series | Embedded section does not surface raw browser frame refusal for storymaps.arcgis.com CSP-blocked content | `/templates/classic-storymaps/mapseries/index.html?appid=6e03f762ac5e4314b87d8dc87b6d1c22` | No (known issue) |  | Repro at section 27; currently shows `storymaps.arcgis.com refused to connect` |
| Cascade | Embedded Swipe status card aligns with direct runtime availability | `/templates/classic-storymaps/cascade/index.html?appid=7bf8056343d24fbea1b929b267b826c4` | No (known issue) |  | Current embed shows retired card while direct Swipe appid `2c272da7d1ef441b9d99898b733425c6` still loads partially |
| Basic | Runtime respects supplied appid (not pinned to default app content) | `/templates/classic-storymaps/basic/index.html?appid=deba59dfcab54702a5a7531de6066013` | No (known issue) |  | Candidate fixes landed in repo on 2026-03-13 (default appid injection removed + wrapper-appid resolution), but this issue is deferred as low priority due to low template usage and does not block current deployment acceptance. |
| Cascade | Embedded web map item does not false-negative as inaccessible | `/templates/classic-storymaps/cascade/index.html?appid=7bf8056343d24fbea1b929b267b826c4` | No (pending verification) |  | Follow-up fail-open patch landed on 2026-03-13 (retry with inaccessible optional layers removed); rerun to confirm card no longer false-negatives |
| Map Journal | App launch does not stall at spinner when theme payload is null/missing | `/templates/classic-storymaps/mapjournal/index.html?appid=99c42de7d2f04d0fbd9af135cac6cd55` | No (known issue) |  | Console currently reports `TypeError: Cannot read properties of null (reading 'themes')` in `viewer-min.js?v=1.31.0` |
| Map Journal | Section 5 embedded Map Series frame loads or presents clear fallback | `/templates/classic-storymaps/mapjournal/index.html?appid=3ca8ba42c90a41d39df64b9cd4f25f58` | No (known issue) |  | Embedded URL is `http://mountvernon.maps.arcgis.com/apps/MapSeries/index.html?appid=99c42de7d2f04d0fbd9af135cac6cd55` |

## Release Pass Criteria

- All `Required = Yes` checks pass.
- No IIS-level 500 response for supported routes.
- No blocking same-site resource load errors in sampled checks.

## Evidence to Capture

- Completed matrix with pass/fail and notes.
- Any console/network screenshots for regressions.
- Link/reference to latest S9-style IIS transcript if rerun.

## Deviation Handling

- If any required check fails:
  - Stop release signoff.
  - Record failing URL, response status, and observed behavior.
  - Either remediate and rerun smoke or execute rollback.

## Related Troubleshooting Evidence

- `docs/testing/phase5-s10c-runtime-troubleshooting-log-2026-03-13.md`
