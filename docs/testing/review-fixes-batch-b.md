# Batch B Verification

## Scope

B1 adds deployment-prefix support and local link auditing. B2 restricts build
permissions, pins Node 24 actions, verifies Cascade fallback downloads, and
disables npm lifecycle scripts. No remote repository settings, branches, or
deployments were changed during this work.

## Local Results

- Node 24.21.0 on macOS arm64: all 36 tests pass with
  `node --test scripts/tests/*.test.mjs`.
- The three initial B1 tests and four initial B2 tests each failed against the
  unfixed implementation before their fixes. The additional Shortlist icon
  fixture failed before its publisher correction.
- Node 24 rejected the older directory-form test invocation. The explicit glob
  is used in both CI and README so the test suite actually runs on Node 24.
- Full landing and runtime builds completed in isolated before/after snapshots.
  Both used Node 24, the same base path, and the same pinned Cascade historical
  fallback tree, extracted from commit
  `30d22e8aa38fce3553eec3dd33e8283e3ddb1770` into the local release-cache path.
- Applying the completed B1 publisher to both snapshots produced identical
  lists of 3,121 files. Only Map Journal and Map Series `viewer-min.js` build
  timestamps differed in content. B2 introduced no artifact paths or removals.
- The existing workflow artifact-structure checks passed, including Cascade's
  viewer bundle and Calcite LESS files.
- Full-artifact links, catalog routes, loader base inference, and compatibility
  redirects passed under `/classic-storymaps-viewer-pages` and the empty root
  prefix. Fixture-based checks also passed under `/nested/classic`.
- Every downloaded Cascade fallback asset passed `sha256sum -c`. The regression
  test substituted altered bytes for downloads and verified rejection.

## Runtime Installs

No lifecycle-script exceptions were retained. Fallback use below occurred in
both snapshots, not only after disabling scripts.

| Runtime | Hardened installation | Build result |
| --- | --- | --- |
| Map Tour | `npm install --ignore-scripts --no-package-lock` | Grunt output |
| Swipe | `npm install --ignore-scripts --no-package-lock` | Grunt output |
| Map Journal | `npm install --ignore-scripts --no-package-lock` | Grunt output |
| Map Series | `npm install --ignore-scripts --no-package-lock` | Grunt output |
| Cascade | `npm ci --ignore-scripts` | Pinned historical release fallback |
| Shortlist | `npm ci --ignore-scripts` | Existing source fallback |
| Crowdsource | `npm ci --ignore-scripts` | Existing source fallback |
| Basic | No npm installation | Source copy |

The first four runtimes have no committed npm lockfile, so `npm ci` is not
applicable to their current inputs. Optional `grunt-cli` installation also uses
`--ignore-scripts`. This work does not claim reproducible dependency resolution
for the unlocked runtimes or browser certification of the legacy fallbacks.

## Action Pins

Release tags were resolved through the official GitHub repository API, and
`action.yml` was read at each resolved commit. All JavaScript actions declare
Node 24. The Pages upload action is composite; its pinned nested upload action
also declares Node 24.

| Action | Release | Commit |
| --- | --- | --- |
| [checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| [setup-node](https://github.com/actions/setup-node/releases/tag/v7.0.0) | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` |
| [configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | v6.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |
| [upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| [deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | v5.0.1 | `368f82528645a54fb793d4d04e342629a3f51346` |
| [upload-artifact, nested](https://github.com/actions/upload-artifact/releases/tag/v7.0.0) | v7.0.0 | `bbbca2ddaa5d8feaa63e36b76fdaad77386f024f` |

Pages configuration runs only in the deploy job. The build job has only
`contents: read`; only the main-branch deploy job has `pages: write` and
`id-token: write`. Checkout does not persist its credentials. Concurrency is
separated by ref and does not cancel an in-progress run.

## Checksum Provenance

[The checksum manifest](../../runtimes/cascade/fallback-assets.sha256) records
the bytes fetched from the seven existing URLs in
[the Cascade build script](../../scripts/build-cascade-runtime.sh): jQuery
2.2.4 from code.jquery.com, fastclick 1.0.6 from unpkg.com, Font Awesome 4.6.3
CSS and three fonts from cdnjs.cloudflare.com, and Calcite Bootstrap CSS from
esri.github.io. Digests were calculated with Node crypto and independently
checked with the system `sha256sum` command.

The Calcite URL is not versioned. If its bytes change, the build must fail until
the new asset is reviewed and the manifest is deliberately updated. Do not
automatically regenerate checksums during a build.

## Remaining Hosted Checks

No push, automated sign-in, or live-site test request was performed. These
remain owner checkpoints, not verified outcomes:

1. Set the repository variable `SITE_BASE_PATH` for the intended public address.
2. Confirm a branch workflow runs tests and builds without deploying.
3. Confirm a main workflow passes its full-artifact link gate and deploys its
   uploaded artifact. Local macOS builds do not substitute for an Ubuntu runner
   or hosted Pages validation.
