# S9 Validation Transcript Template: IIS Route, Cache, and Fallback

## Environment

- Date: 2026-03-12
- Operator: David Asbury
- IIS host: storymaps.esri.com (Default Web Site)
- Site/app path: https://localhost/templates/classic-storymaps
- Package commit SHA:

## Route Validation

### Landing

- [ ] `GET /templates/classic-storymaps/` -> expected 200
- Notes:

### Launchers

- [ ] `GET /templates/classic-storymaps/maptour-launcher.html` -> expected 200
- [ ] `GET /templates/classic-storymaps/swipe-launcher.html` -> expected 200
- [ ] `GET /templates/classic-storymaps/mapjournal-launcher.html` -> expected 200
- Notes:

### Runtimes

- [ ] `GET /templates/classic-storymaps/maptour/index.html` -> expected 200
- [ ] `GET /templates/classic-storymaps/swipe/index.html` -> expected 200
- [ ] `GET /templates/classic-storymaps/mapjournal/index.html` -> expected 200
- Notes:

## Compatibility and Fallback Validation

- [ ] `/templates/classic-stories/...` redirects to `/templates/classic-storymaps/...`
- [ ] Invalid launcher query inputs return guided UX (no server error page)
- [ ] Invalid appid/runtime paths fail gracefully without breaking landing route
- Notes:

## Cache/Header Validation

- [ ] HTML responses use expected conservative cache policy
- [ ] Static assets use expected long-lived cache policy
- [ ] Cache behavior does not break runtime load sequence
- [ ] Required asset MIME types are correct (`js`, `css`, `woff2`, `svg`, etc.)
- Notes:

## Sample Command Log

Document the actual probes run (PowerShell, curl, browser devtools, or IIS logs), including response codes and key headers.

## Acceptance Summary

- Landing and runtime routes serve correctly: [ ] Pass [ ] Fail
- Cache behavior matches policy without runtime regressions: [ ] Pass [ ] Fail
- Follow-up actions:
