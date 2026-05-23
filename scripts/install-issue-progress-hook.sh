#!/usr/bin/env bash
set -euo pipefail

HOOK_PATH=".git/hooks/post-commit"
SCRIPT_PATH="scripts/github-issue-progress.sh"

if [[ ! -d ".git" ]]; then
  echo "Run this script from the repository root." >&2
  exit 1
fi

cat >"$HOOK_PATH" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT="${REPO_ROOT}/scripts/github-issue-progress.sh"

if [[ ! -x "$SCRIPT" ]]; then
  exit 0
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  exit 0
fi

"$SCRIPT" on-commit || true
EOF

chmod +x "$HOOK_PATH"

echo "Installed post-commit hook at $HOOK_PATH"
echo "Next step: export GITHUB_TOKEN and commit with issue references like #123."
