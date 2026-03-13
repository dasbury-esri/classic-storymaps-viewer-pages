# S10 Release Runbook: Import-First Classic Storymaps

## Objective

Define a repeatable release process for publishing Classic Storymaps under `/templates/classic-storymaps` with auditable metadata, verification, and rollback steps.

## Scope

- Landing/catalog shell
- Map Tour runtime
- Swipe runtime
- Map Journal runtime

## Prerequisites

- Local branch is up to date with `main`
- Runtime manifests are pinned and committed:
  - `runtimes/maptour/runtime-manifest.json`
  - `runtimes/swipe/runtime-manifest.json`
  - `runtimes/mapjournal/runtime-manifest.json`
- Build scripts available:
  - `scripts/build-classic-storymaps-landing.sh`
  - `scripts/build-classic-storymaps-runtime-publish.sh`
- IIS host route/caching baseline validated:
  - `docs/testing/phase4-s9-iis-validation-transcript.md`

## Inputs Recorded Per Release

- Release timestamp (UTC)
- Deployer/operator
- Monorepo commit SHA
- Runtime upstream refs (Map Tour, Swipe, Map Journal)
- Runtime patch set references
- Target host + app path

## Standard Release Steps

1. Sync source and capture monorepo SHA.
2. Build landing output.
3. Build runtime publish output.
4. Validate publish tree shape under `publish/templates/classic-storymaps`.
5. Copy package to IIS target path.
6. Run smoke baseline checks for landing and all supported runtimes.
7. Record evidence and release metadata.

## Command Sequence (Git Bash)

```bash
set -euo pipefail

git checkout main
git pull --ff-only

MONOREPO_SHA="$(git rev-parse HEAD)"
RELEASE_TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

./scripts/build-classic-storymaps-landing.sh
./scripts/build-classic-storymaps-runtime-publish.sh

test -f publish/templates/classic-storymaps/index.html
test -f publish/templates/classic-storymaps/maptour/index.html
test -f publish/templates/classic-storymaps/swipe/index.html
test -f publish/templates/classic-storymaps/mapjournal/index.html

echo "Release SHA: ${MONOREPO_SHA}"
echo "Release TS:  ${RELEASE_TS}"
```

## IIS Publish Notes

- Publish target remains `/templates/classic-storymaps`
- Preserve canonical routes and compatibility redirect behavior validated in S9
- Do not mix source-only runtime folders into publish destination

## Smoke Gate

Before release signoff, execute the S10 smoke baseline in:

- `docs/testing/phase5-s10-smoke-suite-baseline.md`

All `Required` checks must pass.

## Rollback

1. Restore prior known-good publish package snapshot.
2. Revalidate landing route and three runtime routes.
3. Record rollback reason and timestamp in release metadata.

## Evidence Artifacts

- Release metadata record:
  - `docs/deployment/phase5-s10-release-metadata-template.md`
- Smoke execution notes (filled copy of baseline):
  - `docs/testing/phase5-s10-smoke-suite-baseline.md`
- Runtime troubleshooting log for hotfix sessions:
  - `docs/testing/phase5-s10c-runtime-troubleshooting-log-2026-03-13.md`
