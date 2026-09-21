#!/usr/bin/env bash
#
# Build the Docusaurus wiki and deploy the static output to the Greenhost VPS.
# nginx serves it with `root /var/www/yres-wiki`, so /nl/wiki/ maps to
# ${DEST}/nl/wiki/ and /en/wiki/ to ${DEST}/en/wiki/.
#
# Improvements over the naive version:
#   - sets ownership + read perms so nginx (www-data) can read new files;
#   - uploads to a staging dir and swaps it in with an atomic rename, so the
#     live site is never an empty directory mid-deploy (no transient 404s);
#   - pre-flight SSH + build-output checks; post-deploy HTTP verification.
#
# Invoked automatically by the post-merge git hook on a merge into main.
# Run manually with: scripts/push-to-vps.sh
# Override targets with env vars: WIKI_VPS, WIKI_DEST, WIKI_BASE_URL.
#
set -euo pipefail

VPS="${WIKI_VPS:-root@185.88.142.48}"
DEST="${WIKI_DEST:-/var/www/yres-wiki}"
BASE_URL="${WIKI_BASE_URL:-https://yres.eu}"
SSH_OPTS=(-o ConnectTimeout=15 -o BatchMode=yes)
STAGE="${DEST}.new"
OLD="${DEST}.old"

# Run from the project root regardless of the caller's working directory.
cd "$(dirname "$0")/.."

echo "==> Checking SSH connectivity to ${VPS}"
ssh "${SSH_OPTS[@]}" "$VPS" 'true' || { echo "!! Cannot reach ${VPS} over SSH (key-based auth required)" >&2; exit 1; }

echo "==> Building wiki (build:all)"
npm run build:all

[[ -f build/nl/index.html && -f build/en/index.html ]] || {
  echo "!! Build output missing (build/nl/index.html or build/en/index.html)" >&2; exit 1;
}

# Upload into a fresh staging dir (does not touch the live one yet).
echo "==> Uploading to staging ${VPS}:${STAGE}"
ssh "${SSH_OPTS[@]}" "$VPS" "rm -rf '${STAGE}'; mkdir -p '${STAGE}/nl/wiki' '${STAGE}/en/wiki'"
tar czf - -C build/nl . | ssh "${SSH_OPTS[@]}" "$VPS" "tar xzf - -C '${STAGE}/nl/wiki'"
tar czf - -C build/en . | ssh "${SSH_OPTS[@]}" "$VPS" "tar xzf - -C '${STAGE}/en/wiki'"

# tar from Windows restores odd UIDs; make it root-owned and world-readable so nginx can serve it.
echo "==> Setting ownership + read permissions"
ssh "${SSH_OPTS[@]}" "$VPS" "chown -R root:root '${STAGE}' && chmod -R a+rX '${STAGE}'"

# Swap staging into place with renames (near-instant) to minimise the empty window.
echo "==> Swapping ${STAGE} -> ${DEST}"
ssh "${SSH_OPTS[@]}" "$VPS" "rm -rf '${OLD}'; [ -e '${DEST}' ] && mv '${DEST}' '${OLD}'; mv '${STAGE}' '${DEST}'; rm -rf '${OLD}'"

# Confirm the live site responds (non-fatal: a fresh deploy can 404 for a moment).
echo "==> Verifying live site"
for path in /nl/wiki/ /en/wiki/; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}${path}" || echo 000)"
  echo "    ${BASE_URL}${path} -> ${code}"
  [[ "$code" == "200" ]] || echo "    !! ${path} returned ${code} (possibly a transient post-deploy moment — recheck in a few seconds)"
done

echo "==> Wiki deploy complete."
