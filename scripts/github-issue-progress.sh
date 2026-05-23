#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  github-issue-progress.sh on-commit [--sha <commit-sha>] [--label <label>]...
  github-issue-progress.sh done <issue-number> [<issue-number> ...] [--close]

Environment:
  GITHUB_TOKEN  Personal access token with issue write access.

Behavior:
  on-commit  Extracts issue references like #123 from the commit message and:
             - adds progress labels (default: in-progress)
             - posts a progress comment with commit SHA
  done       Adds "completed", removes "in-progress", and optionally closes issue.
EOF
}

require_token() {
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "GITHUB_TOKEN is required." >&2
    exit 1
  fi
}

repo_from_remote() {
  local remote
  remote="$(git remote get-url origin)"

  # git@github.com:owner/repo.git
  if [[ "$remote" =~ ^git@github\.com:(.+)/(.+)\.git$ ]]; then
    echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    return
  fi

  # https://github.com/owner/repo.git
  if [[ "$remote" =~ ^https://github\.com/(.+)/(.+)\.git$ ]]; then
    echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    return
  fi

  echo "Unsupported origin URL: $remote" >&2
  exit 1
}

api() {
  local method="$1"
  local url="$2"
  local data="${3:-}"

  if [[ -n "$data" ]]; then
    curl -fsSL \
      -X "$method" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "$url" \
      -d "$data" >/dev/null
  else
    curl -fsSL \
      -X "$method" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "$url" >/dev/null
  fi
}

json_labels_payload() {
  local first=1
  printf '{"labels":['
  for label in "$@"; do
    if [[ $first -eq 0 ]]; then
      printf ','
    fi
    first=0
    printf '"%s"' "$label"
  done
  printf ']}'
}

extract_issues_from_commit_message() {
  local sha="$1"
  git show -s --format=%B "$sha" | grep -oE '#[0-9]+' | tr -d '#' | sort -u || true
}

comment_progress() {
  local repo="$1"
  local issue="$2"
  local sha="$3"
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD)"
  local body
  body="$(printf '{"body":"Progress update: commit `%s` on branch `%s`."}' "$sha" "$branch")"
  api POST "https://api.github.com/repos/${repo}/issues/${issue}/comments" "$body"
}

label_issue() {
  local repo="$1"
  local issue="$2"
  shift 2
  local payload
  payload="$(json_labels_payload "$@")"
  api POST "https://api.github.com/repos/${repo}/issues/${issue}/labels" "$payload"
}

remove_label_if_present() {
  local repo="$1"
  local issue="$2"
  local label="$3"
  local encoded
  encoded="$(printf '%s' "$label" | sed 's/ /%20/g')"
  # Ignore if label not present.
  curl -fsSL \
    -X DELETE \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${repo}/issues/${issue}/labels/${encoded}" >/dev/null 2>&1 || true
}

close_issue_completed() {
  local repo="$1"
  local issue="$2"
  api PATCH "https://api.github.com/repos/${repo}/issues/${issue}" '{"state":"closed","state_reason":"completed"}'
}

cmd_on_commit() {
  require_token

  local sha
  sha="$(git rev-parse --short HEAD)"
  local labels=("in-progress")

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --sha)
        sha="$2"
        shift 2
        ;;
      --label)
        labels+=("$2")
        shift 2
        ;;
      *)
        echo "Unknown argument: $1" >&2
        usage
        exit 1
        ;;
    esac
  done

  local repo
  repo="$(repo_from_remote)"

  local issues
  issues="$(extract_issues_from_commit_message "$sha")"
  if [[ -z "$issues" ]]; then
    echo "No issue references found in commit ${sha}."
    return
  fi

  while IFS= read -r issue; do
    [[ -z "$issue" ]] && continue
    label_issue "$repo" "$issue" "${labels[@]}"
    comment_progress "$repo" "$issue" "$sha"
    echo "Updated issue #${issue} with labels and progress comment."
  done <<<"$issues"
}

cmd_done() {
  require_token

  local close=0
  local issues=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --close)
        close=1
        shift
        ;;
      *)
        issues+=("$1")
        shift
        ;;
    esac
  done

  if [[ ${#issues[@]} -eq 0 ]]; then
    echo "Provide at least one issue number." >&2
    usage
    exit 1
  fi

  local repo
  repo="$(repo_from_remote)"

  for issue in "${issues[@]}"; do
    label_issue "$repo" "$issue" "completed"
    remove_label_if_present "$repo" "$issue" "in-progress"
    if [[ $close -eq 1 ]]; then
      close_issue_completed "$repo" "$issue"
    fi
    echo "Marked issue #${issue} as completed."
  done
}

main() {
  if [[ $# -lt 1 ]]; then
    usage
    exit 1
  fi

  local command="$1"
  shift

  case "$command" in
    on-commit)
      cmd_on_commit "$@"
      ;;
    done)
      cmd_done "$@"
      ;;
    *)
      echo "Unknown command: $command" >&2
      usage
      exit 1
      ;;
  esac
}

main "$@"
