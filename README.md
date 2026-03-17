# Classic Storymaps Viewer Pages

Monorepo for hosting Classic Storymaps landing and per-app viewer helper pages under `/templates/classic-storymaps`.

## Initial Contents
- `.github/prompts/plan-storymapsSiteDeploy.prompt.md` - primary execution checklist and scope for this repo
- `apps/` - app-specific page implementations
- `docs/` - deployment, operations, and architecture notes

## Local Runtime Caches
- Extracted runtime release bundles under `runtimes/*/release-*` are treated as local fallback caches and are git-ignored.
- The current Cascade fallback at `runtimes/cascade/release-1.23.0` is intentionally kept local so `scripts/build-cascade-runtime.sh` can recover when the upstream legacy build cannot reproduce the original deploy output.

## Next Steps
1. Refine the site deployment plan prompt for phase sequencing and effort sizing.
2. Define route contract and adapter matrix for phase-1 apps.
3. Implement shared validation and page shell.
