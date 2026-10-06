---
mode: agent
description: Scoped fixes from the 2026-10-05 code review of d9835d4. One fix per commit, in order, with owner checkpoints between batches.
---

# Review fixes (review of `d9835d4`, 2026-10-05)

Work through the fixes in order, one commit per fix. Stop for the owner after
each batch. Items marked **OWNER DECISION** must be discussed with the owner
before any change.

## Ground rules

- **Every push to `main` rebuilds and redeploys the live site**
  (`.github/workflows/deploy-classic-storymaps-pages.yml`).
  - Before pushing a code change, run the tests (A0) and a full local build
    (the same scripts the workflow runs).
  - Add `[skip ci]` to the commit message for documentation-only commits.
  - After B2, branch runs build and test without deploying.
- Never sign in during automated checks. Never send exploit-style requests
  (foreign URLs, crafted tokens) to the live site. Test logic locally, with
  Node's built-in test runner (`node --test`); no new dependencies.
- Each new test must fail against the unfixed code before you rely on it. Say
  in the commit message that it did.
- Do not edit `runtimes/*/upstream/` directly. Runtime changes go through
  `runtimes/<app>/patches/`.
- The site is public. Never add credentials, tokens, or internal-only links.

## Batch A: security

### A0. Add a test harness and run it in CI

- **Evidence:** the repo has no automated tests. CI only checks that a few
  publish files exist.
- **Change:**
  - Add `scripts/tests/` with `*.test.mjs` files run by `node --test scripts/tests/`.
  - Add an `npm test` script, or document the command in `README.md` if
    there is no root `package.json`.
  - Add a workflow step that runs the tests before the build step, so a
    failure stops the deploy.
- **Done when:** a trivial placeholder test runs locally and in CI. Real tests
  arrive with A1–A3.

### A1. Shorten the ArcGIS token's lifetime and its cookie

- **Evidence:** in `apps/classic-storymaps-site/viewers.html`,
  `beginArcgisLogin` (around line 556) requests `expiration=20160`, a
  14-day token. `storeToken` puts it in `sessionStorage` and in a
  page-readable `esri_auth` cookie. `setEsriAuthCookie` (around line 472)
  sets that cookie with `Path=/` and a fixed 14-day expiry.
- **Why it matters:**
  - On the live host, the cookie's origin `https://dasbury-esri.github.io` is
    shared by every GitHub Pages site on the account. At review time there
    were five public ones: this repo, Esri-leaflet-examples, npm-experiment,
    usa-equal-area-map, and usa-equal-area-map-proto.
  - The runtimes also render author-written story HTML from any owner, via
    the `authorizedOwners: ["*"]` patches.
  - So any script on that origin can read a 14-day token.
  - The runtimes do read this cookie (for example
    `runtimes/maptour/upstream/MapTour/src/app/storymaps/utils/Helper.js`
    around line 227), so it cannot simply be removed.
- **Change:**
  - Request a 120-minute token. Make the expiration one named constant.
  - Read `expires_in` from the OAuth return hash.
  - Set the cookie's `Max-Age` and its JSON `expires` from `expires_in`, not
    from 14 days.
  - Move the cookie string and authorize-URL construction into a small
    helper file
    (`apps/classic-storymaps-site/assets/js/arcgis-auth-helpers.js`) that
    attaches to `window` and also exports for Node, so it can be tested.
  - Keep sign-out clearing both stores.
- **OWNER DECISION:** cookie paths do not separate pages on the same origin,
  so real isolation needs the site on its own origin (for example
  `classicstorymaps.com`, currently returning 404). Until then, record in
  `README.md` that other Pages sites on the account can read the session.
- **Done when:** tests assert that:
  - the authorize URL carries the 120-minute expiration;
  - the cookie's `Max-Age` equals the returned `expires_in`;
  - nothing in the code produces a 14-day value.

### A2. Send the token only to ArcGIS resource URLs

- **Evidence:** in `apps/classic-storymaps-site/assets/js/classic-story-loader.js`,
  `appendResourcesAndImages` (lines 713–715) calls
  `addTokenToResourceUrl` for any image URL from story data that contains
  `/sharing/rest/content/items/`, on any host. That includes
  `https://attacker.example/sharing/rest/content/items/x.png`.
  `addTokenToResourceUrl` (lines 650–662) also skips any URL already
  containing `token=`.
- **Change:**
  - Add `shouldSendArcgisToken(url)` and `withArcgisToken(url, token)` in a
    helper file with the same window/Node pattern as A1.
  - Send the token only when the URL parses, its protocol is `https:`, its
    hostname is `www.arcgis.com` or ends with `.maps.arcgis.com`, and its
    path starts with `/sharing/rest/content/`.
  - Set the token with `URL.searchParams.set('token', …)`.
  - Use the helpers at both call sites (lines 685 and 713–715), and load the
    helper file before `classic-story-loader.js` on every page that loads
    the loader.
- **Done when:** tests cover:
  - a foreign host with the marker in its path gets no token;
  - a foreign host with the marker in its query gets no token;
  - `www.arcgis.com.attacker.example` gets no token;
  - plain `http` gets no token;
  - a `/sharing/rest/content-other/` path gets no token;
  - a real resource URL gets exactly one token;
  - a URL with `?w=800` keeps `w` and gains `&token=`.

### A3. Verify the OAuth return

- **Evidence:** `getTokenFromHash` in `viewers.html` accepts `access_token`
  or `token` from any incoming link. `beginArcgisLogin` sends the return path
  as `state` and never checks it on return. A crafted link can therefore sign
  a visitor in with someone else's token.
- **Change:**
  - Generate a random 128-bit `state` with `crypto.getRandomValues`.
  - Store it, with the return path, in `sessionStorage` before redirecting.
  - On return, accept only `access_token`, and only when `state` matches.
  - Then clear the stored state and the hash.
  - Put the parsing in a pure `parseAuthReturn(hash, storedState)` helper.
- **Done when:** tests show:
  - a matching state yields the token and the return path;
  - a missing or mismatched state yields nothing;
  - a `#token=` link without `state` yields nothing.

**Stop here for owner review.**

## Batch B: deployment correctness

### B1. Make links work under any base path

- **Evidence:** the live site is
  `https://dasbury-esri.github.io/classic-storymaps-viewer-pages/`. Its
  landing page has 89 links starting with `/`, generated by the rewrite rules
  in `scripts/build-classic-storymaps-landing.sh` (lines 113–134 and
  similar).
  - Browsers resolve them outside the project folder. For example,
    `/archive/2017-12-10-pages/en__app-list__map-tour.html` returns 404 as
    clicked, but 200 under the project path.
- **Change:**
  - Add a `SITE_BASE_PATH` setting (default empty) to the landing and
    runtime-publish scripts, and prefix every generated root-relative URL
    with it.
  - Fix any hand-written root-relative links in `apps/`.
  - In the workflow, set `SITE_BASE_PATH` from a repository variable
    (`vars.SITE_BASE_PATH`): empty for a root custom domain,
    `/classic-storymaps-viewer-pages` for the project address.
  - Confirm `classic-story-loader.js`'s base-path inference still finds
    `/viewers` under a prefix.
- **Done when:** a `scripts/tests/check-links.test.mjs` test, run against a
  local build with the base set:
  - finds no root-relative `href`/`src` in `publish/**/*.html` without the
    base;
  - finds every internal link target on disk.

  It must fail against today's build.

### B2. Harden the deploy workflow and build inputs

- **Evidence:**
  - Workflow-level `pages: write` and `id-token: write` also apply to the
    build job. That job runs `npm ci` and grunt for eight legacy projects,
    whose install scripts run with those permissions.
  - Actions are referenced by tag. Your task list notes that their Node 20
    runtime is deprecated.
  - `cancel-in-progress: true` can cancel a deploy partway through; a run on
    2026-03-18 was cancelled.
  - `scripts/build-cascade-runtime.sh` (lines 57–70) downloads jQuery 2.2.4,
    fastclick, Font Awesome, and Calcite with `curl` and no integrity check.
- **Change:**
  - Give the build job only `contents: read`. Grant `pages: write` and
    `id-token: write` on the deploy job only.
  - Deploy only when `github.ref == 'refs/heads/main'`, so branch runs test
    and build without deploying.
  - Set `cancel-in-progress: false`.
  - Pin each action to a full commit SHA, with a version comment, choosing
    releases that run on Node 24.
  - Record SHA-256 hashes of the downloaded fallback files in
    `runtimes/cascade/fallback-assets.sha256`, and verify them with
    `sha256sum -c` before use.
  - Try `npm ci --ignore-scripts` per runtime. Keep install scripts only
    where a build demonstrably needs them, and list those in the commit
    message.
- **Done when:**
  - a branch run builds and tests without deploying;
  - a deliberately altered fallback file fails the hash check;
  - a `main` run deploys the same artifact tree as before; compare the file
    lists of the two artifacts.

**Stop here for owner review.**

## Batch C: clarity and maintenance

### C1. Show where a self-hosted story will open

- **Evidence:** for self-hosted stories, `applyFoundState` in
  `classic-story-loader.js` (lines 991–1022) sets `viewerUrl` to the item's
  own `url`, an `http(s)` address chosen by the item's owner. The button
  only says "Open … Viewer".
- **Change:** show the destination hostname on the button and the full URL
  in the status line before navigation, using a small tested helper.
- **Done when:** a test covers the label for http, https, and long URLs.

### C2. Prove that runtime imports are reproducible

- **Evidence:** `runtimes/<app>/upstream/` holds the patched state. For
  example, Map Tour's `Core.js` additions are recorded in
  `runtimes/maptour/patches/0001-production-behavior-align.patch`. No check
  confirms that re-importing at the pinned ref and applying the patches
  reproduces today's tree.
- **Change:** add a script that does exactly that per runtime (Map Tour,
  Swipe, and Map Journal first) and diffs the result against `upstream/`.
- **Done when:** the script reports no differences, or lists each difference
  for the owner to turn into a patch.

### C3. Stop committing `publish/` (OWNER DECISION)

- **Evidence:** `publish/` (3,115 tracked files) is deleted and rebuilt on
  every deploy. Only the Cascade history fallback needs an old copy, and it
  reads that from commit `30d22e8…`, which stays in history.
- **Proposed change:**
  - `git rm -r --cached publish`.
  - Add `publish/` to `.gitignore`.
  - Document the local preview build in `README.md`.
- **Done when:** a fresh clone builds and previews locally, and the Cascade
  fallback still works.
