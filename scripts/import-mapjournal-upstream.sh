#!/usr/bin/env bash
set -euo pipefail

FORK_OWNER="${FORK_OWNER:-dasbury-esri}"
FORK_REPO="${FORK_REPO:-classic-storymap-journal}"
UPSTREAM_OWNER="${UPSTREAM_OWNER:-Esri}"
UPSTREAM_REPO="${UPSTREAM_REPO:-storymap-journal}"
DESTINATION="${DESTINATION:-runtimes/mapjournal/upstream}"

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
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

rm -rf "$DEST_PATH"
mkdir -p "$DEST_PATH"

git clone "https://github.com/$FORK_OWNER/$FORK_REPO.git" "$TMP_DIR/repo"
pushd "$TMP_DIR/repo" >/dev/null
  git remote add upstream "https://github.com/$UPSTREAM_OWNER/$UPSTREAM_REPO.git"
  git fetch --tags upstream
  git checkout "$REF"
  CHECKED_OUT_REF="$(git rev-parse HEAD)"
  echo "Checked out $CHECKED_OUT_REF"
  rm -rf .git
popd >/dev/null

cp -R "$TMP_DIR/repo"/. "$DEST_PATH"/

echo "Map Journal upstream import complete at $DEST_PATH"