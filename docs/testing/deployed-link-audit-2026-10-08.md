# Deployed Site Link Audit

Crawl completed: 2026-10-08 20:28:51+00:00[UTC]. Follow-up timestamps and observations
are in the [JSON evidence](artifacts/deployed-link-audit-2026-10-08/results.json).

Audited commit: `b3ba1d7c22dbbbb1cf2240fe4b9d0e6656eb4bee`, published successfully by
[Pages run 37836630862](https://github.com/dasbury-esri/classic-storymaps-viewer-pages/actions/runs/37836630862).
Production remains `https://dasbury-esri.github.io/classic-storymaps-viewer-pages/`.
No custom domain was enabled. Release gates passed: 112 Node tests, all ten builds,
58 complete-publish checks and both workflow jobs. The workflow used Node 24.

The [original burn-down](archive-link-audit.md) is complete: 64 resolved and 5 accepted.
This fresh audit expands into rendered story content without overwriting original
observations or reversing accepted limitations. New findings were not automatically fixed.

## Verified Cleanup Release

Verified live: 2026-10-08 23:34:04+00:00[UTC]. Release
`52606da58715ba74e1180a2711c6ae54533d5485` was committed, pushed and deployed by
[Pages run 37859406291](https://github.com/dasbury-esri/classic-storymaps-viewer-pages/actions/runs/37859406291).
Both build and deploy jobs succeeded. Local release gates passed: 116 Node tests,
all ten workflow builds and 62 actual-publish checks. CI used Node 24.

- All 88 deployed first-party HTML responses matched the tested build. No My Stories
  anchors remained. The deployed viewer policy and Cascade step-9 PNG matched local bytes.
- The live relative launcher link opened A walking tour of the National Mall with 46 points.
- The replacement PNG decoded in the live Cascade tutorial at 533 x 460.
- All eight DA-003 original items passed live startup and representative interactions.
  Normal authored-link clicks opened Transitions, the 2016 College Football Recruiting
  Class and 737 Novels in local viewers, with original IDs and no opener.
- Authored My Stories links in ways to make your story map sing were disabled;
  a dynamically inserted My Stories anchor could not run its click handler.
- The Sections guide's Cascade and other story map templates links used the approved
  Esri Classic product URL. The Great In-Between exposed 80 rewritten journal-entry
  anchors across DOM copies, all pointing to the approved Wayback homepage.

Sections again recorded a late canceled YouTube iframe request after passing its
interaction check. Crowdsource recorded three canceled feature queries during teardown.
These do not certify every remote media resource; individual story repairs remain separate.
The integrated browser did not expose a popup event, so normal-click popup verification
was completed in standalone Chromium with standard TLS validation.

DA-001, DA-002, DA-003, DA-005, DA-006 and DA-007 are resolved. The original crawl
observations below and the dated local follow-up notes remain historical evidence;
their earlier pending-deployment wording is superseded by this release verification.
The Pages API still reports `cname: null`, and `SITE_BASE_PATH` remains
`/classic-storymaps-viewer-pages`. The owner will enable the custom domain separately;
root-domain hosting requires an empty `SITE_BASE_PATH` and a corresponding rebuild.

## Countdown Ordering Follow-up

Verified locally: 2026-10-09 00:06:52+00:00[UTC]. At the owner's request, the
Countdown Overview now leads with Ports; 25 Busiest Airports occupies the former
Ports position at the end. The publishing transform swaps complete linked screenshots,
leaving the two middle examples and original capture unchanged. The ordering regression
failed before the change and passed afterward. All 63 actual-publish checks pass;
desktop 1440px and mobile 390px checks verified order, destinations and image decoding.
This follow-up was deployed in `efb0120a2d6943f858a6b9324bef49a08de7ccb2` and
verified live at 2026-10-09 01:17:42+00:00[UTC]. The published Countdown HTML
matched the tested local output. See the latest deployment verification in
[the archive example audit](archive-examples-audit.md). Repository transfer and
domain changes remain paused.

## Coverage

- 426 distinct HTTP(S) destinations, including HTTP/HTTPS aliases.
- 3,838 HTML/DOM observations; 1,453 distinct source/label/URL references.
- All 88 fetched first-party HTML URLs matched the tested build.
- 400 destinations received browser checks; non-HTML files were checked separately.
- All 24 successful PDF/ZIP destinations passed signatures, including eight source ZIPs.
- 38 public viewer examples received deeper startup, media and navigation checks.
- 36 interaction checks passed; two failed. Two passing records include late canceled frames.

The crawl used deployed HTML and rendered anchors, seeded with the homepage, archive
pages and top-level viewer HTML. First-party links were traversed recursively. External
destinations were checked, not recursively crawled. JavaScript/empty-hash controls were
inventoried rather than treated as network destinations. Accepted Gallery placeholders remain.

Anonymous Chromium ran at 1440x900, with 30-second navigation limits and up to 25 additional
seconds for apparent loaders. Known soft failures were independently checked for 45 seconds.
Production Playlist images and representative Blog clicks also passed at 1440px and 390px.
No sign-ins, certificate bypasses, form submissions, remote edits or new dependencies were used.

## Findings

**6 resolved groups, 6 open story groups and 3 story verification groups cover 106 destination URLs.** Nothing remains pending deployment. Counts include
aliases, not independent broken sites. The original 116 automated flags remain separate
from reviewed assessments. Exact URLs, referring pages/labels and observations are in JSON.

| ID | Priority | Status | URLs | Finding |
| --- | --- | --- | ---: | --- |
| DA-001 | P1 | resolved | 1 | My Stories links removed; text retained and live behavior verified. |
| DA-002 | P1 | resolved | 1 | Relative launcher example opens the National Mall tour live. |
| DA-003 | P1 | resolved | 8 | Authored cross-links use local viewers and original item IDs; verified live. |
| DA-004 | P1 | open | 1 | World Ecosystems Journal blocks navigation with a sign-in dialog. |
| DA-005 | P2 | resolved | 1 | Owner-replaced Cascade step-9 PNG decodes correctly live. |
| DA-006 | P2 | resolved | 5 | Retired Classic links and audited aliases use the approved product page live. |
| DA-007 | P2 | resolved | 10 | Travel-blog links use the owner-selected Wayback homepage live. |
| DA-008 | P2 | open | 14 | Authored reference links return HTTP errors. |
| DA-009 | P2 | open | 2 | Headquarters and NA-Pizza domains redirect to domain-sale URLs. |
| DA-010 | P2 | open | 1 | An external destination fails certificate validation. |
| DA-011 | P2 | needs-verification | 16 | Timeouts or temporary-unavailability responses. |
| DA-012 | P2 | needs-verification | 37 | Access/bot challenges prevent anonymous verification. |
| DA-013 | P3 | needs-verification | 7 | Images on external destinations fail to decode. |
| DA-015 | P2 | open | 1 | A restaurant shortlink redirects to a social profile. |
| DA-016 | P3 | open | 1 | DNR's glacial-landforms fragment is absent after redirect. |

DA-014 was a provisional review bucket; no entries remained after contextual review.

## Site Cleanup Versus Story Repairs

All remaining open or needs-verification findings belong to individual stories.
If individual story repairs are deferred, no additional site-level fix remains
identified by this audit. Deployment and live verification of DA-001, DA-002, DA-003,
DA-005, DA-006 and DA-007 are complete, as recorded above. This does not certify
untested content or authorize a custom-domain change.

Catalog story repairs by item ID and verified story title, retaining finding IDs as
issue categories rather than treating each category as the next site-level task.
The 80 distinct remaining destinations form 84 story/destination pairs across 15
stories because some stories share links. The counts include verification cases,
not only confirmed broken links. DA-004 is the ecosystems story's sign-in blocker;
DA-013 concerns images on linked destinations. Original statuses and evidence remain
unchanged so deferred work is not mistaken for resolved work.

| Story | Finding IDs | Affected URLs |
| --- | --- | ---: |
| [Explore a Tapestry of World Ecosystems](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/mapjournal/?appid=dc91db9f6409462b887ebb1695b9c201) | DA-004, DA-008 | 2 |
| [San Diego Shortlist](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/shortlist/index.html?appid=0584dbad6ebf433a96f1111f4cc7e3bd) | DA-008, DA-009, DA-010, DA-011, DA-012, DA-013 | 13 |
| [The Ten Most Damaging Hurricanes in U.S. History](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/mapseries/?appid=50aea84a9853491f994f775cb989ea92) | DA-008, DA-011, DA-012, DA-013 | 19 |
| [Some Places to Go in San Diego, California](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/maptour/?appid=d1ef0471365e400ebb540472b477871e) | DA-008, DA-009, DA-010, DA-011, DA-012, DA-013 | 13 |
| [Some Places to Eat in San Diego, California](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/maptour/index.html?appid=d5b2c90d8a53466f9c3efb0f25d13325) | DA-008, DA-009, DA-011, DA-012, DA-013, DA-015 | 18 |
| [ways to make your story map sing](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=dcd5d01e2b0342fe90cf3b8ca9ab8302) | DA-008 | 1 |
| [Palm Springs Shortlist](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/shortlist/index.html?appid=62eef62250984b188b7512ec8f1caadb) | DA-011, DA-012 | 3 |
| [The Bare Earth](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=36b4887370d141fcbb35392f996c82d9) | DA-012, DA-016 | 2 |
| [Arizona's Birds and Water](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/mapseries/index.html?appid=3c48121bd41945d68aacd1ded71841a4) | DA-012 | 2 |
| [How To Cascade: Sections](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=5cd671a4cf1844b7854220979574b927) | DA-012 | 3 |
| [How To Cascade: Media](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=c4ed68ecb9d54d398dbf46dcde881471) | DA-012 | 1 |
| [How To Cascade: Transitions](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=7a0c165e7b404073b686f95ef98d6241) | DA-012 | 4 |
| [How To Cascade: Multi-View Map](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=a644a02894d246b59ecad16fae25b767) | DA-012 | 1 |
| [How To Cascade: Map Legends](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=954145df6cf84e2d8bbea996438c99fb) | DA-012 | 1 |
| [Devastation in Nepal: Katmandu Before and After the April 2015 Earthquake](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/swipe/index.html?appid=97ab135daee04ee7bac9dac34f65277f) | DA-012 | 1 |

Exact destination indices per story are cataloged in `triage.storyRepairBacklog` in
the JSON evidence; each index retains its URL, referring labels and original checks.
The owner-managed ecosystems item remains untouched.

## DA-008 And DA-009 By Story

These findings span six distinct story items, not one. Titles below come from the
original browser deep checks. Group by item ID rather than viewer URL spelling;
repeated labels and DOM copies do not create additional affected URLs.

| Story | DA-008 URLs | DA-009 URLs | Affected References |
| --- | ---: | ---: | --- |
| [San Diego Shortlist](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/shortlist/index.html?appid=0584dbad6ebf433a96f1111f4cc7e3bd) | 2 | 1 | Sunset Cliffs, La Jolla Shores; Headquarters |
| [Some Places to Go in San Diego, California](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/maptour/?appid=d1ef0471365e400ebb540472b477871e) | 3 | 1 | Museum of Photographic Arts, Sunset Cliffs, La Jolla Shores; Headquarters |
| [Some Places to Eat in San Diego, California](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/maptour/index.html?appid=d5b2c90d8a53466f9c3efb0f25d13325) | 3 | 1 | Cafe Chloe, Liberty Public Market, Rubicon Deli; NA-Pizza |
| [The Ten Most Damaging Hurricanes in U.S. History](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/mapseries/?appid=50aea84a9853491f994f775cb989ea92) | 4 | 0 | NOAA Katrina PDF, A Dangerous Year, Hurricane Sandy, 1928-Okeechobee |
| [Explore a Tapestry of World Ecosystems](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/mapjournal/?appid=dc91db9f6409462b887ebb1695b9c201) | 1 | 0 | Global ecosystems / Ecological Land Units / ELUs: one shared URL; owner repairing this item |
| [ways to make your story map sing](https://dasbury-esri.github.io/classic-storymaps-viewer-pages/viewers/cascade/index.html?appid=dcd5d01e2b0342fe90cf3b8ca9ab8302) | 1 | 0 | Story Maps Resources |

The table contains 17 story/destination pairs across 16 distinct audited URLs:
Headquarters appears in two stories. HTTP/HTTPS Sunset Cliffs and La Jolla Shores
aliases remain separate audited URLs. DA-008 and DA-009 stay open; this reporting
change does not alter their links or the owner-managed ecosystems item.

## My Stories And Relative Examples

Verified locally: 2026-10-08 20:50:35+00:00[UTC]. The owner requested removing all
My Stories links and replacing hard-coded custom-domain examples with relative URLs.
Generated archive pages now retain My Stories wording without anchor wrappers. The
existing viewer link policy also disables those links in initially loaded and dynamically
inserted authored content. Original captures and the archived My Stories file remain;
the historical account interface itself is not repaired.

The Map Tour launcher now uses
`maptour/index.html?webmap=a5019e8c55d547eab69c0777dcd7509a`. Generated HTML is checked
for any remaining hard-coded custom-domain anchors. URL resolution is tested against
both project-prefix and root-domain hosting. The owner plans domain activation once
cleanup is complete; this step does not change domain, DNS, Pages or workflow settings.

All three new regressions failed before their respective fixes and passed afterward.
All 115 Node tests and 61 actual-publish checks pass. Desktop 1440px and mobile 390px
browser checks opened the National Mall tour through the launcher, retained unlinked
My Stories wording, disabled the real authored link in Make Your Story Map Sing, and
blocked the click handler of a dynamically inserted My Stories anchor.

DA-001 and DA-002 remain pending deployment until verified live. The My Stories link
within DA-006 is covered locally; its other product links are now covered by the
Classic Product Links follow-up below.
Changes are not committed or deployed. The observations below describe the original crawl.

## Retired Story Routing

Verified locally: 2026-10-08 20:56:48+00:00[UTC]. All eight DA-003 items remain
public and render through the matching Classic viewers using their original item JSON.
The existing viewer link policy now rewrites those exact host/template/item combinations
as authored links appear, including dynamic content. It retains labels, existing targets,
query strings and fragments, and applies opener protection. Other hosts and unverified
items are unchanged. Paths derive from the loaded policy script, not a hard-coded origin.

The routing regression failed before implementation and passed afterward. All 115 Node
tests and 61 actual-publish checks pass. All eight original items passed startup and
representative interactions. The four referring stories contain the rewritten links;
normal clicks opened Transitions, the 2016 College Football Recruiting Class and
737 Novels with correct item IDs and no opener. A browser fixture verified all eight
routes under root-domain hosting as well as the actual project-prefix preview.

Sections recorded a late canceled YouTube iframe request after passing its interaction
check, consistent with the earlier observation. Remote videos and map layers are not
comprehensively certified. No remote item JSON or upstream runtime source was modified.
DA-003 awaits deployment and live verification; these changes are not committed or deployed.

## Cascade Tutorial Image

The owner replaced the DA-005 asset locally. Independent `file` and macOS `sips`
checks identify a 533 x 460 PNG instead of the previously captured HTML response.
DA-005 awaits deployment and live verification. The original crawl evidence below
and in JSON remains unchanged. No production deployment was performed.

The owner is separately repairing DA-004 item `dc91db9f6409462b887ebb1695b9c201`;
leave its sign-in and media behavior unchanged for now.

## Classic Product Links

Verified locally: 2026-10-08 22:24:47+00:00[UTC]. The owner selected
`https://www.esri.com/en-us/arcgis/products/arcgis-storymaps/classic` for links to
`storymaps-classic.arcgis.com`. Archive publishing and the shared viewer policy now
replace that exact host, including HTTP, HTTPS and protocol-relative links. The
four audited redirect aliases on `storymaps.arcgis.com` are covered through the
`/en/app-list/`, `/en/app-list/cascade/` and `/en/gallery/` paths. Old query strings
and fragments are discarded in favor of the exact approved destination. Link text
and targets remain; dynamic viewer rewrites include opener protection.

My Stories links remain disabled under the earlier owner decision. Modern StoryMaps
URLs and unrelated hosts are unchanged. Original captures, item JSON and audit
observations are preserved. No domain settings or upstream runtime source changed.

Both direct-host and alias regressions failed before their respective implementation
and passed afterward. All 116 Node tests and 62 actual-publish checks pass. A browser
check of How To Cascade: Sections confirmed the authored Cascade and other story map
templates links use the approved destination. Dynamically inserted links were also
rewritten, while My Stories stayed unlinked. The destination independently loaded
Esri's Classic Story Maps retirement/product page. DA-006 awaits deployment and live
verification; no commit or deployment was performed in this step.

## Travel Blog Archive

Verified locally: 2026-10-08 22:31:55+00:00[UTC]. The owner supplied
`https://web.archive.org/web/20171023101933/http://crossingtherubikhan.com/` as the
replacement for travel-blog links. Both the audited `crossingtherubikhan.com` spelling
and the owner's `crossingtherubicon.com` spelling are covered, including `www`, HTTP,
HTTPS and protocol-relative URLs. Archive publishing and the shared viewer policy
use that exact archived homepage, discarding original article paths, queries and
fragments. This restores a navigable destination, not each article's original deep link.
Labels and targets remain; dynamic viewer rewrites include opener protection.

The regressions failed before implementation and passed afterward for all ten audited
DA-007 URLs. All 116 Node tests and 62 actual-publish checks pass. The Great In-Between
rendered 80 matching journal-entry anchors across its DOM copies, all using the
snapshot; no anchors remained on the original hosts. A dynamically inserted alternate-
spelling link was also rewritten. An independent fetch loaded the archived homepage;
its own outbound links and embedded media were not comprehensively tested.

DA-007 awaits deployment and live verification. Original captures, item JSON and
audit observations remain unchanged. No commit, deployment or domain change was made.
DA-008 and DA-009 links remain unchanged; the DA-004 owner-managed item is untouched.

## Priority Evidence

**DA-001: My Stories.** Returns 200 but renders a header, banner and persistent spinner,
not an account interface. Incoming links appear in all eight tutorials and the FAQ.
Authentication was not tested. Prefer an explicit archive/unavailable state or an
owner-approved destination. [Screenshot](artifacts/deployed-link-audit-2026-10-08/my-stories-loader.jpg).

**DA-002: Map Tour example.** The launcher link "If you'd like to view an example Story
Map Tour, click here" points to
`https://classicstorymaps.com/viewers/maptour/index.html?webmap=a5019e8c55d547eab69c0777dcd7509a`.
Navigation fails, and the Pages API independently confirms no active custom domain.
Correct the link under the project base; do not activate a domain as an audit fix.

**DA-003: Retired hosted viewers.** Eight links inside rendered stories still use
`nation.maps.arcgis.com/apps/...` or `story.maps.arcgis.com/apps/...`. They return 200
with title "Item Replacement" rather than the requested story. Shadow-root inspection
confirmed seven explicit "Replacement not available" notices; one HTTP target stayed
blank. The initial top-level DOM snapshots missed the shadow-root notices and must not
be read as eight spinner-only failures. A Transitions link was independently rechecked
for 45 seconds without rendering the story. The repaired archive-page
links to local guides work; cross-links inside their remotely authored narratives still
use retired hosts. Consider approved local viewer routes preserving public item IDs.
[Screenshot](artifacts/deployed-link-audit-2026-10-08/retired-transition-loader.png).

**DA-004: World Ecosystems.** Item `dc91db9f6409462b887ebb1695b9c201` opens "Explore a
Tapestry of World Ecosystems", but a sign-in dialog intercepts second-section navigation.
Several Wikimedia images also fail. A public item does not establish anonymous access
to all dependencies. No sign-in was attempted. Choose recovery, replacement or a notice.
[Screenshot](artifacts/deployed-link-audit-2026-10-08/ecosystems-sign-in.jpg).

**DA-005: False-success image.** Cascade `step9.png` returns 200 and `image/png`, but its
83,325-byte body begins `<!DOCTYPE HTML>`. The browser cannot decode it. Existence/status
checks alone missed this failure.

## Other Follow-ups

- DA-006: Classic Apps/Gallery/My Stories references inside authored content redirect to
  `storymaps-classic.arcgis.com`, which failed DNS resolution.
- DA-007: Ten `crossingtherubikhan.com` links fail DNS and browser navigation here;
  this does not prove every historical page has been deleted.
- DA-008: Fourteen recorded URLs include eleven 404 responses, one 410 and two 402s.
  HTTP/HTTPS Sunset Cliffs and La Jolla Shores aliases account for two duplicate
  destinations. Other entries include the Museum of Photographic Arts shortlink,
  Cafe Chloe, Liberty Public Market, Rubicon Deli, NOAA Katrina and Hurricane Sandy
  references, two newspaper articles, global ecosystems and Story Maps Resources.
  A 402/access-restricted response does not establish that an article was deleted.
  The global ecosystems link is inside the DA-004 owner-managed item and stays untouched.
- DA-009: The two entries are `http://theheadquarters.com/` and
  `http://www.na-pizza.com/`, not two aliases for Headquarters. Each browser check
  reached its own `forsale.godaddy.com/forsale/...` URL instead of venue information,
  despite HTTP 200. The landing pages showed Access Denied, so the evidence supports
  a domain-sale redirect, not a fully rendered sale listing. No venue closure is inferred.
- DA-010: `www.mtrp.org` fails certificate validation; do not bypass TLS to declare success.
- DA-011/012: Government, tourism, restaurant and photo-site timeouts, maintenance or
  anti-bot responses require follow-up, not automatic deletion or a claim of disappearance.
- DA-013: Broken remote images do not necessarily make the whole destination unusable.
- DA-015: `links.esri.com/sandiego/places/con_pane` reaches Facebook. Redirecting shortlinks
  bypass the direct-host social-link suppression.
- DA-016: DNR's glacial-geology topic loads, but `#glacial-landforms` no longer exists.

## Controls And Limits

The removed Idaho WMA URL returned 200 while displaying only "Loading map" after
30 seconds. It is absent from the deployed inventory and its Playlist image is unlinked.
This was a negative control, not a newly failing site link.

GitHub language bars and a video-buffer bar were false loader positives. Both Crowdsource
examples passed gallery/Explore Map interactions despite a detected overlay element.
These observations were not promoted to failures.

Refugee Camps was initially blank but rendered its title and narrative in a fresh context;
its accepted map/selection limitations remain. Audubon's accepted missing layer explains
one deep-validator failure and is not reopened. The other is DA-004. Sections and the
introduction each recorded a late canceled iframe after passing; neither is a zero-error claim.

Eight initial fragment candidates were reviewed separately: two FAQ GitHub anchors exist
with `user-content-` prefixes; two Gallery hashes belong to DA-006; two NOAA anchors were
blocked; one legacy sharing hash is not a section target. The DNR mismatch is DA-016,
not eight additional broken links.

This is a bounded anonymous audit, not a guarantee about future responses, every responsive
state, hidden interaction, cross-origin iframe link, video playback or map layer. Raw flags
are evidence, not automatic verdicts. Credential-like query values are redacted in the saved
JSON. No new finding was automatically repaired, accepted or removed during this audit.
