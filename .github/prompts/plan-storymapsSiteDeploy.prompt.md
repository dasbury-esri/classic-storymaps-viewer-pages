## Deployment Implementation Checklist: Classic Storymaps Site on IIS (Import-First)

### Goal
Deploy a multi-app Classic Storymaps experience at /templates/classic-storymaps by importing and reproducing proven classic runtimes from upstream repos, starting with Map Tour, then Swipe, then Map Journal.

### Strategy Shift
- Use/import the already working Map Tour repo as the seed runtime model.
- Treat local reference assets under classic-apps as catalog/fixtures, not runtime source-of-truth.
- Prioritize reproducibility from upstream source over manual FTP state.
- Keep clean folder routes canonical and keep index.html paths as compatibility forms.

### Task Automation and Git Hygiene
- Prefer bash/python automation for cross-environment use (macOS/Linux/Windows Git Bash), avoid PowerShell-only scripts.
- On task completion, create a focused commit immediately.
- Push each task-complete commit to origin before starting the next task.
- Use one commit per task ID where practical (for example: `S4: scaffold maptour import pipeline`).
- Include task ID and evidence links in commit messages and issue comments.
- Suggested helper command: `./scripts/task-complete.sh <task-id> "<commit-message>"`
- Example: `./scripts/task-complete.sh S4 "import pinned maptour upstream and add reproducibility scripts"`

### Scope
- In scope: runtime import/onboarding process, landing catalog shell, route contract, IIS package/deploy workflow, release smoke tests.
- Out of scope: broad legacy runtime rewrites, forcing all classic apps into one shared frontend architecture, and full legacy map rebuild automation.

### Owners
- Product owner: app sequencing, UX and support-state decisions, acceptance.
- Build owner: runtime import/build/patch process, page templates, package scripts, docs.
- Infra owner: IIS publish path, caching, static content policy.
- QA owner: shared between product owner and repo maintainer.

### App Onboarding Sequence
1. Map Tour (first supported runtime; baseline is already working in production path).
2. Swipe (second supported runtime; simpler model and not a container for other apps).
3. Map Journal (after Swipe; can embed classic Swipe apps, so higher integration risk).

### Work Checklist

Tag legend:
- Effort: XS (<= 0.5d), S (1d), M (2-3d), L (4-5d)
- Depends-On: task IDs that must complete first

#### Phase 1: Baseline, Contract, and Routing
- [x] [S1] Task: Baseline current Map Tour runtime behavior at /templates/classic-storymaps/maptour.
  - Owner: Product owner
  - Effort: S
  - Depends-On: None
  - Deliverable: Baseline verification note and reproducibility target
  - Status: Completed (documentation baseline) on 2026-03-12. Evidence: `docs/architecture/phase1-s1-maptour-baseline.md`.
  - Acceptance criteria:
    - Known-good launch behavior and negative-path behavior are documented
    - Viewer-only expectations are explicitly captured

- [x] [S2] Task: Define runtime import/onboarding contract and runtime manifest schema.
  - Owner: Product owner
  - Effort: S
  - Depends-On: S1
  - Deliverable: Runtime onboarding contract and runtime-manifest field spec
  - Status: Completed (contract + schema draft) on 2026-03-12. Evidence: `docs/architecture/phase1-s2-runtime-onboarding-contract.md`.
  - Acceptance criteria:
    - Upstream provenance, patch policy, build, deploy, and release metadata fields are defined
    - Contract is approved by product and build owners

- [x] [S3] Task: Define import-first route matrix and URL precedence contract.
  - Owner: Product owner
  - Effort: S
  - Depends-On: S1
  - Deliverable: Route matrix for landing and onboarded runtime routes
  - Status: Completed on 2026-03-12. Evidence: `docs/architecture/phase1-s3-route-matrix.md`.
  - Acceptance criteria:
    - Landing and runtime routes are explicit with canonical and compatibility URL forms
    - appid-first behavior is documented with optional webmap support per runtime

#### Phase 2: Seed Runtime and Landing Shell
- [x] [S4] Task: Import and reproduce Map Tour runtime from upstream source.
  - Owner: Build owner
  - Effort: M
  - Depends-On: S2, S3
  - Deliverable: Pinned Map Tour import, reproducible deploy output, explicit patch list
  - Status: Completed on 2026-03-12. Upstream import pinned at `2e56c7e08801fc6bbfc2bc27e0d220688a7120a6`; build output verified at `runtimes/maptour/build/{index.html,app,resources,web.config}` with deploy parity against known-working runtime; explicit patch set recorded in `runtimes/maptour/patches/0001-production-behavior-align.patch` and `runtimes/maptour/patches/0002-iis-web-config-addition.patch`. Evidence: `runtimes/maptour/runtime-manifest.json`, `scripts/import-maptour-upstream.sh`, `scripts/build-maptour-runtime.sh`, `docs/deployment/phase2-s4-maptour-import-repro.md`, `docs/testing/phase2-s4-maptour-verification-transcript.md`, `docs/deployment/phase2-s4-maptour-production-patch-plan.md`.
  - Acceptance criteria:
    - Map Tour runtime is reproducible from monorepo-managed source
    - Differences from baseline are tracked as explicit patches

- [x] [S5] Task: Build landing catalog shell using classic-apps references.
  - Owner: Build owner
  - Effort: S
  - Depends-On: S3
  - Deliverable: Landing/catalog implementation at /templates/classic-storymaps
  - Status: Completed on 2026-03-12. Catalog shell implemented from classic-app fixtures with responsive support-state cards, guided launcher flow for Map Tour, and canonical route policy (`/templates/classic-storymaps`) with IIS compatibility redirects for `/templates/classic-stories`. Evidence: `apps/classic-storymaps-site/index.html`, `apps/classic-storymaps-site/maptour-launcher.html`, `apps/classic-storymaps-site/assets/images/*`, `scripts/build-classic-storymaps-landing.sh`, `publish/templates/classic-storymaps/index.html`, `publish/templates/classic-storymaps/maptour-launcher.html`, `docs/deployment/phase2-s5-landing-catalog-shell.md`.
  - Acceptance criteria:
    - All classic app cards render with clear support-state messaging
    - Supported cards deep-link to canonical routes

#### Phase 3: Second Runtime and Journal Constraints
- [x] [S6] Task: Import and support Swipe as the second onboarded runtime.
  - Owner: Build owner
  - Effort: M
  - Depends-On: S4, S5
  - Deliverable: Reproducible Swipe runtime and integrated launch guidance
  - Status: Completed on 2026-03-12. Swipe import pinned at `7e0fb19e1758638bacff788a513372b4bf4fc0c8` with fork/upstream remote model (`origin`: dasbury fork, `upstream`: Esri source), reproducible runtime build output at `runtimes/swipe/build`, and launcher-based malformed input guidance at canonical route `/templates/classic-storymaps/swipe-launcher.html`. Evidence: `runtimes/swipe/runtime-manifest.json`, `scripts/import-swipe-upstream.sh`, `scripts/build-swipe-runtime.sh`, `runtimes/swipe/patches/0000-no-runtime-patches.md`, `apps/classic-storymaps-site/swipe-launcher.html`, `publish/templates/classic-storymaps/swipe-launcher.html`, `docs/deployment/phase3-s6-swipe-import-repro.md`, `docs/testing/phase3-s6-swipe-verification-transcript.md`, `docs/deployment/runtime-fork-upstream-remote-model.md`.
  - Acceptance criteria:
    - Known-good Swipe launch works from canonical route
    - Unsupported and malformed input paths show actionable guidance

- [ ] [S7] Task: Define Map Journal onboarding constraints and embed policy.
  - Owner: Product owner
  - Effort: S
  - Depends-On: S6
  - Deliverable: Map Journal pre-onboarding design and risk checklist
  - Acceptance criteria:
    - Embedded classic Swipe behavior policy is explicit
    - Journal onboarding risks and mitigations are approved

#### Phase 4: IIS Packaging and Runtime Hosting
- [ ] [S8] Task: Define IIS package boundary and publish assembly for landing + imported runtimes.
  - Owner: Build owner
  - Effort: XS
  - Depends-On: S4, S6
  - Deliverable: Packaging checklist and deterministic publish assembly notes
  - Acceptance criteria:
    - Package excludes source-only files
    - Nested-path assets resolve correctly for landing and onboarded runtimes

- [ ] [S9] Task: Configure IIS route assets, cache policy, and fallback behavior.
  - Owner: Infra owner
  - Effort: M
  - Depends-On: S8
  - Deliverable: IIS configuration checklist and validation transcript template
  - Acceptance criteria:
    - Landing and onboarded runtime routes serve correctly from target path
    - Cache behavior matches documented policy without breaking legacy runtime assets

#### Phase 5: Release and Smoke Operations
- [ ] [S10] Task: Define release runbook and smoke suite baseline for import-first releases.
  - Owner: QA owner (shared with build owner)
  - Effort: S
  - Depends-On: S6, S9
  - Deliverable: Release runbook and smoke checklist matrix
  - Acceptance criteria:
    - Release metadata includes upstream ref, patch set, monorepo SHA, and deployment timestamp
    - Baseline smoke suite is defined for Map Tour and Swipe, with Journal profile queued

### Proposed Monorepo Folder Tree (Pre-Implementation)
```text
apps/
  classic-storymaps-site/

runtimes/
  maptour/
    upstream/
    patches/
    build/
    runtime-manifest.json
  swipe/
    upstream/
    patches/
    build/
    runtime-manifest.json
  mapjournal/
    upstream/
    patches/
    build/
    runtime-manifest.json

docs/
  architecture/
  deployment/
  operations/
  testing/

reference/
  classic-app-catalog/
  thumbnails/
  archived-pages/
  fixtures/

publish/
  templates/
    classic-storymaps/
```

### Runtime Manifest Shape (Draft)
```json
{
  "manifestVersion": "1.0",
  "appId": "maptour",
  "displayName": "Story Map Tour",
  "supportStage": "supported",
  "route": "/templates/classic-storymaps/maptour",
  "canonicalUrlPattern": "/templates/classic-storymaps/maptour",
  "compatibilityUrlPatterns": [
    "/templates/classic-storymaps/maptour/index.html"
  ],
  "upstream": {
    "repo": "classic-storymap-tour",
    "owner": "dasbury-esri",
    "refType": "commit",
    "ref": "<pinned-ref>",
    "sourceSubpath": "MapTour",
    "license": "<license-id>"
  },
  "build": {
    "tool": "grunt",
    "commands": ["npm ci", "grunt"],
    "workingDirectory": "runtimes/maptour/upstream/MapTour",
    "outputPath": "runtimes/maptour/build"
  },
  "deploy": {
    "iisTargetPath": "/templates/classic-storymaps/maptour",
    "packageInclude": ["index.html", "app/**", "resources/**"],
    "packageExclude": ["src/**", "node_modules/**", "tests/**"],
    "defaultDocument": "index.html"
  },
  "launch": {
    "supportedQueryParams": ["appid", "webmap"],
    "precedenceRule": "appid-first",
    "webmapSupport": "runtime-specific",
    "knownGoodExamples": [
      "/templates/classic-storymaps/maptour?appid=<sample-id>"
    ]
  },
  "viewerOnly": {
    "builderBlocked": true,
    "guardRules": ["no-builder-routes", "no-edit-actions"],
    "notes": "Capture per-runtime differences in patches."
  },
  "patches": {
    "patchSetId": "<patch-set-id>",
    "files": [],
    "rationale": "Minimal changes for IIS nested path and viewer-only constraints."
  },
  "verification": {
    "smokeProfile": "maptour-baseline",
    "baselineDate": "2026-03-12",
    "baselineOperator": "<owner>"
  },
  "releaseMetadata": {
    "monorepoCommit": "<sha>",
    "deploymentTimestamp": "<iso8601>",
    "upstreamRefAtRelease": "<pinned-ref>"
  }
}
```

### Risks and Mitigations
- Risk: Map Tour assumptions leak into Swipe or Journal onboarding.
  - Mitigation: enforce runtime-specific manifests and patch boundaries.

- Risk: IIS nested path breaks runtime assets.
  - Mitigation: require nested-path checks during package validation and smoke runs.

- Risk: Map Journal embedded Swipe behavior introduces cross-runtime regressions.
  - Mitigation: onboard Swipe first and define Journal embed policy before Journal import.

- Risk: Upstream drift introduces launch regressions.
  - Mitigation: pin upstream refs and record patch sets per release.

### Exit Criteria
- [ ] Landing catalog is deployed under /templates/classic-storymaps with explicit support-state messaging.
- [ ] Map Tour and Swipe are reproducibly deployed from monorepo-managed source/import.
- [ ] Runtime manifests, patch policy, and route contract are documented.
- [ ] IIS package/process and release runbook are committed.
- [ ] Smoke suite baseline for Map Tour + Swipe is committed and executable.

### Suggested Execution Order
1. Baseline and import contract (S1-S3)
2. Map Tour reproducibility and landing shell (S4-S5)
3. Swipe onboarding and Journal constraints (S6-S7)
4. IIS packaging and hosting configuration (S8-S9)
5. Release runbook and smoke baseline (S10)

### Suggested PR Batches and Merge Order

#### PR1: Import Foundation
- Tasks: S1, S2, S3, S4
- Intent: lock baseline, contract, routes, and reproducible Map Tour seed runtime.
- Merge gate:
  - Baseline behavior and route contract approved
  - Map Tour reproducibility verified with explicit patch set

#### PR2: Catalog + Swipe
- Tasks: S5, S6, S7
- Intent: deliver landing catalog, onboard Swipe as second runtime, and define Journal embed policy.
- Merge gate:
  - Landing support-state UX verified on desktop/mobile
  - Swipe positive/negative launch flows pass
  - Journal pre-onboarding constraints approved

#### PR3: IIS + Operations
- Tasks: S8, S9, S10
- Intent: operationalize deployment assembly, IIS behavior, and repeatable release/smoke process.
- Merge gate:
  - IIS validation passes for landing + onboarded runtime routes
  - Runbook and smoke checklist are committed
