# ═══════════════════════════════════════
# EST Website (Nuxt 4) — Multi-stage Dockerfile
# ═══════════════════════════════════════

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
# `npm ci` is the deterministic, lockfile-strict install — fails loudly on
# lockfile mismatch instead of silently degrading to `npm install`.
RUN npm ci
RUN npx prisma generate

# ── Stage 2: Build ──
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN npm run build

# ── Stage 3: Production Runner ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# wget สำหรับ HEALTHCHECK (alpine มีอยู่แล้ว)
RUN addgroup --system --gid 1001 nuxt \
 && adduser --system --uid 1001 nuxt

# Copy build output (ทุกอย่างที่จำเป็น compiled แล้วใน .output)
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output
COPY --from=builder --chown=nuxt:nuxt /app/prisma ./prisma
COPY --from=builder --chown=nuxt:nuxt /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nuxt:nuxt /app/node_modules ./node_modules
COPY --from=builder --chown=nuxt:nuxt /app/package.json ./package.json

# Create uploads directory
RUN mkdir -p public/uploads && chown -R nuxt:nuxt public

USER nuxt
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ── Healthcheck ──
# Hits the dedicated /api/health endpoint (shallow mode = no DB query, just
# Node-up confirmation). Use `?deep=1` from external probes if DB readiness
# matters; here we want fast container-level liveness only.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
