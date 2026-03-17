# S10 Release Runbook: Classic Storymaps Pages Release

## Objective

Define a repeatable release process for publishing Classic Storymaps with `/viewers` as the canonical route family, legacy compatibility redirects under `/templates`, and auditable metadata, verification, and rollback steps.

## Scope

- Archive-facing root shell
- Landing/catalog shell under `/viewers`
- Supported and imported viewer runtimes under `/viewers`
- Legacy compatibility redirects under `/templates/classic-storymaps` and `/templates/classic-stories`

## Prerequisites

- Local branch is up to date with `main`
- Runtime manifests are pinned and committed:
  - `runtimes/maptour/runtime-manifest.json`
  - `runtimes/swipe/runtime-manifest.json`
  - `runtimes/mapjournal/runtime-manifest.json`
- Build scripts available:
  - `scripts/build-classic-storymaps-landing.sh`
  - `scripts/build-classic-storymaps-runtime-publish.sh`
- Publish-path contract docs reviewed:
  - `docs/architecture/phase1-s3-route-matrix.md`
  - `docs/deployment/phase2-s5-landing-catalog-shell.md`
- Optional IIS deployment baseline validated when applicable:
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
4. Validate publish tree shape under `publish/index.html`, `publish/archive`, `publish/viewers`, and legacy redirect stubs under `publish/templates`.
5. If deploying to GitHub Pages, verify the Pages workflow artifact shape; if deploying to IIS, copy the curated publish package to the target path.
6. Run smoke baseline checks for root, `/viewers`, representative runtimes, and compatibility redirects.
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

test -f publish/index.html
test -f publish/archive/2017-12-10-app-list.html
test -f publish/viewers/index.html
test -f publish/viewers/maptour/index.html
test -f publish/viewers/swipe/index.html
test -f publish/viewers/mapjournal/index.html
test -f publish/templates/classic-storymaps/index.html
test -f publish/templates/classic-stories/index.html

echo "Release SHA: ${MONOREPO_SHA}"
echo "Release TS:  ${RELEASE_TS}"
```

## Deployment Notes

- Canonical public route family is `/viewers`
- Root `/` is the archive-facing entry point and should publish `publish/index.html`
- Compatibility stubs under `/templates/classic-storymaps` and `/templates/classic-stories` must remain intact and preserve query/hash
- Do not mix source-only runtime folders into the deploy destination

## IIS Publish Notes

- Use IIS rewrite rules only for non-GitHub Pages deployments that need true HTTP redirects
- Preserve canonical `/viewers` routes and compatibility redirect behavior validated in S9
- Map the package root so `publish/index.html`, `publish/archive/**`, `publish/viewers/**`, and `publish/templates/**` remain addressable

## Smoke Gate

Before release signoff, execute the S10 smoke baseline in:

- `docs/testing/phase5-s10-smoke-suite-baseline.md`

All `Required` checks must pass.

## Rollback

1. Restore prior known-good publish package snapshot.
2. Revalidate root, `/viewers`, and representative runtime routes.
3. Record rollback reason and timestamp in release metadata.

## Evidence Artifacts

- Release metadata record:
  - `docs/deployment/phase5-s10-release-metadata-template.md`
- Smoke execution notes (filled copy of baseline):
  - `docs/testing/phase5-s10-smoke-suite-baseline.md`
- Runtime troubleshooting log for hotfix sessions:
  - `docs/testing/phase5-s10c-runtime-troubleshooting-log-2026-03-13.md`
