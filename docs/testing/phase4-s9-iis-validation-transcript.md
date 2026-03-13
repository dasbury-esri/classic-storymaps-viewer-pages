# S9 Validation Transcript: IIS Route, Cache, and Fallback

## Environment

- Date: 2026-03-13
- Operator: David Asbury
- IIS host: storymaps.esri.com (Default Web Site)
- Site/app path: https://localhost/templates/classic-storymaps
- Package commit SHA: 8002b6905916434cca1be44e80246eb6c2b9dd86

## Route Validation

- [x] GET /templates/classic-storymaps/ -> 200
- [x] GET /templates/classic-storymaps/maptour-launcher.html -> 200
- [x] GET /templates/classic-storymaps/swipe-launcher.html -> 200
- [x] GET /templates/classic-storymaps/mapjournal-launcher.html -> 200
- [x] GET /templates/classic-storymaps/maptour/index.html -> 200
- [x] GET /templates/classic-storymaps/swipe/index.html -> 200
- [x] GET /templates/classic-storymaps/mapjournal/index.html -> 200
- Notes:

## Compatibility and Fallback Validation

- [x] /templates/classic-stories redirect
- [x] Invalid launcher input: /templates/classic-storymaps/maptour-launcher.html?appid=bad
- [x] Invalid launcher input: /templates/classic-storymaps/swipe-launcher.html?appid=bad
- [x] Invalid launcher input: /templates/classic-storymaps/mapjournal-launcher.html?appid=bad
- [x] Invalid runtime input: /templates/classic-storymaps/maptour/index.html?appid=bad
- [x] Invalid runtime input: /templates/classic-storymaps/swipe/index.html?appid=bad
- [x] Invalid runtime input: /templates/classic-storymaps/mapjournal/index.html?appid=bad
- Notes:

## Cache/Header Validation

- [x] HTML uses conservative cache policy
- [x] Static assets use long-lived cache policy
- [ ] Compression enabled for sampled text assets
- [x] Required asset MIME types are correct
- [x] Header rules do not block same-site runtime resources
- Notes:

## Sample Command Log

Executed with PowerShell 2.0 script: scripts/run-phase4-s9-iis-checklist.ps1

| Category | Check | Pass | Status | Detail |
|---|---|---|---|---|
| Routes | GET /templates/classic-storymaps/ -> 200 | Yes | 200 | Expected 200, got 200 |
| Routes | GET /templates/classic-storymaps/maptour-launcher.html -> 200 | Yes | 200 | Expected 200, got 200 |
| Routes | GET /templates/classic-storymaps/swipe-launcher.html -> 200 | Yes | 200 | Expected 200, got 200 |
| Routes | GET /templates/classic-storymaps/mapjournal-launcher.html -> 200 | Yes | 200 | Expected 200, got 200 |
| Routes | GET /templates/classic-storymaps/maptour/index.html -> 200 | Yes | 200 | Expected 200, got 200 |
| Routes | GET /templates/classic-storymaps/swipe/index.html -> 200 | Yes | 200 | Expected 200, got 200 |
| Routes | GET /templates/classic-storymaps/mapjournal/index.html -> 200 | Yes | 200 | Expected 200, got 200 |
| Fallback | /templates/classic-stories redirect | Yes | 301 | Expected redirect to /templates/classic-storymaps/* |
| Fallback | Invalid launcher input: /templates/classic-storymaps/maptour-launcher.html?appid=bad | Yes | 200 | Expected 200 + non-empty HTML; got status 200, length 8918 |
| Fallback | Invalid launcher input: /templates/classic-storymaps/swipe-launcher.html?appid=bad | Yes | 200 | Expected 200 + non-empty HTML; got status 200, length 11070 |
| Fallback | Invalid launcher input: /templates/classic-storymaps/mapjournal-launcher.html?appid=bad | Yes | 200 | Expected 200 + non-empty HTML; got status 200, length 9112 |
| Fallback | Invalid runtime input: /templates/classic-storymaps/maptour/index.html?appid=bad | Yes | 200 | Expected non-500 status, got 200 |
| Fallback | Invalid runtime input: /templates/classic-storymaps/swipe/index.html?appid=bad | Yes | 200 | Expected non-500 status, got 200 |
| Fallback | Invalid runtime input: /templates/classic-storymaps/mapjournal/index.html?appid=bad | Yes | 200 | Expected non-500 status, got 200 |
| Cache | HTML uses conservative cache policy | Yes | 200 | Cache-Control='no-cache' |
| Cache | Static assets use long-lived cache policy | Yes |  | /templates/classic-storymaps/maptour/app/maptour-viewer-min.js => status=200, cache='public, max-age=604800', encoding=''; /templates/classic-storymaps/maptour/app/maptour-min.css => status=200, cache='public, max-age=604800', encoding=''; /templates/classic-storymaps/maptour/resources/icons/esri-logo.png => status=200, cache='public, max-age=604800', encoding='' |
| Headers | Compression enabled for sampled text assets | No |  | /templates/classic-storymaps/maptour/app/maptour-viewer-min.js => status=200, cache='public, max-age=604800', encoding=''; /templates/classic-storymaps/maptour/app/maptour-min.css => status=200, cache='public, max-age=604800', encoding=''; /templates/classic-storymaps/maptour/resources/icons/esri-logo.png => status=200, cache='public, max-age=604800', encoding='' |
| Headers | Required asset MIME types are correct | Yes |  | js => status=200, content-type='application/x-javascript'; css => status=200, content-type='text/css'; png => status=200, content-type='image/png'; svg => status=200, content-type='image/svg+xml'; woff2 => status=200, content-type='font/woff2' |
| Headers | Header rules do not block same-site runtime resources | Yes |  | No same-site resource blocks detected in sampled requests (non-authoritative, sampled check). |

## Acceptance Summary

- Landing and runtime routes serve correctly: [x] Pass [ ] Fail
- Cache behavior matches policy without runtime regressions: [x] Pass [ ] Fail
- Follow-up actions:
