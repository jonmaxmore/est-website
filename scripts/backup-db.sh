#!/bin/bash
# ═══════════════════════════════════════
# EST Website — Database Backup Script
# ═══════════════════════════════════════
# Run as cron on production server:
#   0 3 * * * /root/est-website/scripts/backup-db.sh >> /var/log/est-backup.log 2>&1
#
# Optional: ตั้ง BACKUP_S3_BUCKET ใน .env เพื่ออัพไป object storage
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-/root/est-website}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/est-website}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")

cd "$PROJECT_ROOT"

# โหลด env
if [ -f ".env" ]; then
  set -a; source .env; set +a
fi

if [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_DB:-}" ]; then
  echo "[Backup] POSTGRES_USER / POSTGRES_DB ต้องถูกตั้งใน .env" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="${BACKUP_DIR}/est-${TIMESTAMP}.sql.gz"

echo "[Backup] Starting pg_dump → ${BACKUP_FILE}"

# stream pg_dump ผ่าน gzip โดยตรง (ไม่เก็บ uncompressed บน disk)
# ⚠️ ต้องระบุ -d (ไม่งั้น pg_dump default ใช้ username เป็นชื่อ DB)
docker compose exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl --clean --if-exists \
  | gzip -9 > "$BACKUP_FILE"

# ตรวจ size — ถ้าน้อยกว่า 1KB แปลว่าผิดพลาด
SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE")
if [ "$SIZE" -lt 1024 ]; then
  echo "[Backup] FAILED — backup file too small (${SIZE} bytes)" >&2
  rm -f "$BACKUP_FILE"
  exit 2
fi

echo "[Backup] ✅ Wrote ${BACKUP_FILE} (${SIZE} bytes)"

# ── Optional: upload to S3-compatible storage (DigitalOcean Spaces, AWS S3, etc.) ──
if [ -n "${BACKUP_S3_BUCKET:-}" ] && command -v aws >/dev/null 2>&1; then
  echo "[Backup] Uploading to s3://${BACKUP_S3_BUCKET}/"
  aws s3 cp "$BACKUP_FILE" "s3://${BACKUP_S3_BUCKET}/" \
    ${S3_ENDPOINT:+--endpoint-url "$S3_ENDPOINT"}
  echo "[Backup] ✅ Uploaded to S3"
fi

# ── Retention: ลบ backup เก่ากว่า N วัน ──
echo "[Backup] Cleaning local backups older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name 'est-*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete
echo "[Backup] Done"
