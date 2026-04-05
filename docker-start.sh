#!/bin/sh

echo "═══ EST Website — Starting ═══"

# Clear mocked HTML files generated during build phase
echo "▶ Clearing static build cache..."
rm -f .next/server/app/index.html .next/server/app/index.meta
rm -f .next/server/app/index.rsc
rm -f .next/server/app/download.html .next/server/app/download.meta
rm -f .next/server/app/download.rsc
rm -f .next/server/app/event.html .next/server/app/event.meta
rm -f .next/server/app/event.rsc
rm -f .next/server/app/faq.html .next/server/app/faq.meta
rm -f .next/server/app/faq.rsc
rm -f .next/server/app/gallery.html .next/server/app/gallery.meta
rm -f .next/server/app/gallery.rsc
rm -f .next/server/app/game-guide.html .next/server/app/game-guide.meta
rm -f .next/server/app/game-guide.rsc
rm -f .next/server/app/privacy.html .next/server/app/privacy.meta
rm -f .next/server/app/privacy.rsc
rm -f .next/server/app/story.html .next/server/app/story.meta
rm -f .next/server/app/story.rsc
rm -f .next/server/app/support.html .next/server/app/support.meta
rm -f .next/server/app/support.rsc
rm -f .next/server/app/terms.html .next/server/app/terms.meta
rm -f .next/server/app/terms.rsc
rm -f .next/server/app/weapons.html .next/server/app/weapons.meta
rm -f .next/server/app/weapons.rsc
rm -f .next/server/app/news.html .next/server/app/news.meta
rm -f .next/server/app/news.rsc
rm -f .next/server/app/sitemap.xml.meta

echo "▶ Starting Next.js server..."
node server.js &
SERVER_PID=$!

# Wait for the server to be ready
echo "▶ Waiting for server to be ready..."
for i in $(seq 1 30); do
  if wget -q --spider http://127.0.0.1:3000/api/public/homepage 2>/dev/null; then
    echo "✓ Server is ready!"
    break
  fi
  sleep 1
done

# Warmup: Hit the admin endpoint to force Payload to fully initialize and push schema
echo "▶ Warming up Payload CMS (schema push)..."
wget -q -O /dev/null http://127.0.0.1:3000/admin/login 2>/dev/null || true
sleep 3

# Hit homepage to trigger ISR regeneration with real CMS data
echo "▶ Warming up public pages..."
wget -q -O /dev/null http://127.0.0.1:3000/ 2>/dev/null || true
wget -q -O /dev/null http://127.0.0.1:3000/event 2>/dev/null || true

echo "✓ EST Website is fully operational!"

# Wait for the server process
wait $SERVER_PID
