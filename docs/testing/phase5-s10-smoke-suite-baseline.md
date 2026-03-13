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
