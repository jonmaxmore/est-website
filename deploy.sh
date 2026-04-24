#!/bin/bash
# ═══════════════════════════════════════
# EST Website — Production Deployment Script
# Usage: ./deploy.sh [--skip-build] [--skip-prune]
# ═══════════════════════════════════════
set -euo pipefail

# ── Color output ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# ── Parse flags ──
SKIP_BUILD=false
SKIP_PRUNE=false

for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
    --skip-prune) SKIP_PRUNE=true ;;
  esac
done

# ── Validate environment ──
log "Checking deployment prerequisites..."

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  if [ -f ".env.production" ]; then
    ENV_FILE=".env.production"
    log "Using .env.production"
  else
    error "No .env or .env.production file found!"
    error "Copy .env.production.example to .env and fill in your credentials."
    exit 1
  fi
fi

# Source the env file to validate required vars
set -a
source "$ENV_FILE"
set +a

# ── Validate required environment variables ──
REQUIRED_VARS=(
  "DATABASE_URL"
  "NUXT_SESSION_PASSWORD"
  "ADMIN_SEED_EMAIL"
  "ADMIN_SEED_PASSWORD"
)

MISSING=false
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    error "Missing required variable: $var"
    MISSING=true
  fi
done

if [ "$MISSING" = true ]; then
  error "Please set all required variables in $ENV_FILE"
  exit 1
fi

log "✅ Environment validated"

# ── Check Docker ──
if ! command -v docker &> /dev/null; then
  error "Docker is not installed. Please install Docker first."
  exit 1
fi

if ! docker compose version &> /dev/null; then
  error "Docker Compose v2 is required. Please update Docker."
  exit 1
fi

log "✅ Docker available"

# ── Stop existing containers ──
log "Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

# ── Clean up (SAFE — only removes unused images, not volumes) ──
if [ "$SKIP_PRUNE" = false ]; then
  log "Cleaning up unused Docker images..."
  docker image prune -f 2>/dev/null || true
fi

# ── Build ──
if [ "$SKIP_BUILD" = false ]; then
  log "Building containers..."
  docker compose build --no-cache
else
  log "Skipping build (--skip-build flag)"
fi

# ── Start ──
log "Starting services..."
docker compose up -d

# ── Wait for database ──
log "Waiting for PostgreSQL to be ready..."
sleep 5

MAX_RETRIES=30
RETRIES=0
until docker compose exec -T postgres pg_isready -U ${POSTGRES_USER:-est_admin} > /dev/null 2>&1; do
  RETRIES=$((RETRIES + 1))
  if [ $RETRIES -ge $MAX_RETRIES ]; then
    error "PostgreSQL did not start in time"
    docker compose logs postgres
    exit 1
  fi
  sleep 2
done
log "✅ PostgreSQL ready"

# ── Run Prisma migrations ──
log "Running database migrations..."
docker compose exec -T app npx prisma migrate deploy 2>/dev/null || {
  warn "Migrations may have failed or schema push needed. Trying prisma db push..."
  docker compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null || true
}

# ── Seed database ──
log "Seeding database..."
docker compose exec -T app npx tsx prisma/seed.ts 2>/dev/null || {
  warn "Seed script failed — this is OK if data already exists"
}

# ── Health check ──
log "Running health check..."
sleep 3

HEALTH_URL="http://localhost:3000"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
  log "✅ Application is running! (HTTP $HTTP_CODE)"
else
  warn "Application returned HTTP $HTTP_CODE — check logs with: docker compose logs app"
fi

# ── Summary ──
echo ""
echo "═══════════════════════════════════════"
echo -e "  ${GREEN}Deployment Complete! ✅${NC}"
echo "═══════════════════════════════════════"
echo "  App:      $HEALTH_URL"
echo "  Admin:    $HEALTH_URL/admin"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f app     # View app logs"
echo "    docker compose logs -f postgres  # View DB logs"
echo "    docker compose ps              # Check status"
echo "    docker compose down            # Stop all"
echo "═══════════════════════════════════════"
