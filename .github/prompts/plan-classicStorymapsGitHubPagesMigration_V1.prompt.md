## Plan: GitHub Pages Migration For Classic Storymaps

Migrate this monorepo from IIS-root assumptions to GitHub Pages by first establishing a portable base-path contract, then adding a Pages publish pipeline, then updating launcher/runtime URL generation and compatibility routing without server rewrites. Recommended default: target a root-hosted Pages model (custom domain or user/org pages) to minimize refactor risk; keep Project Pages as a supported but higher-effort variant.

**Steps**
1. Phase 1: Confirm target hosting profile and freeze URL contract
2. Define one deployment profile per environment: `root-hosted` (custom domain or user/org pages) and `project-pages` (repo subpath).
3. Establish canonical runtime base path as a configuration value consumed by landing + launcher pages + runtime rewrite logic. This avoids hard-coded `/templates/classic-storymaps` literals. 
4. Document compatibility strategy for legacy `/templates/classic-stories/*` as static redirect stubs (HTML/JS) because GitHub Pages cannot perform IIS rewrite rules. *blocks steps 7-8*
5. Phase 2: Add GitHub Pages packaging and publish automation
6. Create a GitHub Actions workflow that runs current build sequence in order: landing build first, runtime publish second, then deploys artifact from `publish/templates/classic-storymaps` to Pages. 
7. Add `.nojekyll` to deployed artifact root to prevent processing side effects on legacy assets. 
8. Decide publish topology:
9. If `root-hosted`: publish artifact preserving `/templates/classic-storymaps/*` structure with minimal code changes.
10. If `project-pages`: publish under `/<repo>/templates/classic-storymaps/*` and require base-path-aware URL generation. *depends on step 3*
11. Phase 3: Refactor hard-coded path assumptions
12. Update all launcher pages to generate viewer URLs from the configured base path (including Back to Catalog and demo links). *parallel across launcher files*
13. Update landing metadata and any absolute OG/image URLs to use environment-aware absolute URL or relative path policy.
14. Patch Map Journal legacy embed normalization logic to use the same base-path contract instead of fixed `/templates/classic-storymaps/...` assembly. *depends on step 3*
15. Review host-specific analytics checks tied to `storymaps.esri.com` and decide whether to disable, generalize by allowlist, or gate by deploy profile.
16. Phase 4: Compatibility and docs re-baseline
17. Implement static compatibility entry points for `/templates/classic-stories/*` equivalents that preserve query strings and redirect to canonical routes. 
18. Replace IIS-only operational docs/checklists with Pages equivalents; keep IIS docs archived or explicitly marked non-applicable in Pages mode.
19. Re-baseline smoke tests and troubleshooting logs to Pages host URLs.
20. Phase 5: Verification and cutover
21. Run per-runtime smoke tests with known good `appid`/`webmap` flows on landing, launcher, runtime, and embedded Map Journal rewrite cases.
22. Verify compatibility redirects, query-string preservation, and absence of broken static assets under final host URL shape.
23. Perform staged release: preview on Pages URL, then optional custom-domain cutover, then update external references.

**Relevant files**
- `apps/classic-storymaps-site/index.html` — landing metadata contains absolute production URL assumptions.
- `apps/classic-storymaps-site/maptour-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `apps/classic-storymaps-site/swipe-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `apps/classic-storymaps-site/mapjournal-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `apps/classic-storymaps-site/mapseries-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `apps/classic-storymaps-site/cascade-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `apps/classic-storymaps-site/shortlist-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `apps/classic-storymaps-site/basic-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `apps/classic-storymaps-site/crowdsource-launcher.html` — `buildViewerUrl`, Back to Catalog, demo links.
- `runtimes/mapjournal/upstream/src/app/storymaps/tpl/ui/MainStage.js` — `normalizeLegacyStorytellingSwipeUrl` currently builds hard-coded canonical path.
- `scripts/build-classic-storymaps-landing.sh` — landing artifact assembly path.
- `scripts/build-classic-storymaps-runtime-publish.sh` — runtime publish assembly path and order.
- `docs/deployment/phase2-s5-landing-catalog-shell.md` — IIS redirect assumptions to replace/annotate.
- `docs/operations/phase4-s9-iis-hosting-checklist.md` — IIS checks not portable to Pages.
- `docs/testing/phase5-s10-smoke-suite-baseline.md` — smoke baseline URLs and compatibility expectations.

**Verification**
1. Build and package in CI using existing scripts; verify artifact root contains landing + all 8 runtimes.
2. Confirm deployed Pages site loads:
3. Landing: canonical catalog URL
4. Each launcher: valid `appid` and, where applicable, `webmap`
5. Each runtime index directly with query parameters
6. Map Journal embedded classic app links normalize correctly under target host.
7. Confirm compatibility stubs redirect `/templates/classic-stories/*` to canonical routes while preserving query strings.
8. Confirm no missing static assets (images/fonts/js/css) and no Jekyll-related omissions.
9. Update and run smoke checklist against Pages URL, then mark IIS-only checks out of scope for Pages profile.

**Decisions**
- Included scope: static hosting migration strategy, path-contract refactor points, CI/CD deployment shape, test/documentation re-baseline.
- Excluded scope: runtime feature changes unrelated to URL/path handling, ArcGIS app behavior changes, non-static backend services.
- Recommended default path: root-hosted Pages (custom domain or user/org pages) for lowest churn and risk.

**Further Considerations**
1. Hosting profile decision recommendation:
Option A: custom domain root (lowest churn).
Option B: user/org pages root (low-medium churn).
Option C: project pages in this repo (highest churn).
2. Compatibility policy recommendation:
Option A: keep `/templates/classic-stories/*` with static stubs for continuity.
Option B: drop legacy path and communicate a migration window.
3. Analytics policy recommendation:
Option A: disable host-locked analytics checks.
Option B: make analytics host allowlist configurable by deployment profile.
