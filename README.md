# Classic Storymaps Viewer Pages

Monorepo for hosting Classic Storymaps landing and per-app viewer helper pages under `/templates/classic-storymaps`.

## Initial Contents
- `.github/prompts/plan-storymapsSiteDeploy.prompt.md` - primary execution checklist and scope for this repo
- `apps/` - app-specific page implementations
- `docs/` - deployment, operations, and architecture notes

## Local Runtime Caches
- Extracted runtime release bundles under `runtimes/*/release-*` are treated as local fallback caches and are git-ignored.
- The current Cascade fallback at `runtimes/cascade/release-1.23.0` is intentionally kept local so `scripts/build-cascade-runtime.sh` can recover when the upstream legacy build cannot reproduce the original deploy output.

## Tests

From the repository root, run the tests with Node.js 20 or later:

```sh
node --test scripts/tests/
```

Tests use Node's built-in test runner and require no additional dependencies.
Add regression tests as `scripts/tests/*.test.mjs`. The Pages workflow runs
the suite before building; a test failure stops the build and deployment.

## Authentication and Shared-Origin Risk

Owner decision for review fix A1: continue on the shared GitHub Pages origin
with a requested 120-minute ArcGIS token. The catalog uses the OAuth response's
`expires_in` for the cookie's `Max-Age` and JSON expiry, and retains an absolute
expiry in session storage so reloading cannot extend the session. Stored tokens
without expiry metadata require signing in again. Sign-out clears the local
token, expiry metadata, and `esri_auth` cookie; it does not revoke already issued
tokens at ArcGIS.

The `esri_auth` cookie remains JavaScript-readable with `Path=/` because the
legacy runtimes consume it. Other Pages sites served from
`https://dasbury-esri.github.io` can read this session cookie. Cookie paths,
`SameSite`, and `Secure` do not isolate those sites from one another. Shorter
token lifetimes reduce the exposure window but do not remove this risk.
Isolation from other Pages projects requires a dedicated origin. That migration
is deferred by the owner decision; author-written story HTML running on this
site's origin remains a separate risk even on a dedicated origin.

References: [ArcGIS OAuth authorize parameters and response](https://developers.arcgis.com/rest/users-groups-and-items/authorize/)
and [MDN cookie attributes and path limitations](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#attributes).

## Next Steps
1. Refine the site deployment plan prompt for phase sequencing and effort sizing.
2. Define route contract and adapter matrix for phase-1 apps.
3. Implement shared validation and page shell.
