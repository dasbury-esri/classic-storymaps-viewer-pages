# Crowdsource View-Only Release

The build uses Esri's Apache-2.0 v0.10.0 release, verified against the
SHA-256 recorded in `../runtime-manifest.json`. It does not compile or copy
raw upstream source. Each patch target must occur exactly once; a missing
or duplicate target stops the build.

- `jquery-3-image-load` replaces the removed jQuery `.load(handler)` shorthand
  with `.on("load", handler)`, allowing the cover to finish loading with the
  release's jQuery 3.
- `participation-disabled` forces the participation reducer to return false
  for both updates and default state. This disables desktop and mobile
  contribution entry points regardless of story settings.
- `builder-disabled` forces both builder and from-scratch modes off.

The four builder bundles listed in the manifest must exist and are removed.
The publisher adds its existing `classicstorymaps-builder-guard` once, before
the application scripts, to strip builder query parameters also read by the
AMD mode plugin. No second guard is injected by the Crowdsource build.

`BUILD_SOURCE` records `release:0.10.0`. This view-only restriction applies
only to this deployment; it does not change editing permissions on the
story owners' ArcGIS feature services.
