#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${SRC_DIR:-apps/classic-storymaps-site}"
OUT_DIR="${OUT_DIR:-publish/templates/classic-storymaps}"
ROOT_PAGE_SRC="${ROOT_PAGE_SRC:-apps/classic-storymaps-site/root-index.html}"
ROOT_PAGE_OUT="${ROOT_PAGE_OUT:-publish/index.html}"
ARCHIVE_PAGE_SRC="${ARCHIVE_PAGE_SRC:-classic-apps/Classic Apps WebPage - Jun 2016 Internet Archive.html}"
ARCHIVE_PAGE_OUT="${ARCHIVE_PAGE_OUT:-publish/archive/classic-apps-2016-06.html}"

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

sanitize_wayback_html() {
  local in_file="$1"
  local out_file="$2"
  local tmp_file
  tmp_file="$(mktemp)"

  # Remove the injected Wayback toolbar block while preserving archived page markup.
  awk '
    /<!-- BEGIN WAYBACK TOOLBAR INSERT -->/ { skip=1; next }
    /<!-- END WAYBACK TOOLBAR INSERT -->/ { skip=0; next }
    skip == 0 { print }
  ' "$in_file" > "$tmp_file"

  # Remove remaining Wayback helper scripts/styles and replay hooks outside toolbar markers.
  sed -E \
    -e '/bundle-playback\.js/d' \
    -e '/wombat\.js/d' \
    -e '/banner-styles\.css/d' \
    -e '/iconochive\.css/d' \
    -e '/__wm\./d' \
    "$tmp_file" > "$out_file"

  rm -f "$tmp_file"
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

if [[ -f "$ROOT_PAGE_SRC" ]]; then
  mkdir -p "$(dirname "$ROOT_PAGE_OUT")"
  cp "$ROOT_PAGE_SRC" "$ROOT_PAGE_OUT"
fi

if [[ -f "$ARCHIVE_PAGE_SRC" ]]; then
  mkdir -p "$(dirname "$ARCHIVE_PAGE_OUT")"
  sanitize_wayback_html "$ARCHIVE_PAGE_SRC" "$ARCHIVE_PAGE_OUT"
fi

echo "Classic Storymaps canonical landing build output copied to $OUT_DIR"
