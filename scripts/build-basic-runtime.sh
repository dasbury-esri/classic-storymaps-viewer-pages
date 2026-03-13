#!/usr/bin/env bash
set -euo pipefail

RUNTIME_PATH="${RUNTIME_PATH:-runtimes/basic/upstream}"
OUTPUT_PATH="${OUTPUT_PATH:-runtimes/basic/build}"

rm -rf "$OUTPUT_PATH"
mkdir -p "$OUTPUT_PATH"

copy_item() {
  local src="$1"
  local dst="$2"
  if [[ -e "$src" ]]; then
    cp -R "$src" "$dst"
  fi
}

copy_item "$RUNTIME_PATH/index.html" "$OUTPUT_PATH"
copy_item "$RUNTIME_PATH/oauth-callback.html" "$OUTPUT_PATH"
copy_item "$RUNTIME_PATH/js" "$OUTPUT_PATH"
copy_item "$RUNTIME_PATH/css" "$OUTPUT_PATH"
copy_item "$RUNTIME_PATH/font" "$OUTPUT_PATH"
copy_item "$RUNTIME_PATH/images" "$OUTPUT_PATH"
copy_item "$RUNTIME_PATH/resources" "$OUTPUT_PATH"
copy_item "$RUNTIME_PATH/config" "$OUTPUT_PATH"

echo "Basic runtime output copied to $OUTPUT_PATH"
