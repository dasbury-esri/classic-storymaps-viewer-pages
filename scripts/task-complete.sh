#!/usr/bin/env bash
set -euo pipefail

TASK_ID="${1:-}"
COMMIT_MESSAGE="${2:-}"

if [[ -z "$TASK_ID" || -z "$COMMIT_MESSAGE" ]]; then
  echo "Usage: $0 <task-id> <commit-message>" >&2
  echo "Example: $0 S4 \"S4: import maptour upstream + scaffold build\"" >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required on PATH." >&2
  exit 1
fi

BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH_NAME" == "HEAD" ]]; then
  echo "Detached HEAD is not supported for task completion commits." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -m "${TASK_ID}: ${COMMIT_MESSAGE}"
else
  echo "No local changes to commit for task ${TASK_ID}."
fi

git push origin "$BRANCH_NAME"

echo "Task ${TASK_ID} committed and pushed on ${BRANCH_NAME}."
