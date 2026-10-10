# Map Journal Patch Set

Patch policy for import-first onboarding:

- Keep patches minimal and focused on nested IIS path compatibility and viewer-only constraints.
- Track each patch as a standalone file in this directory.
- Mirror each patch filename in runtimes/mapjournal/runtime-manifest.json under patches.files.

## Suggested Patch Naming

These names are onboarding suggestions, not a list of applied patches. The
runtime manifest records the active patch files.

- 0001-iis-nested-path-assets.patch
- 0002-viewer-only-guard-routes.patch
- 0003-embedded-swipe-handling.patch

## Review Checklist

- Upstream behavior preserved except explicitly documented patch intent.
- Patch rationale documented in manifest and PR notes.
- Patch applies cleanly to pinned upstream ref.

## Embedded Runtime Base Path

[embedded-base-path.mjs](embedded-base-path.mjs) runs after the build script
copies Map Journal into its staging directory. It corrects the embedded Classic
URL rewriter in compiled bundles and source-fallback output without editing
upstream files. The old rewriter always chose `/templates/classic-storymaps`
unless the parent already used that legacy route. A parent served under
`/classic-storymaps-viewer-pages/viewers/mapjournal/` therefore sent embedded
Swipe frames to an unprefixed, nonexistent GitHub Pages path.

The patch derives `/viewers` and any deployment prefix from the parent path,
preserving legacy template deployment behavior, query parameters, and fragments.
It requires exactly one matching base expression in each staged target and
validates JavaScript syntax before writing any changes.

The regression in
[runtime-release.test.mjs](../../../scripts/tests/runtime-release.test.mjs)
failed before the patch was added and now passes for project-prefix, root,
nested-prefix, and legacy paths, including both reported Swipe IDs. All 134 Node
tests and 68 actual-publish checks passed after rebuilding Map Journal and the
local publish output.

Local browser acceptance used public Journal
`ccd648e8845847d2947cbc7e0c4ec616`: section 4 opened tuition Swipe
`6b58de911fa44d309431d8b3cf7bba6c`, and section 10's **Compare 2006 to 2016**
action opened loan Swipe `d96143b7a084446ebb0417a111c38016`. Both loaded inside
the parent from the project's `/viewers/swipe/index.html` route instead of the
missing legacy path. The loan comparison rendered features in both maps.
This verification is local, not a production deployment or a complete audit of
the story's other external embeds. No remote item data was changed.
