---
description: "Owner decisions that unblock the GitHub ownership transfer of this viewer repository, the owner answer sheet for its next public release, and the ordered, safeguarded viewer transfer steps."
agent: agent
---

# Ownership Transfer Decisions

Recorded 2026-10-17 by Claude from David's instructions. Reconciled 2026-10-22
with the safeguards in the companion converter repository's plan, which were
checked against GitHub's documentation. This file **supersedes** every statement
in `STATUS.md`, the [resolution plan](../../docs/licenses/redistribution-resolution-plan.md)
and the [provenance audit](../../docs/testing/migration-provenance-audit.md)
that makes retained-content rights a gate for the repository transfer. Those
documents remain the evidence record; their transfer gates do not. This public
copy covers the viewer only.

**Order:** the converter transfers first and must be accepted before any step
below starts.

## Owner Decisions

| ID | Decision |
| --- | --- |
| D1 | **The transfer goes ahead.** Retained-content rights review moves to "before any new public release". It no longer gates moving this repository from `dasbury-esri` to `davidasbury`. |
| D2 | **This repository is hybrid (ADR-024)**, which is already in place: `extra.agents` lists `[claude, copilot-enterprise]`. Hybrid is not a `domain` value; the schema allows only `work` or `personal`. `domain: work` and `confidential: false` stay unchanged. |
| D3 | **Scoped exception to the "no personal GitHub" rule** in `.github/copilot-instructions.md`. This repository may record its own canonical location under the `davidasbury` GitHub account, `classicstorymaps.com` and its `convert` subdomain, and the converter's existing Netlify site. Everything else in that rule stands: no Nextcloud, machine paths, home-network hostnames or credentials. |
| D4 | **Hosting stays where it is.** The viewer stays on GitHub Pages, Cloudflare stays authoritative DNS, and the repository stays public. |
| D5 | **Unchanged from earlier decisions:** no history rewrite. The viewer's conversion integration stays gated. |

The transfer changes **who owns** the repository, not **what is public**. The
viewer is already public and served by Pages, so every open rights question is
exactly as open before the move as after it.

## Verified State, 2026-10-22

Recorded by Claude. Each item names its evidence; re-check before acting.

| Item | State | Evidence |
| --- | --- | --- |
| `classicstorymaps.com` Pages verification | Held by `davidasbury` | Owner's view of `davidasbury` → Settings → Pages |
| Challenge TXT | `_github-pages-challenge-davidasbury` present; no `dasbury-esri` record | `dig` against the authoritative nameservers |
| `www` | CNAME to `davidasbury.github.io` | `dig` |
| Apex | A records to GitHub's four Pages addresses; returns GitHub's 404 (no site bound) | `dig`, `curl` |
| Live viewer | Served at `dasbury-esri.github.io/classic-storymaps-viewer-pages/` (200) from `9910cd3` | `curl`, GitHub deployments API |
| Refs | `main` `1ce19fd`; `validation/batch-d-releases` `2b8c572` | `git ls-remote` |
| Branch protection | Neither branch protected; no rulesets | GitHub API, anonymous and authenticated |

GitHub verification is held by one account at a time, so the verification
handoff is **already complete**. Because the domain is verified by `davidasbury`,
no other account can bind it while it serves a 404. Keep the `davidasbury`
challenge record permanently.

## What Gates What

| Action | Gate |
| --- | --- |
| Transfer; bind the custom domain; deploy the pinned revision below | The steps below, run by the owner after converter acceptance. No rights clearance needed. |
| **New public release:** new third-party content, the fonts or images named below, or enabling the conversion integration | The answer sheet below, the open attribution checks in the resolution plan, and owner acceptance |

The transfer exception covers revision `1ce19fd6532950b8333e49da4eca7cd009ed9195`
only, not whatever `main` happens to be. Its changes since the live deploy
(`9910cd3`, 2026-10-14) are tracking documents, notice tooling and attribution,
the Ionicons license, and the removal of eight unused fonts. Any other revision
needs a scoped diff review and owner approval before it uses this exception.
**One exception:** a descendant qualifies without additional content review only
after `git merge-base --is-ancestor 1ce19fd6532950b8333e49da4eca7cd009ed9195 <revision>`
succeeds and `git diff --name-only 1ce19fd6532950b8333e49da4eca7cd009ed9195 <revision>`
lists only paths under `session-logs/` or `.github/prompts/`, or exactly
`STATUS.md`. Run both checks in this repository; a failed command is not an
empty, passing diff. Resolve and record the selected full commit SHA before
dispatch, whether it is the original revision, a qualifying descendant or a
separately reviewed and owner-approved revision. The build never reads the
allowed documentation paths. Note that `docs/licenses/` **is** read by the
notice staging, so changes there need review.

## Owner Answer Sheet (Gates the Next Public Release Only)

Ask these as **one message**, and record each answer under its exact paths and
hashes. Do not start new audits; refresh the inventory only for a selected
release candidate.

1. **Four Tailcoat and four Basic Fontello font files:** keep (owner accepts the documented risk) / replace with Font Awesome or Ionicons glyphs, after the owner approves how they look.
2. **Unresolved archive images and other candidates with no recorded basis:** keep under their existing runtime and archive basis unless a specific file is flagged / continue tracing.

## Viewer Transfer Steps

Agents do not change GitHub, Cloudflare or ArcGIS settings; the owner does.
Authorized documentation commits and read-only checks are separate. Record
results and unknowns in an attributed session log. Never record tokens, private
keys, recovery codes or credential-bearing URLs.

1. **Snapshot (initial collection by the agent; completion accepted by the owner):**
   - Copilot runs these read-only commands on the work Mac, with `gh` signed in as `dasbury-esri`. These commands are not the complete baseline. Check each command's exit status; denied or failed requests remain unknown, never empty inventories.

     ```sh
     R=dasbury-esri/classic-storymaps-viewer-pages
     gh api repos/$R --jq '{visibility, default_branch}'
       gh api --paginate repos/$R/branches --jq '.[] | {name, sha: .commit.sha, protected}'
       gh api --paginate repos/$R/rulesets --jq '.[] | {id, name, source, source_type, enforcement}'
       gh api --paginate repos/$R/collaborators --jq '.[] | {login, role_name}'
       gh api --paginate repos/$R/keys --jq '.[] | {id, read_only}'
       gh api --paginate repos/$R/hooks --jq '.[] | {id, active, events}'
       gh api --paginate repos/$R/actions/variables --jq '.variables[].name'
       gh api --paginate repos/$R/actions/secrets --jq '.secrets[].name'
     gh api repos/$R/pages --jq '{build_type, cname, html_url}'
     ```

    - Agent records full branch/tag refs using `git ls-remote --heads --tags` against the verified repository remote, including annotated-tag object and peeled commit refs, and confirms remote `main` matches the inventory.
    - Owner records classic branch-protection settings and each applicable ruleset's conditions, rules, enforcement and bypass permissions, including inherited rules. A ruleset list or count alone is insufficient.
    - Owner maps deploy-key IDs to public-key fingerprints, approved purpose and read/write access, and records installed-app identities, permissions and repository grants. Do not record private keys or machine-specific aliases.
    - Owner records an approved hostname and purpose for each webhook ID. If an agent processes URL fields, use a structural URL parser and emit only the approved hostname; never emit userinfo, path, query or fragment. Do not print raw API responses.
    - Owner records workflow permissions, environment protection settings, secret names/scopes, enabled security settings and explicitly approved nonsecret restoration values, including `SITE_BASE_PATH`. Review values before recording them; a variable is not safe merely because it is not labeled a secret.
   - Also record: the workflow's permissions and its latest successful run; a known-good deploy that can be restored; and the Cloudflare apex and `www` records with their TTL, proxy mode and TLS settings, plus any CAA records. Mark anything unavailable as unknown.
    - The baseline is complete only when the owner accepts the combined evidence. Resolve required unknowns before transfer, or stop for an explicit owner decision documenting missing evidence and recovery implications. Do not treat the dated "Verified State" table as a fresh snapshot or assume defaults for unavailable fields.
   - Keep `validation/batch-d-releases` unless the owner approves deleting it.
   - Set a quiet window with a recovery deadline. DNS and certificates can take up to 24 hours.
    - Before transfer or changes to Pages/base-path settings, inspect queued, running and approval-waiting deployment runs. The owner cancels or lets them finish, then verifies no outstanding run can publish. The workflow uses `cancel-in-progress: false`; stopping pushes alone does not drain existing runs. Record the empty-queue check and current deployment identity.
2. **Exact sign-in callbacks:**
   - On ArcGIS client `4ZanYdCYK0mWsFLz`, list the registered redirect URIs.
   - The catalog builds its redirect from the page's own address (origin plus path), so `/viewers/` and `/viewers/index.html` are different callbacks. Work out every production page that signs in, including runtime-specific ones.
   - **Add** the exact `https://classicstorymaps.com/...` callbacks for those pages; do not rely on `/` alone. Keep the old callbacks until acceptance.
3. **Confirm verification:** `davidasbury` still shows `classicstorymaps.com` as Verified, and its challenge record still resolves. If either has changed, stop.
4. **Transfer:**
   - Move the repository to `davidasbury`, keeping its name and public visibility, and accept the invitation. It expires after one day.
   - Compare refs, access and settings with step 1. GitHub keeps deploy keys and secrets, and adds the former owner as a collaborator; review that access.
5. **Bind:** in Settings → Pages, set the source to GitHub Actions and the custom domain to `classicstorymaps.com`. Clear `SITE_BASE_PATH` before the cutover build. Actions deploys ignore `publish/CNAME`; the Settings field is what binds the domain.
6. **DNS check:** the apex A records and the `www` CNAME (to `davidasbury.github.io`) already match GitHub's documented setup. Re-check them on the authoritative nameservers. Record "no change needed" if they still match, and do not touch unrelated records.
7. **Pinned deployment:**
   - Select and record the full SHA using "What Gates What," including ancestry and allowed-path checks for a documentation-only descendant. Immediately before dispatch, confirm remote `main` equals that selected SHA and recheck that no older deployment run is outstanding; otherwise stop.
   - The workflow deploys on every push to `main`, so push nothing during the cutover.
   - Verify the dispatched run's actual `head_sha` equals the selected SHA, then independently verify the deployed revision equals it before acceptance. A mismatch triggers owner cancellation or recovery, not an automatic retry or broader release approval.
   - Record the run ID, `head_sha`, build and link-test results, artifact identity and deployment outcome. Turn on Enforce HTTPS once the certificate is issued.
8. **Acceptance, using tools independent of this repository:**
   - The apex returns 200 with a valid certificate; `www` redirects; a path with a query string survives.
   - All eight runtime entry points load visibly with known examples: Map Tour, Swipe, Journal, Series, Cascade, Shortlist, Crowdsource and Basic. A 200 response alone is not enough.
   - The owner tests sign-in, viewing private content, and sign-out (private access is lost afterwards).
   - The conversion integration is still disabled.
   - Record what the old `dasbury-esri.github.io` URL now returns. GitHub does not redirect Pages URLs after a transfer, so old bookmarks may break.
9. **Close:** update `origin` in every clone and the links that name `dasbury-esri`, in no-deploy documentation commits (`[skip ci]`). Record the Pages, DNS and sign-in results, the deployed revision and owner acceptance before normal work resumes.

`classic-story-search.netlify.app`, linked from the launchers, is a separate
site and is not part of this transfer.

## Recovery

- **Triggers:** stop on a ref, visibility or access mismatch; failed TLS or sign-in; or an expired quiet window. The owner chooses whether to repair or roll back, and records the choice.
- **Restoring service:** use the recorded known-good revision, and restore a working combination of Pages binding, `SITE_BASE_PATH`, sign-in callbacks and DNS.
  - A custom-domain build and a project-path build are not interchangeable.
  - Before falling back to the new owner's default Pages URL, confirm its base path and callbacks.
  - Never leave DNS pointing at an unbound site without verification held.
- **Transferring back** is possible only if GitHub has not retired the old name. GitHub retires a name when the repository had more than 100 clones or Actions uses in the week before the transfer, or contains a Marketplace action. Check this before relying on it. Never create a placeholder repository under the old name. Transferring back does not restore DNS, verification or sign-in settings.
