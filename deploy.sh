#!/bin/bash
# ═══════════════════════════════════════════════════════════
# EST Website — Full Server Deployment Script
# Run this on the server: bash /tmp/deploy.sh
# ═══════════════════════════════════════════════════════════
set -e

echo "═══ Phase 1: Clean Server ═══"
# Stop all running containers
docker compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true

# Remove old project files
rm -rf /opt/est-website
rm -rf /var/www/*

echo "═══ Phase 2: Install Docker (if not present) ═══"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Ensure docker compose plugin
if ! docker compose version &> /dev/null; then
  apt-get update && apt-get install -y docker-compose-plugin
fi

echo "═══ Phase 3: Install Git (if not present) ═══"
if ! command -v git &> /dev/null; then
  apt-get update && apt-get install -y git
fi

echo "═══ Phase 4: Clone Repository ═══"
git clone https://github.com/jonmaxmore/est-website.git /opt/est-website
cd /opt/est-website

echo "═══ Phase 5: Create Production .env ═══"
cat > .env << 'ENVEOF'
# ── Database ──
POSTGRES_DB=est_website
POSTGRES_USER=est_admin
POSTGRES_PASSWORD=EtsDb2026SecurePass!
DATABASE_URL=postgresql://est_admin:EtsDb2026SecurePass!@postgres:5432/est_website

# ── Redis ──
REDIS_URL=redis://redis:6379

# ── Auth ──
NUXT_SESSION_PASSWORD=a7f3c9d1e5b84a6f92c0d7e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0

# ── Admin Seed ──
ADMIN_SEED_EMAIL=admin@eternaltowersaga.com
ADMIN_SEED_PASSWORD=EtsAdmin2026!

# ── Public ──
NUXT_PUBLIC_SITE_URL=http://178.128.127.161
NUXT_PUBLIC_SITE_NAME=Eternal Tower Saga
ENVEOF

echo "═══ Phase 6: Build & Start with Docker Compose ═══"
docker compose up -d --build

echo "═══ Phase 7: Wait for services ═══"
echo "Waiting for PostgreSQL..."
sleep 10

# Check health
docker compose ps

echo "═══ Phase 8: Run Prisma Migration & Seed ═══"
docker compose exec app npx prisma db push --accept-data-loss 2>/dev/null || \
  docker compose exec app sh -c "cd /app && npx prisma db push --accept-data-loss"

docker compose exec app npx prisma db seed 2>/dev/null || \
  docker compose exec app sh -c "cd /app && npx tsx prisma/seed.ts" 2>/dev/null || \
  echo "Seed may need manual run"

echo ""
echo "═══════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════"
echo ""
echo "🌐 Site: http://178.128.127.161"
echo "🔐 Admin: http://178.128.127.161/admin/login"
echo "📧 Admin Email: admin@eternaltowersaga.com"
echo "🔑 Admin Password: EtsAdmin2026!"
echo ""
echo "Check status: docker compose -f /opt/est-website/docker-compose.yml ps"
echo "View logs: docker compose -f /opt/est-website/docker-compose.yml logs -f"
