#!/usr/bin/env bash
# Daily i18n sync (VPS cron): new English text on the live site (Airtable products,
# edited pages) → translated into every language → PR → merge after green preview.
# Runs in its own worktree so the interactive working copy is never touched.
# Uses `claude -p` (subscription) for translation; no paid APIs.
set -euo pipefail

REPO="/home/claudebot/projects/amberra"
WT="/home/claudebot/projects/.amberra-i18n-sync"
GH_REPO="amberrajewelry-crypto/amberra"
BRANCH="i18n/auto-sync"
LOG_DIR="/home/claudebot/logs"
CHECK_TRIES=60
CHECK_PAUSE_S=15
mkdir -p "$LOG_DIR"
exec >>"$LOG_DIR/amberra-i18n-sync.log" 2>&1
echo "=== $(date -Is) start"

cd "$REPO"
git fetch -q origin main
if [ ! -d "$WT" ]; then git worktree add -q "$WT" origin/main; fi
cd "$WT"
git checkout -q -B "$BRANCH" origin/main
npm ci --silent --no-audit --no-fund

node scripts/build-i18n.mjs extract --live
BASE="https://www.amberrajewelry.com" timeout 900 python3 scripts/i18n-runtime-collect.py || true
node scripts/build-i18n.mjs extract --live

LANGS=$(grep -o "^export const LANGS = \[[^]]*\]" scripts/build-i18n.mjs | grep -o "'[a-z]*'" | tr -d "'")
for l in $LANGS; do timeout 3600 python3 scripts/i18n-translate.py "$l" --threads 2 || true; done
node scripts/build-i18n.mjs check

if git diff --quiet -- data/i18n; then echo "no new strings"; exit 0; fi
git add data/i18n
git commit -qm "i18n: автоперевод новых строк $(date +%d.%m)"
git push -q -f origin "$BRANCH"
PR=$(gh pr list -R "$GH_REPO" --head "$BRANCH" --json number -q '.[0].number')
if [ -z "$PR" ]; then
  gh pr create -R "$GH_REPO" --head "$BRANCH" --base main \
    --title "i18n: автоперевод новых строк" --body "Автосинк: новые английские строки с живого сайта переведены на все языки, покрытие 100% (build-i18n check)."
  PR=$(gh pr list -R "$GH_REPO" --head "$BRANCH" --json number -q '.[0].number')
fi
for _ in $(seq 1 "$CHECK_TRIES"); do
  S=$(gh pr checks "$PR" -R "$GH_REPO" 2>&1 || true)
  echo "$S" | grep -qi pending || break
  sleep "$CHECK_PAUSE_S"
done
if echo "$S" | grep -qi fail; then echo "checks failed, PR #$PR left open"; exit 1; fi
gh pr merge "$PR" -R "$GH_REPO" --merge
echo "=== $(date -Is) merged #$PR"
