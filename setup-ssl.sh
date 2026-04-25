#!/bin/bash
# ═══════════════════════════════════════
#   EST Website — SSL Setup Script
#   Run on production server to enable HTTPS
# ═══════════════════════════════════════
set -e

DOMAIN="eternaltowersaga.com"
EMAIL="admin@eternaltowersaga.com"
NGINX_CONF="docker/nginx"

echo "═══════════════════════════════════════"
echo "  Setting up SSL for ${DOMAIN}"
echo "═══════════════════════════════════════"

# Step 1: Create certbot directories
echo "[1/5] Creating certbot directories..."
mkdir -p certbot/www certbot/conf

# Step 2: Stop nginx to free port 80 (certbot standalone needs it)
echo "[2/5] Stopping nginx to free port 80..."
docker compose stop nginx || true

# Step 3: Get certificates using standalone certbot
echo "[3/5] Obtaining SSL certificates..."
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}"

# Step 4: Switch nginx to SSL config
echo "[4/5] Switching to SSL nginx config..."
if [ -f "${NGINX_CONF}/default.conf" ]; then
  cp "${NGINX_CONF}/default.conf" "${NGINX_CONF}/default.conf.http-backup"
fi
cp "${NGINX_CONF}/ssl.conf" "${NGINX_CONF}/default.conf"

# Step 5: Restart with new config
echo "[5/5] Restarting nginx with SSL..."
docker compose up -d nginx

echo ""
echo "═══════════════════════════════════════"
echo "  SSL Setup Complete!"
echo "  Site: https://${DOMAIN}"
echo "═══════════════════════════════════════"
echo ""
echo "To auto-renew certificates, add this cron job:"
echo '  0 3 * * * cd /var/www/est-website && docker compose stop nginx && docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" -v "$(pwd)/certbot/www:/var/www/certbot" -p 80:80 certbot/certbot renew --quiet && docker compose up -d nginx'
