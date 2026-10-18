# Migration Provenance Audit

## Gate Status

**2026-10-17:** this gate now applies to the next public release, not to the
repository transfer. See
[transfer decisions](../../.github/prompts/transfer-decisions.prompt.md).

Current inventory update: 2026-10-17. The exact candidate list is
[remaining-content-inventory.json](remaining-content-inventory.json): 5,345
tracked, present files, of which 4,518 are runtime import/local-patch context
preserving earlier evidence. The remaining 827 candidates include authored
material and duplicates, not 827 findings of prohibited content. Every path and
SHA-256 was independently checked against Git and external checksum tools.

Fresh local notice delivery is verified, including the Shortlist Ionicons
decision and approved unused-font removals. Git-history clearance is not a
migration gate; retained deployments remain deferred cleanup after production
acceptance. Other content decisions and publication approval remain separate.
No transfer, history rewrite, new removal, DNS change or deployment occurred.
The baseline and scan sections below are historical, not current remote-state
claims or instructions to reopen completed work.

| Current group | Files |
| --- | ---: |
| Archive/example source | 101 |
| Catalog/captured assets | 497 |
| Schema/captured examples | 9 |
| Site-source candidates | 29 |
| Other asset candidates | 183 |
| Tailcoat font files | 4 |
| Basic social font files | 4 |
| Runtime import/local-patch context | 4,518 |

The report states its selectors and exclusions. Ignored/untracked outputs,
history, deployed copies, credential/certificate contents and symlink targets
were not inspected. Paths in the last group are context, not newly reopened
rights findings. The [font record](../licenses/runtime-font-provenance.md#tailcoat-and-basic-social-font-inventory)
identifies the two remaining font cohorts and their direct CSS consumers.

The permitted release inputs are independently authored code and license-cleared
public components. Public availability, a root license, successful compilation,
or absence of an internal hostname is not sufficient provenance evidence.

## Verified Baseline

- Audited local HEAD: `11de146a6b6665ebe889a9dcff25134d81df875f`.
- GitHub metadata reports `dasbury-esri/classic-storymaps-viewer-pages`, public,
  with default branch `main` and administrative access for the current session.
- Remote `main` matches that HEAD. The remote also advertises
  `validation/batch-d-releases` at
  `2b8c572ec7038372c3130a3e9715bd61d09b0460`.
- The local repository is not shallow. Git reports 4,939 tracked files and 7,850
  objects reachable through the locally available refs.
- The current index has no gitlinks and no tracked files under directories named
  `dist`, `publish`, `.traces`, or `output`. This is a path-based inventory, not
  a complete generated-file classification.
- A reachable-object path check found no `arcgis-storymaps-repo/` root directory.
  This does not detect renamed, copied, derived, unreachable, or remotely retained
  material.
- The Pages API reports Actions publishing, no attached custom domain, and HTTPS
  enforced at the current project Pages address. Account-level domain verification
  is separate from that repository setting.

- Git LFS reported no files in its all-ref inventory. GitHub API queries returned
  no releases, pull requests, listed Actions artifacts, or Actions caches.
  Attachments, provider-retained objects, prior deployments, and complete remote
  history remain outside this checkpoint's clearance scope.
- Local `git fsck --full --no-reflogs --unreachable` reported three blobs,
  three trees and two commits. Their contents were not opened or deleted.

## Local Secret-Pattern Scan

Gitleaks 8.30.1 scanned locally available Git history with `--log-opts=--all`
and `--redact=100`. It returned 53 findings across 25 paths: 22 generic API-key,
20 Google API-key, ten Flickr-token and one private-key pattern matches.
These are scanner flags, not 53 confirmed leaked credentials. The redacted
report remains outside the repository; no matched values are reproduced here.

The flagged `runtimes/crowdsource/upstream/config/server/dev_ssl/key.pem` has
Git blob ID `170b6bc92d2444b50b465781d44800fe2ec9e968`, identical to the same
path in the public `Esri/storymap-crowdsource` tag `v0.10.0` (tree
`878ba358c12a3f3d1b6da5c8fd7b40dbcffbac07`). Only object IDs were compared;
key contents were not opened. This identifies a publicly distributed development
key, not a safe production credential or clearance of the whole runtime.
Do not use it for production TLS. The remaining flags still need triage,
including historical generated bundles. No scanner exceptions were added.

## Preliminary Public-Source Comparison

The public Esri Git tree API resolved all six declared pins below without
truncation. Their root license files identify Apache 2.0. This establishes the
availability and root license of the comparison source, not rights for every
bundled dependency, local modification or captured asset.

| Runtime | Public repository and exact revision | Tracked files | Exact blob matches | Different blobs | Paths absent upstream |
| --- | --- | ---: | ---: | ---: | ---: |
| Map Tour | [Esri/storymap-tour](https://github.com/Esri/storymap-tour/tree/2e56c7e08801fc6bbfc2bc27e0d220688a7120a6) | 726 | 546 | 179 | 1 |
| Swipe | [Esri/storymap-swipe](https://github.com/Esri/storymap-swipe/tree/7e0fb19e1758638bacff788a513372b4bf4fc0c8) | 213 | 104 | 109 | 0 |
| Map Journal | [Esri/storymap-journal](https://github.com/Esri/storymap-journal/tree/2a51369e8e0e90c10ac0340a6496219df218b73e) | 856 | 852 | 4 | 0 |
| Map Series | [Esri/storymap-series](https://github.com/Esri/storymap-series/tree/109e94458da8f297cd21b7ed877832b8a8ce9867) | 814 | 810 | 4 | 0 |
| Cascade | [Esri/storymap-cascade](https://github.com/Esri/storymap-cascade/tree/df47322cf31bbf1d72768c829349477fce0514a9) | 715 | 708 | 7 | 0 |
| Shortlist | [Esri/storymap-shortlist](https://github.com/Esri/storymap-shortlist/tree/882acb573fc415a04f5fb56c63ccb58bfcba15c9) | 789 | 571 | 218 | 0 |

Counts are preliminary helper output comparing Git index blob IDs with public
tree metadata at corresponding paths. They are not independently reconciled
per-file clearance results. No line-ending normalization was applied; different
blobs are not by themselves evidence of substantive or proprietary changes.
Basic and the complete Crowdsource import still need pinned-source reconciliation.
Map Tour's manifest placeholder remains unchanged pending complete review.

## Outstanding Review

| Surface | Required evidence | Status |
| --- | --- | --- |
| Runtime imports and mirrors | Preserve recorded public pins and reviewed patches; investigate only specific remaining differences | Exact paths inventoried; not blanket unresolved copying |
| Map Tour manifest | Resolve the earlier placeholder from public source evidence without inventing lineage | Separate manifest metadata question |
| Captured archive pages and assets | Intended-use permission and credits for exact inventoried copies | Candidate list established; decisions remain |
| Tailcoat and Basic social fonts | Font/glyph origin, applicable terms and attribution | Exact eight files and consumers established; permission unresolved |
| Bundled dependencies | Preserve verified notice/source delivery; check account/use and visible attribution | Local packaging verified, hosted acceptance pending |
| Git history and retained deployments | Preserve owner's exclusion of history clearance and deferred deployment cleanup | Not current migration gates |
| Confidentiality and secret scan | Triage relevant current findings without exposing values; do not equate historical scanner flags with current leaks | Separate security review, not a content-rights finding |

The companion converter repository is private. Its detailed findings must remain
in a separately authorized restricted record, not this public repository.

## Release Rule

Do not transfer or upload a new deployment without owner approval and resolution
of the applicable current content/release decisions. A candidate's presence in
the inventory is not by itself a finding of missing permission.
Any history rewrite, force push, deletion of artifacts, or replacement of suspect
components requires explicit approval and independently verified scope. Keep only
cleared deployment artifacts as rollback candidates. Do not copy suspect content
into public reports, new archives, or personal evidence repositories.
