---
schema_version: 1
id: classic-storymaps-viewer-pages
name: Classic StoryMaps Viewer Pages
domain: work
confidential: false
state: active
health: yellow
priority: 1
next_action: "David to run the transfer preflight, then transfer after the converter. See [transfer decisions](.github/prompts/transfer-decisions.prompt.md)."
updated: 2026-10-22
extra:
  agents: [claude, copilot-enterprise]
  phase: Follow-up transfer safeguards documented; owner preflight and converter acceptance pending; next-public-release gates unchanged
---

# Classic StoryMaps Viewer Pages

This repository hosts the Classic StoryMaps viewers and their GitHub Pages
publication workflow. Its stable tracking ID is `classic-storymaps-viewer-pages`.

## Current state

**Transfer plan reconciled, 2026-10-22.**

- This repository's [transfer decisions](.github/prompts/transfer-decisions.prompt.md) now include the follow-up safeguards: a read-only baseline script (`.github/prompts/transfer-baseline.sh`) run before and after the transfer, with the owner approving the comparison; drained deployment queues; and exact selected-SHA checks.
- Session 0008 recorded domain verification under `davidasbury` and DNS matching the target; recheck both before execution.
- The baseline revision remains `1ce19fd`; a documentation-only descendant requires verified ancestry and an allowed-path diff, with its full SHA selected before dispatch and matched to the run and deployed revision.
- The cutover still waits for owner preflight and acceptance of the converter transfer. Owner decisions and next-public-release gates are unchanged.

See [session 0010](session-logs/2026-10-22-0010-session-log.md), [follow-up session 0009](session-logs/2026-10-22-0009-session-log.md) and the
[earlier reconciliation](session-logs/2026-10-22-0008-session-log.md).

**Transfer approved, 2026-10-17.** David approved transferring this repository
to `davidasbury` now, with retained-content rights review moved to "before any
new public release". The repository stays hybrid (`extra.agents`); `domain: work`
and `confidential: false` are unchanged. The
[transfer decisions](.github/prompts/transfer-decisions.prompt.md) record the
decisions, a two-question answer sheet for the next release, and the ordered
viewer steps. Older text below that makes rights a transfer gate is superseded.
No transfer, Pages, DNS or OAuth change has been made yet. See
[session 0007](session-logs/2026-10-17-0007-session-log.md).

Execution of the [resolution/defer plan](docs/licenses/redistribution-resolution-plan.md)
produced a [release membership report](docs/testing/release-content-membership.json):
282 candidate paths have 350 exact output copies, independently byte-compared.
All eight unresolved font files ship. Bounded public-source checks did not
establish their exact glyph provenance. The owner was unavailable for new
rights decisions; specific replacement proposals are recorded, not implemented.
No font or image was removed, changed or newly accepted.

All eight generated runtime notice pages now display Powered by Esri, verified
in sixteen desktop/mobile browser checks. In-app discoverability, map-provider
expansion and actual layer-credit coverage remain open; notice-page checks are
not blanket compliance. Closure uses CI-skip markers, with no Pages deployment
or transfer. See the [execution log](session-logs/2026-10-17-0006-session-log.md).

The [current inventory](docs/testing/remaining-content-inventory.json) records
5,345 tracked, present files: 827 review candidates and 4,518 runtime import or
local-patch context entries preserving earlier evidence. Independent Git
enumeration and external SHA-256 checks matched all paths and bytes. These are
not counts of unlicensed works. The [updated audit](docs/testing/migration-provenance-audit.md)
separates current decisions from historical findings and completed notices.
All four Tailcoat and four Basic social font files have exact hashes and direct
CSS consumers recorded in the [font inventory](docs/licenses/runtime-font-provenance.md#tailcoat-and-basic-social-font-inventory).
Independent binary metadata identifies Basic's font as Fontello, correcting
the older IcoMoon description. Font-specific permission remains unresolved;
no file was removed or replaced. See the [inventory log](session-logs/2026-10-17-0004-session-log.md).

The owner designated this project as hybrid: both Claude and Copilot Enterprise
may work on its non-confidential content. Work-domain reporting remains unchanged;
hybrid designation is recorded by `extra.agents`, not a new domain value.

Superseded 2026-10-17 by the transfer decisions above: retained-content rights now gate the next public release, not migration. The
[migration handoff](https://github.com/dasbury-esri/ArcGIS-StoryMaps-Classic-Converter-App/blob/main/docs/runbooks/migration-handoff.md)
is the continuation guide and requires access to the converter repository.
No transfer, new deployment or rights clearance is implied by onboarding.

Fresh local notice/font packaging passed all 139 viewer tests under Node 24 and
68 published-link checks against the assembled release. An isolated checkout
started with no runtime build directories: Map Tour, Swipe, Journal and Series
used Grunt; Cascade, Shortlist and Crowdsource used pinned verified releases;
Basic used its static-copy build. All 297 referenced notice documents existed.
External byte comparisons verified the 43 upstream documents, root licenses and
210 bundled editor-source copies. Seven compiled viewer bundles passed syntax
parsing. Ionicons binary fonts matched their previously verified source exactly;
SVG matched after line-ending normalization. All eight retired fonts were absent.

The fresh build exposed a notice CLI bug that silently skipped staging through a
symlinked directory. Resolving the invoked file's real path fixed it, and a new
regression plus the fresh artifact checks passed. Map Tour retained its legacy
JSHint warning; Cascade and Shortlist used their intended verified-release
fallbacks after source-build errors. No unrelated build-system repairs were made.

The owner authorized inclusion of these changes in the scoped no-deployment
checkpoint. This verification established a fresh local artifact, not full
browser/hosted acceptance or rights for other copied
assets. The previously separate provenance audit is now explicitly updated as
part of the owner's requested inventory work, not as a blanket clearance.
Publication approval remains separate; the Pages workflow can deploy from a
main-branch push without the required skip marker. See the
[fresh release log](session-logs/2026-10-17-0003-session-log.md).

## Done

- [x] Owner approved hybrid designation and initial tracking values.
- [x] Created STATUS with a pointer to the existing migration handoff.
- [x] Verified fresh notice/font packaging with the full Node 24 suite, published-link checks and independent artifact comparisons.

## Next

- [ ] Resolve retained-content rights before migration.
- [ ] Execute the resolution/defer plan and complete attribution coverage before release approval.
- [ ] Obtain approval before repository transfer or production publication.

See `session-logs/` for session outcomes.
