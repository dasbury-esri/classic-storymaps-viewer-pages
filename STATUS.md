---
schema_version: 1
id: classic-storymaps-viewer-pages
name: Classic StoryMaps Viewer Pages
domain: work
confidential: false
state: active
health: yellow
priority: 1
next_action: "Resolve retained-content rights before migration. See [migration handoff](https://github.com/dasbury-esri/ArcGIS-StoryMaps-Classic-Converter-App/blob/main/docs/runbooks/migration-handoff.md)."
updated: 2026-10-17
extra:
  agents: [claude, copilot-enterprise]
  phase: Resolution/defer plan recorded; sampled map credits verified; complete attribution and rights decisions remain release gates
---

# Classic StoryMaps Viewer Pages

This repository hosts the Classic StoryMaps viewers and their GitHub Pages
publication workflow. Its stable tracking ID is `classic-storymaps-viewer-pages`.

## Current state

The [resolution/defer plan](docs/licenses/redistribution-resolution-plan.md)
prioritizes the two unresolved font families and shipped copied assets, with
explicit evidence and owner-decision criteria. Shortlist and Journal map views
displayed native Esri marks and provider credits on desktop/mobile. This does
not clear all eight runtimes, cover/no-map states, provider expansion or legacy
logo treatment under current text requirements. Complete attribution remains a
release gate. The owner authorized scoped commit/push with CI skipped, not
Pages deployment or transfer. See the [closure log](session-logs/2026-10-17-0005-session-log.md).

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

Retained-content rights must be resolved before migration. The
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
