@echo off
echo ==========================================
echo   EST-Website - Deploy Webzine Release 1
echo   Merged: Brand Webzine + Banner Control
echo   60 files, +5074 lines
echo ==========================================
echo.
echo This will:
echo   1. Pull latest code on server
echo   2. Rebuild Docker containers
echo   3. Run Prisma migrations (MarketingBanner)
echo   4. Seed new webzine data
echo   5. Health check
echo.
echo Enter server root password when prompted.
echo.
ssh -o StrictHostKeyChecking=yes -o UserKnownHostsFile=~/.ssh/known_hosts root@178.128.127.161 "set -e; echo; echo '=== [1/6] Pulling latest code ==='; cd /root/est-website; git fetch origin; git reset --hard origin/main; echo; echo '=== [2/6] Stopping old containers ==='; docker compose down --remove-orphans 2>/dev/null || true; docker image prune -f 2>/dev/null || true; echo; echo '=== [3/6] Building containers (5-10 min) ==='; docker compose build --no-cache; echo; echo '=== [4/6] Starting services ==='; docker compose up -d; echo; echo '=== [5/6] Waiting for DB + Running migrations ==='; sleep 8; docker compose exec -T postgres pg_isready -U est_admin 2>/dev/null || sleep 5; echo 'Running prisma migrate deploy...'; docker compose exec -T app npx prisma migrate deploy 2>&1 || { echo 'FATAL: prisma migrate deploy failed. Investigate before retrying.'; exit 1; }; echo 'Running seed...'; docker compose exec -T app npx tsx prisma/seed.ts 2>&1 || true; echo; echo '=== [6/6] Health check ==='; sleep 3; docker compose ps; echo; echo '========================================='; echo '  DEPLOYMENT COMPLETE!'; echo '========================================='; echo; echo 'Site:  http://178.128.127.161'; echo 'Admin: http://178.128.127.161/admin'"
echo.
echo Done!
pause
