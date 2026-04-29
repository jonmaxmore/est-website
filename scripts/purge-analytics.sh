#!/bin/bash
# ═══════════════════════════════════════
# EST Website — Analytics Retention (PDPA compliance)
# ═══════════════════════════════════════
# ลบข้อมูล tracking ที่เก่ากว่าระยะเวลาที่กำหนด (default 90 วัน)
#
# Run as cron on production server:
#   30 3 * * * /root/est-website/scripts/purge-analytics.sh >> /var/log/est-purge.log 2>&1
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-/root/est-website}"
PAGEVIEW_RETENTION_DAYS="${PAGEVIEW_RETENTION_DAYS:-90}"
CONVERSION_RETENTION_DAYS="${CONVERSION_RETENTION_DAYS:-180}"
ACTIVITY_RETENTION_DAYS="${ACTIVITY_RETENTION_DAYS:-365}"

cd "$PROJECT_ROOT"

if [ -f ".env" ]; then
  set -a; source .env; set +a
fi

run_sql() {
  docker compose exec -T postgres \
    psql -U "${POSTGRES_USER:?}" -d "${POSTGRES_DB:?}" -c "$1"
}

echo "[Purge] PageView: lifetime ${PAGEVIEW_RETENTION_DAYS}d"
run_sql "DELETE FROM page_views WHERE \"createdAt\" < NOW() - INTERVAL '${PAGEVIEW_RETENTION_DAYS} days';"

echo "[Purge] ConversionEvent: lifetime ${CONVERSION_RETENTION_DAYS}d"
run_sql "DELETE FROM conversion_events WHERE \"createdAt\" < NOW() - INTERVAL '${CONVERSION_RETENTION_DAYS} days';"

echo "[Purge] ActivityLog: lifetime ${ACTIVITY_RETENTION_DAYS}d"
run_sql "DELETE FROM activity_logs WHERE \"createdAt\" < NOW() - INTERVAL '${ACTIVITY_RETENTION_DAYS} days';"

echo "[Purge] VACUUM analytics tables"
run_sql "VACUUM ANALYZE page_views;"
run_sql "VACUUM ANALYZE conversion_events;"
run_sql "VACUUM ANALYZE activity_logs;"

echo "[Purge] Done"
