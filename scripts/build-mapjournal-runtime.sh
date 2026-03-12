#!/usr/bin/env bash
set -euo pipefail

RUNTIME_PATH="${RUNTIME_PATH:-runtimes/mapjournal/upstream}"
OUTPUT_PATH="${OUTPUT_PATH:-runtimes/mapjournal/build}"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required on PATH." >&2
  exit 1
fi

if [[ ! -d "$RUNTIME_PATH" ]]; then
  echo "Runtime path not found: $RUNTIME_PATH" >&2
  exit 1
fi

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

copy_item() {
  local src="$1"
  local dst="$2"
  if [[ -e "$src" ]]; then
    cp -R "$src" "$dst"
  fi
}

if [[ -d "$RUNTIME_PATH/deploy" ]]; then
  copy_item "$RUNTIME_PATH/deploy/index.html" "$OUTPUT_PATH"
  copy_item "$RUNTIME_PATH/deploy/app" "$OUTPUT_PATH"
  copy_item "$RUNTIME_PATH/deploy/resources" "$OUTPUT_PATH"
  copy_item "$RUNTIME_PATH/deploy/web.config" "$OUTPUT_PATH"
  copy_item "$RUNTIME_PATH/src/web.config" "$OUTPUT_PATH"
else
  copy_item "$RUNTIME_PATH/src/index.html" "$OUTPUT_PATH"
  copy_item "$RUNTIME_PATH/src/app" "$OUTPUT_PATH"
  copy_item "$RUNTIME_PATH/src/resources" "$OUTPUT_PATH"
  copy_item "$RUNTIME_PATH/src/web.config" "$OUTPUT_PATH"
fi

echo "Map Journal build output copied to $OUTPUT_PATH"