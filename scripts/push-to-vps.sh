#!/usr/bin/env bash
#
# Build the Docusaurus wiki and deploy the static output to the Greenhost VPS.
# Mirrors DEPLOY.md: build:all -> build/nl + build/en, then tar-over-ssh into
# /var/www/yres-wiki (nginx serves it at /nl/wiki and /en/wiki).
#
# Invoked automatically by the post-merge git hook on a merge into main.
# Run manually with: scripts/push-to-vps.sh
#
set -euo pipefail

VPS="root@185.88.142.48"
DEST="/var/www/yres-wiki"

# Run from the project root regardless of the caller's working directory.
cd "$(dirname "$0")/.."

echo "==> Building wiki (build:all)"
npm run build:all

echo "==> Deploying static build to ${VPS}:${DEST}"
tar czf - -C build nl en \
| ssh "$VPS" "rm -rf ${DEST} && mkdir -p ${DEST} && tar xzf - -C ${DEST}"

echo "==> Wiki deploy complete."
