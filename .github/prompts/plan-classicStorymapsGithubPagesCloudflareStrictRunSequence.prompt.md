## Strict Run Sequence: Tonight + Tomorrow Morning (PT)

Assumption: fallback remains `https://storymaps.esri.com/templates/classic-stories/*` and no DNS changes are made that impact the current production host.

### Tonight

1. 7:00 PM to 7:30 PM — Preflight and freeze window
- [x] Confirm demo scope is Stage A only.
- [x] Confirm no path refactor work enters this window.
- [x] Confirm all required repo permissions for GitHub Pages and Actions.
- [x] Go/No-Go checkpoint passed: permissions and scope are confirmed.
- [ ] Rollback if needed: stop here with zero production impact.

2. 7:30 PM to 9:00 PM — Build and artifact readiness
- [x] Run landing build and runtime publish assembly.
- [x] Validate artifact tree for canonical path `/templates/classic-storymaps/*`.
- [x] Prepare deploy extras `.nojekyll` and `CNAME` content `classicstorymaps.com`.
- [x] Go/No-Go checkpoint passed: all 8 runtime folders and landing files are present and load locally.
- [ ] Rollback if needed: keep current production unchanged and defer demo to fallback host.

3. 9:00 PM to 10:00 PM — Deploy workflow + first Pages publish
- [x] Trigger minimal Pages pipeline publish.
- [x] Blocker noted: GitHub API returned 422 (`Your current plan does not support GitHub Pages for this repository`).
- [x] Confirm Pages artifact deployment completes successfully.
- [x] Validate default Pages hostname serves canonical path content.
- [x] Go/No-Go checkpoint passed: default Pages URL is stable for landing + 2 launchers + 2 runtime URLs.
- [ ] Rollback if needed: no DNS cutover; demo fallback remains `storymaps.esri.com`.

4. 10:00 PM to 11:00 PM — Domain wiring setup (safe mode)
- [x] Configure GitHub custom domain to `classicstorymaps.com`.
- [x] Blocker noted: GitHub Pages API returned `The certificate does not exist yet` when enforcing HTTPS; after custom-domain binding, the default `github.io` hostname now 301-redirects to `classicstorymaps.com` and is no longer an independent fallback while the custom domain is attached.
- [ ] Configure Cloudflare DNS (`www` CNAME and apex flattening) and SSL Full strict.
- [ ] Keep CDN caching conservative.
- [ ] Go/No-Go checkpoint passed: DNS records are correct and certificate issuance begins.
- [ ] Rollback if needed: remove custom domain in Pages to recover the default Pages hostname as the demo endpoint.

5. 11:00 PM to 11:30 PM — Nightly smoke gate
- [ ] Smoke test default Pages hostname.
- [ ] Smoke test `classicstorymaps.com/templates/classic-storymaps/` if propagated.
- [x] Record pass/fail matrix for morning go-live decision.
- [ ] Go/No-Go checkpoint passed: default Pages path passes all core tests, even if custom domain is still propagating.
- [ ] Rollback if needed: declare fallback demo route `storymaps.esri.com/templates/classic-stories/*`.

### Tomorrow Morning

6. 7:00 AM to 8:00 AM — Propagation and cert recheck
- [ ] Re-validate DNS and HTTPS on apex + `www`.
- [ ] Purge Cloudflare cache once after successful validation.
- [ ] Go/No-Go checkpoint passed: HTTPS + canonical path works on custom domain.
- [ ] Rollback if needed: use default Pages hostname or full fallback to `storymaps.esri.com`.

7. 8:00 AM to 9:00 AM — Final content smoke and rehearsal
- [ ] Run strict smoke set on selected demo endpoint.
- [ ] Validate catalog root canonical URL.
- [ ] Validate 2 launcher pages.
- [ ] Validate 2 runtime appid URLs.
- [ ] Confirm no blocking console/runtime errors.
- [ ] Go/No-Go checkpoint passed: all tested routes pass on selected demo endpoint.
- [ ] Rollback if needed: switch endpoint in order: custom domain -> default Pages hostname -> `storymaps.esri.com/templates/classic-stories/*`.

8. 9:00 AM to 10:15 AM — Lock demo endpoint and freeze changes
- [ ] Choose one endpoint as source of truth for demo.
- [ ] Freeze code and DNS edits except critical fixes.
- [ ] Prepare short backup script with fallback URLs.
- [ ] Go/No-Go checkpoint passed: chosen endpoint has 100% pass on smoke set.
- [ ] Rollback if needed: announce fallback endpoint and stop further infra edits.

9. 10:15 AM to 10:45 AM — Final readiness check
- [ ] Re-run 5-minute spot checks on chosen endpoint.
- [ ] Verify from a second network/device if possible.
- [ ] Go/No-Go checkpoint passed: checks pass twice consecutively.
- [ ] Rollback if needed: immediate swap to fallback endpoint with prewritten links.

10. 10:45 AM to 11:00 AM — Buffer and handoff
- [ ] Hold change freeze (no edits).
- [ ] Open demo tabs for primary and fallback endpoint.
- [ ] Keep rollback order visible during demo.
- [ ] Go/No-Go checkpoint passed: primary endpoint stable at 10:55 AM.
- [ ] Rollback if needed: start demo on `https://storymaps.esri.com/templates/classic-stories/*`.

### Hard Stop Rules

- [ ] If Pages deploy fails twice consecutively, stop infra changes and lock fallback plan.
- [ ] If custom domain HTTPS is not clean by 8:30 AM PT, do not use it as primary demo endpoint.
- [ ] If both custom domain and default Pages hostname are unstable by 9:30 AM PT, run demo entirely on current production fallback.

### Demo Endpoint Decision Rule

- [ ] Primary: `https://classicstorymaps.com/templates/classic-storymaps/` only if fully green by 9:00 AM PT.
- [ ] Secondary: default GitHub Pages hostname canonical path, but only if the custom domain is removed from Pages first.
- [ ] Tertiary fallback: `https://storymaps.esri.com/templates/classic-stories/*`.
