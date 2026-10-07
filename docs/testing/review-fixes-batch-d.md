# Batch D Verification

## D1: View-Only Crowdsource

Crowdsource now stages the SHA-256-verified official 0.10.0 release. Its
manifest records the release, three exact patches, and four removed builder
bundles. Raw-source fallback and EJS renaming are removed. Publication keeps
the existing single builder-query guard.

The published-template regression failed against the old Crowdsource output.
The release regression failed before the manifest/build changes. It now
checks exact replacement counts, missing-target rejection, removed builder
files, `BUILD_SOURCE`, and the single published guard against the real release.

Local HTTPS Chromium checks passed for story
`f1fcc302b0864b0c94beffc5177da2b8`, at 1280 and 390 px, for plain, `edit=true`,
and `fromScratch=true` URLs. All six cases had builder mode false, no
Participate button/text, and zero page errors, console errors, failed
requests, or HTTP errors. Desktop rendered 12 gallery items and Explore Map
brought the map into the viewport; mobile rendered 14 items and opened the
gallery. Screenshots were captured after the transitions, not merely after
gallery elements entered the DOM.

Run the release regression and local HTTPS checks from the repository root:

```sh
node --test scripts/tests/runtime-release.test.mjs
PLAYWRIGHT_NODE_MODULES=/path/to/external/node_modules \
  node scripts/validate-release-viewers-browser.mjs
```

The browser script expects a built `publish/`, uses the project base path by
default (override `SITE_BASE_PATH`), and creates an ephemeral self-signed
localhost server. Playwright is external tooling, not a repository dependency.
It writes results and screenshots to the temporary directory it reports,
then removes its temporary certificate and private key.

Owner validation remains pending after an approved deployment: open the
live Crowdsource viewer on desktop and phone and confirm the map/gallery
work and participation is unavailable. No automated sign-in is performed.

## D2: Verified Release Fallbacks

Cascade, Shortlist, and Map Series retain Grunt-first builds. Failed or
incomplete builds now use checksummed official releases, never raw source,
local release caches, or Git-history output. Cascade's obsolete CDN fallback
and checksum list are removed. `CLASSIC_RUNTIME_SOURCE=release` exercises
the release path directly. All four Batch D runtimes publish `BUILD_SOURCE`,
and CI validates and records these markers in its run summary.

Release entry points inherit `appid` and `authorizedOwners` from their
existing upstream source entry points through exact, single-occurrence
replacements. No upstream source files were modified.

### Approved URL-ID Precedence

Browser testing found that the official bundles prefer a configured default
ID over a URL ID. Copying the source defaults therefore loaded San Diego,
Paris Cafes, and Remembering Rupert instead of the required test stories.
The owner approved an additional release-only patch: a URL `appid` that is
exactly 32 hexadecimal characters takes precedence; absent or malformed IDs
retain the existing default behavior. Each manifest records its exact patch.

Tests execute the patched `getAppID` function from each real release bundle.
They cover mixed-case valid IDs, missing/empty IDs, malformed IDs, and wrong
lengths, and assert original/replacement occurrence counts. The precedence
tests failed against all three unpatched releases before the patch was added.

### Validation

- All 60 Node 24 tests passed.
- The three failed-Grunt/bad-checksum regressions failed against the old
  fallback scripts and now pass. Forced-release/provenance tests likewise
  failed before implementation. The checksum helper rejects altered input
  before extraction, and missing exact patch targets fail closed.
- All ten normal deployment build scripts completed with no source override.
  Sources: Cascade `release:1.23.0`, Shortlist `release:2.12.0`, Map Series
  `grunt`, and Crowdsource `release:0.10.0`.
- All 12 full-output link, template, and build-source checks passed. The
  build-source gate was demonstrated failing on the old unmarked output.
- Forced-release HTTPS browser checks passed for Shortlist
  `5a9c34acf59a49f0a67d5f7293b44d6b` (The Raised Bogs of Ireland), Map Series
  `77245a2c7bb540878fd3b24ebd048b20` (Stewardship), and Cascade
  `dbc3574e3d0d4f4a81ae95f2e86b0dc2` (Palau). All 12 combinations of
  1280/390 px and plain/`edit=true` rendered the intended title with loading
  overlays removed, no visible Edit controls, and no console, page, request,
  or HTTP errors.

Use `RUNTIME_FILTER=shortlist,mapseries,cascade` with the browser command
above to run only D2 checks. Without a filter it checks D1 and D2.

Normal branch CI and live owner checks remain separate gates. No production
deployment is authorized by this verification record. After an approved
deployment, the owner must confirm Shortlist no longer shows Edit and that
Map Series and Cascade still load.
