# Classic Storymaps Viewer Pages

Monorepo for hosting Classic Storymaps landing and per-app viewer helper pages under `/templates/classic-storymaps`.

## Initial Contents
- `.github/prompts/plan-storymapsSiteDeploy.prompt.md` - primary execution checklist and scope for this repo
- `apps/` - app-specific page implementations
- `docs/` - deployment, operations, and architecture notes

## Verified Runtime Releases

Crowdsource always uses Esri's verified 0.10.0 release with view-only patches.
Cascade, Shortlist, and Map Series attempt Grunt first, then download a pinned
official release if the build fails or lacks compiled viewer files. Each ZIP
must match its runtime manifest's SHA-256; failure stops the build. Raw source,
local release caches, and historical publish snapshots are not fallbacks.

Set `CLASSIC_RUNTIME_SOURCE=release` when running any of those three build
scripts to exercise the release path directly. Release configuration inherits
`appid` and `authorizedOwners` from the runtime's source entry point. Their
release-only ID-selection patches prefer a valid URL `appid` while retaining
the source default when the URL ID is absent or malformed. Their
`BUILD_SOURCE` files record `grunt` or `release:<version>` and survive publishing;
CI records these values in its run summary. Old ignored `release-*` directories
are no longer used. See [Batch D verification](docs/testing/review-fixes-batch-d.md).

## Local Build and Preview

`publish/` is generated output and is no longer tracked. Build it locally or use
the CI artifact; do not commit generated files. Existing historical copies stay
in Git history, but builds no longer depend on them.

Prerequisites: Node.js 24 with npm, Git, Bash, curl, tar, unzip, and `sha256sum` on PATH;
Python 3 is used for the preview server. Dependency downloads need network
access. From the repository root, run the same build sequence as CI:

```sh
set -e
export SITE_BASE_PATH=""
node --test scripts/tests/*.test.mjs
bash scripts/build-maptour-runtime.sh
bash scripts/build-swipe-runtime.sh
bash scripts/build-mapjournal-runtime.sh
bash scripts/build-mapseries-runtime.sh
bash scripts/build-cascade-runtime.sh
bash scripts/build-shortlist-runtime.sh
bash scripts/build-crowdsource-runtime.sh
bash scripts/build-basic-runtime.sh
bash scripts/build-classic-storymaps-landing.sh
bash scripts/build-classic-storymaps-runtime-publish.sh
PUBLISH_CHECK_ROOT=publish node --test scripts/tests/check-links.test.mjs
python3 -m http.server 8000 --bind 127.0.0.1 --directory publish
```

Open `http://127.0.0.1:8000/`. Stop the server with Ctrl+C. Choose another port
if 8000 is occupied. This preview uses an empty base path so the output is served
at the local root; GitHub Pages uses the repository base path described below.
Builds write ignored dependencies/output inside runtime directories and may
change tracked upstream build metadata. Review such changes separately; do not
commit them as part of generated output.

## Tests

From the repository root, run the tests with Node.js 20 or later:

```sh
node --test scripts/tests/*.test.mjs
```

Tests use Node's built-in test runner and require no additional dependencies.
The explicit file glob works on the Node 24 runtime used by CI.
Add regression tests as `scripts/tests/*.test.mjs`. The Pages workflow runs
the suite before building; a test failure stops the build and deployment.

## Runtime Import Reproducibility

With Node.js 20 or later, Git, and access to the public source repositories:

```sh
node scripts/check-runtime-reproducibility.mjs
node scripts/check-runtime-reproducibility.mjs maptour
```

The default checks Map Tour, Swipe, and Map Journal. Each check fetches the
manifest's pinned commit into a temporary directory, applies its listed patches
in order, and compares the complete imported tree against the local `upstream/`
tree. Existing import scripts are not invoked because they replace that tree.
No builds, dependency installs, or changes to `upstream/` occur.

The command emits one JSON array and exits nonzero for any patch failure,
missing or unexpected file, content difference, or executable/symlink mode
difference. Comparison includes tracked working-tree files and nonignored
untracked files, but excludes ignored build caches. It is byte-exact: line-ending
changes remain differences. After a patch failure, remaining patches are still
attempted and the partial result is compared, without claiming reproducibility.

See [Batch C verification](docs/testing/review-fixes-batch-c.md) for the recorded
results and patch work still needed.

## Deployment Base Path

Both publish scripts accept `SITE_BASE_PATH`, defaulting to empty for a root
custom domain. Use `/classic-storymaps-viewer-pages` for the GitHub Pages project
address, or another absolute path for a nested deployment. The workflow reads
the GitHub repository variable `SITE_BASE_PATH`; configure it for the intended
address before deploying. This change does not set the repository variable.

Source HTML uses `__SITE_BASE_PATH__` for handwritten root links. Build the
landing before previewing it; the scripts substitute the configured prefix and
rewrite generated HTML and CSS URLs. Compatibility redirects and catalog
runtime links retain the same prefix. Unmirrored Wayback references remain
external archive URLs, whose availability is not checked by the local tests.

The default link tests build the real landing with lightweight runtime fixtures
so they can run before the legacy runtime builds. To audit the full artifact
after building all runtimes and publishing with the same base path:

```sh
SITE_BASE_PATH=/classic-storymaps-viewer-pages PUBLISH_CHECK_ROOT=publish node --test scripts/tests/check-links.test.mjs
```

Use an empty `SITE_BASE_PATH` in that command for a root-domain build.

All pushed branches run tests and builds; only `main` can deploy. CI uses pinned
Node 24 actions, grants deployment permissions only to the deploy job, and runs
the full-artifact link audit before upload. Runtime npm installations disable
lifecycle scripts. Downloaded runtime releases must match their manifest's
SHA-256 before extraction.

See [Batch B verification](docs/testing/review-fixes-batch-b.md) for local build
results, action and checksum provenance, fallback limitations, and pending
hosted checks.

## Story Browsing and Launchers

The Viewers page starts with eight app-type cards. Each whole card opens its
launcher. **Browse Stories** replaces those cards with an in-page gallery;
**Hide Stories** restores them. The manual app-ID form remains available.

Signed-in browsing resolves the current ArcGIS Online username, searches owned
Web Mapping Applications, and validates ownership, type, ID, Classic tags or
typeKeywords, and supported runtime before displaying a card. Search, app-type
filtering, sorting, refresh, and pagination are available. Pages contain up to
24 stories, with at most three candidate requests per action. A filtered-empty
page can still have more results; displayed counts are not account-wide totals.

Signed-out browsing uses nineteen curated examples. The shared
`exampleStoriesByRuntime` records in
[classic-storymaps-config.js](apps/classic-storymaps-site/assets/js/classic-storymaps-config.js)
also supply each launcher's two to eight screenshot links. Launcher headers
reuse the catalog image and description. A closed **Advanced tools** disclosure
retains the existing manual launch, supported web-map inputs, and download/export
controls. Entire story cards and example screenshots open the story in a new tab.
Cards without conversion have no separate View button; their title link supports
keyboard navigation. When Convert is available, the card also shows a green View
button beside a blue Convert button. Both actions remain independently clickable.

Set `gallery.publicGroupId` in that configuration when a curated public ArcGIS
Online group is ready. Group browsing replaces the built-in examples, requests
only public items without credentials, and does not silently substitute examples
for an empty or inaccessible group. The group, included items, and their required
services/media must be publicly accessible. This change does not create or share
any ArcGIS items or groups.

`gallery.converter.enabled` is **false** until an owner-approved converter release
containing ownership enforcement and app-ID prefill is deployed. The owner has
verified the sign-in/prefill flow, but the confirmed locked production release
predates those changes. When enabled, Convert is
available only to validated signed-in users for Tour, Journal, Series, Cascade,
and Swipe. Its configured destination is currently
`https://regal-sable-0a6dde.netlify.app/?appid=<item-id>`; no credentials are passed,
and conversion is not started automatically. Switching to
`https://convert.classicstorymaps.com/` requires separate domain and OAuth
readiness work. Basic, Shortlist, and Crowdsource do not receive Convert buttons.

The gallery sends authenticated REST requests only to `www.arcgis.com` using
`X-Esri-Authorization`, not token-bearing rendered URLs. Thumbnails use temporary
blob URLs with generic-image fallback; missing images do not block View.
Logout, expiry, account replacement, hiding the gallery, and page exit cancel
requests and release account-bound state. Browser-history restoration reloads
the gallery. The shared-origin cookie limitation below remains unchanged.

After building, the existing optional Playwright runner can exercise all eight
launchers and the gallery at desktop, phone, and narrow-phone widths:

```sh
SITE_BASE_PATH=/classic-storymaps-viewer-pages \
RUNTIME_FILTER=gallery,launchers \
node scripts/validate-release-viewers-browser.mjs
```

Playwright must already be available. `PLAYWRIGHT_NODE_MODULES` can point to an
existing directory containing its package; no dependency is added to this repo.
For a root-hosted build set `SITE_BASE_PATH=""` and, for a separate build tree,
set `PUBLISH_CHECK_ROOT` to that directory. The runner starts an isolated local
HTTPS preview, uses synthetic intercepted ArcGIS sessions rather than signing
in, checks pagination/account changes/expiry/stale responses, and downloads
synthetic item metadata through each launcher's existing export control.

Real account ownership results, private thumbnails and private runtime launches
still require owner-controlled acceptance on a registered OAuth origin.
Mocked sessions do not establish those results or deployed converter readiness.

## Authentication and Shared-Origin Risk

Shortlist's [staged viewer-only patch](runtimes/shortlist/patches/viewer-only.mjs)
disables the owner-enabled Edit control and the helper that switches to builder
mode. It applies after either Grunt or official-release staging, without changing
upstream files or authentication. Builder bundle removal and publish-time query
guards remain in place. The official-release regression failed before this fix;
local browser checks loaded Raised Bogs of Ireland, simulated owner eligibility,
and confirmed no visible Edit control or builder navigation. The paired gallery
actions passed desktop and mobile checks; all 137 Node tests and 68 publish
checks passed. These are local checks; see the
[release verification notes](docs/testing/archive-examples-audit.md) for deployment
status and production evidence.

Owner decision for review fix A1: continue on the shared GitHub Pages origin
with a requested 120-minute ArcGIS token. The catalog uses the OAuth response's
`expires_in` for the cookie's `Max-Age` and JSON expiry, and retains an absolute
expiry in session storage so reloading cannot extend the session. Stored tokens
without expiry metadata require signing in again. Sign-out clears the local
token, expiry metadata, and `esri_auth` cookie; it does not revoke already issued
tokens at ArcGIS.

OAuth returns accept only `access_token` with a matching, single-use random
128-bit state stored in the initiating tab. The pending state and return hash
are cleared on callback; a valid callback restores the locally stored path.

The `esri_auth` cookie remains JavaScript-readable with `Path=/` because the
legacy runtimes consume it. Other Pages sites served from
`https://dasbury-esri.github.io` can read this session cookie. Cookie paths,
`SameSite`, and `Secure` do not isolate those sites from one another. Shorter
token lifetimes reduce the exposure window but do not remove this risk.
Isolation from other Pages projects requires a dedicated origin. That migration
is deferred by the owner decision; author-written story HTML running on this
site's origin remains a separate risk even on a dedicated origin.

References: [ArcGIS OAuth authorize parameters and response](https://developers.arcgis.com/rest/users-groups-and-items/authorize/)
and [MDN cookie attributes and path limitations](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#attributes).

### Local OAuth Preview

Register a development OAuth client for user authentication with this callback:
`https://127.0.0.1:61326/classic-storymaps-viewer-pages/viewers/`.
Start the local HTTPS preview from the repository root:

```sh
CLASSIC_DEV_CLIENT_ID=YOUR_DEVELOPMENT_CLIENT_ID \
CLASSIC_DEV_CONVERTER_URL=http://localhost:8888/ \
PORT=61326 SITE_BASE_PATH=/classic-storymaps-viewer-pages \
node scripts/preview-server.mjs
```

The server injects the client ID and canonical Viewers callback into that page's
response only. It does not modify built files, runtime pages, or the production
client ID. Without the environment variable, the existing configuration is used.
Use the registered hostname, port, and path consistently; a different preview
address needs its own registered callback. The server uses a temporary self-signed
localhost certificate, so a browser may require local certificate acceptance
after restart. Only a client ID is needed here, never a client secret.
Real sign-in and private-content acceptance remain owner-controlled checks.

`CLASSIC_DEV_CONVERTER_URL` optionally enables Convert in preview responses and
targets an already-running local converter. Only HTTP/HTTPS loopback destinations
without credentials, query strings, or fragments are accepted. HTTP links require
this explicit development override; normal gallery configuration remains
HTTPS-only. Owned-story and supported-template checks still apply, and links pass
only `appid`. Omit this setting to retain the production conversion gate.
The local converter has its own sign-in; opening it does not start conversion.

The development handoff passed 36 focused tests and an isolated browser check:
a synthetic signed-in gallery opened the actual local converter, which captured
the item ID while signed out. Signed-out and unsupported-template Convert actions
remained absent. The check attempted no writes and did not use a real session.

## Next Steps
1. Refine the site deployment plan prompt for phase sequencing and effort sizing.
2. Define route contract and adapter matrix for phase-1 apps.
3. Implement shared validation and page shell.
