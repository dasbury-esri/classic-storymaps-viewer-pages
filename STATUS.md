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
updated: 2026-10-14
extra:
  agents: [claude, copilot-enterprise]
  phase: Hybrid tracking onboarding; retained-content review and migration acceptance pending
---

# Classic StoryMaps Viewer Pages

This repository hosts the Classic StoryMaps viewers and their GitHub Pages
publication workflow. Its stable tracking ID is `classic-storymaps-viewer-pages`.

## Current state

The owner designated this project as hybrid: both Claude and Copilot Enterprise
may work on its non-confidential content. Work-domain reporting remains unchanged;
hybrid designation is recorded by `extra.agents`, not a new domain value.

Retained-content rights must be resolved before migration. The
[migration handoff](https://github.com/dasbury-esri/ArcGIS-StoryMaps-Classic-Converter-App/blob/main/docs/runbooks/migration-handoff.md)
is the continuation guide and requires access to the converter repository.
No transfer, new deployment or rights clearance is implied by onboarding.

Existing local notice/font changes and the separate untracked provenance audit
remain outside the tracking commit. Revalidate those changes against the current
checkout and obtain their publication approval before including them in a release.

## Done

- [x] Owner approved hybrid designation and initial tracking values.
- [x] Created STATUS with a pointer to the existing migration handoff.

## Next

- [ ] Resolve retained-content rights before migration.
- [ ] Review and validate the pending notice/font work separately.
- [ ] Obtain approval before repository transfer or production publication.

See `session-logs/` for session outcomes.
