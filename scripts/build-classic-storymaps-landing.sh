#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${SRC_DIR:-apps/classic-storymaps-site}"
OUT_DIR="${OUT_DIR:-publish/templates/classic-storymaps}"

# Keep this list aligned with scripts/build-classic-storymaps-runtime-publish.sh.
runtime_names=(maptour swipe mapjournal mapseries cascade shortlist crowdsource basic)

is_runtime_dir() {
  local candidate="$1"
  local runtime_name
  for runtime_name in "${runtime_names[@]}"; do
    if [[ "$runtime_name" == "$candidate" ]]; then
      return 0
    fi
  done
  return 1
}

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source landing app directory not found: $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Refresh only landing-managed files while preserving runtime publish folders.
shopt -s dotglob nullglob
for target_path in "$OUT_DIR"/*; do
  target_name="$(basename "$target_path")"
  if is_runtime_dir "$target_name"; then
    continue
  fi
  rm -rf "$target_path"
done
shopt -u dotglob nullglob

cp -R "$SRC_DIR"/. "$OUT_DIR"/

echo "Classic Storymaps canonical landing build output copied to $OUT_DIR"
