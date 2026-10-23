#!/usr/bin/env bash
# Read-only GitHub settings baseline for the ownership transfer.
#
# Usage:  bash transfer-baseline.sh OWNER/REPO > FILE
# Run it before the transfer (old owner) and after it (new owner), keeping both
# files OUTSIDE the repository, then compare them:  diff before.txt after.txt
#
# Every call is a GET. Output never contains secret values, private keys,
# webhook URL credentials, paths or queries, or deploy-key titles. Results:
#   (none)        the call succeeded and returned nothing
#   NONE (404)    GitHub's 404 that means none configured: "Branch not
#                 protected", or no Pages site. Any other 404 is UNKNOWN,
#                 because GitHub also answers 404 when you lack admin access
#   NOT AVAILABLE GitHub says the plan doesn't support the feature here, so
#                 none can exist
#   UNKNOWN       any other failure; never treat it as "none"
set -u
R=${1:?usage: transfer-baseline.sh OWNER/REPO}
# Variables whose values are safe to print; all others show names only.
ALLOWED_VARIABLE_VALUES="SITE_BASE_PATH"

section() { printf '\n## %s\n' "$1"; }

# Prints GitHub's error message from a failed call's output.
error_message() {
  python3 -I -c '
import json, sys
text = sys.stdin.read().strip()
try:
    body, _ = json.JSONDecoder().raw_decode(text)
    print(str(body.get("message", "")).strip() or "no message")
except Exception:
    print((text.splitlines() or ["no output"])[0])'
}

# fetch ARGS...: sets OUT; returns 0 only when the call succeeded.
fetch() {
  OUT=$(gh api "$@" 2>&1)
}

# report_failure [none-on-404]
report_failure() {
  local msg
  msg=$(printf '%s\n' "$OUT" | error_message)
  case "$msg" in
    "Branch not protected") printf 'NONE (404): %s\n' "$msg" ;;
    "Not Found") if [ "${1:-}" = none-on-404 ]; then printf 'NONE (404): %s\n' "$msg"; else printf 'UNKNOWN: %s (404 can also mean no admin access)\n' "$msg"; fi ;;
    *"Upgrade to GitHub Pro"*) printf 'NOT AVAILABLE: %s\n' "$msg" ;;
    *) printf 'UNKNOWN: %s\n' "$msg" ;;
  esac
}

# call [--none-on-404] LABEL ARGS...
call() {
  local mode=""
  if [ "$1" = --none-on-404 ]; then mode=none-on-404; shift; fi
  local label=$1
  shift
  section "$label"
  if fetch "$@"; then
    if [ -n "$OUT" ]; then printf '%s\n' "$OUT"; else printf '(none)\n'; fi
  else
    report_failure "$mode"
  fi
}

call "repository" "repos/$R" --jq '{visibility, default_branch, has_issues, archived, security_and_analysis}'
call "refs (all branches and tags, with object type)" --paginate "repos/$R/git/matching-refs/" --jq '.[] | "\(.ref) \(.object.type) \(.object.sha)"'
call "branches" --paginate "repos/$R/branches" --jq '.[] | "\(.name) \(.commit.sha) protected=\(.protected)"'

if fetch --paginate "repos/$R/branches" --jq '.[].name'; then
  for b in $OUT; do
    call "classic protection: $b" "repos/$R/branches/$b/protection"
  done
fi

default=main
if fetch "repos/$R" --jq .default_branch; then default=$OUT; fi
call "effective rules on $default (includes inherited rulesets)" "repos/$R/rules/branches/$default"
call "rulesets" --paginate "repos/$R/rulesets" --jq '.[] | "\(.id) \(.name) \(.enforcement)"'
if fetch --paginate "repos/$R/rulesets" --jq '.[].id'; then
  for id in $OUT; do
    call "ruleset $id" "repos/$R/rulesets/$id" --jq '{name, target, enforcement, conditions, rules, bypass_actors}'
  done
fi

call "collaborators" --paginate "repos/$R/collaborators" --jq '.[] | "\(.login) \(.role_name)"'

section "deploy keys (id, read_only, created_at, SHA256 fingerprint)"
if fetch --paginate "repos/$R/keys" --jq '.[] | "\(.id) \(.read_only) \(.created_at) \(.key)"'; then
  [ -n "$OUT" ] || printf '(none)\n'
  printf '%s\n' "$OUT" | while read -r id ro created ktype kdata _; do
    [ -n "$id" ] || continue
    fp=$(printf '%s %s\n' "$ktype" "$kdata" | ssh-keygen -lf - 2>/dev/null | cut -d' ' -f2)
    printf '%s read_only=%s %s %s\n' "$id" "$ro" "$created" "${fp:-UNKNOWN-fingerprint}"
  done
else
  report_failure
fi

section "webhooks (id, active, events, hostname only)"
if fetch --paginate "repos/$R/hooks" --jq '.[] | [.id, .active, (.events | join(",")), (.config.url // "")] | @tsv'; then
  [ -n "$OUT" ] || printf '(none)\n'
  printf '%s\n' "$OUT" | python3 -I -c '
import sys, urllib.parse
for line in sys.stdin:
    parts = line.rstrip("\n").split("\t")
    if len(parts) == 4:
        print(parts[0], "active=" + parts[1], parts[2], urllib.parse.urlsplit(parts[3]).hostname)'
else
  report_failure
fi

call "actions permissions" "repos/$R/actions/permissions"
call "workflow token permissions" "repos/$R/actions/permissions/workflow"
call "actions secret names" --paginate "repos/$R/actions/secrets" --jq '.secrets[] | "\(.name) updated=\(.updated_at)"'
call "actions variable names" --paginate "repos/$R/actions/variables" --jq '.variables[].name'
if fetch --paginate "repos/$R/actions/variables" --jq '.variables[].name'; then
  for v in $ALLOWED_VARIABLE_VALUES; do
    case " $(printf '%s ' $OUT)" in
      *" $v "*) call "actions variable value: $v" "repos/$R/actions/variables/$v" --jq '.value' ;;
    esac
  done
fi
call "environments" "repos/$R/environments" --jq '.environments[] | {name, protection_rules: [.protection_rules[]?.type], deployment_branch_policy}'
call --none-on-404 "pages" "repos/$R/pages" --jq '{build_type, cname, https_enforced, source}'

section "workflow runs that could still publish (all should be 0)"
for s in queued in_progress waiting requested pending; do
  if fetch "repos/$R/actions/runs?status=$s" --jq '.total_count'; then
    printf '%s=%s\n' "$s" "$OUT"
  else
    printf '%s=' "$s"; report_failure
  fi
done
