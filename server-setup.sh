#!/bin/bash
# ═══════════════════════════════════════════
# EST Server Setup Script — Fresh Ubuntu VPS
# Run as root on 178.128.127.161
# ═══════════════════════════════════════════

set -e
echo "═══ EST Server Setup ═══"

# 1. Update system
echo "▶ Updating system packages..."
apt-get update -y && apt-get upgrade -y

# 2. Install Node.js 20 LTS
echo "▶ Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Install build essentials + SQLite
echo "▶ Installing build tools & SQLite..."
apt-get install -y build-essential git sqlite3 nginx certbot python3-certbot-nginx

# 4. Install PM2
echo "▶ Installing PM2..."
npm install -g pm2

# 5. Setup project directory
echo "▶ Cloning repository..."
mkdir -p /var/www
cd /var/www
if [ -d "est-website" ]; then
  echo "   Directory exists, pulling latest..."
  cd est-website && git pull origin main
else
  git clone https://github.com/jonmaxmore/est-website.git
  cd est-website
fi

# 6. Create .env
echo "▶ Creating .env..."
cat > .env << 'EOF'
PAYLOAD_SECRET=est-prod-s3cr3t-k3y-2026-ch4ng3-th1s
DATABASE_URI=file:./payload.db
NODE_ENV=production
EOF

# 7. Install dependencies
echo "▶ Installing npm dependencies..."
npm install --legacy-peer-deps

# 8. Build
echo "▶ Building Next.js..."
npm run build

# 9. Setup PM2
echo "▶ Starting PM2..."
pm2 delete est-website 2>/dev/null || true
pm2 start npm --name "est-website" -- start
pm2 save
pm2 startup systemd -u root --hp /root

# 10. Setup Nginx
echo "▶ Configuring Nginx..."
cat > /etc/nginx/sites-available/est-website << 'NGINX'
server {
    listen 80;
    server_name eternaltowersaga.com www.eternaltowersaga.com _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        client_max_body_size 100M;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/est-website /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 11. Seed database
echo "▶ Seeding database..."
curl -s -X POST http://localhost:3000/api/seed || echo "   Seed will run on first visit"

# Done!
echo ""
echo "═══════════════════════════════════════"
echo "✅ EST Server Setup Complete!"
echo "═══════════════════════════════════════"
echo "  Node.js: $(node -v)"
echo "  npm:     $(npm -v)"
echo "  PM2:     $(pm2 -v)"
echo "  Nginx:   $(nginx -v 2>&1)"
echo ""
pm2 status
echo ""
echo "▶ Next: Run 'certbot --nginx -d eternaltowersaga.com' for HTTPS"
