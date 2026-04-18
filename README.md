# Eternal Tower Saga — Official Website

Premium K-MMORPG landing page and portal built with **Nuxt 4**, **Vue 3**, **Prisma**, and **PostgreSQL**.

## Tech Stack

- **Frontend:** Nuxt 4 (Vue 3 Composition API)
- **Styling:** Tailwind CSS + GSAP ScrollTrigger
- **Database:** PostgreSQL 16 + Prisma ORM
- **Cache:** Redis 7
- **Auth:** nuxt-auth-utils (session cookies)
- **i18n:** @nuxtjs/i18n (EN/TH)
- **Deploy:** Docker Compose (4 services) + Nginx

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Database (requires PostgreSQL)
cp .env.example .env
npx prisma migrate dev
npm run db:seed
```

## Docker Production

```bash
cp .env.example .env
# Edit .env with real credentials
docker compose up -d
```

## Project Structure

```
app/          → Nuxt 4 app (pages, components, layouts)
server/       → Nitro server (API routes, middleware)
shared/       → Shared types and constants
prisma/       → Database schema and migrations
docker/       → Dockerfile and Nginx config
i18n/         → Internationalization (EN/TH)
public/       → Static assets
```
