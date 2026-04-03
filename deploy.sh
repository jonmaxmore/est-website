#!/bin/bash
# ═══════════════════════════════════════════════
# EST Website — One Best Way Deploy
# Clean + Build + Deploy + Verify — single script
# ═══════════════════════════════════════════════
set -euo pipefail

REPO_DIR="/var/www/est-website"
LOG_FILE="/tmp/est-deploy-$(date +%Y%m%d-%H%M%S).log"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

log "═══ EST Deploy Started ═══"

# Step 1: Clean Docker — free disk & memory
log "STEP 1/5: Cleaning Docker..."
docker system prune -af 2>&1 | tail -3 | tee -a "$LOG_FILE"
log "Docker cleaned ✓"

# Step 2: Git pull latest
log "STEP 2/5: Pulling latest code..."
cd "$REPO_DIR"
git fetch --all 2>&1 | tee -a "$LOG_FILE"
git reset --hard origin/main 2>&1 | tee -a "$LOG_FILE"
COMMIT=$(git log --oneline -1)
log "Code updated: $COMMIT ✓"

# Step 3: Build & deploy
log "STEP 3/5: Building Docker containers..."
docker compose up -d --build 2>&1 | tee -a "$LOG_FILE"
log "Containers started ✓"

# Step 4: Wait for app to be ready
log "STEP 4/5: Waiting for app healthcheck..."
MAX_WAIT=60
for i in $(seq 1 $MAX_WAIT); do
  HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/health 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    log "App healthy after ${i}s ✓"
    break
  fi
  if [ "$i" = "$MAX_WAIT" ]; then
    log "⚠ App not ready after ${MAX_WAIT}s — check logs with: docker compose logs app"
    exit 1
  fi
  sleep 1
done

# Step 5: Verify
log "STEP 5/5: Verifying deployment..."
HEALTH=$(curl -s http://localhost/api/health)
log "Health: $HEALTH"

docker compose ps 2>&1 | tee -a "$LOG_FILE"

log "═══ Deploy Complete ═══"
log "Full log: $LOG_FILE"
