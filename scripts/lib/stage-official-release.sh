#!/usr/bin/env bash

stage_official_release() (
  set -euo pipefail
  local manifest_path="$1"
  local output_path="$2"
  local release_url release_sha release_version temporary release_root
  release_url="$(node -p 'require(process.argv[1]).release.url' "$manifest_path")"
  release_sha="$(node -p 'require(process.argv[1]).release.sha256' "$manifest_path")"
  release_version="$(node -p 'require(process.argv[1]).release.version' "$manifest_path")"
  [[ "$release_sha" =~ ^[a-f0-9]{64}$ ]] || { echo 'Invalid release SHA-256' >&2; exit 1; }
  temporary="$(mktemp -d)"
  trap 'rm -rf "$temporary"' EXIT
  curl --fail --location --retry 3 --silent --show-error "$release_url" -o "$temporary/release.zip"
  printf '%s  %s\n' "$release_sha" "$temporary/release.zip" | sha256sum -c -
  unzip -q "$temporary/release.zip" -d "$temporary/extracted"
  rm -rf "$temporary/extracted/__MACOSX"
  release_root="$temporary/extracted"
  if [[ ! -f "$release_root/index.html" ]]; then
    shopt -s nullglob dotglob
    local entries=("$release_root"/*)
    [[ "${#entries[@]}" == 1 && -d "${entries[0]}" ]] || { echo 'Unexpected release archive layout' >&2; exit 1; }
    release_root="${entries[0]}"
  fi
  [[ -f "$release_root/index.html" ]] || { echo 'Release index.html missing' >&2; exit 1; }
  mkdir -p "$output_path"
  cp -R "$release_root"/. "$output_path"/
  printf 'release:%s\n' "$release_version" > "$output_path/BUILD_SOURCE"
)
