#!/bin/sh
# ═══════════════════════════════════════
# EST Website — Restore from Backup
# Usage: ./scripts/restore.sh /var/backups/est-db/est_db_TIMESTAMP.sql.gz
# ═══════════════════════════════════════
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  echo "Example: $0 /var/backups/est-db/est_db_20260331_020000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "⚠  WARNING: This will REPLACE the current database with the backup."
echo "   Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "[$(date)] Starting restore from ${BACKUP_FILE}..."

gunzip -c "${BACKUP_FILE}" | docker compose -f /var/www/est-website/docker-compose.yml exec -T db \
  psql -U "${POSTGRES_USER:-est}" -d "${POSTGRES_DB:-est_db}" --quiet

echo "[$(date)] Database restored successfully."
echo "[$(date)] Restarting app container..."

docker compose -f /var/www/est-website/docker-compose.yml restart app

echo "[$(date)] Restore complete."
