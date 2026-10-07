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

## Batch D: Crowdsource (added 2026-10-06, at `9065a0f`)

### D1. Publish a working, view-only Crowdsource viewer

Classic Crowdsource must be **view-only**: no Participate (contributions) and
no builder. This is an owner requirement.

**Evidence: why it is broken.** Crowdsource has never worked on this site.

- Every published version since onboarding (`d7edbc2`, 2026-03-12) has
  served raw source.
- `scripts/build-crowdsource-runtime.sh` (lines 29–37) falls back to copying
  `runtimes/crowdsource/upstream/src/` when the 2018 grunt/webpack build
  fails, which it does on the current toolchain. It then renames the EJS
  template `index.ejs` to `index.html`.
- In a browser, the live
  `viewers/crowdsource/index.html?appid=f1fcc302b0864b0c94beffc5177da2b8`
  makes one script request: the literal URL
  `…/crowdsource/<%= pathMods.resourcePath %>app/main-config<%= pathMods.minPath %>.js`.
  It gets HTTP 400 and the page stays blank.
- Raw `src/` also has no `app/main-config.js`, only Babel source
  (`main-config.babel.js`).
- CI only checks that `index.html` exists, so nothing caught this.
- Esri's own hosted viewer (`www.arcgis.com/apps/StoryMapCrowdsource/`) now
  shows "has been retired" for this story.

**Evidence: the fix, tested locally.** The steps below were applied to Esri's
official release, served from a local HTTPS origin, and loaded in headless
Chromium.

- Desktop, `?edit=true`, `?fromScratch=true`, and a 390 px mobile view all
  showed:
  - no Participate button or text, and no contribution panel;
  - builder mode off;
  - gallery items present (12–14), with Explore Map opening the clustered
    contribution map;
  - no console errors and no failed requests.
- On mobile, the bottom bar showed only Home, Map, and Gallery.

**Change.** Each step must fail the build when it does not apply cleanly.

1. **Use the official release, not the source build.** In
   `scripts/build-crowdsource-runtime.sh`:
   - download
     `https://github.com/Esri/storymap-crowdsource/releases/download/v0.10.0/StoryMapsCrowdsource-0.10.0.zip`;
   - verify SHA-256
     `e6a5a2d775f63f3ea466613a5be89449cc4647b4792f4d91d89b21c6073b41dd`, as B2
     does for the Cascade fallback assets;
   - unzip it into the build output;
   - delete the `src/` fallback and the `index.ejs` copy, and make any failure
     stop the build.

   v0.10.0 matches the pinned upstream version, and the bundle loads its
   scripts by relative path, so it works under `SITE_BASE_PATH`.
2. **Apply exact text replacements, asserting each target occurs exactly
   once before replacing:**

   **(a) jQuery 3 fix**, in `app/main-app.min.js`. Replace:

   ```text
   t.find("img").load(this.updateTitleWidth)
   ```

   with:

   ```text
   t.find("img").on("load",this.updateTitleWidth)
   ```

   **(b) Participation off**, in `app/main-app.min.js`. Replace:

   ```text
   UPDATE_SETTINGS_CONTRIBUTE_PARTICIPATION_ALLOWED:return n.allowed;default:return t}
   ```

   with:

   ```text
   UPDATE_SETTINGS_CONTRIBUTE_PARTICIPATION_ALLOWED:return!1;default:return!1}
   ```

   **(c) Builder off**, in `app/main-config.min.js`. Replace:

   ```text
   isBuilder:i("edit")||i("fromScratch")||i("fromscratch")||!1,fromScratch:i("fromScratch")||i("fromscratch")||!1
   ```

   with:

   ```text
   isBuilder:!1,fromScratch:!1
   ```

   - **(a)** Esri's release calls the jQuery 1/2 `.load(handler)` shorthand
     with bundled jQuery 3.3.1. That throws `e.indexOf is not a function`,
     and the cover never finishes (no Explore Map button).
   - **(b)** This reducer feeds every Participate entry point: the header
     button, both contribution panels, and the mobile Participate button (see
     upstream `src/app/components/crowdsource/viewer/Viewer.babel.js` lines
     56, 130, 208, and 287). Forcing it false makes participation unavailable,
     whatever each story's settings say.
3. **Keep the builder URL guard.**
   - `?edit=true` must never reach the app. Without a guard it crashes with
     "x.default is not a constructor", because the AMD `mode!isBuilder` plugin
     reads the URL independently.
   - `scripts/build-classic-storymaps-runtime-publish.sh` already injects a
     `classicstorymaps-builder-guard` script into every runtime's
     `index.html`, Crowdsource included, during `sanitize_runtime_publish`.
     It strips `edit`, `fromScratch`, and `fromscratch`. Confirm the published
     Crowdsource page contains that guard, and do not add a second one.
   - Only if the `?edit=true` browser check below still fails with the
     publish guard in place, insert this script immediately after `<head>`
     in the Crowdsource build output. This was the variant used in local
     testing:

   ```html
   <script>(function(){try{var u=new URL(window.location.href),c=!1;["edit","fromScratch","fromscratch"].forEach(function(k){if(u.searchParams.has(k)){u.searchParams.delete(k);c=!0}});if(c){window.history.replaceState(null,"",u.toString())}}catch(e){}})();</script>
   ```

4. **Delete the builder bundles from the output:**
   - `app/main-app-builder.min.js`
   - `app/main-app-builder.min.css`
   - `app/main-app-builder-bootstrap.min.css`
   - `app/main-app-builder-calcite.min.css`
5. **Record provenance.**
   - Add `runtimes/crowdsource/runtime-manifest.json` with: the release URL,
     version `0.10.0`, the SHA-256, license Apache-2.0, `viewerOnly: true`,
     and the patch list.
   - Add `runtimes/crowdsource/patches/README.md` explaining each
     replacement and why.
   - Crowdsource is currently the only runtime without a manifest.

**Done when:**

- A `node --test` test runs the patch step against the release files. It
  must show:
  - each original string is gone and each replacement appears once;
  - the published Crowdsource `index.html` contains
    `classicstorymaps-builder-guard`;
  - the builder files are absent;
  - a missing patch target fails.
- A check over `publish/viewers/*/index.html` fails if any file contains
  `<%`. It must fail against today's build.
- A browser check passes on desktop and at 390 px. Crowdsource forces HTTPS,
  so test over an HTTPS origin. Load the appid above three ways: plain,
  `&edit=true`, and `&fromScratch=true`. It must show:
  - no `button.participate` element and no "Participate" text;
  - builder mode false;
  - gallery items present;
  - Explore Map works on desktop;
  - no console errors and no failed requests.
- **Owner check:** after an owner-approved deploy, the owner opens the live
  Crowdsource viewer on desktop and phone, and confirms there is no
  Participate button and the map and gallery work.

**Notes:**

- View-only applies to this site only. Story owners' feature services can
  still accept edits through ArcGIS itself.
- The Cascade, Shortlist, and Map Series build scripts have the same silent
  copy-`src` fallback. Their published pages have no template tags today; a
  follow-up should make those builds fail loudly too.

### D2. Replace the silent raw-source fallback in the Cascade, Shortlist, and Map Series builds

Added 2026-10-07, at `5f3700e`. Do this after D1; it reuses D1's download,
checksum, and extract approach.

**Evidence: the scripts.**

- `scripts/build-shortlist-runtime.sh` and `scripts/build-mapseries-runtime.sh`
  (lines 27–34) copy `runtimes/<app>/upstream/src/` into the build output
  when the grunt build fails or produces no `deploy/` folder. The only signal
  is a stderr message.
- `scripts/build-cascade-runtime.sh` tries three things after a failed build:
  1. a local release cache (`runtimes/cascade/release-1.23.0`), which is
     git-ignored and never present in CI;
  2. an old build pulled from git history (`30d22e8…`);
  3. raw `src/` plus CDN downloads (`stage_fallback_lib_assets`).

**Evidence: the live viewers** (headless Chromium, 2026-10-07):

- **Shortlist is live on the raw-source fallback.**
  - It serves loose source modules such as
    `app/storymaps/common/utils/CommonHelper.js`.
  - `app/viewer-min.js` returns 404.
  - It renders story `5a9c34acf59a49f0a67d5f7293b44d6b` ("The Raised Bogs of
    Ireland"), but shows a "⚙ Edit ×" builder button to anonymous visitors,
    because raw source runs in development mode.
- **Map Series is a real grunt build** (`app/viewer-min.js` is present).
  Story `77245a2c7bb540878fd3b24ebd048b20` ("Stewardship") renders.
- **Cascade** has `app/viewer-min.js`, and Palau
  (`dbc3574e3d0d4f4a81ae95f2e86b0dc2`) renders.

**Consequence:** Shortlist's build already fails in CI. Making these scripts
fail loudly without a replacement would break every deploy.

**Official replacements.** Esri published built releases matching each
pinned upstream version. Each contains `app/viewer-min.js` and
`app/main-config.js`.

- **Shortlist 2.12.0**
  - URL: `https://github.com/Esri/storymap-shortlist/releases/download/V2.12.0/Storytelling-Shortlist-2.12.0.zip`
  - SHA-256: `e315fde278ab354ea58e53b3862471d71b637ad4f29cfc9c36fd94b013851bdf`
  - Files are at the zip root.
- **Map Series 1.27.0**
  - URL: `https://github.com/Esri/storymap-series/releases/download/V1.27.0/storymap-series-1.27.0.zip`
  - SHA-256: `3c6ca06a3a268618e6561764b0c1484d22cf8f2b4a79b8b2e302caed904e5d41`
  - Files are under a top-level `storymap-series-1.27.0/` folder.
- **Cascade 1.23.0**
  - URL: `https://github.com/Esri/storymap-cascade/releases/download/V1.23.0/Storymaps-Cascade-1.23.0.zip`
  - SHA-256: `40b68fd330b232571146ef7aaf0a3942069355e8a0f4cf0719a66d3b6a7a267e`
  - Files are at the zip root. Ignore the `__MACOSX/` folder.

**Tested locally.** Each release, with `authorizedOwners: ["*"]`, was served
and loaded in headless Chromium:

- **Shortlist:** `5a9c34acf59a49f0a67d5f7293b44d6b` rendered, with no
  "⚙ Edit ×" button.
- **Map Series:** `77245a2c7bb540878fd3b24ebd048b20` rendered.
- **Cascade:** Palau (`dbc3574e3d0d4f4a81ae95f2e86b0dc2`) rendered.

All three had no visible Edit button, no console errors, and no failed
requests. Map Series story `858c4126f0604d1a86dea06ffbdc23a3` also renders,
but its own third-party map hosts no longer resolve. Do not use it as a gate.

**Change.**

1. **Shared release helper.** Add one helper, for example
   `scripts/lib/stage-official-release.sh`, that:
   - downloads the release URL;
   - verifies its SHA-256 with `sha256sum -c`;
   - extracts it into `runtimes/<app>/build`, stripping a single top-level
     folder if present and skipping `__MACOSX/`;
   - exits non-zero on any failure.

   If D1 already added an equivalent helper, extend it rather than adding a
   second one.
2. **Site configuration on the release.** The release `index.html` lacks your
   site's values, which live in `runtimes/<app>/upstream/src/index.html`:
   the default `appid` and `authorizedOwners: ["*"]`.
   - Read both values from that `src/index.html`. Do not hard-code them.
   - Apply them to the release `index.html` by exact replacement of
     `authorizedOwners: [""]` and `appid: ""`. Assert each occurs exactly
     once.
   - At review time the `src` values were: Cascade `f2e8448fef064238ace4f324ffc16fde`,
     Map Series `167ca9b1c85e4c7ea5eac8c6be43358b`, Shortlist
     `0584dbad6ebf433a96f1111f4cc7e3bd`, each with `authorizedOwners: ["*"]`.
3. **Build order in each of the three scripts:**
   1. Run the grunt build.
   2. If it fails, or its output lacks `index.html` or `app/viewer-min.js`
      (for Cascade, keep `has_required_cascade_viewer_files`), stage the
      official release.
   3. If that fails too, exit 1.

   Then:
   - remove every `cp -R "$RUNTIME_PATH/src"` fallback;
   - remove Cascade's local-release and git-history fallbacks;
   - remove `stage_fallback_lib_assets`;
   - remove `runtimes/cascade/fallback-assets.sha256` if nothing else uses it.
4. **Make the source visible and testable.**
   - Support `CLASSIC_RUNTIME_SOURCE=release`, which skips grunt and stages
     the release, so the fallback can be tested even where the build
     succeeds.
   - Each script writes a `BUILD_SOURCE` file into its build output,
     containing `grunt` or `release:<version>`.
   - The publish step keeps that file.
5. **Record provenance.** Record each release's URL, version, and SHA-256 in
   `runtimes/<app>/runtime-manifest.json`.
6. **Out of scope.** Leave builder handling to the existing publish step:
   the `classicstorymaps-builder-guard` injection and the removal of
   `resources/tpl/builder`.

**Done when:**

- `node --test` tests show:
  - the helper rejects a wrong SHA-256;
  - each script exits non-zero when both grunt and the release fail
    (simulate with a bad hash);
  - after a full build, every runtime's `BUILD_SOURCE` is `grunt` or
    `release:*`, never anything else.
- With `CLASSIC_RUNTIME_SOURCE=release` set for each of the three runtimes, a
  browser check loads:
  - Shortlist `5a9c34acf59a49f0a67d5f7293b44d6b`;
  - Map Series `77245a2c7bb540878fd3b24ebd048b20`;
  - Cascade `dbc3574e3d0d4f4a81ae95f2e86b0dc2`.

  Each must render its title, show no visible Edit button, and have no
  console errors and no failed requests, both plain and with `&edit=true`.
- A normal branch run (no override) passes. Record each runtime's
  `BUILD_SOURCE` in the run summary or commit message. Expect Shortlist to
  report `release:2.12.0`.
- **Owner check:** after an owner-approved deploy, the live Shortlist viewer
  no longer shows "⚙ Edit ×", and Map Series and Cascade still load.

## Batch E: link to the converter (added 2026-10-07, at `a94a20f`)

Owner decision, 2026-10-07: the landing page offers a Convert button. It
opens the Classic converter (the `ArcGIS-StoryMaps-Classic-Converter-App`
repository) in a new tab, with the story's item ID. The two sites stay
separate:

- each has its own ArcGIS sign-in;
- no token passes between them;
- the converter decides who may convert: the story's owner, or an
  administrator of the owner's organization.

### E1. Add a Convert button, hidden until configured

**Evidence:**

- `applyFoundState` (`classic-story-loader.js:995`) already has what the
  button needs:
  - the resolved item, `result.item.id` (`resolveClassicStory` has already
    followed URL-only items);
  - its runtime, `result.classicType`;
  - `result.selfHosted` and `result.itemData`.
- At converter commit `55ae366`,
  `converter-app/src/components/enabledTemplates.ts` enables Map Tour, Swipe,
  Map Journal, Map Series, and Cascade. Shortlist, Crowdsource, and Basic are
  not supported yet.

**Change:**

1. `apps/classic-storymaps-site/assets/js/classic-storymaps-config.js`:
   - Add a top-level `converterUrl: ""`. An empty value means no button.
   - Add `convertible: true` to the `maptour`, `swipe`, `mapjournal`,
     `mapseries`, and `cascade` entries.
   - Add a comment saying the converter's `enabledTemplates.ts` is the source
     of truth, and the two lists change together.
2. `ensureUi`:
   - Add `<button id="convert-story-btn" type="button" disabled hidden>Convert
     to ArcGIS StoryMaps</button>` beside "Open Story Viewer".
   - Under it, add a one-line note: "Sign in as the story's owner or an
     administrator of its organization."
3. `applyFoundState`:
   - Show the button and its note only when `converterUrl` parses as an
     `https:` URL.
   - Enable the button only when the item is not self-hosted, its data
     loaded, and its runtime has `convertible: true`.
   - When the button is disabled, put the reason in its `title`:
     - "Self-hosted stories can't be converted here."
     - "<label> stories can't be converted yet."
     - "The story's data didn't load."
   - `resetButtons` disables it. The web map launcher state
     (`applyWebmapState`) keeps it hidden.
4. Click handler:
   - Re-check `state.item.id` against `APP_ID_REGEX`.
   - Build the link with `new URL(converterUrl)` and
     `searchParams.set("appid", id)`.
   - Open it with `window.open(url, "_blank", "noopener,noreferrer")`.
   - Add no other parameter, and never a token.

**Done when:**

- `node --test` tests, extending the pattern in
  `scripts/tests/story-destination.test.mjs`, each failing first, show:
  - with an empty `converterUrl`, the button is hidden;
  - with a URL set, the enabled state and the reason are correct for all
    eight runtimes, a self-hosted story, and a story whose data didn't load;
  - the opened URL is exactly `<converterUrl>?appid=<id>`;
  - an invalid ID opens nothing.
- **Browser check** on a local build, with `converterUrl` set in an
  uncommitted edit:
  - a Map Journal enables the button, which opens the converter with
    `?appid=` in a new tab;
  - a Shortlist shows the button disabled, with its reason.
- The commit ships `converterUrl: ""`.
- **Owner step:** set `converterUrl` only after the converter's D1 and D2 are
  in a deployed release. Today that would be
  `https://regal-sable-0a6dde.netlify.app/`; later it will be
  `https://convert.classicstorymaps.com/`.
