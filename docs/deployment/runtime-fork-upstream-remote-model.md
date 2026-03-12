# Runtime Fork/Upstream Remote Model

## Purpose
Use a consistent source-control model for classic runtime imports:
- Pull updates from Esri upstream repositories.
- Push maintained changes to dasbury-esri fork repositories.
- Materialize import content into monorepo without nested `.git` directories.

## Standard Mapping
For each runtime:
- `origin` (push target): `https://github.com/dasbury-esri/<fork-repo>.git`
- `upstream` (pull source): `https://github.com/Esri/<upstream-repo>.git`

## Current Runtime Repo Map
- Map Tour
  - fork: `dasbury-esri/classic-storymap-tour`
  - upstream: `Esri/storymap-tour`
- Swipe
  - fork: `dasbury-esri/classic-storymap-swipe`
  - upstream: `Esri/storymap-swipe`
- Map Journal
  - fork: `dasbury-esri/classic-storymap-journal`
  - upstream: `Esri/storymap-journal`
- Map Series (Tabbed/Bulleted/Accordion)
  - fork: `dasbury-esri/classic-storymap-series`
  - upstream: `Esri/storymap-series`
- Cascade
  - fork: `dasbury-esri/classic-storymap-cascade`
  - upstream: `Esri/storymap-cascade`
- Shortlist
  - fork: `dasbury-esri/classic-storymap-shortlist`
  - upstream: `Esri/storymap-shortlist`
- Crowdsource
  - fork: `dasbury-esri/classic-storymap-crowdsource`
  - upstream: `Esri/storymap-crowdsource`
- Basic
  - fork: `dasbury-esri/classic-storymap-basic`
  - upstream: `Esri/storymap-basic`

## Monorepo Import Pattern
1. Clone from fork (`origin`) into a temp workspace.
2. Add upstream remote (Esri repo) and fetch.
3. Checkout pinned ref.
4. Copy source content into `runtimes/<app>/upstream` after removing `.git`.
5. Record pinned SHA + remote mapping in runtime manifest.

## Implemented Scripts
- Map Tour: `scripts/import-maptour-upstream.sh`
- Swipe: `scripts/import-swipe-upstream.sh`

## Notes
- This keeps monorepo commits as file snapshots while preserving reproducible upstream/fork provenance.
- Runtime-specific patch files remain under `runtimes/<app>/patches`.
