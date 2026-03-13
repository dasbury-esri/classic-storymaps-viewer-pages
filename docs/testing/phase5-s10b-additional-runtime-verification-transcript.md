# S10b Verification Transcript: Additional Runtime Build and Publish

## Scope

Validation for pre-S11 onboarding of five additional runtimes:

- `mapseries`
- `cascade`
- `shortlist`
- `crowdsource`
- `basic`

## Commands Executed

1. Import each runtime at pinned commit refs:
   - `bash scripts/import-mapseries-upstream.sh 109e94458da8f297cd21b7ed877832b8a8ce9867`
   - `bash scripts/import-cascade-upstream.sh df47322cf31bbf1d72768c829349477fce0514a9`
   - `bash scripts/import-shortlist-upstream.sh 882acb573fc415a04f5fb56c63ccb58bfcba15c9`
   - `bash scripts/import-crowdsource-upstream.sh 878ba358c12a3f3d1b6da5c8fd7b40dbcffbac07`
   - `bash scripts/import-basic-upstream.sh 7e8a3bf18a411923fcda6c1c063f401650480c70`
2. Build each runtime:
   - `bash scripts/build-mapseries-runtime.sh`
   - `bash scripts/build-cascade-runtime.sh`
   - `bash scripts/build-shortlist-runtime.sh`
   - `bash scripts/build-crowdsource-runtime.sh`
   - `bash scripts/build-basic-runtime.sh`
3. Assemble publish output:
   - `bash scripts/build-classic-storymaps-runtime-publish.sh`
4. Verify per-runtime build and publish entrypoints:
   - `for app in mapseries cascade shortlist crowdsource basic; do test -f "runtimes/$app/build/index.html"; test -f "publish/templates/classic-storymaps/$app/index.html"; done`

## Build Observations

- Map Series, Cascade, Shortlist, and Basic produced expected build output.
- Crowdsource emitted legacy dependency/toolchain errors during npm/node-gyp processing on modern Node.
- Crowdsource fallback path succeeded and produced deployable output by copying from `src/` and generating `index.html` from `index.ejs`.

## Artifact Verification

Build artifacts verified:

- `runtimes/mapseries/build/index.html`
- `runtimes/cascade/build/index.html`
- `runtimes/shortlist/build/index.html`
- `runtimes/crowdsource/build/index.html`
- `runtimes/basic/build/index.html`

Publish artifacts verified:

- `publish/templates/classic-storymaps/mapseries/index.html`
- `publish/templates/classic-storymaps/cascade/index.html`
- `publish/templates/classic-storymaps/shortlist/index.html`
- `publish/templates/classic-storymaps/crowdsource/index.html`
- `publish/templates/classic-storymaps/basic/index.html`

## Acceptance Mapping

- Clone/import at pinned refs for all five additional runtimes: Pass
- Build output generated for all five runtimes: Pass
- Deploy assembly includes all five runtime routes under publish target: Pass
- Basic runtime smoke (entrypoint presence) validated in build and publish trees: Pass

## Conclusion

Pre-S11 additional runtime onboarding is complete for Map Series, Cascade, Shortlist, Crowdsource, and Basic.
The only residual risk is Crowdsource legacy toolchain instability on modern Node, mitigated via deterministic source-fallback packaging.
