# Redistribution Resolution Plan

## Scope and Decision Rules

This proposed plan uses the exact paths and hashes in the
[current inventory](../testing/remaining-content-inventory.json). The 827
review candidates and 4,518 runtime-context entries are not counts of unlicensed
works. Existing public-source, Shortlist font and notice decisions remain valid
within their recorded scope. No new removal, replacement or rights acceptance
is authorized by this plan.

For each unique content hash, record every retained path, source URL/revision,
rights holder if known, applicable terms, intended use, required credit,
evidence reference and owner disposition. Deduplicate research by hash, but
apply the final decision to every shipped and repository copy. Similar names
or thumbnails are not proof of identical content or common rights.

Allowed dispositions are:

- **Retain with evidence:** record the grant or owner-confirmed basis and satisfy
  its terms, including notices, source availability and visible attribution.
- **Replace:** obtain approval for independently authored or suitably licensed
  replacements, preserve behavior and archive originals locally before removing
  any tracked or shipped copy.
- **Defer outside release:** preserve material locally and verify its exclusion
  from new release artifacts. If it remains in a repository to be transferred,
  its repository redistribution decision is still required.
- **Owner-approved risk acceptance:** record exact paths/hashes, intended
  redistribution and the owner's decision. This is not independent legal
  certification or a license grant from a third party.

## Work Sequence

### Execution Checkpoint

The [release membership report](../testing/release-content-membership.json)
now compares the recorded candidates with the fresh local artifact checked in
session 0003. Of 827 non-runtime-context candidates, 282 paths have exact copies
in the artifact: 19 site-source files, four Tailcoat fonts, 180 other assets,
75 catalog/captured assets and four Basic social fonts. All 350 matching output
copies were independently byte-compared with `cmp`, including duplicates.
The artifact has 2,927 files; the report records its deterministic path/size/hash
manifest digest and the source inventory digest.

Both unresolved font families are actually included in this artifact, not just
referenced in unused source. Their [bounded upstream investigation](runtime-font-provenance.md#execution-investigation)
did not establish exact glyph provenance. Owner evidence or a specific
retain/replace decision is required before clearing that cohort.

The 545 candidates without exact matches are **not automatically excluded or
cleared**: archive HTML and styles/scripts can be transformed by the build,
and content may be embedded or fetched remotely. Source retention and artifact
distribution remain separate questions. This checkpoint changed no font,
image or runtime source and accepted no new rights. Subsequent notice-text
changes do not retroactively change this artifact snapshot.

### Replacement Proposals for Owner Review

The owner was unavailable during execution. General autonomy was not treated
as image/font risk acceptance or approval of a specific replacement.

| Cohort | Proposed fallback | Acceptance checks before any removal |
| --- | --- | --- |
| Basic social font | Reuse verified Font Awesome 4.7.0 files from Map Tour, mapping the five semantic classes to equivalent glyphs and preserving OFL/copyright notices | Owner-approved appearance; share and up/down controls; all formats matched to pinned source |
| Tailcoat | Inventory archive consumers including data-icon attributes, breadcrumbs and button states; map generic controls to verified Ionicons; handle custom/brand glyphs separately | Approved mapping for every used glyph and desktop/mobile archive checks |
| Copied catalog/tutorial images | Use authored synthetic examples and approved media, or propose excluding affected archive sections from a future release | Approval of replacements or reduced archive scope; preserve originals locally before removing tracked copies |

These are proposals, not implemented substitutions. All original font and
image bytes remain unchanged. Deferring research does not resolve inclusion
in a transferred repository or new release.

| Order | Cohort | Proposed action | Completion evidence |
| --- | --- | --- | --- |
| 1 | Eight Tailcoat/Basic Fontello files | Trace original glyph selections and terms; request owner retention decision or approve replacement if evidence is unavailable | Font-specific evidence, credits, and desktop/mobile comparison; no deletion of referenced fonts |
| 2 | Shipped catalog thumbnails and site images | Join inventory hashes to the selected publish artifact; group exact duplicates; identify source and intended-use conditions | Every shipped image has a recorded disposition and any required visible credit |
| 3 | Copied archive HTML, scripts, styles and embedded media | Separate application code from captured editorial/third-party content; confirm archive-use terms or propose an approved reduced archive | Per-group terms with exact path/hash membership; link and visual regression checks |
| 4 | Non-shipped examples and schema captures | Propose deferral from new releases; retain locally; separately decide whether inclusion in the transferred repository is acceptable | Artifact exclusion plus owner repository-scope decision |
| 5 | Runtime source/patch context | Reuse existing pinned-source and notice evidence; investigate only unmatched or changed portions | Specific differences resolved, not a repeat blanket audit |
| 6 | Selected release and account use | Confirm required Esri/data-provider attribution and account eligibility for the intended operator | Attribution evidence below, owner eligibility confirmation and hosted acceptance |

The owner decides retain/replace/risk acceptance; engineering collects evidence,
implements only approved changes and verifies artifact membership. Reviewers
should escalate uncertain third-party grants rather than infer them from public
availability, a root license or a font generator name.

## Attribution Verification

Official requirements are documented in the
[SDK licensing guide](https://developers.arcgis.com/javascript/latest/licensing/)
and [Esri/data attribution guide](https://developers.arcgis.com/documentation/esri-and-data-attribution/).
Esri attribution must be discoverable and unobstructed, including applications
without maps. Map data-provider attribution must remain visible or accessible
through the documented expandable control and reflect the actual loaded sources.

On 2026-10-17, isolated Chrome checks used the freshly assembled local release
at 1440 x 1000 and 390 x 844. Shortlist and Map Journal displayed their native
Esri mark and provider credits in map views. Shortlist's observed sources
included Esri, TomTom, FAO, NOAA and USGS; its desktop extent additionally named
Garmin, EPA and USFWS. Journal displayed "Esri Data and Maps 2011". These are
observed strings, not a permanent provider list or a comparison against every
loaded layer's terms. No authenticated session or write request was used.

Screenshots were checked after loading overlays disappeared. Journal's mobile
cover is not its map: section 2 was opened for the map check. Shortlist's mobile
introduction also covers its map: a category was opened before checking the
unobstructed map attribution. A bounding box or nonempty DOM text behind these
screens must not be counted as visible attribution.

**Result: sampled map credits confirmed; overall attribution clearance remains
open.** The observed legacy marks were logos, not literal "Powered by Esri"
text. The runtime notice index now includes literal Powered by Esri text and
an Esri link. All eight generated pages passed desktop/mobile Chrome checks,
sixteen checks total. The document-head license link still does not provide
visible navigation. Do not infer that these alone satisfy the
current text/discoverability requirement, particularly on no-map/cover screens.
Archived site logo removal is likewise not proof of compliant replacement
attribution, nor grounds to restore branding without review.

Before publication, verify all eight runtimes, gallery/archive and map/no-map
states. Provide or verify discoverable "Powered by Esri" text using an approved
shared control where needed. Test the truncated provider-credit expansion on
touch devices, zoom-dependent credits and operational-layer acknowledgments.
Compare against the actual service/item metadata and applicable terms; obtain
Esri clarification if relying on legacy-logo treatment. Repeat on the selected
hosted artifact. License packaging and this two-runtime sample are not a legal
certification or blanket confirmation for arbitrary user-supplied maps.

## Release Gates and Deferrals

**Changed 2026-10-17:** the owner moved this review to "before any new public
release". It no longer gates the repository transfer. See
[transfer decisions](../../.github/prompts/transfer-decisions.prompt.md).
Wherever the text below says "transfer", read "new public release".

Do not describe this plan as completed rights clearance. Before a transfer or
new publication, approve the exact repository and artifact content sets, resolve
or explicitly decide every applicable remaining candidate, verify account/use
conditions, and perform hosted acceptance. Keep unresolved material out of a
new release unless its inclusion has a documented basis and owner approval.

Git-history clearance is not a migration gate. Retained deployments remain
deferred cleanup after full production acceptance. Neither exception clears
unresolved content for a new release. Commit/push of this planning checkpoint
does not authorize Pages deployment, transfer, DNS, OAuth or account changes.
