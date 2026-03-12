# Map Tour Patch Set

Patch policy for import-first onboarding:

- Keep patches minimal and focused on nested IIS path compatibility and viewer-only constraints.
- Track each patch as a standalone file in this directory.
- Mirror each patch filename in runtimes/maptour/runtime-manifest.json under patches.files.

## Suggested Patch Naming
- 0001-iis-nested-path-assets.patch
- 0002-viewer-only-guard-routes.patch

## Review Checklist
- Upstream behavior preserved except explicitly documented patch intent.
- Patch rationale documented in manifest and PR notes.
- Patch applies cleanly to pinned upstream ref.
