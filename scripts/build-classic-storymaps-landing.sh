#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${SRC_DIR:-apps/classic-storymaps-site}"
OUT_DIR="${OUT_DIR:-publish/templates/classic-storymaps}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source landing app directory not found: $SRC_DIR" >&2
  exit 1
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp -R "$SRC_DIR"/. "$OUT_DIR"/

echo "Classic Storymaps canonical landing build output copied to $OUT_DIR"
