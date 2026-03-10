#!/usr/bin/env bash
set -euo pipefail

echo "Scanning tracked files for common secret patterns..."

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  files="$(git ls-files)"
else
  files="$(find . -type f \
    -not -path './node_modules/*' \
    -not -path './dist/*' \
    -not -path './.git/*')"
fi

if [ -z "$files" ]; then
  echo "No files to scan."
  exit 0
fi

pattern='AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|aws_secret_access_key|aws_access_key_id|BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}'

found=0
while IFS= read -r file; do
  normalized_file="${file#./}"
  if [ "$normalized_file" = "scripts/scan-secrets.sh" ]; then
    continue
  fi

  if grep -nE "$pattern" "$file"; then
    found=1
  fi
done <<EOF
$files
EOF

if [ "$found" -eq 1 ]; then
  echo "Potential secrets detected. Remove them before committing."
  exit 1
fi

echo "Secret scan passed."
