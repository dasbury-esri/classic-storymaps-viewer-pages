# S10 Release Metadata Template

Use this template for each import-first release to `/templates/classic-storymaps`.

## Release Record

- Release ID: `<yyyy-mm-dd>-<short-sha>`
- Release timestamp (UTC): `<iso8601>`
- Operator: `<name>`
- Environment: `<prod|staging>`
- IIS host: `<host>`
- IIS app path: `/templates/classic-storymaps`

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

## Validation Evidence

- IIS validation transcript: `docs/testing/phase4-s9-iis-validation-transcript.md`
- Smoke baseline record: `docs/testing/phase5-s10-smoke-suite-baseline.md`

## Outcome

- Release decision: `<approved|rejected|rolled-back>`
- Summary notes: `<short summary>`

## Rollback (If Executed)

- Rollback executed: `<yes|no>`
- Rollback timestamp (UTC): `<iso8601>`
- Rollback operator: `<name>`
- Rollback reason: `<reason>`
