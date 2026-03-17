# S10 Release Metadata Template

Use this template for each Classic Storymaps release with `/viewers` as the canonical route family.

## Release Record

- Release ID: `<yyyy-mm-dd>-<short-sha>`
- Release timestamp (UTC): `<iso8601>`
- Operator: `<name>`
- Environment: `<prod|staging>`
- Public host: `<host>`
- Canonical route base: `/viewers`
- Root archive entry: `/`
- Compatibility route bases:
  - `/templates/classic-storymaps`
  - `/templates/classic-stories`
- Optional IIS host: `<host-or-n/a>`
- Optional IIS app path: `<path-or-n/a>`

## Source Provenance

- Monorepo commit SHA: `<sha>`
- Branch/tag: `<branch-or-tag>`

### Runtime Upstream Refs

- Map Tour upstream ref: `<commit>`
- Swipe upstream ref: `<commit>`
- Map Journal upstream ref: `<commit>`

### Runtime Patch Sets

- Map Tour patches: `runtimes/maptour/patches/*`
- Swipe patches: `runtimes/swipe/patches/*`
- Map Journal patches: `runtimes/mapjournal/patches/*`

## Build and Package Evidence

- Landing build script run: `scripts/build-classic-storymaps-landing.sh`
- Runtime build script run: `scripts/build-classic-storymaps-runtime-publish.sh`
- Package boundary reference: `docs/deployment/phase4-s8-package-boundary-and-assembly.md`
- Verified publish outputs:
  - `publish/index.html`
  - `publish/archive/2017-12-10-app-list.html`
  - `publish/viewers/**`
  - `publish/templates/classic-storymaps/**`
  - `publish/templates/classic-stories/**`

## Validation Evidence

- Route contract reference: `docs/architecture/phase1-s3-route-matrix.md`
- Optional IIS validation transcript: `docs/testing/phase4-s9-iis-validation-transcript.md`
- Smoke baseline record: `docs/testing/phase5-s10-smoke-suite-baseline.md`

## Outcome

- Release decision: `<approved|rejected|rolled-back>`
- Summary notes: `<short summary>`

## Rollback (If Executed)

- Rollback executed: `<yes|no>`
- Rollback timestamp (UTC): `<iso8601>`
- Rollback operator: `<name>`
- Rollback reason: `<reason>`
