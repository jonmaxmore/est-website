# Eternal Tower Saga — Official Website

Premium K-MMORPG landing page + admin CMS. Nuxt 4 + Vue 3 + Prisma 7 + PostgreSQL 16.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 4, Vue 3 (Composition API) |
| Styling | Tailwind CSS 4, @nuxt/ui 4, GSAP ScrollTrigger |
| State | Pinia 3 |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`) |
| Cache & rate-limit | Redis 7 (ioredis) |
| Auth | nuxt-auth-utils (session cookies, 12 hr sliding TTL) |
| i18n | @nuxtjs/i18n (EN + TH, default `th`) |
| Editor | TipTap 3 (admin rich-text) |
| Email | Resend (newsletter confirm — optional) |
| Error tracking | Sentry (optional, env-gated) |
| Deploy | Docker Compose: app + nginx + postgres + redis |

## Requirements

- **Node.js** 22.x (the Docker image uses `node:22-alpine`)
- **npm** 10.x (the lockfile is npm-format; `npm ci` is the install command)
- **Docker** + Docker Compose v2 (for prod-like local + production)
- A PostgreSQL 16 instance (Docker provides one; or BYO)

## First-time setup

```bash
git clone https://github.com/jonmaxmore/est-website.git
cd est-website
cp .env.example .env

# Open .env and at minimum set:
#   POSTGRES_PASSWORD     (any strong password for local dev)
#   REDIS_PASSWORD        (any strong password for local dev)
#   NUXT_SESSION_PASSWORD (32+ chars, e.g. `openssl rand -hex 32`)
#   ANALYTICS_IP_SALT     (32 chars)
#   ADMIN_SEED_EMAIL      (your email)
#   ADMIN_SEED_PASSWORD   (12+ chars)

npm install                  # postinstall runs `nuxt prepare && prisma generate`
docker compose up -d postgres redis  # bring up just the deps
npx prisma migrate deploy    # apply all migrations to the local DB
npm run db:seed              # insert initial CMS content + seed admin user
npm run dev                  # site at http://localhost:3000, admin at /admin
```

Login at http://localhost:3000/admin with the email/password you put in `.env`.

## Environment variables (TL;DR)

Required: `DATABASE_URL`, `POSTGRES_*`, `REDIS_PASSWORD`, `REDIS_URL`,
`NUXT_SESSION_PASSWORD`, `ANALYTICS_IP_SALT`, `WEBHOOK_SECRET`,
`ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `INTEGRATION_EXPORT_TOKEN`.

Optional (feature-gated, no-op when unset): `SENTRY_DSN`, `NUXT_PUBLIC_SENTRY_DSN`,
`SLACK_ALERT_WEBHOOK_URL`, `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `BACKUP_S3_BUCKET`,
`BACKUP_GPG_PASSPHRASE`, `S3_SSE`, GA/GTM/Meta Pixel IDs.

Full list with descriptions: [`.env.example`](.env.example) (dev) and
[`.env.production.example`](.env.production.example) (prod).

## Common scripts

| Command | What it does |
|---|---|
| `npm run dev` | Nuxt dev server with HMR (port 3000) |
| `npm run build` | Production build → `.output/` |
| `npm run preview` | Run the production build locally |
| `npm run lint` | ESLint on all `.ts` + `.vue` |
| `npm run lint:fix` | Auto-fix where possible |
| `npm run format` | Prettier write |
| `npm run test:node` | Unit tests (`tests/cms/*.test.ts` via `tsx --test`) |
| `npm run test:e2e` | Playwright e2e (requires running dev server) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run db:migrate` | Create + apply a new migration in dev |
| `npm run db:deploy` | Apply existing migrations (prod) |
| `npm run db:status` | Show pending migrations |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Open Prisma Studio |

## Project layout

```
app/
  components/
    admin/      → admin-only Vue components (forms, modals, toolbar)
    site/       → public-site components (nav, footer, banners)
    organisms/  → big page-level components (hero, CTA section)
  composables/  → useTracking, useConsent, useLocalizedField, …
  layouts/      → admin.vue, default.vue, blank.vue
  pages/        → public + /admin routes (Nuxt file-based routing)
  shared/
    cms/        → pure-function helpers shared between app + server
    constants/  → admin-nav, api endpoints, seo, limits, …
    tracking/   → event taxonomy
  plugins/      → tracking.client.ts, sentry.client.ts
  utils/        → small client-only utils
server/
  api/          → Nitro API handlers (REST under /api/*)
  middleware/   → admin-auth, csrf, request-id, track-pageview
  plugins/      → sentry.ts
  routes/       → custom routes (sitemap.xml, news/feed.xml, robots.txt)
  utils/        → logger, prisma, redis, sanitize, privacy, schemas, …
prisma/
  schema.prisma → single source of truth for the DB model
  migrations/   → auto-generated Prisma migrations (forward-only)
  seed.ts       → idempotent seed for first-deploy + dev
docker/         → Dockerfile (multi-stage) + nginx config
e2e/            → Playwright specs (admin/, api/, pages/, smoke/)
tests/cms/      → unit tests via node:test
i18n/locales/   → en.json, th.json
docs/           → operational runbooks (PRODUCTION-OPS, RESTORE-RUNBOOK,
                  OBSERVABILITY, SECURITY-OPS, AUDIT-CHANGES)
public/         → static assets (logo, favicon, hero images)
scripts/        → backup-db.sh, finish-deploy.sh, etc.
```

## Documentation

- [docs/PRODUCTION-OPS.md](docs/PRODUCTION-OPS.md) — first-deploy, rollback, security checklist
- [docs/RESTORE-RUNBOOK.md](docs/RESTORE-RUNBOOK.md) — DB restore procedure
- [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md) — log shipper / uptime / Sentry / Slack setup
- [docs/SECURITY-OPS.md](docs/SECURITY-OPS.md) — secret rotation, incident response
- [docs/AUDIT-CHANGES.md](docs/AUDIT-CHANGES.md) — historical audit fixes log
- [CONTRIBUTING.md](CONTRIBUTING.md) — branching model, PR checklist
- [CHANGELOG.md](CHANGELOG.md) — version log

## Troubleshooting

**`prisma generate` fails on `npm install`** — make sure `prisma` is in
`devDependencies` (it is). Try `rm -rf node_modules && npm ci`.

**`docker compose up` says `POSTGRES_PASSWORD is required`** — the compose
file uses `${VAR:?msg}` to fail-closed; set it in `.env`.

**Nginx redirects to HTTPS but TLS isn't set up yet** — until `setup-ssl.sh`
runs, the bundled `default.conf` is HTTP-only. Run `bash setup-ssl.sh` on the
production host once the domain is pointed at the server.

**Admin layout looks broken after a fresh checkout** — run
`npx nuxt prepare` (the `postinstall` script does this; if you ran with
`--ignore-scripts`, do it manually).

## License

Proprietary. © 2026 Eternal Tower Saga. All rights reserved.
