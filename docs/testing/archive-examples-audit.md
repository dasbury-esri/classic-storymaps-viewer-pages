# Archive Example Audit

Recorded: 2026-10-08 01:28:11+00:00[UTC].

## Status and Test Targets

These changes are local and uncommitted. No deployment was performed for this
audit. Production still has the previous example-page links.

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

## Verification

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
- No full runtime rebuild or deployment was performed; runtime source is unchanged.

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
