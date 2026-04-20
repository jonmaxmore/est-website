# ═══════════════════════════════════════
# EST Website (Nuxt 4) — Multi-stage Dockerfile
# ═══════════════════════════════════════

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install && npx prisma generate

# ── Stage 2: Build ──
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN npx prisma generate && npm run build

# ── Stage 3: Production Runner ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nuxt
RUN adduser --system --uid 1001 nuxt

# Copy build output
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output
COPY --from=builder --chown=nuxt:nuxt /app/prisma ./prisma
COPY --from=builder --chown=nuxt:nuxt /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nuxt:nuxt /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nuxt:nuxt /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nuxt:nuxt /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=builder --chown=nuxt:nuxt /app/package.json ./package.json

# Copy seed dependencies
COPY --from=builder --chown=nuxt:nuxt /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nuxt:nuxt /app/prisma/seed.ts ./prisma/seed.ts

# Create uploads directory
RUN mkdir -p public/uploads && chown -R nuxt:nuxt public

USER nuxt
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".output/server/index.mjs"]
