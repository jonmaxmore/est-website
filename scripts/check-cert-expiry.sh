#!/bin/bash
# ═══════════════════════════════════════
# Daily cert-expiry check. Posts to Slack when < 14 days remaining.
# Cron: 30 8 * * * /root/est-website/scripts/check-cert-expiry.sh >> /var/log/est-cert-check.log 2>&1
# ═══════════════════════════════════════
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-/root/est-website}"
DOMAIN="${CERT_DOMAIN:-yourdomain.com}"
THRESHOLD_DAYS="${CERT_EXPIRY_THRESHOLD:-14}"

CERT_FILE="${PROJECT_ROOT}/certbot/conf/live/${DOMAIN}/cert.pem"

if [ ! -f "$CERT_FILE" ]; then
  echo "[check-cert-expiry] WARN: cert file not found at $CERT_FILE — skipping"
  exit 0
fi

EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" | sed 's/.*=//')
EXPIRY_TS=$(date -d "$EXPIRY" +%s)
NOW_TS=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_TS - NOW_TS) / 86400 ))

echo "[$(date -u +%FT%TZ)] Cert for $DOMAIN expires in $DAYS_LEFT days ($EXPIRY)"

if [ "$DAYS_LEFT" -lt "$THRESHOLD_DAYS" ]; then
  echo "[check-cert-expiry] ALERT: cert expires in $DAYS_LEFT days (< threshold $THRESHOLD_DAYS)"
  if [ -n "${SLACK_ALERT_WEBHOOK_URL:-}" ]; then
    curl -sf -X POST -H 'content-type: application/json' \
      --data "{\"text\":\":rotating_light: TLS cert for ${DOMAIN} expires in ${DAYS_LEFT} days (threshold ${THRESHOLD_DAYS})\"}" \
      "$SLACK_ALERT_WEBHOOK_URL" || echo "[check-cert-expiry] WARN: Slack alert failed"
  else
    echo "[check-cert-expiry] WARN: SLACK_ALERT_WEBHOOK_URL not set — alert not delivered"
  fi
fi
