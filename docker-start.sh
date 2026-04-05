#!/bin/sh
set -e

echo "═══ EST Website — Starting ═══"

# Run Payload schema push (create/update DB tables)
echo "▶ Pushing database schema..."
npx payload migrate 2>/dev/null || echo "⚠️ migrate skipped (will use push mode)"

# Clear mocked HTML files generated during build phase
echo "▶ Clearing static build cache..."
rm -f .next/server/app/index.html .next/server/app/index.meta
rm -f .next/server/app/download.html .next/server/app/download.meta
rm -rf .next/server/app/news/*.html .next/server/app/news/*.meta

# Start the Next.js server
echo "▶ Starting Next.js server..."
exec node server.js
