@echo off
echo =========================================
echo   EST-Website - Deploy to Production
echo =========================================
echo.
echo Connecting to server... (Enter root password when prompted)
echo.
ssh -o StrictHostKeyChecking=no root@178.128.127.161 "set -e; echo '[1/6] Pulling latest...'; cd /root/est-website; git pull origin main; echo '[2/6] Stopping containers...'; docker compose down --remove-orphans 2>/dev/null || true; echo '[3/6] Building (this takes a few minutes)...'; docker compose build --no-cache; echo '[4/6] Starting services...'; docker compose up -d; echo '[5/6] Waiting for DB...'; sleep 8; docker compose exec -T db pg_isready -U postgres 2>/dev/null || docker compose exec -T postgres pg_isready 2>/dev/null || sleep 5; echo '[6/6] Running migrations...'; docker compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null || true; docker compose exec -T app npx tsx prisma/seed.ts 2>/dev/null || true; echo; echo '========================================='; echo '  DEPLOYMENT COMPLETE!'; echo '========================================='; docker compose ps; echo; echo 'Site: http://178.128.127.161'; echo 'Admin: http://178.128.127.161/admin'"
echo.
echo Done!
pause
