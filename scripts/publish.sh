#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
repo=carlos-ed-ferreira/oddiary-pwa
base=main
fail() { printf '%s\n' "$*" >&2; exit 1; }
for tool in git gh make docker; do
    command -v "$tool" >/dev/null || fail "Instale $tool antes de publicar."
done

branch=$(git branch --show-current)
[[ -n "$branch" && "$branch" != "$base" ]] || fail 'Use uma branch de trabalho, fora de main e sem HEAD destacado.'
[[ -z "$(git status --porcelain=v1 --untracked-files=all)" ]] || fail 'Resolva conflitos e faça commit das alterações antes de publicar.'
for direction in fetch push; do
    if [[ "$direction" == push ]]; then
        remote=$(git remote get-url --push --all origin)
    else
        remote=$(git remote get-url --all origin)
    fi
    case "$remote" in
        "https://github.com/$repo"|"https://github.com/$repo.git"|"git@github.com:$repo.git"|"ssh://git@github.com/$repo.git") ;;
        *) fail 'Origin deve apontar exclusivamente para carlos-ed-ferreira/oddiary-pwa, tanto para fetch quanto push.' ;;
    esac
done

gh auth status --hostname github.com >/dev/null 2>&1 || fail 'Autentique o GitHub CLI com gh auth login.'
metadata=$(gh repo view "$repo" --json nameWithOwner,defaultBranchRef,viewerPermission --jq '[.nameWithOwner,.defaultBranchRef.name,.viewerPermission]|@tsv')
IFS=$'\t' read -r actual_repo actual_base permission <<< "$metadata"
[[ "$actual_repo" == "$repo" && "$actual_base" == "$base" ]] || fail 'Repositório ou branch principal divergem da configuração esperada.'
case "$permission" in ADMIN|MAINTAIN|WRITE) ;; *) fail 'A conta autenticada precisa de acesso de escrita.' ;; esac

git fetch --no-tags origin "$base"
git merge-base --is-ancestor "origin/$base" HEAD || fail 'Atualize a branch com origin/main antes de publicar.'
[[ "$(git rev-list --count "origin/$base..HEAD")" -gt 0 ]] || fail 'A branch não contém commits para publicar.'
[[ -z "${PR_BODY_FILE:-}" || -f "$PR_BODY_FILE" && -r "$PR_BODY_FILE" ]] || fail 'PR_BODY_FILE deve indicar um arquivo legível.'
head=$(git rev-parse HEAD)
workflow=$(gh api "repos/$repo/actions/workflows/ci.yml" --jq '.state' 2>/dev/null || true)
protected=$(gh api "repos/$repo/branches/$base/protection" --jq '.enforce_admins.enabled and .required_status_checks.strict and (.required_pull_request_reviews.required_approving_review_count >= 1) and ([.required_status_checks.checks[]?.context] | index("quality") != null)' 2>/dev/null || true)
main_head=$(git rev-parse "origin/$base")
main_ci=$(gh api "repos/$repo/actions/workflows/ci.yml/runs?branch=$base&event=push&status=success&head_sha=$main_head&per_page=1" --jq '.workflow_runs | length' 2>/dev/null || true)
if [[ "$workflow" == active && "$protected" == true && "$main_ci" == 1 ]]; then
    gate=check
else
    gate=quality
fi
printf 'Validação local: make %s\n' "$gate"
make "$gate"
[[ "$head" == "$(git rev-parse HEAD)" && -z "$(git status --porcelain=v1 --untracked-files=all)" ]] || fail 'A árvore ou HEAD mudou durante a validação; execute novamente.'
git push --set-upstream origin "$head:refs/heads/$branch"
[[ "$head" == "$(git rev-parse HEAD)" ]] || fail 'HEAD mudou durante o push; o commit enviado é o validado, revise antes de criar a PR.'

numbers=$(gh pr list --repo "$repo" --head "$branch" --base "$base" --state open --json number,isCrossRepository --jq '.[] | select(.isCrossRepository | not) | .number')
[[ "$numbers" != *$'\n'* ]] || fail 'Mais de uma PR corresponde à branch; resolva a ambiguidade no GitHub.'
body_file=${PR_BODY_FILE:-}
title=${PR_TITLE:-$(git log -1 --pretty=%s)}
temporary_body=
trap 'if [[ -n "$temporary_body" ]]; then rm -f -- "$temporary_body"; fi' EXIT
if [[ -z "$body_file" ]]; then
    temporary_body=$(mktemp "${TMPDIR:-/tmp}/oddiary-publish.XXXXXX")
    body_file=$temporary_body
    {
        git log --reverse --format='- %s' "origin/$base..HEAD"
        printf '\nValidação local: `make %s`. Commit: `%s`.\n' "$gate" "$head"
    } > "$body_file"
fi
[[ -r "$body_file" && -f "$body_file" ]] || fail 'PR_BODY_FILE deve indicar um arquivo legível.'
if [[ -n "$numbers" ]]; then
    edit_args=()
    [[ -z "${PR_TITLE:-}" ]] || edit_args+=(--title "$title")
    [[ -z "${PR_BODY_FILE:-}" ]] || edit_args+=(--body-file "$body_file")
    if [[ ${#edit_args[@]} -gt 0 ]]; then
        gh pr edit "$numbers" --repo "$repo" "${edit_args[@]}"
    fi
    url=$(gh pr view "$numbers" --repo "$repo" --json url --jq '.url')
else
    url=$(gh pr create --repo "$repo" --head "$branch" --base "$base" --title "$title" --body-file "$body_file")
fi
printf '%s\n' "$url"
count=$(gh pr view "$url" --repo "$repo" --json statusCheckRollup --jq '.statusCheckRollup | length')
if [[ "$count" == 0 ]]; then
    printf 'Checks remotos pendentes de registro. Acompanhe a PR.\n'
    exit 0
fi
status=0
gh pr checks "$url" --repo "$repo" || status=$?
case "$status" in
    0) ;;
    8) printf 'Checks remotos pendentes. Acompanhe a PR.\n' ;;
    *) fail 'PR publicada; checks falharam ou ainda não estão disponíveis. Consulte o endereço acima.' ;;
esac
