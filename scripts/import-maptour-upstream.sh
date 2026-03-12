#!/usr/bin/env bash
set -euo pipefail

OWNER="${OWNER:-dasbury-esri}"
REPO="${REPO:-classic-storymap-tour}"
DESTINATION="${DESTINATION:-runtimes/maptour/upstream}"

REF="${1:-}"
if [[ -z "$REF" ]]; then
  echo "Usage: $0 <pinned-ref>" >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required on PATH." >&2
  exit 1
fi

ROOT_DIR="$(pwd)"
DEST_PATH="$ROOT_DIR/$DESTINATION"

rm -rf "$DEST_PATH"
mkdir -p "$DEST_PATH"

git clone "https://github.com/$OWNER/$REPO.git" "$DEST_PATH"
pushd "$DEST_PATH" >/dev/null
  git checkout "$REF"
  CHECKED_OUT_REF="$(git rev-parse HEAD)"
  echo "Checked out $CHECKED_OUT_REF"
popd >/dev/null

echo "Map Tour upstream import complete at $DEST_PATH"
