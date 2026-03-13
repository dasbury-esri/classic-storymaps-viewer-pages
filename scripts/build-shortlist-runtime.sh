#!/usr/bin/env bash
set -euo pipefail

RUNTIME_PATH="${RUNTIME_PATH:-runtimes/shortlist/upstream}"
OUTPUT_PATH="${OUTPUT_PATH:-runtimes/shortlist/build}"

rm -rf "$OUTPUT_PATH"
mkdir -p "$OUTPUT_PATH"

pushd "$RUNTIME_PATH" >/dev/null
  if [[ -f "package-lock.json" || -f "npm-shrinkwrap.json" ]]; then
    npm ci
  else
    npm install --no-package-lock --no-audit --no-fund
  fi
  if [[ ! -x "node_modules/.bin/grunt" ]]; then
    npm install --no-save grunt-cli --no-audit --no-fund
  fi
  ./node_modules/.bin/grunt --force
popd >/dev/null

if [[ -d "$RUNTIME_PATH/deploy" ]]; then
  cp -R "$RUNTIME_PATH/deploy"/. "$OUTPUT_PATH"/
else
  cp -R "$RUNTIME_PATH/src"/. "$OUTPUT_PATH"/
fi

echo "Shortlist build output copied to $OUTPUT_PATH"
