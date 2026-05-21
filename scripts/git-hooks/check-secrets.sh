#!/usr/bin/env bash
# Block commits containing secrets or sensitive files.
# Override (use sparingly): ALLOW_SECRETS=1 git commit ...
#
# Lifted from kfoks-os-flight-control/scripts/git-hooks/check-secrets.sh
# (same patterns, same exit semantics).
set -e

if [ "${ALLOW_SECRETS:-0}" = "1" ]; then
  echo "  [check-secrets] skipped (ALLOW_SECRETS=1)"
  exit 0
fi

violations=""

# 1) Block staged files by path — these should never be committed.
# Whitelist .example / .template / .sample suffixes (those are templates).
forbidden_paths=$(git diff --cached --name-only --diff-filter=AM | grep -E \
  '(^|/)\.secrets(\..+)?$|(^|/)\.env(\..+)?$|\.pem$|\.p12$|\.pfx$|(^|/)id_rsa(\.pub)?$|(^|/)id_ed25519(\.pub)?$' \
  | grep -vE '\.(example|template|sample)$' || true)

if [ -n "$forbidden_paths" ]; then
  violations="$violations
Blocked paths (rename, move, or add to .gitignore):
$forbidden_paths"
fi

# 2) Scan staged diff for secret patterns
diff_content=$(git diff --cached -U0 --no-color --diff-filter=AM)

if [ -n "$diff_content" ]; then
  # We grep added lines only (start with + but not +++)
  added=$(printf '%s\n' "$diff_content" | grep -E '^\+[^+]' || true)

  matches=""

  m=$(printf '%s\n' "$added" | grep -E 'AKIA[0-9A-Z]{16}' || true)
  [ -n "$m" ] && matches="$matches
[AWS access key]
$m"

  m=$(printf '%s\n' "$added" | grep -E 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' || true)
  [ -n "$m" ] && matches="$matches
[JWT token]
$m"

  m=$(printf '%s\n' "$added" | grep -E -- '-----BEGIN [A-Z ]*PRIVATE KEY-----' || true)
  [ -n "$m" ] && matches="$matches
[Private key]
$m"

  m=$(printf '%s\n' "$added" | grep -E '(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}' || true)
  [ -n "$m" ] && matches="$matches
[GitHub token]
$m"

  m=$(printf '%s\n' "$added" | grep -E 'xox[baprs]-[A-Za-z0-9-]{10,}' || true)
  [ -n "$m" ] && matches="$matches
[Slack token]
$m"

  m=$(printf '%s\n' "$added" | grep -E 'sk-(proj-|ant-|or-)?[A-Za-z0-9_-]{32,}' || true)
  [ -n "$m" ] && matches="$matches
[OpenAI / Anthropic API key]
$m"

  # Generic high-risk literal assignments — only flag when value is long enough
  # to look like a real secret (32+ chars of [A-Za-z0-9/_=+-])
  m=$(printf '%s\n' "$added" | grep -iE '(api[_-]?key|client[_-]?secret|access[_-]?token|auth[_-]?token|secret[_-]?key|private[_-]?key|password|passwd)\s*[:=]\s*["\x27]?[A-Za-z0-9/_=+-]{32,}["\x27]?' || true)
  [ -n "$m" ] && matches="$matches
[Possible secret assignment]
$m"

  if [ -n "$matches" ]; then
    violations="$violations
Suspicious patterns in staged diff:$matches"
  fi
fi

if [ -n "$violations" ]; then
  echo "[check-secrets] commit blocked"
  echo "$violations"
  echo ""
  echo "If this is a false positive, override with: ALLOW_SECRETS=1 git commit ..."
  exit 1
fi
