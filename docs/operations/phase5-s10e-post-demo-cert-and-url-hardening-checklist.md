## Phase 5-S10e: Post-Demo Cert Recovery and URL Hardening Checklist

Purpose: recover custom-domain HTTPS on GitHub Pages, then harden classic runtime URL and redirect behavior so Pages matches storymaps.esri.com behavior.

Use this checklist in order. Do not start URL hardening until cert recovery gates pass.

### Section A: Preflight and Freeze

- [ ] Confirm demo window is complete.
- [ ] Freeze non-critical code and DNS edits.
- [ ] Confirm current fallback endpoint still works:
  - `https://storymaps.esri.com/templates/classic-stories/`
- [ ] Confirm current Pages endpoint still works:
  - `https://dasbury-esri.github.io/classic-storymaps-viewer-pages/templates/classic-storymaps/`

Go/No-Go A

- [ ] Proceed only if both fallback and Pages endpoints are reachable.

### Section B: Certificate Recovery (custom domain)

1) Verify Pages state before reattach

- [ ] Run:
  - `gh api repos/dasbury-esri/classic-storymaps-viewer-pages/pages`
- [ ] Record `cname`, `html_url`, `https_enforced` in notes.

2) Reattach custom domain

- [ ] Run:
  - `gh api -X PUT repos/dasbury-esri/classic-storymaps-viewer-pages/pages -f cname=classicstorymaps.com`
- [ ] Recheck Pages state.

3) Validate DNS from public resolver

- [ ] Apex A records return GitHub Pages IPs.
- [ ] `www` CNAME points to `dasbury-esri.github.io`.
- [ ] No restrictive CAA blocks issuance.

Suggested checks:

- `curl -s "https://dns.google/resolve?name=classicstorymaps.com&type=A"`
- `curl -s "https://dns.google/resolve?name=www.classicstorymaps.com&type=CNAME"`
- `curl -s "https://dns.google/resolve?name=classicstorymaps.com&type=CAA"`

4) Attempt HTTPS enforcement

- [ ] Run:
  - `gh api -X PUT repos/dasbury-esri/classic-storymaps-viewer-pages/pages -f cname=classicstorymaps.com -F https_enforced=true`
- [ ] If response is `The certificate does not exist yet`, wait 15 minutes and retry.
- [ ] Retry up to 8 times (about 2 hours).

5) Verify cert gate

- [ ] `gh api repos/dasbury-esri/classic-storymaps-viewer-pages/pages` shows `https_enforced: true`.
- [ ] `https://classicstorymaps.com/templates/classic-storymaps/` returns 200/301 (not TLS failure).
- [ ] `https://www.classicstorymaps.com/templates/classic-storymaps/` returns 200/301.

Go/No-Go B

- [ ] If cert is still not issued after 2 hours, stop retries and open GitHub Support with:
  - repo name
  - custom domain
  - timestamps
  - exact API error text
  - DNS evidence

Rollback B

- [ ] If urgent stability is needed, detach custom domain again:
  - `gh api -X PUT repos/dasbury-esri/classic-storymaps-viewer-pages/pages -f cname=`

### Section C: URL and Redirect Hardening

Scope for this section:

- Normalize legacy and embed URLs so project Pages and custom domain both resolve runtime assets correctly.
- Add compatibility redirects for legacy path family `/templates/classic-stories/*`.

1) Runtime URL normalization audit

- [ ] Audit mapseries, mapjournal, and cascade runtime code for root-absolute `/templates/classic-storymaps/...` asset and embed references.
- [ ] Ensure URL builders derive from deployment base path and preserve query/hash.

2) Compatibility redirects

- [ ] Add static redirect stubs for `/templates/classic-stories/*` to `/templates/classic-storymaps/*` with query preservation.
- [ ] Validate representative old links map to correct new routes.

3) Launcher and loader consistency

- [ ] Verify launcher open-viewer links preserve repo prefix on project Pages.
- [ ] Verify Back to Catalog links preserve repo prefix on project Pages.

4) Rebuild and deploy

- [ ] Rebuild affected runtimes.
- [ ] Rebuild landing.
- [ ] Publish artifacts.
- [ ] Push and wait for Pages workflow success.

Go/No-Go C

- [ ] Continue only if build and deploy are green.

### Section D: Post-Hardening Smoke Suite

Run on selected endpoint(s):

- [ ] Catalog root
- [ ] 2 launcher pages
- [ ] 2 runtime appid links
- [ ] Embedded app links inside Map Series
- [ ] Embedded app links inside Map Journal
- [ ] Embedded app links inside Cascade
- [ ] Legacy `/templates/classic-stories/*` compatibility links

Required result:

- [ ] No blocking 404s for runtime assets.
- [ ] No TLS errors on custom domain (if cert gate passed).
- [ ] No blocking console errors in tested paths.

### Section E: Final Lock and Handoff

- [ ] Record final primary endpoint decision.
- [ ] Record fallback endpoint decision.
- [ ] Freeze non-critical changes.
- [ ] Update strict run-sequence checklist with final states.

Done criteria:

- [ ] Custom-domain HTTPS is healthy OR documented as blocked with support case.
- [ ] Runtime embed behavior matches expected classic behavior on chosen endpoint.
- [ ] Compatibility redirects validated.
