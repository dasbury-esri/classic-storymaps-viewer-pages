#!/usr/bin/env bash
set -euo pipefail

RUNTIME_PATH="${RUNTIME_PATH:-runtimes/cascade/upstream}"
OUTPUT_PATH="${OUTPUT_PATH:-runtimes/cascade/build}"
CASCADE_RELEASE_FALLBACK_PATH="${CASCADE_RELEASE_FALLBACK_PATH:-runtimes/cascade/release-1.23.0}"
CASCADE_HISTORY_FALLBACK_REF="${CASCADE_HISTORY_FALLBACK_REF:-30d22e8aa38fce3553eec3dd33e8283e3ddb1770}"
CASCADE_HISTORY_FALLBACK_PATH="${CASCADE_HISTORY_FALLBACK_PATH:-publish/templates/classic-storymaps/cascade}"

has_required_cascade_viewer_files() {
  local candidate_path="$1"

  [[ -f "$candidate_path/index.html" ]] || return 1
  [[ -f "$candidate_path/app/main-config.js" ]] || return 1
  [[ -f "$candidate_path/app/main-app.js" ]] || return 1
  [[ -f "$candidate_path/app/viewer-min.js" ]] || return 1
  [[ -f "$candidate_path/resources/styles/calcite/colors-default.less" ]] || return 1
  [[ -f "$candidate_path/resources/styles/calcite/variables.less" ]] || return 1
}

stage_release_fallback_bundle() {
  local output_path="$1"

  if [[ ! -f "$CASCADE_RELEASE_FALLBACK_PATH/index.html" ]]; then
    return 1
  fi

  rm -rf "$output_path"
  mkdir -p "$output_path"
  cp -R "$CASCADE_RELEASE_FALLBACK_PATH"/. "$output_path"/
}

stage_history_fallback_bundle() {
  local output_path="$1"

  if ! git cat-file -e "$CASCADE_HISTORY_FALLBACK_REF:$CASCADE_HISTORY_FALLBACK_PATH/index.html" 2>/dev/null; then
    return 1
  fi

  rm -rf "$output_path"
  mkdir -p "$output_path"
  git archive "$CASCADE_HISTORY_FALLBACK_REF" "$CASCADE_HISTORY_FALLBACK_PATH" | \
    tar -x -C "$output_path" --strip-components=4
}

stage_fallback_lib_assets() {
  local output_path="$1"

  mkdir -p "$output_path/lib/jquery/dist"
  mkdir -p "$output_path/lib/fastclick/lib"
  mkdir -p "$output_path/lib/font-awesome/css"
  mkdir -p "$output_path/lib/font-awesome/fonts"
  mkdir -p "$output_path/lib/calcite-bootstrap/css"

  # Fallback build copies src/ and misses bower-provided lib assets. Pull the
  # minimum runtime dependencies so cascade can bootstrap in publish output.
  curl -fsSL "https://code.jquery.com/jquery-2.2.4.min.js" \
    -o "$output_path/lib/jquery/dist/jquery.min.js"
  curl -fsSL "https://unpkg.com/fastclick@1.0.6/lib/fastclick.js" \
    -o "$output_path/lib/fastclick/lib/fastclick.js"
  curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css" \
    -o "$output_path/lib/font-awesome/css/font-awesome.css"
  curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/fonts/fontawesome-webfont.woff2?v=4.6.3" \
    -o "$output_path/lib/font-awesome/fonts/fontawesome-webfont.woff2"
  curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/fonts/fontawesome-webfont.woff?v=4.6.3" \
    -o "$output_path/lib/font-awesome/fonts/fontawesome-webfont.woff"
  curl -fsSL "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/fonts/fontawesome-webfont.ttf?v=4.6.3" \
    -o "$output_path/lib/font-awesome/fonts/fontawesome-webfont.ttf"
  curl -fsSL "https://esri.github.io/calcite-bootstrap/assets/css/calcite-bootstrap.min.css" \
    -o "$output_path/lib/calcite-bootstrap/css/calcite-bootstrap-open.min.css"
}

rm -rf "$OUTPUT_PATH"
mkdir -p "$OUTPUT_PATH"

build_ok=true
pushd "$RUNTIME_PATH" >/dev/null
  if [[ -f "package-lock.json" || -f "npm-shrinkwrap.json" ]]; then
    npm ci || build_ok=false
  else
    npm install --no-package-lock --no-audit --no-fund || build_ok=false
  fi

  if [[ "$build_ok" == "true" ]]; then
    if [[ ! -x "node_modules/.bin/grunt" ]]; then
      npm install --no-save grunt-cli --no-audit --no-fund || build_ok=false
    fi
  fi

  if [[ "$build_ok" == "true" ]]; then
    ./node_modules/.bin/grunt --force || build_ok=false
  fi
popd >/dev/null

if [[ "$build_ok" == "true" && -d "$RUNTIME_PATH/deploy" && has_required_cascade_viewer_files "$RUNTIME_PATH/deploy" ]]; then
  cp -R "$RUNTIME_PATH/deploy"/. "$OUTPUT_PATH"/
else
  echo "Cascade grunt build output is incomplete on this toolchain; attempting official release fallback bundle." >&2
  if stage_release_fallback_bundle "$OUTPUT_PATH"; then
    echo "Cascade official release fallback bundle restored from local release assets." >&2
  elif stage_history_fallback_bundle "$OUTPUT_PATH"; then
    echo "Cascade historical fallback bundle restored from git history." >&2
  else
    echo "Cascade historical fallback unavailable; using source fallback output from src/." >&2
    cp -R "$RUNTIME_PATH/src"/. "$OUTPUT_PATH"/
    stage_fallback_lib_assets "$OUTPUT_PATH"
  fi
fi

echo "Cascade build output copied to $OUTPUT_PATH"
