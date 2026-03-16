## Plan: Migrate Classic Storymaps To GitHub Pages + Cloudflare Domain

Move production hosting from storymaps.esri.com to GitHub Pages using classicstorymaps.com (Cloudflare-managed), while decoupling hard-coded `/templates/classic-storymaps` paths through a shared base-path contract. Recommended rollout: preserve `/templates/classic-storymaps/*` first for low-risk cutover, then optionally shorten URLs later.

**LOE scale**
- `XS` = < 0.5 day
- `S` = 0.5 to 1.5 days
- `M` = 2 to 4 days
- `L` = 5 to 8 days
- `XL` = 9+ days

**Work Plan With Checklists and LOE**

1. **Phase 1: Deployment Target and URL Contract**
- Objective: lock cutover URL contract and avoid accidental scope expansion.
- Dependencies: none.
- LOE: `S` (about 1 day).
- Checklist:
- [ ] Confirm Stage A production canonical URL: `https://classicstorymaps.com/templates/classic-storymaps/*`.
- [ ] Confirm Stage B remains optional: future short URLs `/<runtime>/index.html`.
- [ ] Define base-path contract (`window.CLASSIC_STORY_BASE_PATH` or equivalent) and where it is initialized.
- [ ] Document explicit non-goals for Stage A (no route flattening, no unrelated runtime behavior changes).

2. **Phase 2: GitHub Pages + Cloudflare Wiring**
- Objective: establish reproducible CI/CD deployment to custom domain.
- Dependencies: Phase 1 URL contract.
- LOE: `M` (about 2 to 3 days).
- Checklist:
- [x] Add GitHub Actions workflow to run landing build then runtime publish then Pages deploy.
- [x] Add deployment safeguards: `.nojekyll`, `CNAME` (`classicstorymaps.com`), artifact structure check.
- [ ] Configure Pages settings for custom domain and HTTPS.
- [ ] Configure Cloudflare DNS:
- [ ] `www CNAME -> <owner>.github.io`
- [ ] apex flattening `classicstorymaps.com -> <owner>.github.io`
- [ ] Configure Cloudflare SSL/TLS and redirects:
- [ ] SSL mode `Full (strict)`
- [ ] `Always Use HTTPS` enabled
- [ ] `Automatic HTTPS Rewrites` enabled
- [ ] Keep Cloudflare caching conservative during cutover.

3. **Phase 3: Hard-Coded Path Refactor**
- Objective: remove brittle `/templates/classic-storymaps` assumptions from source-level URL generation and inference.
- Dependencies: Phase 1 base-path contract.
- LOE: `L` (about 5 to 7 days).
- Checklist:
- [ ] Refactor `apps/classic-storymaps-site/assets/js/classic-story-loader.js`:
- [ ] Replace `VIEWER_BY_APP` absolute values with base-path-aware builder.
- [ ] Update `getViewerUrl` to build from base path and preserve query encoding.
- [ ] Replace `inferViewerConfig` runtime regex `/classic-storymaps/...` with base-path-aware runtime detection.
- [ ] Refactor launcher pages to remove absolute Back to Catalog/demo anchors and use base-path-derived links.
- [ ] Refactor landing `index.html` OG URL and embedded viewer map table to match deployment profile.
- [ ] Refactor runtime source modules synthesizing canonical runtime URLs:
- [ ] `runtimes/mapjournal/upstream/src/app/storymaps/tpl/ui/MainStage.js`
- [ ] `runtimes/mapseries/upstream/src/app/storymaps/tpl/ui/MainStage.js`
- [ ] `runtimes/cascade/upstream/src/app/storymaps/tpl/view/media/WebPage.jsx`
- [ ] Rebuild affected runtimes and republish using scripts (no manual edits in `publish/`).

4. **Phase 4: Compatibility Without IIS Rewrites**
- Objective: preserve legacy path behavior without server-side rewrite support.
- Dependencies: Phase 2 deployment in place.
- LOE: `M` (about 2 days).
- Checklist:
- [ ] Implement static redirect stubs for `/templates/classic-stories/*` preserving query strings.
- [ ] Verify compatibility behavior for representative runtime routes and launcher routes.
- [ ] Update IIS-focused docs/checklists to Pages/Cloudflare equivalents.
- [ ] Mark IIS-only validation items as non-applicable in new production profile.

5. **Phase 5: Validation and Staged Cutover**
- Objective: prove production readiness and execute low-risk DNS transition.
- Dependencies: Phases 2 through 4.
- LOE: `M` (about 2 to 3 days).
- Checklist:
- [ ] Run smoke suite across landing, all launchers, and direct runtime URLs.
- [ ] Validate embedded-story normalization in Map Journal, Map Series, and Cascade.
- [ ] Validate apex and `www` HTTPS behavior and redirect policy.
- [ ] Validate cache behavior and perform purge steps after deploy.
- [ ] Perform staged DNS cutover: preview -> low-traffic verification -> full cutover.

6. **Phase 6: Stage B Optional URL Flattening**
- Objective: optionally migrate to short root routes after stabilization.
- Dependencies: stable production on Stage A for at least one release cycle.
- LOE: `L` (about 5 to 8 days).
- Checklist:
- [ ] Finalize short-route contract and redirect matrix.
- [ ] Update base-path default from `/templates/classic-storymaps` to new root contract.
- [ ] Preserve backward compatibility redirects for old canonical routes.
- [ ] Re-run full validation and embedded-story checks.

**Effort Summary**
- Stage A (Phases 1 to 5): `L` overall (about 12 to 16 engineering days).
- Stage B (Phase 6): `L` additional (about 5 to 8 engineering days).
- Full program (Stage A + Stage B): `XL` overall (about 17 to 24 engineering days).

**Suggested Owners**
- Build and CI/CD: DevOps/Release owner.
- Runtime and launcher path refactor: frontend/runtime owner.
- DNS/SSL and Cloudflare controls: platform/infrastructure owner.
- Smoke validation and sign-off: QA + runtime owner.

**Milestones**
- Milestone 1: URL contract approved and base-path contract documented.
- Milestone 2: GitHub Pages deploy live on preview URL with `CNAME` and HTTPS.
- Milestone 3: Hard-coded path refactor merged and all runtimes rebuilt.
- Milestone 4: Compatibility stubs verified and docs updated.
- Milestone 5: Production DNS cutover complete and smoke tests signed off.

**Relevant files**
- `apps/classic-storymaps-site/assets/js/classic-story-loader.js` — hard-coded viewer map (`VIEWER_BY_APP`) and runtime detection (`inferViewerConfig`) are primary blockers.
- `apps/classic-storymaps-site/index.html` — hard-coded production OG URL and viewer path table.
- `apps/classic-storymaps-site/maptour-launcher.html` — Back to Catalog + demo path assumptions.
- `apps/classic-storymaps-site/swipe-launcher.html` — Back to Catalog + demo path assumptions.
- `apps/classic-storymaps-site/mapjournal-launcher.html` — Back to Catalog + demo path assumptions.
- `apps/classic-storymaps-site/mapseries-launcher.html` — Back to Catalog + demo path assumptions.
- `apps/classic-storymaps-site/cascade-launcher.html` — Back to Catalog + demo path assumptions.
- `apps/classic-storymaps-site/shortlist-launcher.html` — Back to Catalog + demo path assumptions.
- `apps/classic-storymaps-site/basic-launcher.html` — Back to Catalog + demo path assumptions.
- `apps/classic-storymaps-site/crowdsource-launcher.html` — Back to Catalog + demo path assumptions.
- `runtimes/mapjournal/upstream/src/app/storymaps/tpl/ui/MainStage.js` — legacy URL normalization builds `/templates/classic-storymaps` links.
- `runtimes/mapseries/upstream/src/app/storymaps/tpl/ui/MainStage.js` — legacy URL normalization builds `/templates/classic-storymaps` links.
- `runtimes/cascade/upstream/src/app/storymaps/tpl/view/media/WebPage.jsx` — legacy URL normalization builds `/templates/classic-storymaps` links.
- `scripts/build-classic-storymaps-landing.sh` — landing artifact assembly.
- `scripts/build-classic-storymaps-runtime-publish.sh` — runtime artifact assembly and publish tree.
- `runtimes/*/runtime-manifest.json` — route/canonical metadata still tied to `/templates/classic-storymaps`.
- `docs/operations/phase4-s9-iis-hosting-checklist.md` — IIS-only checks requiring migration guidance.
- `docs/testing/phase5-s10-smoke-suite-baseline.md` — baseline URLs and compatibility expectations requiring re-baseline.

**Verification**
1. CI build and Pages deploy produce a valid artifact with landing + all runtime folders.
2. `https://classicstorymaps.com/templates/classic-storymaps/` loads catalog and launcher routes.
3. Loader flow from each launcher resolves app ID and opens correct runtime URL.
4. Hard-coded path replacement test: set alternate base path in a staging deploy and confirm loader + launchers still function.
5. Embedded app URL normalization in Map Journal/Map Series/Cascade routes to the expected runtime URL on new domain.
6. Legacy compatibility path `/templates/classic-stories/*` redirects correctly with query-string preservation.
7. No broken static assets and no Jekyll-induced omissions.
8. Cloudflare HTTPS and DNS behavior verified for apex and `www`.

**Decisions**
- Included scope: production cutover to GitHub Pages on classicstorymaps.com, base-path refactor for hard-coded viewer links, runtime rewrite alignment, docs/test re-baseline.
- Excluded scope: functional runtime feature changes not related to hosting/path behavior.
- Recommended migration shape: two-stage.
- Stage A: keep `/templates/classic-storymaps/*` on new domain (fast and safe).
- Stage B: optionally move to shorter root routes after telemetry/stability validation.

**Further Considerations**
1. Hard-coded path removal strategy:
Option A: introduce one global base-path helper used by all launchers + loader + runtime rewrite functions.
Option B: keep per-file replacements (faster initially, higher long-term drift risk).
2. Legacy route policy:
Option A: maintain `/templates/classic-stories/*` via static stubs indefinitely.
Option B: keep for 90-day migration window, then remove.
3. Analytics host checks currently pinned to `storymaps.esri.com` in runtime configs:
Option A: update allowlist to include classicstorymaps.com.
Option B: disable host-locked analytics during migration and reintroduce later.
