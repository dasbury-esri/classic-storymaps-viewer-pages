#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP="${TIMESTAMP:-20171210022531}"
ORIGIN="${ORIGIN:-http://storymaps.arcgis.com}"
SEED_PATH="/en/app-list/"
OUT_ROOT="${OUT_ROOT:-classic-apps/2017-12-10/app-list}"
MAX_LINKS="${MAX_LINKS:-40}"

RAW_DIR="$OUT_ROOT/raw"
PAGES_DIR="$OUT_ROOT/pages"

mkdir -p "$RAW_DIR" "$PAGES_DIR"

wayback_url() {
  local url="$1"
  printf 'https://web.archive.org/web/%s/%s' "$TIMESTAMP" "$url"
}

canonicalize_storymaps_url() {
  local url="$1"

  if [[ "$url" =~ ^(https?://storymaps\.(arcgis|esri)\.com)(/.*)$ ]]; then
    local origin_part="${BASH_REMATCH[1]}"
    local path_part="${BASH_REMATCH[3]}"

    if [[ "$path_part" != "/" ]]; then
      path_part="${path_part%/}"
    fi

    printf '%s%s\n' "$origin_part" "$path_part"
    return 0
  fi

  printf '%s\n' "$url"
}

fetch_to_file() {
  local url="$1"
  local out_file="$2"

  curl --retry 3 --retry-delay 2 --retry-connrefused -fsSL "$(wayback_url "$url")" -o "$out_file"
}

should_strip_brand_chrome() {
  local source_url="$1"

  [[ "$source_url" =~ ^https?://storymaps\.(arcgis|esri)\.com/en/ ]] || return 1
  [[ "$source_url" =~ ^https?://storymaps\.(arcgis|esri)\.com/en/app-list/?$ ]] && return 1
  [[ "$source_url" =~ ^https?://storymaps\.(arcgis|esri)\.com/en/app-list$ ]] && return 1

  return 0
}

should_capture_link() {
  local url="$1"

  [[ "$url" =~ ^https?://storymaps\.(arcgis|esri)\.com/en/app-list/[^/]+/?$ ]] && return 0
  [[ "$url" =~ ^https?://storymaps\.(arcgis|esri)\.com/en/app-list/[^/]+/(gallery[^/]*|tutorial)/?$ ]] && return 0
  [[ "$url" =~ ^https?://storymaps\.(arcgis|esri)\.com/en/(faq|gallery|how-to|my-stories|resources)/?$ ]] && return 0
  [[ "$url" =~ ^https?://storymaps\.(arcgis|esri)\.com/en/?$ ]] && return 0

  return 1
}

sanitize_file() {
  local in_file="$1"
  local out_file="$2"
  local source_url="${3:-}"
  local tmp_file
  local tmp_file2
  local tmp_file3
  tmp_file="$(mktemp)"
  tmp_file2="$(mktemp)"
  tmp_file3="$(mktemp)"

  awk '
    /<!-- BEGIN WAYBACK TOOLBAR INSERT -->/ { skip=1; next }
    /<!-- END WAYBACK TOOLBAR INSERT -->/ { skip=0; next }
    skip == 0 { print }
  ' "$in_file" > "$tmp_file"

  cp "$tmp_file" "$tmp_file2"

  if should_strip_brand_chrome "$source_url"; then
    awk '
      /<header id="header">/ { skip=1; next }
      /<\/header>/ { if (skip) { skip=0; next } }
      skip == 0 { print }
    ' "$tmp_file2" > "$tmp_file3"
  else
    cp "$tmp_file2" "$tmp_file3"
  fi

  sed -E \
    -e 's#https?://web\.archive\.org/web/[0-9]+(im_|js_|cs_|if_|id_)?/##g' \
    -e 's#//web\.archive\.org/web/[0-9]+(im_|js_|cs_|if_|id_)?/##g' \
    -e '/bundle-playback\.js/d' \
    -e '/wombat\.js/d' \
    -e '/banner-styles\.css/d' \
    -e '/iconochive\.css/d' \
    -e '/__wm\./d' \
    -e '/FILE ARCHIVED ON/,/SECTION 108\(a\)\(3\)\)\./d' \
    -e '/playback timings \(ms\):/,$d' \
    "$tmp_file3" > "$out_file"

  rm -f "$tmp_file" "$tmp_file2" "$tmp_file3"

  if should_strip_brand_chrome "$source_url"; then
    local tmp_file4
    tmp_file4="$(mktemp)"

    awk '
      /<footer class="footer/ { skip=1; next }
      /<a href="#" class="back-to-top/ { if (skip) { skip=0; next } }
      skip == 0 { print }
    ' "$out_file" > "$tmp_file4"

    mv "$tmp_file4" "$out_file"
  fi
}

normalize_link() {
  local link="$1"
  link="${link%%#*}"
  link="${link%%\?*}"
  [[ -n "$link" ]] || return 1

  # Decode common Wayback wrappers to the original URL.
  link="$(printf '%s' "$link" | sed -E 's#^https?://web\.archive\.org/web/[0-9]+(im_|js_|cs_|if_|id_)?/##')"
  link="$(printf '%s' "$link" | sed -E 's#^//web\.archive\.org/web/[0-9]+(im_|js_|cs_|if_|id_)?/##')"
  link="$(printf '%s' "$link" | sed -E 's#^/web/[0-9]+(im_|js_|cs_|if_|id_)?/##')"

  if [[ "$link" =~ ^https?://storymaps\.(arcgis|esri)\.com/ ]]; then
    canonicalize_storymaps_url "$link"
    return 0
  fi

  if [[ "$link" =~ ^/en/ ]]; then
    canonicalize_storymaps_url "${ORIGIN}${link}"
    return 0
  fi

  return 1
}

save_page() {
  local url="$1"
  local path
  path="$(printf '%s' "$url" | sed -E 's#^https?://storymaps\.(arcgis|esri)\.com##')"
  path="${path%/}"
  [[ -n "$path" ]] || path="/en"

  local slug
  slug="$(printf '%s' "$path" | sed -E 's#^/##; s#[^A-Za-z0-9/_-]+#-#g; s#/#__#g')"
  [[ -n "$slug" ]] || slug="en"

  local raw_file="$RAW_DIR/${slug}.raw.html"
  local clean_file="$PAGES_DIR/${slug}.html"

  if ! fetch_to_file "$url" "$raw_file"; then
    printf 'Skipped linked page after retries: %s\n' "$url" >&2
    return 0
  fi

  sanitize_file "$raw_file" "$clean_file" "$url"
}

SEED_URL="${ORIGIN}${SEED_PATH}"
SEED_RAW="$RAW_DIR/index.raw.html"
SEED_OUT="$OUT_ROOT/index.html"

fetch_to_file "$SEED_URL" "$SEED_RAW"
sanitize_file "$SEED_RAW" "$SEED_OUT" "$SEED_URL"

mapfile -t links < <(
  grep -Eoi 'href="[^"]+"' "$SEED_RAW" \
    | sed -E 's/^href="//; s/"$//' \
    | while IFS= read -r href; do
        normalize_link "$href" || true
      done \
    | while IFS= read -r link; do
        if should_capture_link "$link"; then
          printf '%s\n' "$link"
        fi
      done \
    | sort -u \
    | head -n "$MAX_LINKS"
)

for link in "${links[@]}"; do
  save_page "$link"
done

printf 'Captured seed: %s\n' "$SEED_OUT"
printf 'Captured linked pages: %s\n' "${#links[@]}"
