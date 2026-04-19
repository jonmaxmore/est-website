# Remote Deploy Script for EST-Website
# Usage: powershell -ExecutionPolicy Bypass -File remote-deploy.ps1

$server = "178.128.127.161"
$user = "root"
$projectDir = "/root/est-website"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EST-Website Remote Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Commands to run on server
$commands = @"
set -e
echo '=== [1/6] Checking existing project ==='
if [ -d '$projectDir' ]; then
  echo 'Project found. Pulling latest...'
  cd $projectDir
  git pull origin main
else
  echo 'Cloning project...'
  git clone https://github.com/jonmaxmore/est-website.git $projectDir
  cd $projectDir
fi

echo '=== [2/6] Checking .env ==='
cd $projectDir
if [ ! -f .env ]; then
  cp .env.production.example .env
  echo 'CREATED .env from template - EDIT IT BEFORE CONTINUING!'
  echo 'Run: nano $projectDir/.env'
fi

echo '=== [3/6] Docker status ==='
docker --version
docker compose version

echo '=== [4/6] Stopping old containers ==='
docker compose down --remove-orphans 2>/dev/null || true
docker image prune -f 2>/dev/null || true

echo '=== [5/6] Building & starting ==='
docker compose build --no-cache
docker compose up -d

echo '=== [6/6] Waiting for DB & running migrations ==='
sleep 8
docker compose exec -T db pg_isready -U postgres || sleep 5
docker compose exec -T app npx prisma migrate deploy 2>/dev/null || docker compose exec -T app npx prisma db push --accept-data-loss 2>/dev/null || true
docker compose exec -T app npx tsx prisma/seed.ts 2>/dev/null || true

echo ''
echo '========================================='
echo '  DEPLOYMENT COMPLETE!'
echo '========================================='
docker compose ps
echo ''
echo "Site: http://$server"
echo "Admin: http://$server/admin"
"@

Write-Host "Connecting to $server..." -ForegroundColor Yellow
Write-Host "Please enter the root password when prompted." -ForegroundColor Yellow
Write-Host ""

# Execute via SSH
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15 "${user}@${server}" $commands
