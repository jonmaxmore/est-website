#!/bin/bash
# ═══════════════════════════════════════
# Self-hosted uptime probe. Hits /api/health every minute via cron and
# fires a Slack alert on consecutive failures (avoids alarm-fatigue from
# transient blips).
# Cron: * * * * * /root/est-website/scripts/uptime-probe.sh >> /var/log/est-uptime.log 2>&1
# ═══════════════════════════════════════
set -euo pipefail

URL="${HEALTH_URL:-http://localhost:3000/api/health}"
STATE_FILE="${UPTIME_STATE_FILE:-/var/lib/est-uptime.state}"
ALERT_AFTER="${UPTIME_ALERT_AFTER:-3}"   # 3 consecutive failures = 3 min
TIMEOUT="${UPTIME_TIMEOUT:-5}"

mkdir -p "$(dirname "$STATE_FILE")"
[ -f "$STATE_FILE" ] || echo 0 > "$STATE_FILE"

if curl -sf -m "$TIMEOUT" "$URL" > /dev/null 2>&1; then
  PREV=$(cat "$STATE_FILE")
  echo 0 > "$STATE_FILE"
  if [ "$PREV" -ge "$ALERT_AFTER" ] && [ -n "${SLACK_ALERT_WEBHOOK_URL:-}" ]; then
    # Recovery alert — close the loop so on-call knows it's over.
    curl -sf -X POST -H 'content-type: application/json' \
      --data "{\"text\":\":white_check_mark: Health probe RECOVERED after $PREV failed attempts.\"}" \
      "$SLACK_ALERT_WEBHOOK_URL" >/dev/null || true
  fi
  exit 0
fi

# Probe failed
COUNT=$(($(cat "$STATE_FILE") + 1))
echo "$COUNT" > "$STATE_FILE"
echo "[$(date -u +%FT%TZ)] Health probe FAILED (consecutive: $COUNT)"

if [ "$COUNT" -eq "$ALERT_AFTER" ]; then
  if [ -n "${SLACK_ALERT_WEBHOOK_URL:-}" ]; then
    curl -sf -X POST -H 'content-type: application/json' \
      --data "{\"text\":\":rotating_light: Health probe failed ${COUNT} consecutive times. URL: ${URL}\"}" \
      "$SLACK_ALERT_WEBHOOK_URL" >/dev/null || true
  else
    echo "[uptime-probe] WARN: SLACK_ALERT_WEBHOOK_URL not set — alert not delivered"
  fi
fi
