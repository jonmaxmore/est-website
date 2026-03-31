#!/bin/sh
# ═══════════════════════════════════════
# EST Website — PostgreSQL Backup Script
# Runs daily via cron. Stores 7 days of backups.
# ═══════════════════════════════════════
set -e

BACKUP_DIR="/var/backups/est-db"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/est_db_${TIMESTAMP}.sql.gz"

# Create backup directory if not exists
mkdir -p "${BACKUP_DIR}"

# Dump database from Docker container
echo "[$(date)] Starting backup..."
docker compose -f /var/www/est-website/docker-compose.yml exec -T db \
  pg_dump -U "${POSTGRES_USER:-est}" -d "${POSTGRES_DB:-est_db}" \
  --clean --if-exists --no-owner \
  | gzip > "${BACKUP_FILE}"

# Verify backup is not empty
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "[$(date)] ERROR: Backup file is empty!"
  rm -f "${BACKUP_FILE}"
  exit 1
fi

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Backup created: ${BACKUP_FILE} (${SIZE})"

# Remove backups older than retention period
DELETED=$(find "${BACKUP_DIR}" -name "est_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "[$(date)] Cleaned up ${DELETED} old backup(s)"

# Also backup media uploads volume
MEDIA_BACKUP="${BACKUP_DIR}/media_${TIMESTAMP}.tar.gz"
docker compose -f /var/www/est-website/docker-compose.yml exec -T app \
  tar czf - -C /app/public media 2>/dev/null > "${MEDIA_BACKUP}" || true

if [ -s "${MEDIA_BACKUP}" ]; then
  MEDIA_SIZE=$(du -h "${MEDIA_BACKUP}" | cut -f1)
  echo "[$(date)] Media backup created: ${MEDIA_BACKUP} (${MEDIA_SIZE})"
else
  rm -f "${MEDIA_BACKUP}"
  echo "[$(date)] WARNING: Media backup skipped (empty or failed)"
fi

# Clean old media backups
find "${BACKUP_DIR}" -name "media_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup complete."
