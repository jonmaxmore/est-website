#!/bin/bash
# ═══════════════════════════════════════
# Pin the production server's SSH host key into ~/.ssh/known_hosts
# so deploy scripts can drop StrictHostKeyChecking=no safely.
#
# Run once on a trusted operator machine (NOT in CI). Verify the captured
# fingerprint out-of-band before using it (e.g., compare to what `ssh -v`
# prints from a separate network) — the WHOLE security model rests on
# trusting the first key you capture.
# ═══════════════════════════════════════
set -euo pipefail

HOST="${DEPLOY_HOST:-178.128.127.161}"
KNOWN_HOSTS="${HOME}/.ssh/known_hosts"

mkdir -p "$(dirname "$KNOWN_HOSTS")"
chmod 700 "$(dirname "$KNOWN_HOSTS")"
touch "$KNOWN_HOSTS"
chmod 600 "$KNOWN_HOSTS"

echo "[setup-known-hosts] Capturing host key for $HOST..."
KEY=$(ssh-keyscan -t ed25519,rsa "$HOST" 2>/dev/null)

if [ -z "$KEY" ]; then
  echo "[setup-known-hosts] FAILED — could not reach $HOST on port 22" >&2
  exit 1
fi

echo "[setup-known-hosts] Captured key:"
echo "$KEY" | head -2
echo ""
echo "Verify the fingerprint matches what the server actually presents:"
ssh-keygen -lf <(echo "$KEY")

read -p "Does this fingerprint match? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "[setup-known-hosts] Aborted by operator. known_hosts not modified." >&2
  exit 1
fi

# Remove any stale entry for this host first (so re-runs after a server
# rebuild don't leave the old key shadowing the new one).
ssh-keygen -R "$HOST" -f "$KNOWN_HOSTS" >/dev/null 2>&1 || true

echo "$KEY" >> "$KNOWN_HOSTS"
echo "[setup-known-hosts] ✅ Pinned $HOST into $KNOWN_HOSTS"
echo ""
echo "Now you can drop StrictHostKeyChecking=no from the deploy scripts."
