#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${SRC_DIR:-apps/classic-storymaps-site}"
OUT_DIR="${OUT_DIR:-publish/viewers}"
COMPAT_OUT_DIR_STORIES="${COMPAT_OUT_DIR_STORIES:-publish/templates/classic-stories}"
COMPAT_OUT_DIR_STORYMAPS="${COMPAT_OUT_DIR_STORYMAPS:-publish/templates/classic-storymaps}"
ROOT_PAGE_SRC="${ROOT_PAGE_SRC:-apps/classic-storymaps-site/archive-root.html}"
ROOT_PAGE_OUT="${ROOT_PAGE_OUT:-publish/index.html}"
ARCHIVE_PAGE_SRC="${ARCHIVE_PAGE_SRC:-classic-apps/2017-12-10/app-list/raw/index.raw.html}"
ARCHIVE_PAGE_OUT="${ARCHIVE_PAGE_OUT:-publish/archive/2017-12-10-app-list.html}"

# Keep this list aligned with scripts/build-classic-storymaps-runtime-publish.sh.
runtime_names=(maptour swipe mapjournal mapseries cascade shortlist crowdsource basic)
launcher_files=(maptour-launcher.html swipe-launcher.html mapjournal-launcher.html mapseries-launcher.html cascade-launcher.html shortlist-launcher.html crowdsource-launcher.html basic-launcher.html)

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
  local tmp_file_2
  tmp_file="$(mktemp)"
  tmp_file_2="$(mktemp)"

  # Remove the injected Wayback toolbar and head bootstrap while preserving the archived document shell.
  awk '
    /<!-- BEGIN WAYBACK TOOLBAR INSERT -->/ { skip=1; next }
    /<!-- END WAYBACK TOOLBAR INSERT -->/ { skip=0; next }
    /^[[:space:]]*<head><script type="text\/javascript" src="https:\/\/web-static\.archive\.org\/_static\/js\/bundle-playback\.js/ {
      sub(/<script.*/, "", $0)
      print
      skip=1
      next
    }
    /<!-- End Wayback Rewrite JS Include -->/ { skip=0; next }
    skip == 0 { print }
  ' "$in_file" > "$tmp_file"

  # Remove remaining Wayback helper scripts/styles and replay hooks outside toolbar markers.
  sed -E \
    -e '/RufflePlayer/d' \
    -e '/ruffle\.js/d' \
    -e '/^[[:space:]]*"[0-9]+"\);[[:space:]]*$/d' \
    -e '/bundle-playback\.js/d' \
    -e '/wombat\.js/d' \
    -e '/banner-styles\.css/d' \
    -e '/iconochive\.css/d' \
    -e '/__wm\./d' \
    -e '/FILE ARCHIVED ON/,/SECTION 108\(a\)\(3\)\)\./d' \
    -e '/playback timings \(ms\):/,$d' \
    "$tmp_file" > "$tmp_file_2"

  if grep -qi '^[[:space:]]*<meta charset=' "$tmp_file_2"; then
    {
      printf '<!DOCTYPE html>\n'
      printf '<html xml:lang="en" lang="en">\n'
      printf '  <head>\n'
      cat "$tmp_file_2"
    } > "$out_file"
  else
    mv "$tmp_file_2" "$out_file"
  fi

  rm -f "$tmp_file"
  rm -f "$tmp_file_2"
}

write_compat_redirect_stub() {
  local out_file="$1"
  local from_prefix="$2"
  mkdir -p "$(dirname "$out_file")"

  cat > "$out_file" <<EOF
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecting...</title>
  <script>
    (function() {
      var fromPrefix = '${from_prefix}';
      var toPrefix = '/viewers';
      var path = String(window.location.pathname || '');
      var lowerPath = path.toLowerCase();
      var lowerFrom = fromPrefix.toLowerCase();
      var targetPath = toPrefix + '/';

      if (lowerPath === lowerFrom || lowerPath === lowerFrom + '/') {
        targetPath = toPrefix + '/';
      } else if (lowerPath.indexOf(lowerFrom + '/') === 0) {
        targetPath = toPrefix + path.substring(fromPrefix.length);
      }

      var destination = targetPath + window.location.search + window.location.hash;
      window.location.replace(destination);
    })();
  </script>
</head>
<body>
  Redirecting to the canonical Classic Story Maps route...
</body>
</html>
EOF
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

if [[ -n "$ROOT_PAGE_SRC" && -f "$ROOT_PAGE_SRC" ]]; then
  mkdir -p "$(dirname "$ROOT_PAGE_OUT")"
  cp "$ROOT_PAGE_SRC" "$ROOT_PAGE_OUT"
fi

if [[ -f "$ARCHIVE_PAGE_SRC" ]]; then
  mkdir -p "$(dirname "$ARCHIVE_PAGE_OUT")"
  sanitize_wayback_html "$ARCHIVE_PAGE_SRC" "$ARCHIVE_PAGE_OUT"
fi

compat_specs=(
  "$COMPAT_OUT_DIR_STORIES:/templates/classic-stories"
  "$COMPAT_OUT_DIR_STORYMAPS:/templates/classic-storymaps"
)

for compat_spec in "${compat_specs[@]}"; do
  compat_out_dir="${compat_spec%%:*}"
  compat_prefix="${compat_spec#*:}"

  rm -rf "$compat_out_dir"
  mkdir -p "$compat_out_dir"

  write_compat_redirect_stub "$compat_out_dir/index.html" "$compat_prefix"

  for runtime_name in "${runtime_names[@]}"; do
    write_compat_redirect_stub "$compat_out_dir/$runtime_name/index.html" "$compat_prefix"
  done

  for launcher_file in "${launcher_files[@]}"; do
    write_compat_redirect_stub "$compat_out_dir/$launcher_file" "$compat_prefix"
  done
done

echo "Classic Storymaps canonical landing build output copied to $OUT_DIR"
