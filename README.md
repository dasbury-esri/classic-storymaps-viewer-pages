# Classic Storymaps Viewer Pages

Monorepo for hosting Classic Storymaps landing and per-app viewer helper pages under `/templates/classic-storymaps`.

## Initial Contents
- `.github/prompts/plan-storymapsSiteDeploy.prompt.md` - primary execution checklist and scope for this repo
- `apps/` - app-specific page implementations
- `docs/` - deployment, operations, and architecture notes

## Local Runtime Caches
- Extracted runtime release bundles under `runtimes/*/release-*` are treated as local fallback caches and are git-ignored.
- The current Cascade fallback at `runtimes/cascade/release-1.23.0` is intentionally kept local so `scripts/build-cascade-runtime.sh` can recover when the upstream legacy build cannot reproduce the original deploy output.

## Local Build and Preview

`publish/` is generated output and is no longer tracked. Build it locally or use
the CI artifact; do not commit generated files. Existing historical copies stay
in Git history. Cascade can restore its complete viewer bundle from commit
`30d22e8aa38fce3553eec3dd33e8283e3ddb1770` even without a local release cache.
Use a full-history clone, as CI does, rather than a shallow clone or source ZIP.

Prerequisites: Node.js 24 with npm, Git, Bash, curl, tar, and `sha256sum` on PATH;
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
lifecycle scripts. Cascade's downloaded fallback files must match
`runtimes/cascade/fallback-assets.sha256` before use.

See [Batch B verification](docs/testing/review-fixes-batch-b.md) for local build
results, action and checksum provenance, fallback limitations, and pending
hosted checks.

## Authentication and Shared-Origin Risk

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

## Next Steps
1. Refine the site deployment plan prompt for phase sequencing and effort sizing.
2. Define route contract and adapter matrix for phase-1 apps.
3. Implement shared validation and page shell.
