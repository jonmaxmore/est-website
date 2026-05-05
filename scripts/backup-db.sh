#!/bin/bash
# ═══════════════════════════════════════
# EST Website — Database Backup Script
# ═══════════════════════════════════════
# Run as cron on production server:
#   0 3 * * * /root/est-website/scripts/backup-db.sh >> /var/log/est-backup.log 2>&1
#
# Off-site backup is REQUIRED in production: BACKUP_S3_BUCKET must be set OR
# REQUIRE_OFFSITE_BACKUP=false must be opted-in explicitly. Same-host backups
# alone leave RPO = ∞ if the host disk fails (audit-2 finding I-4).
#
# AES-256 encrypts the dump before upload via openssl when BACKUP_GPG_PASSPHRASE
# is set. Without it the dump is plaintext gzip.
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

# Off-site backup invariant: refuse to run without it unless operator explicitly
# opts out. Surfaces the gap on day 1 instead of silently producing same-host-
# only backups that fail when the disk dies.
if [ -z "${BACKUP_S3_BUCKET:-}" ] && [ "${REQUIRE_OFFSITE_BACKUP:-true}" != "false" ]; then
  echo "[Backup] FAILED — BACKUP_S3_BUCKET not configured." >&2
  echo "[Backup] Off-site backup is required. Either:" >&2
  echo "[Backup]   1. Set BACKUP_S3_BUCKET (and S3_ENDPOINT for non-AWS) in .env, OR" >&2
  echo "[Backup]   2. Set REQUIRE_OFFSITE_BACKUP=false to acknowledge the risk." >&2
  exit 1
fi

# AWS CLI presence check — silent skip is dangerous (operator believes uploads
# are happening when they aren't). Hard fail when S3 target is set but tool missing.
if [ -n "${BACKUP_S3_BUCKET:-}" ] && ! command -v aws >/dev/null 2>&1; then
  echo "[Backup] FAILED — BACKUP_S3_BUCKET set but 'aws' CLI not installed." >&2
  echo "[Backup] Install: pip install awscli  OR  apt install awscli" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

if [ -n "${BACKUP_GPG_PASSPHRASE:-}" ]; then
  BACKUP_FILE="${BACKUP_DIR}/est-${TIMESTAMP}.sql.gz.enc"
  ENCRYPTED=true
else
  BACKUP_FILE="${BACKUP_DIR}/est-${TIMESTAMP}.sql.gz"
  ENCRYPTED=false
fi

echo "[Backup] Starting pg_dump → ${BACKUP_FILE} (encrypted=${ENCRYPTED})"

# stream pg_dump ผ่าน gzip → optionally openssl AES-256 → disk
# ⚠️ ต้องระบุ -d (ไม่งั้น pg_dump default ใช้ username เป็นชื่อ DB)
if [ "$ENCRYPTED" = "true" ]; then
  docker compose exec -T postgres \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl --clean --if-exists \
    | gzip -9 \
    | openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt \
        -pass env:BACKUP_GPG_PASSPHRASE -out "$BACKUP_FILE"
else
  docker compose exec -T postgres \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl --clean --if-exists \
    | gzip -9 > "$BACKUP_FILE"
fi

# ตรวจ size — ถ้าน้อยกว่า 1KB แปลว่าผิดพลาด
SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE")
if [ "$SIZE" -lt 1024 ]; then
  echo "[Backup] FAILED — backup file too small (${SIZE} bytes)" >&2
  rm -f "$BACKUP_FILE"
  exit 2
fi

echo "[Backup] ✅ Wrote ${BACKUP_FILE} (${SIZE} bytes)"

# ── Upload to S3-compatible storage (DigitalOcean Spaces, AWS S3, etc.) ──
# Required unless explicitly opted out (the early invariant guard above
# refuses to run without BACKUP_S3_BUCKET except when REQUIRE_OFFSITE_BACKUP=false).
if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  echo "[Backup] Uploading to s3://${BACKUP_S3_BUCKET}/"
  aws s3 cp "$BACKUP_FILE" "s3://${BACKUP_S3_BUCKET}/" \
    ${S3_ENDPOINT:+--endpoint-url "$S3_ENDPOINT"} \
    ${S3_SSE:+--sse "$S3_SSE"}
  echo "[Backup] ✅ Uploaded to S3"
fi

# ── Retention: ลบ backup เก่ากว่า N วัน ──
echo "[Backup] Cleaning local backups older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name 'est-*.sql.gz*' -type f -mtime "+${RETENTION_DAYS}" -delete
echo "[Backup] Done"
