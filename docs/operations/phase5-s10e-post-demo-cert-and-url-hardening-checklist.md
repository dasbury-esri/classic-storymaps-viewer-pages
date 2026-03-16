## Phase 5-S10e: Post-Demo Cert Recovery and URL Hardening Checklist

Purpose: recover custom-domain HTTPS on GitHub Pages, then harden classic runtime URL and redirect behavior so Pages matches storymaps.esri.com behavior.

Use this checklist in order. Do not start URL hardening until cert recovery gates pass.

### Section A: Preflight and Freeze

- [x] Confirm demo window is complete.
- [x] Freeze non-critical code and DNS edits.
- [x] Confirm current fallback endpoint still works:
  - `https://storymaps.esri.com/templates/classic-stories/`
- [x] Confirm current Pages endpoint still works:
  - `https://dasbury-esri.github.io/classic-storymaps-viewer-pages/templates/classic-storymaps/`

Go/No-Go A

- [x] Proceed only if both fallback and Pages endpoints are reachable.

### Section B: Certificate Recovery (custom domain)

1) Verify Pages state before reattach

- [x] Run:
  - `gh api repos/dasbury-esri/classic-storymaps-viewer-pages/pages`
- [x] Record `cname`, `html_url`, `https_enforced` in notes.

2) Reattach custom domain

- [x] Run:
  - `gh api -X PUT repos/dasbury-esri/classic-storymaps-viewer-pages/pages -f cname=classicstorymaps.com`
- [x] Recheck Pages state.

3) Validate DNS from public resolver

- [x] Apex A records return GitHub Pages IPs.
- [x] `www` CNAME points to `dasbury-esri.github.io`.
- [x] No restrictive CAA blocks issuance.

Suggested checks:

- `curl -s "https://dns.google/resolve?name=classicstorymaps.com&type=A"`
- `curl -s "https://dns.google/resolve?name=www.classicstorymaps.com&type=CNAME"`
- `curl -s "https://dns.google/resolve?name=classicstorymaps.com&type=CAA"`

4) Attempt HTTPS enforcement

- [x] Run:
  - `gh api -X PUT repos/dasbury-esri/classic-storymaps-viewer-pages/pages -f cname=classicstorymaps.com -F https_enforced=true`
- [x] If response is `The certificate does not exist yet`, wait 15 minutes and retry. (Not needed in final successful run)
- [x] Retry up to 8 times (about 2 hours). (Not needed in final successful run)

5) Verify cert gate

- [x] `gh api repos/dasbury-esri/classic-storymaps-viewer-pages/pages` shows `https_enforced: true`.
- [x] `https://classicstorymaps.com/templates/classic-storymaps/` returns 200/301 (not TLS failure).
- [x] `https://www.classicstorymaps.com/templates/classic-storymaps/` returns 200/301.

Go/No-Go B

- [x] If cert is still not issued after 2 hours, stop retries and open GitHub Support with: (Not triggered; cert issued and HTTPS enforced)
  - repo name
  - custom domain
  - timestamps
  - exact API error text
  - DNS evidence

Section B execution notes (2026-03-16)

- Initial pre-reattach API state: `cname: null`, `html_url: https://dasbury-esri.github.io/classic-storymaps-viewer-pages/`, `https_enforced: true`.
- After reattach: `cname: classicstorymaps.com`, certificate state progressed from `new` to `approved`, and `https_enforced: true`.
- Approved certificate domains include both `classicstorymaps.com` and `www.classicstorymaps.com` with expiry `2026-06-14`.
- Public DNS checks show apex A records on GitHub Pages IPs and no restrictive CAA entries.
- Local network probes to custom-domain HTTPS currently return TLS handshake reset from this machine.
- External verification from a remote fetch proxy (`r.jina.ai`) confirms HTTPS reachability and landing page content for both apex and `www` URLs.

Rollback B

- [ ] If urgent stability is needed, detach custom domain again:
  - `gh api -X PUT repos/dasbury-esri/classic-storymaps-viewer-pages/pages -f cname=`

### Section C: URL and Redirect Hardening

Scope for this section:

- Normalize legacy and embed URLs so project Pages and custom domain both resolve runtime assets correctly.
- Add compatibility redirects for legacy path family `/templates/classic-stories/*`.

1) Runtime URL normalization audit

- [x] Audit mapseries, mapjournal, and cascade runtime code for root-absolute `/templates/classic-storymaps/...` asset and embed references.
- [x] Ensure URL builders derive from deployment base path and preserve query/hash.

2) Compatibility redirects

- [x] Add static redirect stubs for `/templates/classic-stories/*` to `/templates/classic-storymaps/*` with query preservation.
- [x] Validate representative old links map to correct new routes.

3) Launcher and loader consistency

- [x] Verify launcher open-viewer links preserve repo prefix on project Pages.
- [x] Verify Back to Catalog links preserve repo prefix on project Pages.

4) Rebuild and deploy

- [x] Rebuild affected runtimes.
- [x] Rebuild landing.
- [x] Publish artifacts.
- [x] Push and wait for Pages workflow success.

Go/No-Go C

- [x] Continue only if build and deploy are green.

Section C execution notes (2026-03-16)

- Added static compatibility redirect stubs at `publish/templates/classic-stories/*` via `scripts/build-classic-storymaps-landing.sh` generation step.
- Redirect stubs preserve query string and hash while remapping `/templates/classic-stories` to `/templates/classic-storymaps`.
- Updated launcher runtime inference in `apps/classic-storymaps-site/assets/js/classic-story-loader.js` to detect runtime folder from any base path (no hard-coded `/classic-storymaps` dependency).
- Rebuilt landing and republished runtime artifacts locally.
- Pushed commit `93a59bd` and verified GitHub Actions deploy workflow `23165031897` completed successfully.
- Validated representative legacy route mappings preserve query/hash and translate to canonical `/templates/classic-storymaps/*` targets.

### Section D: Post-Hardening Smoke Suite

Run on selected endpoint(s):

- [x] Catalog root
- [x] 2 launcher pages
- [x] 2 runtime appid links
- [x] Embedded app links inside Map Series
- [x] Embedded app links inside Map Journal
- [x] Embedded app links inside Cascade
- [x] Legacy `/templates/classic-stories/*` compatibility links

Required result:

- [x] No blocking 404s for runtime assets. (PASS: sampled runtime assets referenced by tested pages are present in publish output)
- [ ] No TLS errors on custom domain (if cert gate passed). (FAIL from current network: `curl` to `https://classicstorymaps.com/templates/classic-storymaps/` returns `status=000`, `curl: (35) Recv failure: Connection was reset`)
- [ ] No blocking console errors in tested paths. (FAIL/PENDING: browser DevTools validation is still blocked by network access constraints; published artifacts still contain localhost livereload references in Cascade/Crowdsource sources)

Section D execution notes (2026-03-16)

- Direct local curl checks to `classicstorymaps.com` continue to fail with TLS handshake reset from this network (`curl: (35)`), so local status-only probes are not representative.
- External reachability checks were executed via remote fetch proxy (`r.jina.ai`) and confirmed content retrieval for catalog, two launchers, two runtime appid URLs, and embedded candidates.
- Legacy compatibility behavior remains validated by deployed static stubs in `publish/templates/classic-stories/*` and by previously validated path-mapping logic that preserves query/hash to canonical `/templates/classic-storymaps/*` targets.
- Runtime asset and console-error checks require a full browser/network session (DevTools) and are still pending as explicit checklist items.
- Runtime asset presence validation sample: `mapjournal/resources/tpl/viewer/icons/loading-light.gif`, `mapseries/resources/tpl/viewer/icons/loading-light.gif`, `maptour/app/maptour-viewer-min.js`, and `cascade/app/main-config.js` all exist in publish output.
- ServiceNow request is open with Esri IST to unblock `classicstorymaps.com`; expected response time is approximately one week.

### Section E: Final Lock and Handoff

- [ ] Record final primary endpoint decision.
- [ ] Record fallback endpoint decision.
- [ ] Freeze non-critical changes.
- [ ] Update strict run-sequence checklist with final states.

Done criteria:

- [ ] Custom-domain HTTPS is healthy OR documented as blocked with support case.
- [ ] Runtime embed behavior matches expected classic behavior on chosen endpoint.
- [ ] Compatibility redirects validated.
