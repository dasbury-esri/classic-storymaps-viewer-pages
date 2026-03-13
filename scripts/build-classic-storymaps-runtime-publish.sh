#!/usr/bin/env bash
set -euo pipefail

PUBLISH_ROOT="${PUBLISH_ROOT:-publish/templates/classic-storymaps}"

runtime_names=(maptour swipe mapjournal)

require_runtime_build() {
  local runtime_name="$1"
  local runtime_build="runtimes/$runtime_name/build"

  if [[ ! -d "$runtime_build" ]]; then
    echo "Runtime build directory not found: $runtime_build" >&2
    echo "Build the runtime first, for example: bash scripts/build-${runtime_name}-runtime.sh" >&2
    exit 1
  fi

  if [[ ! -f "$runtime_build/index.html" ]]; then
    echo "Runtime build is missing index.html: $runtime_build/index.html" >&2
    exit 1
  fi

  if [[ ! -d "$runtime_build/app" ]]; then
    echo "Runtime build is missing app/: $runtime_build/app" >&2
    exit 1
  fi

  if [[ ! -d "$runtime_build/resources" ]]; then
    echo "Runtime build is missing resources/: $runtime_build/resources" >&2
    exit 1
  fi
}

copy_runtime_build() {
  local runtime_name="$1"
  local runtime_build="runtimes/$runtime_name/build"
  local runtime_publish_dir="$PUBLISH_ROOT/$runtime_name"

  rm -rf "$runtime_publish_dir"
  mkdir -p "$runtime_publish_dir"
  cp -R "$runtime_build"/. "$runtime_publish_dir"/
}

mkdir -p "$PUBLISH_ROOT"

for runtime_name in "${runtime_names[@]}"; do
  require_runtime_build "$runtime_name"
  copy_runtime_build "$runtime_name"
done

echo "Classic Storymaps runtime publish output copied to $PUBLISH_ROOT/{maptour,swipe,mapjournal}"