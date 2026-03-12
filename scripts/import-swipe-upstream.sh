#!/usr/bin/env bash
set -euo pipefail

FORK_OWNER="${FORK_OWNER:-dasbury-esri}"
FORK_REPO="${FORK_REPO:-classic-storymap-swipe}"
UPSTREAM_OWNER="${UPSTREAM_OWNER:-Esri}"
UPSTREAM_REPO="${UPSTREAM_REPO:-storymap-swipe}"
DESTINATION="${DESTINATION:-runtimes/swipe/upstream}"

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
TMP_CLONE="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_CLONE"
}
trap cleanup EXIT

rm -rf "$DEST_PATH"
mkdir -p "$DEST_PATH"

git clone "https://github.com/$FORK_OWNER/$FORK_REPO.git" "$TMP_CLONE/repo"
pushd "$TMP_CLONE/repo" >/dev/null
  if ! git remote | grep -q '^upstream$'; then
    git remote add upstream "https://github.com/$UPSTREAM_OWNER/$UPSTREAM_REPO.git"
  fi

  git fetch --all --tags
  git checkout "$REF"
  CHECKED_OUT_REF="$(git rev-parse HEAD)"
  echo "Checked out $CHECKED_OUT_REF"

  rm -rf .git
  cp -R . "$DEST_PATH/"

  echo "Origin remote (push target): https://github.com/$FORK_OWNER/$FORK_REPO.git"
  echo "Upstream remote (pull source): https://github.com/$UPSTREAM_OWNER/$UPSTREAM_REPO.git"
popd >/dev/null

echo "Swipe upstream import complete at $DEST_PATH"
