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

**12 open groups and 3 verification groups cover 106 destination URLs.** Counts include
aliases, not independent broken sites. The original 116 automated flags remain separate
from reviewed assessments. Exact URLs, referring pages/labels and observations are in JSON.

| ID | Priority | Status | URLs | Finding |
| --- | --- | --- | ---: | --- |
| DA-001 | P1 | open | 1 | My Stories remains on its loader. |
| DA-002 | P1 | open | 1 | Map Tour launcher example uses the inactive custom domain. |
| DA-003 | P1 | open | 8 | Retired hosted cross-links return 200 with unavailable or blank pages. |
| DA-004 | P1 | open | 1 | World Ecosystems Journal blocks navigation with a sign-in dialog. |
| DA-005 | P2 | open | 1 | Cascade tutorial step-9 PNG contains HTML. |
| DA-006 | P2 | open | 5 | Classic product links redirect to an unresolvable retired host. |
| DA-007 | P2 | open | 10 | Travel-blog destinations fail DNS resolution. |
| DA-008 | P2 | open | 14 | Authored reference links return HTTP errors. |
| DA-009 | P2 | open | 2 | The Headquarters aliases redirect to a domain-sale URL. |
| DA-010 | P2 | open | 1 | An external destination fails certificate validation. |
| DA-011 | P2 | needs-verification | 16 | Timeouts or temporary-unavailability responses. |
| DA-012 | P2 | needs-verification | 37 | Access/bot challenges prevent anonymous verification. |
| DA-013 | P3 | needs-verification | 7 | Images on external destinations fail to decode. |
| DA-015 | P2 | open | 1 | A restaurant shortlink redirects to a social profile. |
| DA-016 | P3 | open | 1 | DNR's glacial-landforms fragment is absent after redirect. |

DA-014 was a provisional review bucket; no entries remained after contextual review.

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
- DA-008: Includes Sunset Cliffs, La Jolla Shores, global ecosystems, an old NOAA Katrina
  PDF and other references/venues. Exact 404, 410 and 402 responses are retained.
- DA-009: Browser redirects reach a domain-sale URL, not venue information; access denial
  at the destination is also recorded.
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
