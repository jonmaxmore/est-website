#!/bin/bash
# ═══════════════════════════════════════
#   EST Website — SSL Setup Script
#   Run on production server to enable HTTPS
# ═══════════════════════════════════════
#
# REQUIRED: ตั้งค่า DOMAIN + EMAIL ก่อนรัน
#
#   DOMAIN=yourdomain.com EMAIL=admin@yourdomain.com bash setup-ssl.sh
#
# OR ตั้งใน .env แล้วโหลด:
#   set -a; source .env; set +a; bash setup-ssl.sh
#
# Prerequisites: DNS A-record ของ DOMAIN และ www.DOMAIN ต้องชี้มาที่ server IP แล้ว
set -e

DOMAIN="${DOMAIN:-${SSL_DOMAIN:-}}"
EMAIL="${EMAIL:-${SSL_EMAIL:-}}"
NGINX_CONF="docker/nginx"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "❌ DOMAIN and EMAIL env vars are required"
  echo ""
  echo "Usage:"
  echo "  DOMAIN=yourdomain.com EMAIL=admin@yourdomain.com bash setup-ssl.sh"
  echo ""
  echo "Or set in .env then: set -a; source .env; set +a; bash setup-ssl.sh"
  exit 1
fi

echo "═══════════════════════════════════════"
echo "  Setting up SSL for ${DOMAIN}"
echo "  Notification email: ${EMAIL}"
echo "═══════════════════════════════════════"
echo ""
echo "⚠️  Verify DNS first:"
echo "    dig +short ${DOMAIN}"
echo "    dig +short www.${DOMAIN}"
echo "    Both should resolve to this server's IP"
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

# Step 1: Create certbot directories
echo "[1/6] Creating certbot directories..."
mkdir -p certbot/www certbot/conf

# Step 2: Stop nginx to free port 80 (certbot standalone needs it)
echo "[2/6] Stopping nginx to free port 80..."
docker compose stop nginx || true

# Step 3: Get certificates using standalone certbot
echo "[3/6] Obtaining SSL certificates from Let's Encrypt..."
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

# Step 4: Render ssl.conf with the actual domain
echo "[4/6] Rendering ssl.conf for ${DOMAIN}..."
if [ ! -f "${NGINX_CONF}/ssl.conf.template" ]; then
  cp "${NGINX_CONF}/ssl.conf" "${NGINX_CONF}/ssl.conf.template"
fi
sed "s|__SSL_DOMAIN__|${DOMAIN}|g" "${NGINX_CONF}/ssl.conf.template" > "${NGINX_CONF}/ssl.conf"

# Step 5: Switch nginx to SSL config
echo "[5/6] Switching to SSL nginx config..."
if [ -f "${NGINX_CONF}/default.conf" ] && [ ! -f "${NGINX_CONF}/default.conf.http-backup" ]; then
  cp "${NGINX_CONF}/default.conf" "${NGINX_CONF}/default.conf.http-backup"
fi
cp "${NGINX_CONF}/ssl.conf" "${NGINX_CONF}/default.conf"

# Step 6: Restart with new config
echo "[6/6] Restarting nginx with SSL..."
docker compose up -d nginx

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ SSL Setup Complete!"
echo "  Site: https://${DOMAIN}"
echo "═══════════════════════════════════════"
echo ""
echo "To auto-renew certificates, add this cron job (replaces nginx for renewal):"
echo "  0 3 * * 0 cd $(pwd) && docker compose stop nginx && docker run --rm -v \"\$(pwd)/certbot/conf:/etc/letsencrypt\" -v \"\$(pwd)/certbot/www:/var/www/certbot\" -p 80:80 certbot/certbot renew --quiet && docker compose up -d nginx"
