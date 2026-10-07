# Review Fixes: Batch C Verification

## C1: Self-Hosted Destination Disclosure

Commit `ee4c74b` shows the parsed destination hostname on the viewer button and
the complete HTTP(S) URL in the status before navigation. Invalid destinations
disable navigation. Switching back to a local runtime restores its ordinary
button label and status.

All four new tests failed against the original loader, then passed after the
change. The full suite at that point passed 40 tests. Local browser checks used
mocked item metadata with a long hostname and path at 1280px desktop and 375px
mobile widths. Complete URL text remained visible, without horizontal overflow;
screenshots of both layouts were inspected. No sign-in or destination navigation
was performed.

## C2: Runtime Reconstruction

The checker fetches the exact manifest commit into a disposable Git checkout,
then applies patches in manifest order using `git apply --index -p4`. The strip
count removes the existing `a/runtimes/<app>/upstream/` prefix. The full repository
is imported, matching the existing importers; `sourceSubpath` is a build location,
not a filter on the imported files.

Comparison uses reconstructed Git blob identities and modes against local file
bytes, symlink targets, and executable bits. Tracked working-tree files and
nonignored untracked additions are considered; ignored local build caches are
not. No source files, manifests, patches, or existing importers were changed.

Three dependency-free fixture tests failed before implementation and passed
afterwards. They cover pinned reconstruction, ordered patches, tracked files,
ignored caches, modified/missing/additional files, executable-mode drift, and
unreplayable patches without modifying the checked-in source.

The complete 43-test suite passed under Node 24.21.0 after C1 and C2. The new
checker, test, report, and this document had no editor diagnostics; six existing
README Markdown spacing warnings were unchanged.

### Recorded Result

The source trees checked are those at `ee4c74b`. The command exited 1 as expected:
**none of the three runtime imports currently reproduces exactly**.

| Runtime | Applied Patches | Failed Patches | Modified Files | Missing Files |
| --- | ---: | ---: | ---: | ---: |
| Map Tour | 1 | 1 | 179 | 3 |
| Swipe | 0 | 2 | 109 | 2 |
| Map Journal | 0 | 1 | 11 | 0 |

[The complete JSON report](runtime-repro-results.json) records each pinned SHA,
every patch error, and all 304 differing paths relative to that runtime's
`upstream/` directory. There were no unexpected files. Because some patches
failed, these differences describe a partial reconstruction, not necessarily
304 independent missing patch changes.

Patch replay findings:

- Map Tour `0001-production-behavior-align.patch` fails to apply to seven files.
  `0002-iis-web-config-addition.patch` applies successfully.
- Swipe `0001-allow-url-appid-with-authorized-owners-wildcard.patch` fails at
  `Swipe/src/index.html`. `0002-force-viewer-only-in-production.patch` is reported
  corrupt at line 77.
- Map Journal `0001-allow-url-appid-with-authorized-owners-wildcard.patch` is
  reported as garbage at line 4; it contains bare `@@` markers rather than
  numbered unified-diff hunk headers.

The comparison intentionally does not normalize line endings. An independent
`git show` comparison against the pinned Map Tour source confirmed that its
README has 518 CRLF endings, while the checked-in copy has LF endings; those
two files match after CRLF-to-LF normalization. This explains that particular
difference, not all reported differences. There may also be substantive source
changes. Patch applicability must be resolved before interpreting the final
drift set.

Owner follow-up: establish any required import normalization explicitly, repair
unreplayable patch files, and capture intended source changes or deletions as
patches. Rerun the checker until patch failures and differences are both empty.
No automatic normalization or direct upstream edits were made for C2.

### Re-run

From the repository root:

```sh
node scripts/check-runtime-reproducibility.mjs > docs/testing/runtime-repro-results.json
node --test scripts/tests/runtime-repro.test.mjs
```

The first command needs public GitHub access and intentionally exits nonzero
while drift remains. The second uses only temporary local repositories. The
reconstruction check is not a deployment gate while its documented drift remains.

## C3: Owner Decision Pending

No change to `publish/` tracking has been made. Untracking generated output,
updating ignore rules, and validating a fresh-clone preview with Cascade's
historical fallback require the owner's decision first.
