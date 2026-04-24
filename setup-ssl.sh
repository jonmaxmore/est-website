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
echo "[1/4] Creating certbot directories..."
mkdir -p certbot/www certbot/conf

# Step 2: Get certificates using standalone certbot
echo "[2/4] Obtaining SSL certificates..."
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

# Step 3: Switch nginx to SSL config
echo "[3/4] Switching to SSL nginx config..."
if [ -f "${NGINX_CONF}/default.conf" ]; then
  cp "${NGINX_CONF}/default.conf" "${NGINX_CONF}/default.conf.http-backup"
fi
cp "${NGINX_CONF}/ssl.conf" "${NGINX_CONF}/default.conf"

# Step 4: Restart with new config
echo "[4/4] Restarting services..."
docker compose restart nginx

echo ""
echo "═══════════════════════════════════════"
echo "  SSL Setup Complete!"
echo "  Site: https://${DOMAIN}"
echo "═══════════════════════════════════════"
echo ""
echo "To auto-renew certificates, add this cron job:"
echo '  0 3 * * * cd /root/est-website && docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" -v "$(pwd)/certbot/www:/var/www/certbot" certbot/certbot renew --quiet && docker compose restart nginx'
