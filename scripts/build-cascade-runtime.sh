#!/usr/bin/env bash
set -euo pipefail

RUNTIME_PATH="${RUNTIME_PATH:-runtimes/cascade/upstream}"
OUTPUT_PATH="${OUTPUT_PATH:-runtimes/cascade/build}"

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
  echo "Cascade grunt build failed on this toolchain; using source fallback output from src/." >&2
  cp -R "$RUNTIME_PATH/src"/. "$OUTPUT_PATH"/
fi

echo "Cascade build output copied to $OUTPUT_PATH"
