# S10c Runtime Troubleshooting Log (2026-03-13)

## Objective

Record post-S10/S10b runtime troubleshooting completed on 2026-03-13, including root-cause findings, implemented fixes, and outstanding issues.

## Scope

- Runtime embed handling for Classic app URLs and shortlinks
- Runtime error behavior for deleted items
- Runtime behavior for inaccessible optional Map Tour context layers

## Summary

| Runtime | Symptom | Root Cause | Outcome |
|---|---|---|---|
| Map Series + Map Journal | Embedded classic stories failed when links used shorteners or legacy app routes | Embedded URL normalization only handled limited patterns | Fixed and validated in runtime builds |
| Cascade | Embedded classic stories failed for shortlinks/legacy routes | Cascade media iframe path lacked the generalized resolver used in other runtimes | Fixed and validated in runtime builds |
| Cascade | Deleted appids still show authentication-style message in some cases | Deleted-item classification did not cover identity-dialog and some auth/error-code paths returned by AGOL for tested appids | Additional hardening implemented; pending targeted verification |
| Map Tour | Generic ArcGIS sign-in prompt appeared for public app with missing/inaccessible context layers | Web map contained optional context layers returning `499 Token Required`; pre-sanitizer probing could trigger identity flow | Fixed; user confirmed behavior corrected after latest patch |

## Changes Implemented

### 1. Generalized shortlink and legacy-route normalization

Applies to:
- Map Series
- Map Journal
- Cascade

What changed:
- Added shortlink host detection and resolution for classic embed URLs.
- Added normalization for legacy classic app route forms so embedded URLs resolve to supported runtime routes.

Validation:
- Runtime rebuilds completed for affected apps.
- Published bundle outputs regenerated under `publish/templates/classic-storymaps/<app>/app`.

### 2. Cascade deleted-app error handling hardening (follow-up)

Applies to:
- Cascade

What changed:
- Added deleted-item detection helper and `deletedApp` message mapping in the Cascade core error path.
- Adjusted identity dialog behavior to reduce false invalid-config messaging when OAuth app id is absent.
- Added anonymous app-item probing when identity dialog appears during viewer app load without OAuth config, so deleted appids can map to `deletedApp` and non-deleted auth cases map to `notAuthorized`.
- Centralized Cascade app-item load error classification and expanded auth-code handling to include `401/403/498/499` while preserving `deletedApp` precedence.

Current expected behavior:
- Truly deleted app items should show the deleted-item message while preserving existing error styling.

Current observed behavior (latest production observation before follow-up patch):
- The following appids still showed:
  - "An error has occurred"
  - "This story requires authentication, please configure an ArcGIS OAuth ID in index.html or make the story public."
- Repro URLs:
  - `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=5fdca0f47f1a46498002f39894fcd26f`
  - `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=a8a18aaa2dee41dc98ae5eee3a2e4259`

Status:
- Follow-up hardening patch implemented on 2026-03-13 and runtime republished.
- Non-interactive deployed-page fetch on 2026-03-13 still includes auth-related strings (`An error has occurred`, `Sign In`, and `Please sign in to access the item on ArcGIS Online (...)`) in returned page content; this is not sufficient to confirm final runtime UX state without browser interaction.
- Additional hardening added on 2026-03-13 in Cascade `appLoadingTimeout` to prevent unbounded timeout re-arming while the ArcGIS identity dialog remains busy, then force deterministic `deletedApp`/`notAuthorized` classification for inaccessible appids.
- Cascade runtime rebuilt and publish assembly regenerated on 2026-03-13 after this timeout guard change.
- Manual post-hardening runtime verification for both repro appids remains required.

REST verification snapshot (2026-03-13, post-patch):
- `https://www.arcgis.com/sharing/rest/content/items/5fdca0f47f1a46498002f39894fcd26f?f=json` returned `403` (`GWM_0003`).
- `https://www.arcgis.com/sharing/rest/content/items/a8a18aaa2dee41dc98ae5eee3a2e4259?f=json` returned `403` (`GWM_0003`).
- This confirms both repro appids are currently non-public/inaccessible at item level; final UX message verification in Cascade viewer remains pending.

### 3. Map Tour fail-open for inaccessible optional context layers

Applies to:
- Map Tour

Problem details:
- Appid: `d3fd1deb014f4d9f99b58221463abbf0`
- Web map: `5e036b2d5dbd476eb955ae9eee7d1d17`
- Optional context service layers returned `499 Token Required` to anonymous requests.

What changed:
- Added operational-layer sanitization before `arcgisUtils.createMap`.
- Preserved source (tour) layer while filtering inaccessible optional layers.
- Expanded skippable error detection to include auth-related service errors (`401/403/498/499`) and missing/deleted patterns (`404` and specific `400` not-found text).
- Switched layer metadata probes to anonymous JSONP requests to avoid triggering identity prompts during pre-checks.

Status:
- User confirmed the latest patch resolved the generic sign-in symptom for the reported Map Tour case.

### 4. Additional Testing Issues Logged (Open)

Logged after S10c validation to track follow-up hardening work.

#### 4.1 Map Series embedded section blocked by frame-ancestors CSP

Runtime:
- Map Series

Repro:
- Story URL: `https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=6e03f762ac5e4314b87d8dc87b6d1c22`
- Section index: 27

Observed:
- In-section embedded content shows `storymaps.arcgis.com refused to connect`.
- Browser console reports frame blocking:
  - `Framing 'https://storymaps.arcgis.com/' violates the following Content Security Policy directive: "frame-ancestors 'none'".`

Expected:
- Section should render a stable fallback/retired/inaccessible message path without surfacing a raw browser frame refusal.

Status:
- Open; classify as embedded external host CSP incompatibility and determine viewer fallback behavior.

#### 4.2 Cascade embed shows retired card while embedded Swipe app is still reachable

Runtime:
- Cascade

Repro:
- Cascade story: `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=7bf8056343d24fbea1b929b267b826c4`
- Embedded Swipe app (loads at least partially when opened directly): `https://storymaps.esri.com/templates/classic-storymaps/swipe/index.html?appid=2c272da7d1ef441b9d99898b733425c6`

Observed:
- Cascade embed surface presents ArcGIS retired-style card, but direct Swipe launch indicates the target is still partially available.

Expected:
- Embed status/message should align with direct runtime availability for the target appid, or explicitly distinguish retire-policy vs runtime reachability.

Status:
- Verified on 2026-03-13: embedded Swipe now renders in Cascade for appid `7bf8056343d24fbea1b929b267b826c4` with target `2c272da7d1ef441b9d99898b733425c6`.
- Closed.

#### 4.3 Basic runtime ignores supplied appid and always serves default app

Runtime:
- Basic

Repro:
- Test URL (non-default appid): `https://storymaps.esri.com/templates/classic-storymaps/basic/index.html?appid=deba59dfcab54702a5a7531de6066013`
- Observed to show same content as default appid: `cd21c8e6ecad4929adac15382d85179f`

Investigation note (2026-03-13):
- Both appids above are catalog/wrapper `Web Mapping Application` entries whose item `url` points to a different appid.
- Example mappings from ArcGIS REST item metadata:
  - `cd21c8e6ecad4929adac15382d85179f` -> `...StoryMapBasic/index.html?appid=2d7d46abf47242d0a64db72d8f6b530a`
  - `deba59dfcab54702a5a7531de6066013` -> `...StoryMapBasic/index.html?appid=2e1974b8769f4752ab411676011ba7e1`
- This means equality of rendered content between wrapper ids does not by itself prove runtime appid precedence failure.

Observed:
- Viewer appears pinned to default app regardless of `appid` query value.

Expected:
- Runtime should resolve and load the requested `appid` when valid, per appid-first route contract.

Status:
- Candidate fixes applied in repo on 2026-03-13:
  - `scripts/build-basic-runtime.sh` no longer injects a hard-coded default `appid` into runtime `config/defaults.js`, and publish output now keeps `appid` empty by default.
  - `runtimes/basic/upstream/js/template.js` now probes app item metadata and, when a wrapper appid references another app via `item.url?appid=...`, resolves and loads configuration from the referenced direct appid.
- Deferred as low priority on 2026-03-13 due to low template usage; keep as known issue and do not block current deployment acceptance.

#### 4.4 Cascade embedded web map shows inaccessible-content card

Runtime:
- Cascade

Repro:
- Story URL: `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=7bf8056343d24fbea1b929b267b826c4`
- Embedded web map item: `07bfb1e5671d446e821455a228689c5a`

Observed:
- Embedded panel shows `Sorry this content is not accessible` for the web map.

Expected:
- Confirm whether this is a true permission-state result or an avoidable false-negative in embed loading flow.

Follow-up patch (2026-03-13):
- Added Cascade web map load retry logic that, on initial `createMap` failure, fetches map item data and retries with inaccessible optional operational layers removed.
- Layer accessibility probe uses anonymous JSONP metadata requests and drops only layers with clearly skippable errors (auth token required/unauthorized codes `401/403/498/499`, missing/deleted `404`, or specific `400` not-found style failures).

Status:
- Patch implemented and runtime republished.
- Targeted verification on 2026-03-13 confirms this embed remains non-renderable due to an invalid/missing basemap layer in web map `07bfb1e5671d446e821455a228689c5a`.
- Classified as source web map data defect (author repair required), not recoverable by runtime optional-layer fail-open logic.
- Closed as runtime issue; track as content remediation.

REST verification snapshot (2026-03-13, post-patch):
- `https://www.arcgis.com/sharing/rest/content/items/07bfb1e5671d446e821455a228689c5a?f=json` returned public item metadata.
- Web map data includes operational layers where at least one endpoint still returns `499 Token Required` anonymously:
  - `https://landscape5.arcgis.com/arcgis/rest/services/USA_NLCD_2011/ImageServer?f=json` -> `{"error":{"code":499,"message":"Token Required"...}}`
- Sample companion layers remain anonymously readable (expected to be retained by fail-open logic), e.g.:
  - `https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer?f=json`
  - `https://services.arcgis.com/BG6nSlhZSAWtExvp/arcgis/rest/services/latlong/FeatureServer/1?f=json`
- This supports the optional-layer auth-failure hypothesis; final in-viewer card behavior verification remains pending.

#### 4.5 Map Journal app can stall on loader with null themes runtime error

Runtime:
- Map Journal

Repro:
- Story URL: `https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=99c42de7d2f04d0fbd9af135cac6cd55`

Observed:
- Viewer loader continues spinning and app does not complete initialization.
- Browser console reports uncaught runtime error:
  - `TypeError: Cannot read properties of null (reading 'themes')`
  - Stack includes `getColors` and `updateMainStageWithLayoutSettings` in `mapjournal/app/viewer-min.js?v=1.31.0`.

Expected:
- Runtime should fail gracefully for missing/invalid theme payloads and avoid permanent loading spinner.

Status:
- Open; investigate Map Journal layout/theme initialization assumptions and add defensive null handling.

#### 4.6 Map Journal embedded Map Series does not load in section 5

Runtime:
- Map Journal

Repro:
- Story URL: `https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=3ca8ba42c90a41d39df64b9cd4f25f58`
- Section index: 5
- Embedded URL: `http://mountvernon.maps.arcgis.com/apps/MapSeries/index.html?appid=99c42de7d2f04d0fbd9af135cac6cd55`

Observed:
- Embedded Map Series frame does not load in-section.

Expected:
- Embedded content should load, or the runtime should present clear fallback guidance when blocked.

Follow-up patch (2026-03-13):
- Added viewer-side HTTPS normalization in Map Journal embed rendering (`MainStage`) for ArcGIS-hosted embed URLs when the viewer is served over HTTPS.
- Normalization is applied after short-link resolution and legacy route normalization, before iframe `src` assignment.
- This prevents mixed-content iframe loads for persisted `http://*.arcgis.com/...` embed URLs without changing stored story content.

Status:
- Fixed in source and republished in runtime artifacts on 2026-03-13.
- Verified on 2026-03-13: embedded Map Series now displays in section 5 for appid `3ca8ba42c90a41d39df64b9cd4f25f58`.
- Closed.

#### 4.7 Map Tour tour media no longer loading from author-hosted URLs (possible regression)

Runtime:
- Map Tour

Repro:
- Story URL: `https://storymaps.esri.com/templates/classic-storymaps/maptour/index.html?appid=d3fd1deb014f4d9f99b58221463abbf0`
- Web map: `5e036b2d5dbd476eb955ae9eee7d1d17`

Observed:
- Tour point photos/thumbnails that previously loaded from author-hosted URLs no longer render.
- Console includes repeated mixed-content auto-upgrade notices, followed by image failures such as:
  - `GET https://www.nyanc.org/storymap/D08A8971.jpg net::ERR_NAME_NOT_RESOLVED`
  - Similar failures for multiple media files (`*.jpg`) with `ERR_NAME_NOT_RESOLVED`.
- Runtime initialization sequence still completes and logs optional-layer sanitization (`removed inaccessible optional operational layers: 2`).

Expected:
- Tour media should load when source hosts are reachable; runtime should avoid introducing regressions in media URL handling for legacy author-hosted assets.

Initial assessment:
- Current evidence points to external-hostname/DNS reachability issues after HTTPS upgrade for media URLs, not a confirmed runtime crash.
- Keep classified as possible regression until side-by-side baseline comparison confirms whether previous success depended on transient host availability or prior HTTP-only behavior.

Status:
- Open; requires targeted comparison against prior known-good runtime behavior and direct host reachability checks for affected media domains.

## Verification Roll-up

| Snapshot | V-01 | V-02 | V-03 | V-04 | V-05 | V-06 | V-07 | V-08 |
|---|---|---|---|---|---|---|---|---|
| Current | Open | Open | Pass | Open | Pass | Open | Pass | Open |

## Verification Checklist (Short Form)

Use this section for final manual/browser verification evidence. Keep one line item per issue and mark exactly one result.

### V-01 Cascade deleted/inaccessible app behavior (two repro URLs)

- Target A: `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=5fdca0f47f1a46498002f39894fcd26f`
- Target B: `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=a8a18aaa2dee41dc98ae5eee3a2e4259`
- Target C: `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=f9d4ebbf7667439dbe1ac292e23203ac`
- Expected: loader does not spin indefinitely; runtime resolves to deterministic `deletedApp` or `notAuthorized` messaging.
- Result: [ ] Pass  [ ] Fail
- Date:
- Operator:
- Evidence (screenshots/console/network):
- Notes:

### V-02 Issue 4.1 Map Series embedded CSP block

- Target: `https://storymaps.esri.com/templates/classic-storymaps/mapseries/index.html?appid=6e03f762ac5e4314b87d8dc87b6d1c22` (section 27)
- Expected: behavior matches documented fallback policy for frame-ancestors CSP block.
- Result: [ ] Pass  [ ] Fail
- Date:
- Operator:
- Evidence:
- Notes:

### V-03 Issue 4.2 Cascade retired-card mismatch vs embedded Swipe

- Target story: `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=7bf8056343d24fbea1b929b267b826c4`
- Target embed: `https://storymaps.esri.com/templates/classic-storymaps/swipe/index.html?appid=2c272da7d1ef441b9d99898b733425c6`
- Expected: embedded result aligns with direct runtime availability.
- Result: [x] Pass  [ ] Fail
- Date: 2026-03-13
- Operator: davi6569
- Evidence: Swipe loads.
- Notes: Swipe app is broken, no map on left side. Likely Swipe config author error.

### V-04 Issue 4.3 Basic appid precedence

- Target: `https://storymaps.esri.com/templates/classic-storymaps/basic/index.html?appid=deba59dfcab54702a5a7531de6066013`
- Comparison: `https://storymaps.esri.com/templates/classic-storymaps/basic/index.html?appid=cd21c8e6ecad4929adac15382d85179f`
- Expected: runtime honors supplied appid (including wrapper-resolution behavior) and does not pin to default unexpectedly.
- Result: [ ] Pass  [ ] Fail
- Date:
- Operator:
- Evidence:
- Notes:

### V-05 Issue 4.4 Cascade embedded web map inaccessible card

- Target story: `https://storymaps.esri.com/templates/classic-storymaps/cascade/index.html?appid=7bf8056343d24fbea1b929b267b826c4`
- Target web map item: `07bfb1e5671d446e821455a228689c5a`
- Expected: remains classified as source web map defect unless content owner repair changes outcome.
- Result: [x] Pass  [ ] Fail
- Date: 2026-03-13
- Operator: davi6569
- Evidence: Embed does not load.
- Notes: Old Dark Gray Basemap in webmap. Must be replaced by webmap owner/org admin.

### V-06 Issue 4.5 Map Journal null-themes loader stall

- Target: `https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=99c42de7d2f04d0fbd9af135cac6cd55`
- Expected: no permanent loader stall; runtime handles missing/invalid theme payload gracefully.
- Result: [ ] Pass  [ ] Fail
- Date:
- Operator:
- Evidence:
- Notes:

### V-07 Issue 4.6 Map Journal embedded Map Series in section 5

- Target story: `https://storymaps.esri.com/templates/classic-storymaps/mapjournal/index.html?appid=3ca8ba42c90a41d39df64b9cd4f25f58`
- Section: 5
- Expected: embedded Map Series loads in-section (or documented fallback is shown).
- Result: [x] Pass  [ ] Fail
- Date: 2026-03-13
- Operator: davi6569
- Evidence: Embed Map Series (Accordion Layout) loads in section 5 and other sections of Map Journal.
- Notes:

### V-08 Issue 4.7 Map Tour author-hosted media no longer loading

- Target story: `https://storymaps.esri.com/templates/classic-storymaps/maptour/index.html?appid=d3fd1deb014f4d9f99b58221463abbf0`
- Expected: tour point photos/thumbnails load when author media host is reachable; no runtime-introduced media URL regression.
- Result: [ ] Pass  [ ] Fail
- Date:
- Operator:
- Evidence:
- Notes:

## Follow-up Actions

1. Cascade: manually verify both failing repro appids now resolve loader hang into deterministic user-facing error text after the timeout guard patch.
2. Smoke suite: keep regression checks for Map Tour optional context layers in release validation.
3. Triage and fix the newly logged open issues in Map Series/Cascade/Basic/Map Journal/Map Tour, then rerun targeted regression checks.
4. Release evidence: include this troubleshooting log in future release metadata attachments when hotfixes are involved.
