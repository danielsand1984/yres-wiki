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

# The live nginx serves the wiki with `root /var/www/yres-wiki`, so a request to
# /nl/wiki/ maps to ${DEST}/nl/wiki/. Deploy each language build INTO that
# subpath (not ${DEST}/nl) so it lines up with the running config.
echo "==> Deploying static build to ${VPS}:${DEST}/{nl,en}/wiki (served at /nl/wiki, /en/wiki)"
ssh "$VPS" "rm -rf ${DEST}; mkdir -p ${DEST}/nl/wiki ${DEST}/en/wiki"
tar czf - -C build/nl . | ssh "$VPS" "tar xzf - -C ${DEST}/nl/wiki"
tar czf - -C build/en . | ssh "$VPS" "tar xzf - -C ${DEST}/en/wiki"

echo "==> Wiki deploy complete."
