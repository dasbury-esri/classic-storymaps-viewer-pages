#!/usr/bin/env bash
set -euo pipefail

UPSTREAM_OWNER="${UPSTREAM_OWNER:-Esri}"
UPSTREAM_REPO="${UPSTREAM_REPO:-storymap-basic}"
DESTINATION="${DESTINATION:-runtimes/basic/upstream}"

REF="${1:-}"
if [[ -z "$REF" ]]; then
  echo "Usage: $0 <pinned-ref>" >&2
  exit 1
fi

ROOT_DIR="$(pwd)"
DEST_PATH="$ROOT_DIR/$DESTINATION"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

rm -rf "$DEST_PATH"
mkdir -p "$DEST_PATH"

git clone "https://github.com/$UPSTREAM_OWNER/$UPSTREAM_REPO.git" "$TMP_DIR/repo"
pushd "$TMP_DIR/repo" >/dev/null
  git fetch --tags origin
  git checkout "$REF"
  CHECKED_OUT_REF="$(git rev-parse HEAD)"
  echo "Checked out $CHECKED_OUT_REF"
  rm -rf .git
popd >/dev/null

cp -R "$TMP_DIR/repo"/. "$DEST_PATH"/
echo "Basic upstream import complete at $DEST_PATH"
