#!/bin/bash
# ═══════════════════════════════════════
# Finish Deploy — apply Sprint 1-4 audit fixes on a running server
# ═══════════════════════════════════════
# จุดประสงค์: รันบน server เพื่อ deploy โค้ดใหม่ + เพิ่ม secrets ใหม่
# Idempotent — รันซ้ำได้ถ้าผิดกลางทาง
#
# Usage on server:
#   cd /root/est-website
#   git pull origin main
#   bash scripts/finish-deploy.sh
set -e

cd /root/est-website

# ── Helper: ดึงค่าจาก .env แบบไม่ source (กัน parse error ถ้าค่ามี space) ──
env_get() {
  local key="$1"
  local default="$2"
  local val
  val=$(grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
  echo "${val:-$default}"
}

PG_USER=$(env_get POSTGRES_USER est_admin)
PG_DB=$(env_get POSTGRES_DB est_website)

echo "═══════════════════════════════════════"
echo "  EST-Website Deploy"
echo "  Commit: $(git rev-parse --short HEAD)"
echo "  PG: ${PG_USER}@${PG_DB}"
echo "═══════════════════════════════════════"

# ── 1. Ensure secrets exist in .env ──
echo ""
echo "═══ [1/7] Ensure required secrets in .env ═══"

ensure_secret() {
  local key="$1"
  local generator="$2"
  if ! grep -qE "^${key}=" .env; then
    local val=$(eval "$generator")
    echo "${key}=${val}" >> .env
    echo "  ✚ Added ${key}"
  else
    echo "  ✓ ${key} already set"
  fi
}

# Backup .env ก่อนแก้
cp .env ".env.backup-$(date +%Y%m%d_%H%M%S)"

ensure_secret REDIS_PASSWORD "openssl rand -hex 24"
ensure_secret ANALYTICS_IP_SALT "openssl rand -hex 32"
ensure_secret WEBHOOK_SECRET "openssl rand -hex 32"
ensure_secret PG_POOL_MAX "echo 20"
ensure_secret PG_POOL_IDLE_TIMEOUT_MS "echo 30000"
ensure_secret PG_POOL_CONNECTION_TIMEOUT_MS "echo 10000"
ensure_secret LOG_LEVEL "echo info"

# ── 2. Sync REDIS_URL กับ REDIS_PASSWORD ──
REDIS_PW=$(env_get REDIS_PASSWORD "")
if [ -n "$REDIS_PW" ]; then
  if grep -qE '^REDIS_URL=redis://[^:]*@' .env; then
    # มี password แล้ว — sync ใหม่
    sed -i "s|^REDIS_URL=redis://[^@]*@|REDIS_URL=redis://:${REDIS_PW}@|" .env
  elif grep -qE '^REDIS_URL=redis://redis:' .env; then
    # ยังไม่มี password — ใส่ใหม่
    sed -i "s|^REDIS_URL=redis://redis:|REDIS_URL=redis://:${REDIS_PW}@redis:|" .env
  fi
  echo "  ✓ REDIS_URL synced with REDIS_PASSWORD"
fi

# ── 3. Backup DB ──
echo ""
echo "═══ [2/7] Backup DB ก่อน migrate ═══"
mkdir -p /var/backups/est-website
BACKUP_FILE="/var/backups/est-website/pre-deploy-$(date +%Y%m%dT%H%M%SZ).sql.gz"
docker compose exec -T postgres pg_dump \
  -U "$PG_USER" \
  -d "$PG_DB" \
  --no-owner --no-acl --clean --if-exists \
  | gzip -9 > "$BACKUP_FILE"
SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE")
if [ "$SIZE" -lt 1024 ]; then
  echo "  ❌ Backup file too small ($SIZE bytes) — aborting"
  exit 2
fi
echo "  ✓ $(ls -lh $BACKUP_FILE | awk '{print $5, $9}')"

# ── 4. Build app image ──
echo ""
echo "═══ [3/7] Build app image ═══"
docker compose build app

# ── 5. Run migrations ──
echo ""
echo "═══ [4/7] Run prisma migrations ═══"
docker compose run --rm app npx prisma migrate deploy

# ── 6. Recreate all services (Redis ต้องตั้ง password ใหม่) ──
echo ""
echo "═══ [5/7] Recreate services ═══"
docker compose up -d --force-recreate

# ── 7. Health check polling ──
echo ""
echo "═══ [6/7] Health check polling (max 60s) ═══"
sleep 15
HEALTH_OK=false
for i in $(seq 1 30); do
  if curl -sf -m 3 http://localhost:3000/api/public/site > /dev/null 2>&1; then
    echo "  ✅ Healthy after ${i} attempts"
    HEALTH_OK=true
    break
  fi
  sleep 2
done

if [ "$HEALTH_OK" = false ]; then
  echo "  ❌ Health check failed"
  echo ""
  echo "═══ App logs ═══"
  docker compose logs --tail=80 app
  echo ""
  echo "═══ Redis logs ═══"
  docker compose logs --tail=20 redis
  exit 3
fi

# ── 8. Verify ──
echo ""
echo "═══ [7/7] Verify ═══"
echo ""
echo "Containers:"
docker compose ps
echo ""
echo "Ports check (ต้องไม่มี 0.0.0.0:5432 หรือ 6379):"
if ss -tlnp 2>/dev/null | grep -E '0\.0\.0\.0:(5432|6379)|\[::\]:(5432|6379)' >/dev/null; then
  echo "  ⚠️  WARNING — DB/Redis ports still externally exposed:"
  ss -tlnp | grep -E ':5432|:6379'
else
  echo "  ✅ Postgres/Redis ports closed externally"
fi
echo ""
echo "Request-id header (verify request-id middleware ทำงาน):"
RID=$(curl -sI -m 5 http://localhost:3000/ 2>/dev/null | grep -i '^x-request-id:' | head -1)
if [ -n "$RID" ]; then
  echo "  ✅ ${RID}"
else
  echo "  ⚠️  No x-request-id header — middleware may not be registered"
fi
echo ""
echo "Sample API response (request-id should round-trip):"
curl -sI -m 5 -H 'x-request-id: deploy-verify-12345' http://localhost:3000/api/public/site 2>/dev/null | grep -i '^x-request-id:'

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ DEPLOY COMPLETE — commit $(git rev-parse --short HEAD)"
echo "═══════════════════════════════════════"
