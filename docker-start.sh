#!/bin/sh
set -e

echo "═══ EST Website — Starting ═══"

# Run Payload schema push (create/update DB tables)
echo "▶ Pushing database schema..."
npx payload migrate 2>/dev/null || echo "⚠️ migrate skipped (will use push mode)"

# Start the Next.js server
echo "▶ Starting Next.js server..."
exec node server.js
