---
description: "Owner decisions of 2026-10-17 that unblock the GitHub ownership transfer of this viewer repository, the owner answer sheet for its next public release, and the ordered viewer transfer steps."
agent: agent
---

# Ownership Transfer Decisions

Recorded 2026-10-17 by Claude from David's instructions. This file
**supersedes** every statement in `STATUS.md`, the
[resolution plan](../../docs/licenses/redistribution-resolution-plan.md) and the
[provenance audit](../../docs/testing/migration-provenance-audit.md) that makes
retained-content rights a gate for the repository transfer. Those documents
remain the evidence record; their transfer gates do not. The companion converter
repository holds its own copy of these decisions together with its private
steps; this public copy covers the viewer only.

## Owner Decisions

| ID | Decision |
| --- | --- |
| D1 | **The transfer goes ahead now.** Retained-content rights review moves to "before any new public release". It no longer gates moving this repository from `dasbury-esri` to `davidasbury`. |
| D2 | **This repository is hybrid (ADR-024)**, which is already in place: `extra.agents` lists `[claude, copilot-enterprise]`. Hybrid is not a `domain` value; the schema allows only `work` or `personal`. `domain: work` and `confidential: false` stay unchanged. |
| D3 | **Scoped exception to the "no personal GitHub" rule** in `.github/copilot-instructions.md`. This repository may record its own canonical location under the `davidasbury` GitHub account, `classicstorymaps.com` and its `convert` subdomain, and the converter's existing Netlify site. Everything else in that rule stands: no Nextcloud, machine paths, home-network hostnames or credentials. |
| D4 | **Hosting stays where it is.** The viewer stays on GitHub Pages, Cloudflare stays authoritative DNS, and the repository stays public. |
| D5 | **Unchanged from earlier decisions:** no history rewrite. The viewer's conversion integration stays gated. |

The transfer changes **who owns** the repository, not **what is public**. The
viewer is already public and served by Pages, so every open rights question is
exactly as open before the move as after it.

## What Gates What

| Action | Gate |
| --- | --- |
| Transfer; restore the custom domain; redeploy the current `main` | The steps below, run by the owner. No rights clearance needed. |
| **New public release:** new third-party content, the fonts or images named below, or enabling the conversion integration | The answer sheet below, the open attribution checks in the resolution plan, and owner acceptance |

Redeploying the current `main` during the transfer is not a new public release.
Its only changes since the live deploy (`9910cd3`, 2026-10-14) are tracking
documents, notice tooling, the Ionicons license, and the removal of eight unused
fonts. It adds no third-party content.

## Owner Answer Sheet (Gates the Next Public Release Only)

Ask these as **one message**, and record each answer under its exact paths and
hashes. Do not start new audits; refresh the inventory only for a selected
release candidate.

1. **Four Tailcoat and four Basic Fontello font files:** keep (owner accepts the documented risk) / replace with Font Awesome or Ionicons glyphs, after the owner approves how they look.
2. **Unresolved archive images and other candidates with no recorded basis:** keep under their existing runtime and archive basis unless a specific file is flagged / continue tracing.

## Viewer Transfer Steps

Agents do not change GitHub, Cloudflare or ArcGIS settings; the owner does.
Record each result in a session log. The converter transfers first; its
repository records its own steps.

1. **Domain verification on `davidasbury` (before transferring):** go to GitHub `davidasbury` → Settings → Pages → Verified domains and add `classicstorymaps.com`. Create the TXT record it shows in Cloudflare and verify it. Keep the existing `dasbury-esri` verification record.
2. **Record current state (names only, never values):** visibility; `main` SHA (`git ls-remote origin main`); branches, including `validation/batch-d-releases` (keep or delete it first); collaborators; deploy keys; Actions secrets and variables; Pages source and custom-domain field.
3. **Sign-in redirects:** on the ArcGIS application (client `4ZanYdCYK0mWsFLz`), **add** redirect URIs for `https://classicstorymaps.com/` and the viewer paths that sign in. Keep the existing ones.
4. **Transfer:** move the repository to `davidasbury`, keeping the same name and keeping it public. Confirm the `main` SHA and the Actions variables match step 2.
5. **Pages:** in Settings → Pages, set the source to GitHub Actions and the custom domain to `classicstorymaps.com`. In the same change, **clear the `SITE_BASE_PATH` variable**. The workflow writes `publish/CNAME`, but Actions deploys ignore that file; the Settings field is what binds the domain.
6. **Redeploy:** run the Pages workflow on `main`. Turn on Enforce HTTPS once the certificate is issued.
7. **Check, using tools independent of this repository:**
   - `https://classicstorymaps.com/` returns 200 with a valid certificate.
   - `www` redirects to the apex domain.
   - A viewer path with a query string loads.
   - The owner completes one real sign-in.
   - The old `dasbury-esri.github.io/classic-storymaps-viewer-pages/` now returns 404. That is expected: GitHub does not redirect Pages URLs after a transfer.
8. **After:** update `origin` in every clone, and update repository links that name `dasbury-esri` (as permitted by D3).

`classic-story-search.netlify.app`, linked from the launchers, is a separate
site and is not part of this transfer.

## Rollback

Transfer the repository back to `dasbury-esri` and restore the custom-domain
field and `SITE_BASE_PATH`. Never create a placeholder repository under the old
name. Leave both domain verification records in place.
