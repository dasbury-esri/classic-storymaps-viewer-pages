## Plan: Classicstorymaps Archive + Viewers Routing

Rebuild a historical-facing classicstorymaps.com experience from the 2017-12-10 archived Story Maps site, while making /viewers the canonical path for this repo's live classic viewer launchers and runtimes. Implement this as a dual-track delivery: archived-site shell/content reconstruction plus live viewer path migration with compatibility redirects.

## Hosting Context (Updated)
- Original hosting model: storymaps.esri.com on IIS (server-side rewrites and IIS deployment assumptions).
- New hosting model: this repository's GitHub Pages site with custom domain classicstorymaps.com.
- Planning implication: prioritize GitHub Pages-compatible routing/redirect patterns first, then document IIS behavior as historical context or optional enterprise deployment path.

## Effort Scale
- S = 0.5-1 day
- M = 1-3 days
- L = 3-5 days
- XL = 5+ days

## Phase 1: Route Contract and Deployment Guardrails

Estimated phase effort: M (2-3 days)

Focused tasks
- [x] Define canonical route contract as /viewers for landing, launchers, and app runtimes.
	- Priority: P0
	- Dependencies: none
	- Estimate: S
	- Output: final route table with canonical and compatibility paths
- [x] Preserve legacy /templates/classic-storymaps as compatibility redirects.
	- Priority: P0
	- Dependencies: canonical route contract defined
	- Estimate: S
	- Output: redirect matrix and expected status behavior
- [x] Update route matrix and deployment docs for root-site role and compatibility behavior.
	- Priority: P1
	- Dependencies: canonical route contract, compatibility redirect matrix
	- Estimate: S
	- Output: updated docs/architecture and docs/deployment references
- [x] Add GitHub Pages-compatible redirect strategy for production-safe HTTP behavior.
	- Priority: P0
	- Dependencies: compatibility redirect matrix
	- Estimate: M
	- Output: static redirect/stub approach, path conventions, and limitations documented
- [x] Document IIS rewrite strategy as historical/optional deployment path.
	- Priority: P2
	- Dependencies: compatibility redirect matrix
	- Estimate: M
	- Output: IIS rules and verification guidance for non-GitHub Pages environments
- [x] In parallel, update release/checklist docs to assert /viewers canonical availability and legacy redirect integrity.
	- Priority: P1
	- Dependencies: canonical route contract
	- Estimate: S
	- Output: checklist criteria and runbook updates

Phase checklist
- [x] Canonical and compatibility contracts are documented and reviewed.
- [x] Redirect strategy is documented for IIS and non-IIS fallback.
- [x] Release checklist includes /viewers-specific validations.

## Phase 2: Viewer Hub Canonicalization (/viewers)

Estimated phase effort: L (3-5 days)

Focused tasks
- [x] Repoint landing and launcher path generation from /templates/classic-storymaps to /viewers.
	- Priority: P0
	- Dependencies: Phase 1 canonical route contract
	- Estimate: M
	- Output: unified base-path usage in landing and launcher code
- [x] Update launcher pages and shared loader logic so all catalog/sample/runtime URLs resolve under /viewers.
	- Priority: P0
	- Dependencies: landing/launcher path generation repointed
	- Estimate: M
	- Output: launcher and loader path updates
- [x] Adjust build scripts so publish output produces /viewers as first-class output.
	- Priority: P0
	- Dependencies: loader and launcher path updates
	- Estimate: M
	- Output: build outputs under publish/viewers
- [x] Emit legacy compatibility redirects from /templates/classic-storymaps to /viewers.
	- Priority: P1
	- Dependencies: publish/viewers output in place
	- Estimate: S
	- Output: generated redirect stubs and/or rewrite rules
- [x] Update workflow validation to assert canonical files at publish/viewers and legacy redirect validity.
	- Priority: P1
	- Dependencies: build outputs and redirect artifacts finalized
	- Estimate: S
	- Output: CI checks and expected artifacts

Phase checklist
- [x] /viewers landing and launcher pages are generated and navigable.
- [x] Legacy /templates routes redirect as expected.
- [ ] CI validation passes with new canonical path expectations.

## Phase 3: Archived Site Reconstruction (2017-12-10)

Estimated phase effort: XL (5-8 days)

Focused tasks
- [ ] Capture and sanitize the 2017-12-10 app-list snapshot and linked legacy sections/pages (as much as available).
	- Priority: P0
	- Dependencies: none
	- Estimate: L
	- Output: cleaned HTML/content set with Wayback artifacts removed
- [ ] Rewrite archived links/assets to classicstorymaps.com equivalents when local mirrors exist.
	- Priority: P0
	- Dependencies: sanitized HTML/content set
	- Estimate: M
	- Output: rewritten internal links and asset references
- [ ] Preserve historical external references when no local equivalent exists.
	- Priority: P1
	- Dependencies: rewrite rules for local mirrors defined
	- Estimate: S
	- Output: explicit rules for local vs external link retention
- [x] Build archive-themed root experience with archive label and CTA text:
	- Priority: P0
	- Dependencies: hosting context and root navigation targets finalized
	- Estimate: S
	- Output: root page with "To view classic stories, click here" and "here" linked to /viewers
- [ ] Generate archive-notice placeholders for unavailable pages/resources.
	- Priority: P1
	- Dependencies: availability classification complete
	- Estimate: M
	- Output: placeholder page templates and mapped missing routes

Phase checklist
- [x] Root page presents archive banner with 2017-12-10 reference.
- [ ] Core archived navigation is functional.
- [ ] Missing sections are handled via explicit placeholders.

## Phase 4: Asset and Subpage Completeness

Estimated phase effort: M (2-4 days)

Focused tasks
- [ ] Inventory app-list linked subpages/assets and classify each as mirrored-local, rewritten-remote, or unavailable-placeholder.
	- Priority: P0
	- Dependencies: captured archived navigation set
	- Estimate: S
	- Output: inventory spreadsheet/markdown table
- [ ] Ensure each app card, image, and subpage link on archived shell resolves deterministically in publish output.
	- Priority: P0
	- Dependencies: inventory classification complete
	- Estimate: M
	- Output: resolved path map and fixes
- [ ] Validate no Wayback-only scripts/styles are required for rendering.
	- Priority: P1
	- Dependencies: archived shell link/asset fixes complete
	- Estimate: S
	- Output: dependency audit and cleanup list

Phase checklist
- [ ] Inventory coverage reaches 100% for app-list visible assets and links.
- [ ] No critical broken links/images remain in archived shell.
- [ ] Rendering works without live Wayback runtime dependencies.

## Phase 5: Verification and Rollout Readiness

Estimated phase effort: M (2-3 days)

Focused tasks
- [x] Run build scripts in required order and verify output tree includes root archived site, /viewers landing, /viewers launchers, /viewers runtimes, and legacy redirects.
	- Priority: P0
	- Dependencies: Phases 1-4 completed
	- Estimate: S
	- Output: build logs and artifact tree snapshot
- [x] Execute URL verification for canonical and compatibility routes (status codes and static-stub redirect behavior with query/hash preservation).
	- Priority: P0
	- Dependencies: output tree generated
	- Estimate: S
	- Output: route verification report
- [ ] Smoke-test representative launches (maptour, mapjournal, mapseries, shortlist, swipe) from /viewers launchers.
	- Priority: P0
	- Dependencies: canonical and compatibility routes validated
	- Estimate: S
	- Output: smoke test pass/fail list
- [ ] Document known archival gaps and final route contract.
	- Priority: P1
	- Dependencies: route verification and smoke tests completed
	- Estimate: S
	- Output: final notes in deployment docs/runbook

Phase checklist
- [x] All critical canonical routes pass.
- [x] Legacy redirects pass expected behavior checks.
- [ ] Representative app launches succeed.
- [ ] Known gaps are documented and accepted.

## Execution Order (Priority-Driven)
1. Complete all P0 tasks in Phase 1 and Phase 2 first to establish deployable /viewers canonical behavior on GitHub Pages.
2. Run Phase 3 and Phase 4 P0 tasks to reconstruct archived content and stabilize links/assets.
3. Execute Phase 5 P0 validation tasks; do not proceed to release until these pass.
4. Complete P1 documentation hardening and fallback behavior updates.
5. Treat P2 IIS-specific updates as optional unless a non-GitHub Pages hosting target is reintroduced.

## Overall Timeline (Rough)

- Minimum path: 11-14 working days
- Expected path: 14-20 working days
- Risk-adjusted path (if archive gaps are high): 20+ working days

## Relevant Files
- apps/classic-storymaps-site/index.html - landing card route map and runtime path targets to canonicalize to /viewers.
- apps/classic-storymaps-site/maptour-launcher.html - representative launcher with hard-coded catalog/route links to migrate.
- apps/classic-storymaps-site/mapjournal-launcher.html - launcher link/path migration pattern.
- apps/classic-storymaps-site/mapseries-launcher.html - launcher link/path migration pattern.
- apps/classic-storymaps-site/swipe-launcher.html - launcher link/path migration pattern.
- apps/classic-storymaps-site/assets/js/classic-story-loader.js - base-path resolver and runtime URL construction defaults.
- scripts/build-classic-storymaps-landing.sh - landing/root assembly and compatibility stub generation insertion point.
- scripts/build-classic-storymaps-runtime-publish.sh - runtime output root for canonical /viewers publish layout.
- .github/workflows/deploy-classic-storymaps-pages.yml - deployment validation paths to update for /viewers canonical.
- docs/architecture/phase1-s3-route-matrix.md - route contract update source of truth.
- docs/deployment/phase2-s5-landing-catalog-shell.md - root/catalog relationship and rewrite behavior docs.
- docs/deployment/phase4-s8-package-boundary-and-assembly.md - assembly sequence and output boundary updates.
- scripts/run-phase4-s9-iis-checklist.ps1 - redirect semantics checks to align with /viewers canonical + legacy compatibility.
- publish/index.html - current generated root page target (derived from root-index source) for final archived banner behavior verification.
- classic-apps/Classic Apps WebPage - Jun 2016 Internet Archive.html - existing archive sanitization pattern reference.

## Verification Checklist
- [x] Build order verification: run landing build then runtime publish and confirm deterministic output.
- [x] URL contract verification: check /, /viewers, /viewers/index.html, /viewers/*-launcher.html, /viewers/<app>/index.html.
- [x] Redirect verification: check legacy /templates/classic-storymaps* to /viewers* static redirect behavior and query/hash preservation (GitHub Pages static stubs return 200 and do not emit Location headers).
- [ ] App launch verification: open sample launch URLs with appid for at least 5 runtimes and confirm viewer load.
- [ ] Archive integrity verification: crawl rebuilt archived navigation and ensure no unresolved web.archive.org dependency is required for primary rendering.
- [ ] Placeholder verification: unavailable pages render clear archive-notice pages and maintain user navigation path.

## Decisions
- Scope: "As much as available" for old site recreation, not only app-list.
- Canonical runtime/catalog path: /viewers.
- Legacy support: keep /templates/classic-storymaps as compatibility redirects.
- Banner archive date reference: 2017-12-10 snapshot.
- Banner CTA requirement: include "To view classic stories, click here" with "here" linking to /viewers.
- Hosting target: GitHub Pages for this repository with custom domain classicstorymaps.com.

## Further Considerations
1. Redirect mechanism recommendation: Prefer IIS/server rewrites for HTTP-correct redirects; keep generated static fallback stubs for environments without rewrite control.
2. Historical fidelity recommendation: Preserve original copy/layout where possible, but prioritize stable local assets and deterministic navigation over exact script parity with archived runtime injections.
3. Deployment safety recommendation: Keep dual-path support through at least one release cycle before removing any legacy path assumptions in downstream docs or bookmarks.
