# Archive Example Audit

Recorded: 2026-10-08 01:28:11+00:00[UTC].

## Status and Test Targets

The owner-approved changes are now deployed at
<https://dasbury-esri.github.io/classic-storymaps-viewer-pages/archive/>.
The initial audit below predates deployment; its original test counts and
observations are retained separately from the checkpoint verification.

### Latest Deployment Verification

Verified: 2026-10-09 01:17:42+00:00[UTC]. Release commit
`efb0120a2d6943f858a6b9324bef49a08de7ccb2` deployed successfully in
[Pages run 37868814726](https://github.com/dasbury-esri/classic-storymaps-viewer-pages/actions/runs/37868814726).
Both build and deploy jobs passed. This publishes the owner-selected example
updates, Countdown reorder, layout illustrations, folded-map favicon, and restored
Resources media documented below. Earlier local-only and pending-deployment notes
are historical and superseded by this verification.

All 122 Node tests, ten workflow builds, and 68 actual-publish checks passed.
Twenty-two deployed HTML, CSS, favicon, and image files matched the tested local
build byte-for-byte. Live Resources checks at 1440px and 390px decoded all seven
restored images and the 64x64 favicon, with no horizontal overflow, browser errors,
or Wayback rendering requests. The original mobile hiding of circular illustrations
is preserved. The [evidence](artifacts/overview-examples-2026-10-09.json) includes
the checked file list, live browser results, asset sources, and workflow URL.

GitHub Pages still reports no custom domain. Repository transfer and domain changes
remain paused. Rupert's authored-logo failure is accepted; Shale Gas's two legacy
script errors remain documented, with its second panel verified working.

### Earlier Deployment Checkpoint

Verified: 2026-10-08 03:24:06+00:00[UTC]. Commit
`5a458e1e848a140bfff2affe6746aa225ad5d793` deployed successfully in
[Pages run 37721947193](https://github.com/dasbury-esri/classic-storymaps-viewer-pages/actions/runs/37721947193).
All 74 Node tests, ten build scripts and 25 complete-publish link checks passed.
Production HTML contains all thirteen pending link replacements. Twelve actual
new-tab checks passed with no opener; eight applicable runtime destinations passed
the browser validator without errors. Introduction entry 2's nested Cascade also
passed on production. Audubon's missing layer remains owner-accepted. NOAA's href
is corrected, but its zero-size tile failed normal clicking and remains open.
See [the current triage ledger](archive-link-audit.md) for dispositions and limits.

### Initial Test Targets

- Updated pages: <https://127.0.0.1:61326/classic-storymaps-viewer-pages/archive/>.
  This loopback-only preview uses a temporary self-signed HTTPS certificate.
- Story destinations were tested anonymously against the deployed runtimes at
  <https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/>.
- The inactive `classicstorymaps.com` host is not a valid production test target.

## Owner-Selected Map Tours

| Location | Item | Viewer Parameter | Result |
| --- | --- | --- | --- |
| Archive View Sample, including repeated root listings | A walking tour of the National Mall, `a5019e8c55d547eab69c0777dcd7509a` | `webmap` | Loading, navigation, and media checks passed |
| Fourth Map Tour Overview example, replacing Kentucky Bucket List | Epic Flight, `016c31c6dcd54c7ca635cc63e4bc82a4` | `appid` | Loading, navigation, and media checks passed after the owner's HTTPS correction |

The second item's ArcGIS metadata title is "Around the world in 8 days - alone";
its configured and rendered story title is "Epic Flight". Its screenshot and alt
text use the rendered title. The first Overview example remains the Lincoln tour.

## Owner-selected Overview Follow-up

Verified locally: 2026-10-09 00:34:02+00:00[UTC]. These changes are not committed
or deployed. Repository transfer and custom-domain changes remain paused.

- Cascade's second linked example and the Apps View Sample button now open
  Remembering Rupert (`f2e8448fef064238ace4f324ffc16fde`). Palau stays first;
  Seeing Green Infrastructure stays last.
- A Nation of Drones (`79798a56715c4df183448cc5b7e1b999`) replaces Stewardship
  in the Map Series Overview and Side Accordion sample. The transform preserves
  the three original layout illustrations instead of replacing the Side Accordion
  illustration with a full-size story screenshot. The illustrations again form
  one desktop row and wrap without horizontal overflow on mobile.
- Crowdsource Overview now shows UC Selfie first, San Diego Cool second, and
  Chicago HomeStories (`b861ca9ea1114af7908600022ee9d033`) third. The owner selected
  Chicago after reviewing the candidate results. The Apps sample remains UC Selfie.
- New screenshots were captured from the local viewers. Historical source captures,
  converter fixtures, and remote ArcGIS items were not changed.

All 119 Node tests and 65 actual-publish checks passed. New ordering, destination,
and illustration checks failed before their corresponding changes. Chromium checks
verified image decoding and no horizontal overflow at 1440px and 390px, the three
Map Series illustrations in one desktop row, and real Apps sample clicks opening
the three correct items in new tabs with no opener.

Rupert loaded and scrolled past its cover, but its authored Esri logo request to
`story.maps.arcgis.com/apps/MapSeries/resources/tpl/viewer/icons/esri-logo-white.png`
failed with `net::ERR_BLOCKED_BY_ORB`. This prevents a clean browser-audit pass;
the remote item was left unchanged. A Nation of Drones passed startup, second-entry
navigation, and visible-image checks without browser errors.

### Later Owner Adjustments

Verified locally: 2026-10-09 00:52:09+00:00[UTC]. Still not committed or deployed.

- Restored The Raised Bogs of Ireland (`5a9c34acf59a49f0a67d5f7293b44d6b`) in
  Shortlist Overview's second, "Get inspired!" example, with a newly captured
  screenshot. San Diego remains first and Palm Springs remains last. Public
  startup, second-place navigation, visible images, and the real example click passed.
- The Map Series Side Accordion layout illustration depicts Shale Gas, so its
  link now opens the owner-supplied
  <https://storymaps.esri.com/archives/stories/2013/ShaleGas/>. This changes the
  illustration link only; the separate Drones story example and Apps sample remain.
  The archive returned HTTP 200 over normal HTTPS and its State by State Comparison
  panel opened. It reports two legacy JavaScript errors: `OTCompleteCount is not
  defined` and `Unexpected identifier 'content'`. No external story repair was made.
- Replaced both local favicon copies with a 64x64 ICO derived from the owner's
  supplied folded-map artwork, square-padded with its original background color.
  The catalog, launchers, Apps, and Overview pages now use the shared local icon
  with `?v=folded-map` to refresh cached icons. Native macOS and Chromium decoding
  checks passed; both copies are byte-identical.
- The owner accepted Rupert's failing authored logo. No logo or remote item change
  is needed for this work.

All 121 Node tests and 67 actual-publish checks passed. The new link and favicon
regressions failed before implementation. Desktop 1440px and mobile 390px browser
checks verified all Overview images, favicon decoding, no horizontal overflow,
and the three Map Series layout illustrations still aligned in one desktop row.

### Crowdsource Candidate Results

Tested all 24 distinct item IDs in the 25 data fixtures under the converter's
`tests/classics/Crowdsource` directory, using anonymous live item data in the local
view-only viewer. Eight qualified, including the two existing samples:

| Story | Item ID | Result |
| --- | --- | --- |
| The 2016 Esri UC Selfie Story Map | `467eccf026ca416cae01a2c6f086b2b9` | Existing sample; startup, map and visible images passed |
| San Diego Cool | `f1fcc302b0864b0c94beffc5177da2b8` | Existing sample; startup, map and visible images passed |
| Chicago HomeStories | `b861ca9ea1114af7908600022ee9d033` | Selected third example; contribution selection and visible media passed |
| The American Experience in 737 Novels | `734842b0043445eaaa9a2305d43c38b4` | Contribution selection and visible media passed |
| 1Frame4Nature | `99abe066efef4c72837da71c403798c6` | Custom cover, contribution selection and visible media passed |
| Kyoto University Postcard Collection | `3625639d89454282b44c7eb899fc910f` | Japanese cover control, contribution selection and visible media passed |
| Story Map Crowdsource | `8c76de0b9a1648ef81f1a7e15e5b0c4d` | Custom cover, contribution selection and visible media passed |
| UC2016 Story Maps Workshop Roll Call | `af540f454ff14b739a69990c26ecf905` | Custom cover, contribution selection and visible media passed; two contributions |

The initial audit expected the exact cover label "Explore Map". Four candidates
passed after follow-up checks used their actual customized or localized controls;
their initial failures remain in the evidence. The six alternatives were also
checked for visible CSS-background media, not only image elements. Novels and
Kyoto each recorded three cancelled feature queries during teardown, separately
from errors. The other sixteen candidates did not qualify because the gallery
did not load within 30 seconds or browser, service, or media errors occurred.
This is representative-interaction coverage, not certification of every contribution.

[Detailed candidate and UI evidence](artifacts/overview-examples-2026-10-09.json)
records every item, failures, follow-ups, cancellations, and layout checks. The
original replacement table below is historical; this owner follow-up takes precedence.

## Resources Media Restoration

Verified locally: 2026-10-09 01:13:09+00:00[UTC], pending deployment.

At the owner's request, recovered media referenced by the
[December 2017 Resources capture](https://web.archive.org/web/20171224040826/http://storymaps.arcgis.com/en/resources/).
The six circular illustrations (Basics, FAQs, Community, Blog, Newsletter, and
Developers) had broken Wayback-relative paths. They now use local PNGs, alongside
the recovered trophy image and `support.css`. The stylesheet is unchanged except
for its trophy URL. Existing approved link cleanup and historical captures remain
intact; no social, My Stories, or retired developer links were restored.

Wayback resolved the requested asset URLs to February 2018 captures. The detailed
[evidence](artifacts/overview-examples-2026-10-09.json) records each requested URL,
resolved capture, byte count, and SHA-256. The six illustrations are 204x204 PNGs;
the trophy is 400x400. Desktop 1440px and mobile 390px checks decoded all seven
assets with zero Wayback rendering requests or horizontal overflow. The original
stylesheet hides the circular illustrations below 480px; that behavior is preserved.

The Resources regression failed before each fix. All 122 Node tests, all ten
workflow build steps, and 68 checks against the real publish output passed before
the owner-authorized push. This release also includes the pending example swaps,
layout illustration correction, restored Shortlist example, and folded-map favicon.

## Replacement Policy

[refresh-archive-examples.mjs](../../scripts/refresh-archive-examples.mjs) owns the
old-to-new destination mapping and linked screenshot replacements. The landing
build applies it to generated pages without rewriting the historical captures.
Existing working examples are retained unless explicitly selected for replacement
by the owner. Modern StoryMaps migrations are replaced with Classic examples.

| Runtime | Other Replacements |
| --- | --- |
| Map Tour | Santa Clara development projects -> Monuments Men |
| Swipe | Unavailable item -> Washington DC 1851 and Today; hosted diabetes story -> local viewer for the same story |
| Map Journal | China highways -> The Great In-Between; migrated Abandoned Islands -> There are Riches Here |
| Map Series | Shale Gas -> Stewardship, preserving accordion layout; Footpaths of Erissos -> Paris Cafes |
| Cascade | Migrated Atlas of Electricity and Remembering Rupert sample -> Palau; externally hosted Uprooted -> Seeing Green Infrastructure |
| Shortlist | Retired San Diego hosted URLs -> local San Diego Shortlist; externally hosted Frank Lloyd Wright example -> Palm Springs Shortlist |
| Crowdsource | National Park Memories -> San Diego Cool; Veterans and unavailable root sample -> 2016 Esri UC Selfie Story Map |
| Basic | Unavailable item -> Brazil World Cup Stadiums; retired Flitsmeister URL -> Wildlife Strikes |

The Map Series Tabbed and Side Accordion sample buttons now open matching layouts
instead of the bulleted Paris Cafes story. Spyglass opens the New York City 1836
Spyglass example instead of the diabetes Swipe story.

All example links open with `target="_blank"` and `rel="noopener noreferrer"`.
Overview and other site navigation are not converted into new-tab links.

## Initial Verification

- All 66 Node tests passed. Each new regression failed before its corresponding
  fix, including the owner-selected Map Tour destinations.
- The landing build succeeded with `SITE_BASE_PATH=/classic-storymaps-viewer-pages`.
- Final inventory: 48 example anchors, 30 distinct URL spellings, 27 distinct items.
- Initial Chromium destination audit: 29/30 URLs passed. Epic Flight subsequently
  passed a focused retest after the owner's HTTPS correction; the other 29 URLs
  were not rerun during that retest.
- Checks include public item availability, loading state, error messages, visible
  images, and representative interaction: another entry or place, scrolling past
  a Cascade cover, map zoom, or opening the Crowdsource map. Genuine single-section
  Journals are recorded separately. Crowdsource remains view-only.
- Non-document `net::ERR_ABORTED` cancellations are recorded separately from errors.
- Desktop 1440x900 and mobile 390x844: all eight Overview image sets loaded. Real
  clicks on both owner-selected Map Tour links opened the expected destinations
  in new tabs with `window.opener === null`. Map Tour screenshots were inspected.
- At the initial audit, no full runtime rebuild or deployment was performed.
  The later checkpoint includes the Map Series staged-bundle patch and all builds.

This is startup and representative-interaction coverage, not an exhaustive check
of every story point, embedded page, external link, or later media asset. Public
story content and its dependencies can change after verification.

### Epic Flight Issue Resolved

Verified: 2026-10-08 01:55:27+00:00[UTC]. The owner changed the two operational
layer URLs in Web Map `124b5f15857f4eed869ae206631c93bd` from HTTP to HTTPS.
Both saved URLs now use HTTPS for layers 0 and 1 of
`services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/WileyPostRoute/FeatureServer`.

A fresh anonymous Chromium check against the deployed viewer passed loading,
second-entry navigation, and visible-image checks with zero browser errors.
No response overrides or mocks were used. Two cancelled non-document requests
were recorded separately, consistent with the existing audit policy.
No viewer code change or site deployment was needed to resolve the issue.

## Reproduction and Evidence

```sh
node --test scripts/tests/*.test.mjs
SITE_BASE_PATH=/classic-storymaps-viewer-pages bash scripts/build-classic-storymaps-landing.sh
PLAYWRIGHT_NODE_MODULES=/path/to/external/node_modules node scripts/validate-archive-examples-browser.mjs
```

Playwright is supplied externally; no repository dependency was added. The audit
prints its temporary artifact directory and writes the inventory, JSON results,
and screenshots there. An optional JSON target array can be passed as the first
argument. `EXAMPLE_ORIGIN`, `PUBLISH_CHECK_ROOT`, and `LOCAL_HTTPS=1` support local
preview checks; the last setting is only for the loopback certificate exception.

Local evidence directories under the session's macOS temporary directory:

- `classic-example-audit-689tKm`: final inventory, destination results, screenshots.
- `classic-example-audit-UIyIbx`: focused National Mall verification.
- `classic-example-audit-PWC6qZ`: Epic Flight navigation and mixed-content failures.
- `classic-example-audit-g6movo`: passing Epic Flight retest after the saved HTTPS correction.
- `classic-example-pages-pexV0w`: desktop/mobile Overview screenshots.

Linked replacement screenshots are retained under the landing site's
[example images](../../apps/classic-storymaps-site/assets/images/examples).
