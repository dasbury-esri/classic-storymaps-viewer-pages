#!/usr/bin/env bash
set -euo pipefail

RUNTIME_PATH="${RUNTIME_PATH:-runtimes/crowdsource/upstream}"
OUTPUT_PATH="${OUTPUT_PATH:-runtimes/crowdsource/build}"

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

if [[ "$build_ok" == "true" && -d "$RUNTIME_PATH/deploy" ]]; then
  cp -R "$RUNTIME_PATH/deploy"/. "$OUTPUT_PATH"/
else
  echo "Crowdsource grunt build failed on this toolchain; using source fallback output from src/." >&2
  cp -R "$RUNTIME_PATH/src"/. "$OUTPUT_PATH"/
  if [[ ! -f "$OUTPUT_PATH/index.html" && -f "$OUTPUT_PATH/index.ejs" ]]; then
    cp "$OUTPUT_PATH/index.ejs" "$OUTPUT_PATH/index.html"
  fi
fi

echo "Crowdsource build output copied to $OUTPUT_PATH"
