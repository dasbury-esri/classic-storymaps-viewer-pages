# S2 Runtime Import/Onboarding Contract and Manifest Spec

## Purpose
Define a repeatable import-first contract for onboarding classic runtimes into this monorepo.

## Contract Rules
- Upstream-first: each runtime must declare upstream repository, owner, and pinned ref.
- Patch-minimal: downstream patches must be explicit, reviewable, and linked to rationale.
- Build-reproducible: build commands, working directory, and expected output path are required.
- Deploy-explicit: IIS target path, include/exclude package lists, and default document are required.
- Launch-defined: supported query params and precedence behavior are required.
- Verification-bound: smoke profile and baseline evidence fields are required.
- Release-traceable: monorepo SHA, upstream ref, patch set, and deployment timestamp are required.

## Runtime Manifest Field Spec (v1.0)

### Top-Level
- `manifestVersion` (string): schema version.
- `appId` (string): runtime key (`maptour`, `swipe`, `mapjournal`).
- `displayName` (string): user-facing app name.
- `supportStage` (string enum): `supported`, `limited`, `queued`, `unsupported`.
- `route` (string): canonical runtime route under `/templates/classic-storymaps`.
- `canonicalUrlPattern` (string): canonical URL form.
- `compatibilityUrlPatterns` (string[]): allowed compatibility URL forms.

### Upstream Block
- `upstream.repo` (string)
- `upstream.owner` (string)
- `upstream.refType` (string enum): `commit`, `tag`, `branch`
- `upstream.ref` (string): pinned value for release reproducibility
- `upstream.sourceSubpath` (string)
- `upstream.license` (string)

### Build Block
- `build.tool` (string)
- `build.commands` (string[])
- `build.workingDirectory` (string)
- `build.outputPath` (string)

### Deploy Block
- `deploy.iisTargetPath` (string)
- `deploy.packageInclude` (string[])
- `deploy.packageExclude` (string[])
- `deploy.defaultDocument` (string)

### Launch Block
- `launch.supportedQueryParams` (string[])
- `launch.precedenceRule` (string): must be `appid-first`
- `launch.webmapSupport` (string enum): `none`, `optional`, `required`, `runtime-specific`
- `launch.knownGoodExamples` (string[])

### Viewer-Only Block
- `viewerOnly.builderBlocked` (boolean)
- `viewerOnly.guardRules` (string[])
- `viewerOnly.notes` (string)

### Patches Block
- `patches.patchSetId` (string)
- `patches.files` (string[])
- `patches.rationale` (string)

### Verification Block
- `verification.smokeProfile` (string)
- `verification.baselineDate` (string, ISO date)
- `verification.baselineOperator` (string)

### Release Metadata Block
- `releaseMetadata.monorepoCommit` (string)
- `releaseMetadata.deploymentTimestamp` (string, ISO-8601)
- `releaseMetadata.upstreamRefAtRelease` (string)

## Approval and Governance
- Product owner approval required for support stage and launch behavior fields.
- Build owner approval required for upstream pinning, patch boundaries, and deploy fields.
- Any manifest schema changes require `manifestVersion` bump and migration notes.
