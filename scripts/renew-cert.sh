#!/bin/bash
# ═══════════════════════════════════════
# Renew Let's Encrypt cert + reload nginx — run weekly.
# Cron: 0 3 * * 0 /root/est-website/scripts/renew-cert.sh >> /var/log/est-renew-cert.log 2>&1
# ═══════════════════════════════════════
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-/root/est-website}"
cd "$PROJECT_ROOT"

echo "[$(date -u +%FT%TZ)] Running certbot renew..."
docker run --rm \
  -v "${PROJECT_ROOT}/certbot/conf:/etc/letsencrypt" \
  -v "${PROJECT_ROOT}/certbot/www:/var/www/certbot" \
  certbot/certbot renew --quiet

# Reload nginx so it picks up the new cert without dropping connections.
docker compose -f "${PROJECT_ROOT}/docker-compose.yml" exec -T nginx nginx -s reload \
  || echo "[renew-cert] WARN: nginx reload failed (may not be running)"

echo "[$(date -u +%FT%TZ)] ✅ certbot renew completed"
