# Archive Link Audit and Triage

Recorded: 2026-10-08 01:45:51+00:00[UTC].

This is the working burn-down list for the original read-only crawl and its
follow-up fixes. Original observations remain below and in the JSON evidence;
they are not current failure counts. The owner-approved checkpoint is deployed:
twelve link tasks were resolved at that checkpoint. NOAA's subsequent rendering
repair and the owner-selected Boston replacement are also deployed and verified.
The owner's remote Story Locator and Epic Flight repairs were verified
independently of this site deployment.
The subsequent archive follow-up deployment below closes fourteen more tasks and
publishes the shared internal-only footer.

## Triage Rules

- `open`: a confirmed failure needs a replacement, recovery, or explicit unavailable state.
- `needs-verification`: repeat the check or decide whether the destination matches its label.
- `pending-deployment`: a local fix passed its focused check; keep unchecked until verified live.
- `resolved`: the agreed repair or unavailable state was verified live.
- `accepted`: investigated and no fix needed; not a repaired failure.

Use the stable IDs below when choosing the next task. Each destination task covers
all of its source-page references in the JSON, including aliases where explicitly
listed. Do not renumber existing IDs when adding findings. A checked task means
resolved or accepted, never merely implemented locally.

For closure, record the selected destination or repair, a focused regression when
code changes, and a browser check of the actual destination and intended behavior.
For repository changes, run the required tests/builds before an approved push and
verify the deployed links afterward. The checklist conversion itself did not
authorize deployment; the owner subsequently approved the checkpoint below.

## Shared Footer Follow-up

The owner requested consistent internal-only footers. Existing historical footers
now reuse the footer from the Apps page template during the build. Story Maps
navigation contains Home plus the header's Apps, Viewers, Resources, Blog and FAQs
destinations. Social icons, feedback controls and external Esri navigation are
removed. Historical copyright and the Apps archive notice remain; pages without
a footer are unchanged. Captured source pages are not edited.

The shared-footer regression failed before the change and passed afterward. All
90 Node tests passed, including footer identity, internal link resolution, header
parity and copyright preservation. Local desktop 1440x900 and mobile 390x844
screenshots confirmed matching Apps/homepage footers with readable, unclipped text.
Normal footer clicks reached Apps and FAQs. These local checks preceded the archive
follow-up deployment below; the original crawl observations are not a fresh audit
of the changed footer.

## Burn-down

| Status | Tasks |
| --- | ---: |
| open | 31 |
| needs-verification | 6 |
| pending-deployment | 0 |
| resolved | 30 |
| accepted | 2 |
| Total | 69 |

**37 outstanding; 32 closed (30 resolved, 2 accepted).** These are task counts,
not failed-link counts: 62 destination tasks, four groups covering 55 placeholder
occurrences, and three follow-ups. ENV-001 is a local-tooling issue, not a
production defect. URL aliases retain separate IDs so none disappear from the
inventory, but can be repaired together. The other 182 destinations had no failure
observed and do not become tasks without new evidence.

The [JSON evidence](artifacts/archive-link-audit.json) is the status ledger. Search
for a task ID to find the exact original URL, classification, all referring pages
and labels, and any verified replacement. Destination `triage.status` is current;
the adjacent HTTP `status`, `classification`, and `browser` fields describe the
original crawl. Root `triage.supplementalTasks` covers placeholders and follow-ups.
Root-relative replacement URLs are viewer routes before deployment base-prefixing.
Update both the ledger and this checklist/count table when closing a task. A new
crawl is fresh evidence, not permission to overwrite the ledger or renumber IDs.

### Archive Follow-up Deployment

Verified: 2026-10-08 17:36:07+00:00[UTC]. Commit
`b030e1ab78347628b75bf2dd6b1baf03bd97296a` deployed successfully in
[Pages run 37817207834](https://github.com/dasbury-esri/classic-storymaps-viewer-pages/actions/runs/37817207834).
Preflight passed 90 Node tests, all ten builds and 41 complete-publish checks.
Both workflow jobs succeeded. Production remains at the GitHub Pages project URL;
no custom domain was enabled.

All fourteen task references match their selected URLs or unavailable states in
live HTML. Six shared footers and the organization stylesheet match the tested
build. Normal production clicks opened both Countdown archives and all five
original Cascade guides at the exact destinations with no opener and matching
visible titles or instructional text.

At desktop 1440x900 and mobile 390x844, all seven unavailable entries caused no
navigation or popup on normal clicks; Tab visited only the five retained links
in order. Tiles and footers had no overflow. Footer Home, Apps and FAQs clicks
reached the correct destinations at both sizes. Mobile screenshots and a fresh
desktop Apps-footer capture were inspected. An earlier desktop element capture
showed preceding content and was not used as visual proof. Browser artifacts:
temporary `classic-checkpoint-live-jpuF3C`.

The Cascade validator reported 5/5 passing, but Sections also recorded a late
canceled YouTube iframe request (`ECuarAmpK00`, `net::ERR_ABORTED`). A separate
production-click run rendered all five topics without failed guide requests.
Runtime artifacts: temporary `classic-example-audit-zz9OhA`. This is not exhaustive
certification of embedded videos or map layers. Countdown closure covers the
owner-selected links, not the documented missing chart or map-selection issues.
Unavailable states do not restore the original organization content.

This checkpoint supersedes earlier local/pending statements for the fourteen
tasks in the sections below and the shared footer. Original crawl evidence and
historical investigation notes remain intact.

### Deployed Checkpoint

Verified: 2026-10-08 03:24:06+00:00[UTC]. Commit
`5a458e1e848a140bfff2affe6746aa225ad5d793` deployed successfully in
[Pages run 37721947193](https://github.com/dasbury-esri/classic-storymaps-viewer-pages/actions/runs/37721947193).
Preflight passed all 74 Node tests, all ten build scripts, and 25 checks against
the complete publish output. Production remains on the GitHub Pages project URL;
the inactive custom domain was not enabled.

All thirteen replacement hrefs and new-tab attributes were verified in live HTML
on their referring pages. Twelve representative production clicks opened the
expected destinations with `window.opener === null`; NOAA's zero-size tile failed
normal clicking and remains open. Eight distinct applicable runtime destinations
passed startup, media and representative-interaction checks with zero browser
errors. Production markers were Map Series `grunt`, Cascade `release:1.23.0`,
Shortlist `release:2.12.0`, and Crowdsource `release:0.10.0`.

The introduction's entry 2 loaded its embedded Cascade at the project-prefixed
viewer URL and rendered "What's a Story Map?" and its narrative. The archived
20 Towns title and content rendered. Audubon's original title and narrative
rendered; the missing layer remains accepted, and Cancel remains owner-reported.
These checks do not certify every presentation entry or external dependency.
Runtime artifacts: `classic-example-audit-1EtMf1` in the session's temporary
directory. This checkpoint supersedes local/pending statements in the historical
follow-ups and per-task JSON verification paragraphs.

- [x] AL-009 `resolved`: Original FAQ caption-formatting example recovered in Map Tour; live link, popup and runtime checks passed.
- [x] AL-012 `resolved`: Playlist's 20 Towns example opens the owner-selected archive with matching title and content.
- [x] AL-017 `resolved`: Flitsmeister replaced by Wildlife Strikes in Basic; live checks passed.
- [x] AL-018 `resolved`: Kentucky/custom-domain Map Tour link replaced by Epic Flight; live checks passed, with RT-001's data repair retained.
- [x] AL-035 `resolved`: Original introduction presentation recovered through Map Series; production entry 2 and its embedded Cascade passed. Other entries and the release fallback are not certified.
- [x] AL-037 `resolved`: Original "Make Your Story Map Sing" Cascade opens; live link, popup and runtime checks passed.
- [x] AL-038 `resolved`: Both "The Bare Earth" anchors use the original Cascade item; live hrefs, representative popup and runtime checks passed.
- [x] AL-042 `resolved`: Original Audubon link opens in Map Series with its title and narrative. The owner-accepted missing layer is not repaired; Cancel was not independently retested.
- [x] AL-058 `resolved`: Veterans replaced by Selfie in Crowdsource; live checks passed.
- [x] AL-059 `resolved`: San Diego Shortlist slashless alias replaced by the current viewer; live checks passed.
- [x] AL-060 `resolved`: San Diego Shortlist trailing-slash alias verified together with AL-059.
- [x] AL-062 `resolved`: Footpaths replaced by Paris Cafes in Map Series; live checks passed.

### Organization Follow-up Deployment

Verified: 2026-10-08 03:45:58+00:00[UTC]. Commit
`ccd48ea50ac8c574c00e098348b1699d66323931` deployed successfully in
[Pages run 37724050105](https://github.com/dasbury-esri/classic-storymaps-viewer-pages/actions/runs/37724050105).
Preflight passed 76 Node tests, all ten build scripts and 27 complete-publish checks.
The live organization stylesheet matched the committed source. All twelve controls
had usable dimensions without text overflow. Desktop 1440x900 and mobile 390x844
normal clicks opened both exact owner-selected destinations with no opener. NOAA's
title and Boston's gallery heading and Land Use Update result rendered anonymously.
Mobile also passed with the remote homepage stylesheet blocked. This supersedes
the earlier pending/local statements for these tasks; individual external stories
are not recertified.

- [x] AL-044 `resolved`: Boston opens the owner-selected StoryMaps-filtered gallery; production desktop/mobile navigation and content checks passed. The inaccessible original group was not repaired.
- [x] AL-047 `resolved`: NOAA opens the exact selected Wayback capture; production desktop/mobile tile and click checks passed, including missing archived CSS.

### Unavailable Organization Examples

Verified locally: 2026-10-08 03:59:04+00:00[UTC]. The owner approved marking Montana
and NCC unavailable, with the same treatment for additional failing "Join the
party" examples. These are disabled text entries, not substitute destinations.
Unavailable describes the archived example, not the organization or all its content.

Seven generated entries retain their names with "(Unavailable)" and
`aria-disabled="true"`, without `href`, `target`, or `tabindex`. Disabled styling
removes link decoration. Each regression failed before its fix and passed afterward.
Standalone Chromium at desktop 1440x900 and mobile 390x844 confirmed no navigation
or popup on any disabled entry, no text overflow, and Tab visiting only the five
retained links in order. Screenshots were inspected; artifacts are in the session's
temporary `classic-party-unavailable-h5O9m0` directory. All 83 Node tests and the
local landing build passed. The archive follow-up deployment above subsequently
verified these states live.

Audubon, NOAA, Boston, NPCA and PA DCNR remain linked. NPCA and PA DCNR were
rechecked: their shortlinks end at HTTP 200 mapping hubs with relevant content.
Audubon's previously accepted missing-layer limitation is unchanged. Individual
stories within the retained hubs were not recertified.

- [x] AL-043 `resolved`: Blue Raster's archived example is explicitly unavailable on production; its consulting website is not down.
- [x] AL-045 `resolved`: Owner-approved unavailable Montana entry verified live; original item access was not repaired.
- [x] AL-046 `resolved`: Owner-approved unavailable NCC entry verified live; original group access was not repaired.
- [x] AL-049 `resolved`: NPS unavailable state verified live; original story URL remains documented as 404.
- [x] AL-050 `resolved`: Nature Conservancy unavailable state verified live; original field-notes URL remains documented as 404.
- [x] AL-051 `resolved`: Trust for Public Land unavailable state verified live; original retired app was not repaired.
- [x] AL-052 `resolved`: USDA unavailable state verified live; original retired app was not repaired.

These unavailable states were verified on production before closure. Their JSON
`disposition` is `unavailable`; unlike replacements, they have no replacement URL.

### Cascade Tutorial Guides

Verified locally: 2026-10-08 16:47:28+00:00[UTC]. All five original guides remain
public and match their tutorial topics. Their retired nation-hosted links now use
the Cascade viewer with the original item IDs, labels and surrounding copy intact.
All five regressions failed before the rewrite and passed afterward. The existing
runtime, media and representative-scroll checks passed for all five with zero
browser errors; artifacts are in temporary `classic-example-audit-NHW5bv`.

Normal clicks from the local tutorial opened each correct guide in an isolated
new tab. Selected instructional text was scrolled into view for each topic below.
All 88 Node tests and the landing build passed at that local checkpoint. The
archive follow-up deployment above subsequently verified the live tutorial links.
The checks do not certify every map layer, transition or embedded video.

- [x] AL-053 `resolved`: Original Sections guide verified live; section-composition instructions rendered. Canceled iframe observation recorded above.
- [x] AL-054 `resolved`: Original Transitions guide verified live; Swipe Vertical instructions rendered.
- [x] AL-055 `resolved`: Original Map Legends guide verified live; contextual-graphics guidance rendered.
- [x] AL-056 `resolved`: Original Multi-View Map guide verified live; Interaction Disabled guidance rendered.
- [x] AL-057 `resolved`: Original Media guide verified live; Add Images to a Story instructions rendered.

### P1: Story and Organization Examples

The organization decisions are recorded above. For the remaining retired endpoints,
inspect the public item and try the matching supported viewer. Verify actual
content and one representative interaction before selecting a replacement.
For missing sites, locate a suitable preserved capture or explicitly mark the
destination unavailable. Do not infer that an item was deleted from a blank host.

- [x] AL-013 `resolved`: Exact owner-selected Ports archive URL verified live with isolated popup and matching title. The observed blank volume chart remains documented.
- [x] AL-014 `resolved`: Exact owner-selected Refugee Camps archive URL verified live with isolated popup and matching title. The blocked HTTP map service and entry-selection error are not repaired.

The owner explicitly selected
[Ports](https://storymaps.esri.com/archives/stories/2013/ports/) and
[Refugee Camps](https://storymaps.esri.com/archives/stories/2013/refugee-camps/).
Both generated links use these exact URLs and retain isolated new-tab behavior.
The restored Refugee Camps regression failed before its rewrite and passed after;
both Countdown checks, the neighboring Playlist check and the landing build passed.
This supersedes the earlier decision gate, not the runtime observations below.
The owner subsequently approved the archive follow-up deployment above; both live
links were verified before closure.

Both official archive candidates preserve the original stories. Their temporary
route regressions failed before the rewrites and passed afterward; local clicks
opened the correct destinations with no opener. Ports was tested in standalone
Chromium after both maps initialized: selecting Singapore displayed rank 2,
2011 volume 29.94 million TEUs, and satellite imagery. Its chart area was blank in
the inspected `classic-countdown-ports-hYJ39e/singapore.png` screenshot; external
tracking-script errors were also observed. The owner subsequently selected this
destination with those observations recorded.

Refugee Camps requests World_Imagery over HTTP, blocked as mixed content. Selecting
Dagahaley throws `Cannot read properties of undefined (reading 'hide')` in
`postSelection`, reproduced in integrated and standalone Chromium. Its candidate
rewrite was initially withdrawn, then restored with regression coverage following
the owner's explicit URL selection. No remote source or new runtime was modified;
these limitations are not claimed as repaired.

### P1: Placeholder Navigation

Use `sourcePlaceholders` in the JSON for each exact page/label occurrence. These
four disjoint groups cover all 55 references. Choose the intended target for each
context, or show an explicit unavailable state; verify every affected generated
anchor and representative browser clicks. Leave legitimate Top/menu controls alone.

- [ ] PH-001 `open`: 37 gallery references: 24 Gallery tabs, 10 app-specific calls to action, one home call to action, and two Story Maps Gallery references.
- [ ] PH-002 `open`: 11 Developers' Corner references; restore appropriate preserved resources.
- [ ] PH-003 `open`: Three Learn ArcGIS lesson references; restore the actual lesson rather than a generic catalog.
- [ ] PH-004 `open`: Four FAQ references labelled "this link", "linked", or "embedded"; recover targets from their surrounding questions.

### P2: Downloads

For missing repositories, check for an official preserved/renamed project and
working downloadable artifact; otherwise show that the download is unavailable.
For mislabeled source ZIPs, either select and validate an actual ready-to-deploy
release or relabel it as a developer/source download with its build requirements.
Do not call a branch ZIP ready to deploy solely because it downloads successfully.

- [ ] AL-001 `open`: Playlist shortened download URL; coordinate with AL-026.
- [ ] AL-002 `open`: Countdown shortened download URL; coordinate with AL-023 and AL-024.
- [ ] AL-023 `open`: Countdown GitHub repository returns 404.
- [ ] AL-024 `open`: Countdown GitHub ZIP returns 404.
- [ ] AL-026 `open`: Playlist GitHub repository returns 404.
- [ ] AL-025 `open`: Map Tour "ready-to-deploy" download is a branch source ZIP.
- [ ] AL-027 `open`: Basic "ready-to-deploy" download is a branch source ZIP.
- [ ] AL-028 `open`: Cascade "ready-to-deploy" download is a branch source ZIP.
- [ ] AL-029 `open`: Crowdsource "ready-to-deploy" download is a branch source ZIP.
- [ ] AL-030 `open`: Journal "ready-to-deploy" download is a branch source ZIP.
- [ ] AL-031 `open`: Series "ready-to-deploy" download is a branch source ZIP.
- [ ] AL-032 `open`: Shortlist "ready-to-deploy" download is a branch source ZIP.
- [ ] AL-033 `open`: Swipe "ready-to-deploy" download is a branch source ZIP.

### P2: Resources and Navigation

Find a preserved or current destination that matches the original label and
context. If it cannot be recovered, explicitly mark it unavailable. TLS repairs
must work under normal browser certificate validation, without bypasses.

- [ ] AL-004 `open`: Story Maps blog-listing shortlink returns 404; restore the intended listing.
- [ ] AL-005 `open`: Custom Crowdsource panel article has a DNS failure; locate the specific article.
- [ ] AL-006 `open`: HTML in Map Tour captions article has a DNS failure; locate the specific article.
- [ ] AL-008 `open`: Premium-content article shortlink returns 404; locate the specific article.
- [ ] AL-010 `open`: ArcGIS Marketplace goes to Find a Partner; restore matching apps/data content or revise the label.
- [ ] AL-011 `open`: Old gallery endpoint fails DNS; coordinate with PH-001 without conflating URL and placeholder coverage.
- [ ] AL-016 `open`: Developer Summit navigation returns 404; choose a preserved event page or correctly labelled successor.
- [ ] AL-019 `open`: Shortlists collection has an expired certificate; recover a normally accessible collection.
- [ ] AL-021 `open`: Main-stage-action buttons article has a DNS failure; locate the specific article.
- [ ] AL-022 `open`: GeoNet thread 150596 returns 404; find the corresponding community thread or archived answer.
- [ ] AL-039 `open`: Instructional collection has an expired certificate; recover matching content.
- [ ] AL-040 `open`: Oceans collection has an expired certificate; recover matching content.
- [ ] AL-041 `open`: All Story Map Collections shortlink ends at a DNS failure; recover a suitable collections index.

### P3: Verification and Decisions

Do not treat timeouts or automation restrictions as proof of removal. Recheck
anonymously in a browser; record a content-matching decision for destination drift.

- [ ] AL-003 `needs-verification`: Norway atlas timed out; recheck availability and actual example content.
- [ ] AL-007 `needs-verification`: Newsletter signup timed out; determine whether signup still exists without submitting anything.
- [ ] AL-034 `needs-verification`: ArcGIS Book chapter link now delivers a companion-resource PDF; decide whether it satisfies the label.
- [ ] AL-036 `needs-verification`: Story Maps training link now opens generic catalog search; recover a relevant filter or revise the label.
- [ ] AL-061 `needs-verification`: EsriStoryMaps X profile is inconclusive under automation; confirm without assuming deletion.
- [ ] RV-001 `needs-verification`: Contest-year links converge on a combined winners archive; decide whether year-specific navigation must be restored.

### Local Tooling

- [ ] ENV-001 `open`: Temporary HTTPS preview returns 404 for slashless runtime directories. Fix its directory redirect, then verify the Lincoln URL; production already redirects correctly. Keep separate from archive-content failures.

### Closed

- [x] AL-015 `resolved`: Story Locator's owner repaired the JavaScript string and made the Web Map public. Fresh anonymous startup without overrides passed; title/list render, loading clears, and no sign-in prompt appears. Individual story destinations are not recertified.
- [x] RT-001 `resolved`: Epic Flight's owner changed both layer URLs to HTTPS. Fresh unmocked load and second-entry navigation passed without browser errors. The archive replacement link is also resolved under AL-018.
- [x] AL-020 `accepted`: Developer `/en/` redirect to the root is valid; no fix required.
- [x] AL-048 `accepted`: NPCA redirect to its mapping resource hub is valid; no fix required.

## Scope

- All 31 HTML files under the generated archive, plus the main root page and
  the viewer directory's archive-root alias: 33 pages total.
- Both current local output and the corresponding production HTML were inventoried:
  1,441 link occurrences each, 2,882 combined, resolving to 244 distinct HTTP(S)
  destinations after removing fragments.
- Every destination was requested, following redirects and examining HTML titles,
  headings, and content rather than relying only on status codes.
- All 33 production archive pages were rendered in Chromium. Twenty-five suspect
  destinations received browser follow-up; a blank presentation and the Playlist
  example also received explicit 20-second readiness checks.
- All 33 archive pages returned HTTP 200. No missing named fragments were found
  in the static HTML checks, including cross-page fragment links.
- Production origin: <https://dasbury-esri.github.io/classic-storymaps-viewer-pages/>.
  Internal links in the local inventory were resolved against that deployment
  origin, not the temporary preview server.

The full [machine-readable evidence](artifacts/archive-link-audit.json) contains
every destination, final URL, redirect chain, status, classification, link labels,
source pages, and whether each reference occurs locally, on production, or both.

## Original Findings

The following sections preserve the original crawl findings. Use the checklist
and current `triage.status` fields above for disposition, not these past-tense
observations as a live failure list.

### Placeholder Navigation

There are 55 nonempty, non-Top placeholder references in the local source with
`href="#"`. These include Gallery tabs and gallery calls to action, FAQ references
labelled "this link", "linked", and "embedded", Developers' Corner references,
and Learn ArcGIS lesson references. Blank mobile-menu controls and legitimate
"Top" controls were excluded from this count. The rendered-page observations
are retained in the evidence, separately from intentionally disabled anchors.

The Map Tour "Explore the Story Map Tour gallery" link was clicked in a real
browser: it stayed on the same Overview page and merely added `#` to the URL.
These controls do not open the content their labels describe.

Suggested action: restore a specific preserved destination where available;
otherwise make the archived/unavailable state explicit instead of presenting a
normal-looking link. Do not replace legitimate menu or Top controls.

### Successful HTTP Responses Without Working Content

Fifteen distinct URLs returned an ArcGIS page titled "Item Replacement" with an
empty body in Chromium. These are not working story destinations merely because
their HTTP status is 200:

- "The Bare Earth" on the historical home page.
- "An Introduction to Story Maps" and "Make Your Story Map Sing" presentations.
- The Map Tour HTML-caption example.
- Five "How To Cascade" guide URLs on `nation.maps.arcgis.com`.
- Six organization examples: Audubon, City of Boston, Montana FWP, NCC, TPL, USDA.

The introduction presentation remained blank during an additional 20-second
readiness check. Do not assume the underlying items are missing; these findings
concern the old hosted application endpoints. Supported app families may be
recoverable through the local viewers, but that requires separate validation.

The Playlist example at
<https://storymaps.esri.com/stories/2013/storylocator/> remained on "Loading Playlist"
and raised `Invalid or unexpected token`. It also failed the extended readiness
check. Countdown and Playlist were outside the earlier eight-viewer example audit.

The [NOAA example](https://links.esri.com/storymaps/user/noaa) redirects to a page
whose actual heading is "Page Not Found" despite HTTP 200. Chromium independently
confirmed this soft 404.

### Broken External URLs

Nineteen distinct URLs returned HTTP 404, excluding the separately qualified X
profile result. Several are aliases for the same failed destination.

| Affected Area | Examples of Failures |
| --- | --- |
| Countdown | GitHub repository, ZIP download, shortened download URL, Refugee Camps and Ports examples |
| Playlist | GitHub repository, shortened download URL, 20 Towns example |
| Historical home page | NPS and Nature Conservancy organization examples |
| Resources and FAQs | Story Maps blog listing, premium-content article, GeoNet thread 150596 |
| Archived global navigation | Developer Summit URL |
| Production-only old examples | Veterans, San Diego Shortlist, Footpaths of Erissos, Flitsmeister |

Five URLs failed DNS resolution after redirects. They lead to
`storymaps-classic.arcgis.com` or `developerscorner.storymaps.arcgis.com`, including
the old gallery/collections shortlinks and three developer articles.

Three URLs failed TLS validation with `CERT_HAS_EXPIRED`: the Shortlists collection
and the Oceans and Instructional collection shortlinks. Chromium independently
reported `ERR_CERT_DATE_INVALID` for two of them. These are inaccessible under
normal certificate validation on the test machine; bypassing certificate checks
would not make them acceptable public destinations.

### Misleading Destinations

| Link Label or Purpose | Actual Destination | Assessment |
| --- | --- | --- |
| ArcGIS Marketplace, apps and data | Esri "Find a Partner" | Confirmed destination mismatch; browser verified |
| Download the ready-to-deploy app, eight viewer families | GitHub branch source ZIPs | Developer/source downloads, not release packages |
| All Story Maps training resources | Generic training catalog search with no Story Maps filter | Broader than promised; review |
| Story Maps chapter in The ArcGIS Book | Second-edition companion-resource PDF | Different artifact; review before replacing |
| Blue Raster organization example | Low-Code and No-Code GIS Applications marketing page | No longer a specific story example; review |

The [Map Tour repository documentation](https://github.com/Esri/storymap-tour)
explicitly distinguishes its User Download from the Developer Download and build
workflow. Its Developer Download is the ZIP currently advertised by the Overview
as ready to deploy. All eight download references use GitHub branch archive URLs.

### Uncertain or Acceptable Results

- Newsletter signup and the Norway atlas timed out. Newsletter also timed out in
  Chromium. These are unresolved checks, not proof of permanent removal.
- The obsolete custom-domain Kentucky URL timed out; it is already replaced in
  local output and is production-only in this inventory.
- The EsriStoryMaps X profile returned a profile-not-found 404 to the HTTP check,
  but Chromium showed a blank page. Treat this as unverified because social-site
  access restrictions can affect automation; do not conclude the account is deleted.
- NPCA's redirect to its mapping resource hub is valid. The Developer site's
  `/en/` to `/` redirect is also valid. Both were removed from the failure list.
- The Medium hosting article loads correctly after redirecting to the author's
  profile domain. GitHub repository renames also resolve to the expected projects.
- Contest-year links now converge on a combined winners archive. This is a loss
  of year-specific navigation, not a confirmed dead destination.

## AL-009 Follow-up

The FAQ's caption-formatting shortlink now opens the original item
`d5b2c90d8a53466f9c3efb0f25d13325` through the current Map Tour viewer.
The generated-link regression failed on the retired shortlink, then passed with
the original item and "Map Tour" label preserved, the deployment base prefix, and
`target="_blank"` with `noopener noreferrer`.

The deployed viewer loaded "Some Places to Eat in San Diego, California" with
56 places. Visible captions retained the red Website hyperlink, bold neighborhood
text, horizontal separator, and italic photo credit. Selecting another place
changed the caption to The Fish Market and loaded its photo and map tiles. This
checks the FAQ's specific formatting example, not just an HTTP response. Individual
restaurant destinations and every media entry were not recertified. The archive
FAQ link change is local and remains pending deployment.

## AL-035 Follow-up

The Resources shortlink now opens the original public presentation item
`4aaf9036c7324b0cb5c8ee3e609126e7` in Map Series. The link regression failed before
the change and passed afterward, preserving the label, deployment prefix and
isolated new-tab behavior. The opening slide renders; its image decoded at
1500 by 891 pixels.

That link-only fix exposed a runtime defect: entry 2 ("What are Story Maps?")
was rewritten to the obsolete `/templates/classic-storymaps/cascade/` path and
returned a GitHub Pages 404. The saved presentation correctly references an
ArcGIS Cascade item; the wrong local base came from the custom Map Series
embedded-link rewriter, not the owner's data.

[The staged-bundle patch](../../runtimes/mapseries/patches/embedded-base-path.mjs)
now derives the current `/viewers` base for Grunt bundles while retaining legacy
hosting behavior. It checks an exact single target in each bundle, parses patched
JavaScript before writing, and fails closed on an unexpected or already-patched
Grunt bundle. Upstream source is not edited. Tests cover root, project-prefixed,
nested, and legacy bases, plus repeated patching and unchanged release bundles.

A fresh local Grunt build loaded entry 2 without overrides at the correct
project-prefixed Cascade URL, rendering "What's a Story Map?" and its narrative.
A later embedded "The Two Koreas" story also loaded. Navigation checks intended
for entries 3 and 5 landed on other entries, so those specific slides are not
certified; neither are all of the presentation's embedded stories or media.
The official-release fallback is intentionally unchanged and was not certified
for this nested-story recovery. Before closure, verify the deployed build's
provenance and entry 2 behavior, not merely the new Resources link. Both the link
and runtime patch remain local pending deployment.

## AL-042 Follow-up: Accepted Limitation

The original public Audubon item `3c48121bd41945d68aacd1ded71841a4` opens as
"Arizona's Birds and Water" in the local Map Series viewer. Its opening narrative
and navigation to "Arizona Water Initiative" work, but the planning-area map
layer does not load. A plain basemap is not sufficient to demonstrate this story.

The entry uses Web Map `abbc3cbe61cd4072a2ec8f5ef09a917b`. Its sole operational
layer, `StrategicVision_222` ("StrategicVision - planningAreaStrategicVision"),
stores `http://gisweb2.azwater.gov/arcgis/rest/services/OpenData/StrategicVision/MapServer/0`.
The browser requests HTTPS and fails. Independent anonymous HTTPS requests to
both that layer and the server's REST info endpoint return HTTP 404 with HTML
"Not Found", so this is not merely a local-preview CORS restriction.

The owner chose to retain this original story through the current Map Series
viewer, reporting that readers can click Cancel to bypass the dead map data and
that most of the app still works. This is acceptance of the known missing layer,
not a claim that the service was repaired. The Cancel workaround is owner-reported
and was not independently retested. No substitute story or new in-app warning was
requested, and no ArcGIS item or service configuration was changed.

The Audubon tile now points to the original item in the current viewer. Its
regression failed before the change and passed afterward, preserving the tile,
item ID, deployment prefix, and isolated new-tab behavior. AL-042 is pending
deployment of that link change; its data limitation remains documented here.

## AL-044 Follow-up: Owner-Selected Gallery

The original "Story Maps Homepage Gallery App", item
`4a31b22b1f914f95a13283dfb127100d`, remains public and owned by `BostonGIS`.
Its saved `values.group` is `af3c6e28332246d4abef51ffbbfce186`. Anonymous requests
to both the group's metadata and content endpoints return ArcGIS error 403 with
message code `GWM_0003`, despite HTTP 200. This is an access failure, not evidence
that the group was deleted. No sign-in or access change was attempted.

The owner selected this replacement:
<https://boston.maps.arcgis.com/home/gallery.html?sortField=relevance&sortOrder=desc&mode=keyword&focus=applications-storymap>.
This is the BostonMaps organization gallery filtered to StoryMaps, not recovery
of the inaccessible historical group. The generated Boston tile now points directly
to that exact URL, preserving all four query parameters and its readable label.

The regression failed against the old shortlink and passed after the change.
The local landing build passed. A normal tile click opened the exact URL in a
new tab with `window.opener === null`; "Gallery for BostonMaps" and the "Land Use
Update" result were visible without signing in. Individual gallery stories were
not recertified. AL-044 remains pending deployment and a production click check.

## AL-045 Follow-up: Owner-Approved Unavailable State

The retired Montana FWP Cascade endpoint references item
`0fa1de4222074cdeb7dbf0710ecb2ee0`. Anonymous metadata and data requests through
both `www.arcgis.com` and `mtfwp.maps.arcgis.com` return ArcGIS error 400,
`CONT_0001`, "Item does not exist or is inaccessible", despite HTTP 200. This
does not distinguish deletion from restricted access. A local viewer rewrite
cannot recover an item that it cannot read.

The candidate organization gallery at
<https://mtfwp.maps.arcgis.com/home/gallery.html?sortField=relevance&sortOrder=desc&mode=keyword&focus=applications-storymap>
redirected to a page titled "Sign In", displaying "Sign in to Montana Fish,
Wildlife & Parks". It is not an anonymous replacement. No sign-in was attempted
and no substitute destination was selected. The owner subsequently approved an
explicit unavailable state, implemented and verified locally as recorded above.

## AL-046 Follow-up: Owner-Approved Unavailable State

The public app "ESRI Showcased NCC Apps (English)", item
`bd073fd595154516987e927fae85baac`, is owned by `NCC_Geomatics`. Its saved
`values.group` is `6b9031513b8244a6b21f8dba0931cddf`. Anonymous metadata and
content requests for that group both return ArcGIS error 403, `GWM_0003`, despite
HTTP 200. This does not prove deletion.

The organization's StoryMaps-filtered gallery redirected to "Sign In", displaying
"Sign in to National Capital Commission". No sign-in was attempted. The owner
approved an unavailable entry, not a replacement with this sign-in-only gallery.
The local implementation and verification are recorded above.

## NOAA Follow-up

The owner selected
<https://web.archive.org/web/20250223200002/https://oceanservice.noaa.gov/map-stories/welcome.html>.
The NOAA organization tile now uses that exact capture in production.
Earlier Chromium verification confirmed HTTP 200, title "NOAA's National Ocean Service: Story
Maps", and the Story Maps heading. The targeted regression failed before the
change and passed afterward. Postdeployment normal-click checks failed: the
empty `a.party-tile.noaa` computed to `display:inline` with a 0x0 bounding box at
1280x720. The original soft-404 and zero-size observations remain historical evidence.

The homepage relies on a remote archived `newhome.css`, which can fail or arrive
late. The local repair supplies scoped organization-tile styles and readable
labels for all twelve existing organization links, preserving their destinations.
No local logo assets were available; no replacement logos were invented. The
styles explicitly set sizing so later archived CSS cannot change the tile layout.

The new generated-stylesheet/content regression failed before the fix and passed
afterward. Desktop 1440x900 and mobile 390x844 screenshots and bounds checks showed
readable tiles without text overflow. With `newhome.css` blocked, normal NOAA clicks
opened the exact capture with its matching title and `window.opener === null` in
fresh anonymous browsers on both viewports. Only the legacy stylesheet was blocked;
the destination content was not overridden. No forced click or sign-in was used.
This rendering repair is local and pending deployment; the other organizations'
unresolved destination findings are not closed by restoring their controls.
All 75 Node tests passed after the repair. The landing build passed; the ten-build
deployment gate has not been rerun and no code has been pushed or deployed for
this follow-up.

## Playlist Follow-up

The owner supplied the correct first Playlist example destination:
<https://storymaps.esri.com/archives/stories/2013/20towns/>. The landing build now
rewrites the old `/stories/2013/20towns/` link to that URL, preserving the existing
screenshot and isolated new-tab behavior. The regression failed before the fix;
all 67 Node tests passed afterward, and the local preview was rebuilt. This
correction is not deployed. The original crawl counts remain historical.

Chromium loaded the archived page as "Smithsonian's 20 Best Small Towns to Visit
in 2013 (and 2012)" and rendered its narrative and town list. Analytics/consent
scripts still reported errors, so this is not an error-free browser run. The app
uses ArcGIS JS 3.4 and separate `javascript/map.js` and `javascript/layout.js`
files, unlike Story Locator's ArcGIS JS 3.9 and combined viewer bundle.

Story Locator initially had two independently verified blockers:

1. Its [viewer bundle](https://storymaps.esri.com/stories/2013/storylocator/app/javascript/Playlist-viewer.min.js)
  contains a literal newline inside a quoted Facebook sharing URL, between
  `http://www.` and `facebook.com/sharer/sharer.php`. The original bundle fails
  JavaScript parsing at line 54, before the map initializes. This is not merely
  an error introduced by the Dojo loader.
2. Removing that one newline in a browser-only response override makes the bundle
  parse and advances startup to "Loading map", but then displays a sign-in
  dialog for Web Map `9ec6c45f6ad249a8993527614a850077`. An independent anonymous
  item request returns ArcGIS error code 403, "You do not have permissions to
  access this resource or perform this operation." No sign-in was attempted.

The owner has since shared Web Map `9ec6c45f6ad249a8993527614a850077` publicly.
A fresh anonymous metadata request now returns `access: public` and title
"Explore the Growing World of Story Maps". The permissions blocker is resolved.
Before the owner's JavaScript repair, the hosted bundle contained the malformed
string: line 54 ended with
`window.open("http://www.` and line 55 started with
`facebook.com/sharer/sharer.php?s=100"`. The repair removed the newline between
them. Searching for `facebook.com/sharer/sharer.php?s=100` locates that source
even if local line numbers differ.

The proposed `/archives/stories/2013/storylocator/` alternative returns 404.
The hosted JavaScript repair was still necessary at that point. A legacy Bitly request also failed
after the earlier browser-only syntax repair; further dependency checks should
follow the actual bundle repair. No hosted JavaScript or ArcGIS item was changed
by the assistant in this comparison. Temporary comparison evidence is in
`/tmp/classic-playlist-comparison.json`.

The owner subsequently repaired the hosted bundle. A fresh fetch confirms that
the broken newline is absent and the complete bundle parses successfully. Fresh
anonymous Chromium loads, without response overrides, render "Explore the Growing
World of Story Maps" and its story list; the loading/updating indicator clears,
the map container is present, and no sign-in prompt appears. No page JavaScript
errors were observed during the first load. Both identified startup blockers are
resolved. This check does not certify every historical story link, map tile, or
sharing/analytics dependency.

## Local Versus Production

At the original crawl, of the initial 34 automatic flags, two were valid redirects.
Of the remaining 32, 26 appeared in local output and six URL spellings were
production-only:

- The old Flitsmeister example.
- The inactive custom-domain Kentucky Bucket List URL.
- The Veterans example.
- San Diego Shortlist, with and without its trailing slash.
- Footpaths of Erissos.

Those six, plus the subsequent NOAA, 20 Towns, FAQ caption-example, introduction
presentation, singing-presentation, Bare Earth, and owner-approved Audubon link fixes,
were the thirteen destination tasks included in the deployed checkpoint above.
The earlier 34 automatic flags are not the full
manually reviewed triage inventory. Deploying those fixes did not repair the
whole archive; the current checklist also includes blank destinations, download
label mismatches, placeholders, and verification/decision tasks.

The earlier [example audit](archive-examples-audit.md) initially found two blocked
HTTP layer metadata requests in Epic Flight. The owner corrected both saved Web
Map URLs to HTTPS; a fresh browser retest passed without overrides or browser
errors at 2026-10-08 01:55:27+00:00[UTC]. That issue is resolved. Runtime loading
still cannot be certified solely from an HTTP 200 response.

The temporary HTTPS preview's failure to redirect slashless runtime directory
URLs is a separate local-server issue. Production correctly redirects the Lincoln
Tour URL to its trailing-slash form. It was not counted as a production failure.

## Reproduction and Limits

[audit-archive-links.mjs](../../scripts/audit-archive-links.mjs) reproduces the HTTP
inventory and redirect/content checks:

```sh
PLAYWRIGHT_NODE_MODULES=/path/to/external/node_modules node scripts/audit-archive-links.mjs /tmp/classic-archive-link-audit
```

It uses six concurrent requests, 15-second per-request timeouts, and a ten-hop
redirect limit. Response bodies are capped and binary download bodies are not
retained. It writes the raw inventory and results to the specified directory.
Browser follow-up and manual classifications are recorded in the evidence file;
they are not inferred automatically by that first-pass script.

This covers outbound anchors on all archive pages, not a recursive crawl of
third-party sites. No sign-ins, submissions, or ArcGIS content writes were made.
Email links, deliberately disabled controls, every media dependency, and every
interactive state of third-party destinations are outside this link audit.
Unflagged HTTP responses mean no failure was observed by these checks, not that
every external application's functionality was exhaustively tested.
