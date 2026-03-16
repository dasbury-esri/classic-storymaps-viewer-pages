# S10d Pages Domain Gate Transcript: 2026-03-16

## Objective

Record the current GitHub Pages plus custom-domain gate state for the Stage A demo path while certificate issuance is pending.

## Environment

- Date (UTC): 2026-03-16
- Operator: David Asbury
- Monorepo SHA: ba1b4bc
- Pages repo: dasbury-esri/classic-storymaps-viewer-pages
- Pages default host: https://dasbury-esri.github.io/classic-storymaps-viewer-pages/
- Custom domain target: classicstorymaps.com

## Observed State

- GitHub Pages workflow deploy completed successfully on run `23131144703`.
- Repository Pages settings show `cname: classicstorymaps.com`.
- Repository Pages settings still show `https_enforced: false`.
- GitHub Pages API still returns `The certificate does not exist yet` when attempting to enforce HTTPS.
- Public DNS-over-HTTPS resolves:
  - `classicstorymaps.com` to GitHub Pages edge IPs (`185.199.108.153` through `185.199.111.153`, plus GitHub Pages IPv6 addresses)
  - `www.classicstorymaps.com` as `CNAME dasbury-esri.github.io`
- The default `github.io` hostname now returns `301` to `http://classicstorymaps.com/...` after the custom domain was attached.
- From the Esri corporate network, requests to `classicstorymaps.com` return an `Access Blocked` page categorized as `high-risk`.
- Because of that redirect, the default `github.io` hostname is not an independent fallback while the custom domain remains attached.

## Pass/Fail Matrix

| Area | Check | Result | Notes |
|---|---|---|---|
| CI/CD | Pages build and deploy run completes | Pass | Run `23131144703` succeeded |
| GitHub Pages | Custom domain bound in repo settings | Pass | `cname: classicstorymaps.com` |
| DNS | Apex resolves to GitHub Pages | Pass | Verified via DNS-over-HTTPS |
| DNS | `www` resolves to GitHub Pages | Pass | `CNAME dasbury-esri.github.io` |
| HTTPS | Certificate issued and enforceable | Fail | GitHub API still reports `The certificate does not exist yet` |
| Default host | `github.io` remains independent fallback | Fail | Redirects to custom domain once bound |
| Corporate-network reachability | `classicstorymaps.com` accessible from Esri network | Fail | Blocked by network policy |

## Immediate Implications

- Custom-domain HTTPS remains blocked until GitHub issues the certificate.
- Local smoke testing from the Esri corporate network is not a reliable indicator for the custom domain because that network blocks the domain.
- If the custom domain must be bypassed for demo fallback, remove the custom domain from GitHub Pages first so the default `github.io` hostname stops redirecting.

## Next Retry Conditions

Retry enabling HTTPS when both of these remain true:

1. DNS records remain gray-cloud and stable.
2. GitHub Pages deploy continues succeeding.

Retry command:

```bash
gh api -X PUT repos/dasbury-esri/classic-storymaps-viewer-pages/pages -f cname=classicstorymaps.com -F https_enforced=true
```

## Next Safe Actions Before HTTPS Turns Green

1. Continue recording gate status in the strict run sequence.
2. Use a second network or non-Esri device for custom-domain validation.
3. Prepare rollback move: remove custom domain from Pages if the default `github.io` hostname is needed as a fallback endpoint.
