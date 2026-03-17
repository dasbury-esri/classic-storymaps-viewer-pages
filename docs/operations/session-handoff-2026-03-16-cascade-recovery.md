# Session Handoff: Cascade Runtime Recovery

Date: 2026-03-16

## Why this handoff exists
This session focused on restoring the Cascade runtime after the `/templates/classic-storymaps/cascade` to `/viewers/cascade` migration exposed a packaging gap in the rebuilt assets.

The immediate goal for the next session is local browser validation of the rebuilt Cascade viewer before deciding whether to push to GitHub Pages.

## What was established
- GitHub Pages deployment for this repo is driven by push-to-`main` through `.github/workflows/deploy-classic-storymaps-pages.yml`.
- The current Cascade runtime under `publish/viewers/cascade` expects a top-level `lib/` directory via `app/main-config.js`.
- The public upstream source in `runtimes/cascade/upstream` is not sufficient by itself to reproduce the original production build because the legacy build depended on a Bower-populated `src/lib/` tree that is ignored in git.
- A direct upstream `grunt` rebuild was attempted and failed on a missing dependency asset: `src/lib/calcite-bootstrap/css/calcite-bootstrap-open.min.css`.

## Recovery approach used
You provided the official release archive:

```text
/Users/davi6569/Downloads/Storymaps-Cascade-1-23-0.zip
```

That archive was extracted into:

```text
runtimes/cascade/release-1.23.0
```

The Cascade build script was updated so its fallback order is now:

1. Attempt upstream `grunt` build from `runtimes/cascade/upstream`
2. If that fails, stage the official extracted release bundle from `runtimes/cascade/release-1.23.0`
3. If that is unavailable, fall back to the historical git-tracked deployed bundle
4. Final fallback remains the raw-source/minimal-lib path

## Files changed or validated during this session
- `scripts/build-cascade-runtime.sh`
  - Added `CASCADE_RELEASE_FALLBACK_PATH`
  - Added release-bundle staging logic ahead of the git-history fallback
- `runtimes/cascade/release-1.23.0`
  - Added extracted official Cascade 1.23.0 release assets
- `runtimes/cascade/build`
  - Rebuilt/staged Cascade output used for republish
- `publish/viewers/cascade`
  - Republished locally from `runtimes/cascade/build`
- `publish/viewers/cascade/app/main-config.js`
  - Read to confirm production mode and `lib` package expectations
- `publish/viewers/cascade/app/main-app.js`
  - Read to confirm early dependency load from `lib/jquery/dist/jquery.min`
- `runtimes/cascade/upstream/README.md`
  - Read to confirm original `grunt` build flow and `deploy/` output expectation
- `runtimes/cascade/upstream/.bowerrc`
  - Read to confirm Bower installed into `src/lib`
- `runtimes/cascade/upstream/.gitignore`
  - Read to confirm `src/lib/` is intentionally omitted from git
- `runtimes/cascade/upstream/Gruntfile.js`
  - Read to confirm the legacy build expects vendor assets under `src/lib`

## Most important verified results
- The last local republish command for Cascade completed successfully:

```bash
rm -rf publish/viewers/cascade && mkdir -p publish/viewers/cascade && cp -R runtimes/cascade/build/. publish/viewers/cascade/
```

- The republish copy exited successfully.
- No active Cascade shell command appeared to be hung at handoff time.
- The main source of session sluggishness was likely the very large binary diff introduced by `runtimes/cascade/release-1.23.0`, which made repo diff/context processing expensive.

## Important caveat
No fresh browser validation was completed after wiring in the official release fallback.

That means the current local state is a release-backed Cascade publish candidate, but it is not yet browser-verified.

## Recommended continuation steps
Run these from repo root in a fresh session focused only on Cascade browser validation.

1. Rebuild Cascade if needed:

```bash
scripts/build-cascade-runtime.sh
```

2. Republish the Cascade viewer if needed:

```bash
rm -rf publish/viewers/cascade && mkdir -p publish/viewers/cascade && cp -R runtimes/cascade/build/. publish/viewers/cascade/
```

3. Start or use the local static host already used in this repo for browser checks.
4. Open the local `/viewers/cascade` route and validate:
   - bootstrap completes
   - no missing top-level `lib/*` requests
   - app renders instead of failing early in loader/bootstrap
   - console/network errors are captured for follow-up if still broken
5. Only if local browser validation passes, proceed with the normal push-to-`main` GitHub Pages deployment path.

## Suggested validation focus
- Confirm the release-backed `publish/viewers/cascade` now includes everything expected by `app/main-config.js` and `app/main-app.js`.
- Pay particular attention to network requests for:
  - `lib/jquery/dist/jquery.min`
  - other top-level `lib/*` dependencies
  - any broken asset URLs inherited from the release bundle
- Compare runtime behavior against the known-good historical template bundle if a regression is still visible.

## Handoff state
At handoff time, the repo was left in a locally modified state that includes the extracted official Cascade release assets and the build-script fallback changes. The next session should avoid broad repo diff commands unless necessary, because the added release asset tree is large and slows tooling substantially.