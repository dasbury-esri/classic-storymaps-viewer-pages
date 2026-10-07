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
