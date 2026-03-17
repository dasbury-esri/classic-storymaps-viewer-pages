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
ARCHIVE_PAGES_SRC="${ARCHIVE_PAGES_SRC:-classic-apps/2017-12-10/app-list/pages}"
ARCHIVE_PAGES_OUT="${ARCHIVE_PAGES_OUT:-publish/archive/2017-12-10-pages}"

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

sanitize_archive_html_file() {
  local file_path="$1"

  perl -0pi -e '
    s{\s*<script>window\.RufflePlayer=.*?</script>\s*}{}gs;
    s{\s*<script[^>]+ruffle\.js[^>]*></script>\s*}{}gs;
    s{\s*<script type="text/javascript">\s*"\d+"\);\s*</script>\s*<!-- End Wayback Rewrite JS Include -->\s*}{}gs;
    s{\s*<script>\s*var _gaq = _gaq \|\| \[\];.*?</script>\s*}{}gs;
    s{\s*<!-- Google Tag Manager -->.*?<!-- End Google Tag Manager -->\s*}{}gs;
    s{\s*<noscript><iframe[^>]*googletagmanager\.com/ns\.html[^>]*></iframe></noscript>\s*}{}gs;
    s{^[ \t]*<!-- Adobe Analytics -->\s*$\n?}{}mg;
    s{^[ \t]*<!-- Pardot -->\s*$\n?}{}mg;
    s{^[ \t]*<!-- Adobe Analytics start -->\s*$\n?}{}mg;
    s{^[ \t]*<script[^>]+src="[^"]*assets\.adobedtm\.com[^"]*"[^>]*></script>\s*$\n?}{}mg;
    s{^[ \t]*<script[^>]+src="[^"]*go\.pardot\.com[^"]*"[^>]*></script>\s*$\n?}{}mg;
    s{^[ \t]*<script[^>]+src="[^"]*go\.esri\.com[^"]*"[^>]*></script>\s*$\n?}{}mg;
    s{^[ \t]*<script[^>]+src="[^"]*google-analytics\.com[^"]*"[^>]*></script>\s*$\n?}{}mg;
    s{^[ \t]*<script[^>]*>_satellite\.pageBottom\(\);</script>\s*$\n?}{}mg;
    s{href="[^"]*go\.esri\.com[^"]*"}{href="#"}g;
    s{href="[^"]*storymaps\.arcgis\.com/assets/images/favicon\.ico[^"]*"}{href="/viewers/assets/images/favicon.ico"}g;
    s{href="[^"]*storymaps\.arcgis\.com/assets/images/apple-touch-icon\.png[^"]*"}{href="/viewers/assets/images/apple-touch-icon.png"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/css/screen\.css[^"]*"}{href="/viewers/assets/css/archive/screen.css"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/arcgis-storymaps-my-stories-utils/assets/css/my-stories-utils\.css[^"]*"}{href="/viewers/assets/css/archive/my-stories-utils.css"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/arcgis-storymaps-my-stories-utils/sign-in/assets/css/signIn\.css[^"]*"}{href="/viewers/assets/css/archive/signIn.css"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/css/features/features-page\.css[^"]*"}{href="/viewers/assets/css/archive/features-page.css"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/css/applist\.css[^"]*"}{href="/viewers/assets/css/archive/applist.css"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/css/create-story\.css[^"]*"}{href="/viewers/assets/css/archive/create-story.css"}g;
    s{src="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/js/libs/jquery-1\.9\.1\.min\.js[^"]*"}{src="/viewers/assets/js/archive/jquery-1.9.1.min.js"}g;
    s{src="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/js/locale/l10NStrings\.js[^"]*"}{src="/viewers/assets/js/archive/l10NStrings.js"}g;
    s{src="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/js/locale/langSelector\.js[^"]*"}{src="/viewers/assets/js/archive/langSelector.js"}g;
    s{src="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/js/back-to-top\.js[^"]*"}{src="/viewers/assets/js/archive/back-to-top.js"}g;
    s{src="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/assets/js/tailcoat/tailcoat\.js[^"]*"}{src="/viewers/assets/js/archive/tailcoat.js"}g;
    s{src="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/app-list/img/([^"?]+)(?:\?[^"]*)?"}{src="/viewers/assets/images/$1"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/app-list/(map-tour|map-journal|cascade|map-series|crowdsource|shortlist|swipe-spyglass|basic)/tutorial/?"}{href="/archive/2017-12-10-pages/en__app-list__$1__tutorial.html"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/app-list/(map-tour|map-journal|cascade|map-series|crowdsource|shortlist|swipe-spyglass|basic)/?"}{href="/archive/2017-12-10-pages/en__app-list__$1.html"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/app-list/?"}{href="/archive/2017-12-10-pages/en__app-list.html"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/resources/?"}{href="/archive/2017-12-10-pages/en__resources.html"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/my-stories/?"}{href="/archive/2017-12-10-pages/en__my-stories.html"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/how-to/?"}{href="/archive/2017-12-10-pages/en__how-to.html"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/faq/?(#?[^"]*)?"}{href="/archive/2017-12-10-pages/en__faq.html$1"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/?"}{href="/archive/2017-12-10-pages/en.html"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/app-list/[^"/]+/gallery[^\"]*"}{href="#"}g;
    s{href="/(?:web/\d+(?:im_|js_|cs_)?/)?https?://storymaps\.arcgis\.com/en/gallery/[^\"]*"}{href="#"}g;
    s{\s*<link[^>]+fast\.fonts\.net/cssapi[^>]*>\s*}{}gs;
    s{href="[^"]*blogs\.esri\.com/esri/arcgis/category/story-maps/"}{href="/archive/2017-12-10-pages/en__archive-blog.html"}g;
    s{href="[^"]*links\.esri\.com/storymaps/story_maps_geonet"}{href="/archive/2017-12-10-pages/en__archive-forum.html"}g;
    s{href="[^"]*links\.esri\.com/storymaps/story_maps_geonet_ideas"}{href="/archive/2017-12-10-pages/en__archive-feedback.html"}g;
    s{href="[^"]*storymaps\.arcgis\.com/feedback/"}{href="/archive/2017-12-10-pages/en__archive-feedback.html"}g;
  ' "$file_path"
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

# Keep canonical /viewers/index.html even when source is named viewers.html.
if [[ -f "$OUT_DIR/viewers.html" && ! -f "$OUT_DIR/index.html" ]]; then
  cp "$OUT_DIR/viewers.html" "$OUT_DIR/index.html"
fi

if [[ -n "$ROOT_PAGE_SRC" && -f "$ROOT_PAGE_SRC" ]]; then
  mkdir -p "$(dirname "$ROOT_PAGE_OUT")"
  cp "$ROOT_PAGE_SRC" "$ROOT_PAGE_OUT"
fi

if [[ -f "$ARCHIVE_PAGE_SRC" ]]; then
  mkdir -p "$(dirname "$ARCHIVE_PAGE_OUT")"
  sanitize_wayback_html "$ARCHIVE_PAGE_SRC" "$ARCHIVE_PAGE_OUT"
  sanitize_archive_html_file "$ARCHIVE_PAGE_OUT"
fi

if [[ -d "$ARCHIVE_PAGES_SRC" ]]; then
  rm -rf "$ARCHIVE_PAGES_OUT"
  mkdir -p "$ARCHIVE_PAGES_OUT"
  cp -R "$ARCHIVE_PAGES_SRC"/. "$ARCHIVE_PAGES_OUT"/

  while IFS= read -r archive_page; do
    sanitize_archive_html_file "$archive_page"
  done < <(find "$ARCHIVE_PAGES_OUT" -type f -name '*.html' | sort)
fi

while IFS= read -r standalone_archive_page; do
  sanitize_archive_html_file "$standalone_archive_page"
done < <(find "$(dirname "$ARCHIVE_PAGE_OUT")" -maxdepth 1 -type f -name '*.html' | sort)

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
