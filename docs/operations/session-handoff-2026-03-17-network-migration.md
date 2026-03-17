# Session Handoff: Viewer Hardening Work (Network Migration)

Date: 2026-03-17

## Continuation update (2026-03-17 rerun)
- Re-ran reachability checks and probe from this environment against `https://classicstorymaps.com/viewers`.
- `https://classicstorymaps.com/` and `https://classicstorymaps.com/viewers/` both returned HTTP 200.
- Re-ran:

```bash
node scripts/probe-storymaps-org-viewers.mjs \
  --domain=story.maps.arcgis.com \
  --viewerBase=https://classicstorymaps.com/viewers \
  --max=250
```

- Result summary remained stable:
  - `readyForManualRuntimeLoadTest`: 243
  - `appItemNotAuthorized`: 5
  - `missingAppIdInSourceUrl`: 2
- Generated artifacts were refreshed in place:
  - `docs/testing/phase5-s10e-storymaps-org-viewer-probe-2026-03-17.md`
  - `docs/testing/artifacts/storymaps-org-viewer-probe-2026-03-17.json`
- Policy update for ongoing validation:
  - `https://classicstorymaps.com/viewers` is the source-of-truth deployment.
  - `https://storymaps.esri.com/templates/classic-storymaps` is retired and should not be used for acceptance checks.

## Why this handoff exists
This session was paused on archive reconstruction due to Wayback instability and shifted to real-world viewer hardening using public classic StoryMaps discovered from the ArcGIS StoryMaps organization.

You asked for this to be saved in-repo so work can continue from a machine/network where `classicstorymaps.com` is reachable.

## What was completed in this session
1. Created and ran an automated probe workflow that:
   - Resolves org id for `story.maps.arcgis.com`
   - Uses the same REST search pattern as `classic-story-search`
   - Maps source app types to classic runtimes
   - Probes item accessibility and viewer route reachability
   - Classifies failures into diagnosis buckets

2. Confirmed network-specific blocker from this environment at the original handoff time:
   - `https://classicstorymaps.com/*` returns connection reset from this corporate network
   - `https://storymaps.esri.com/*` is reachable

3. Re-ran probes against reachable deployment base to get actionable app-level diagnostics.

## Artifacts produced
- Probe report (markdown):
  - `docs/testing/phase5-s10e-storymaps-org-viewer-probe-2026-03-17.md`
- Probe data (json):
  - `docs/testing/artifacts/storymaps-org-viewer-probe-2026-03-17.json`
- Probe runner script used in this session:
  - `scripts/probe-storymaps-org-viewers.mjs`

## Current diagnostic snapshot (from reachable base)
From the 250-record run:
- `readyForManualRuntimeLoadTest`: 243
- `appItemNotAuthorized`: 5
- `missingAppIdInSourceUrl`: 2

Known non-ready records:
- Missing appid source URLs:
  - `https://storymaps.esri.com/stories/shortlist-palmsprings/`
  - `https://storymaps.esri.com/stories/shortlist-sandiego/`
- Not authorized/inaccessible appids:
  - `6d920df507b5430fbd2c69c74ed21c6f`
  - `58f90c5a5b5f4f94aaff93211c45e4ec`
  - `53cf1b54abf34c4bacdec863e5c56391`
  - `6a9c3a5af20b43dea05fbd1e121ef6da`
  - `15a744844c714434a158c9191fd74a48`

## Re-run commands on another network
Run from repo root.

1. Probe using custom domain (target environment):

```bash
node scripts/probe-storymaps-org-viewers.mjs \
  --domain=story.maps.arcgis.com \
  --viewerBase=https://classicstorymaps.com/viewers \
  --max=250
```

2. Quick reachability sanity check:

```bash
curl -I -sS --max-time 20 'https://classicstorymaps.com/' | sed -n '1,8p'
curl -I -sS --max-time 20 'https://classicstorymaps.com/viewers/' | sed -n '1,8p'
```

## Next recommended steps
1. Keep this report as baseline and continue probing against `https://classicstorymaps.com/viewers`.
2. For top traffic appids, execute browser-level runtime checks (console + network) because HTTP reachability alone does not validate full viewer render.
3. Update the planning prompt Phase 5 app-launch verification once browser-level checks are complete.

## Note on git state at handoff
At time of writing, probe outputs under `docs/testing/artifacts/` and `docs/testing/phase5-s10e-storymaps-org-viewer-probe-2026-03-17.md` are present as local changes.
