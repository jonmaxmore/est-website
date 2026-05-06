# Changelog

Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The git log is the source of truth — this file rolls up notable changes per release.

## Unreleased

### Added (Sprint A — security/compliance hotfix, 2026-05-05)
- Bearer-token auth + rate limit on `/api/integration/export/news` (CRM-2 critical)
- Cookie consent banner gating GA/GTM/Meta Pixel injection (M-1 + C-2 critical)
- Hashed admin IP at write time in `ActivityLog` (M-1 critical)
- `/api/health` endpoint with shallow + deep DB probe (Sr-SWE-5 critical)
- Husky pre-commit hook now active (`npx lint-staged`); `.dockerignore`
  expanded to exclude tests, docs, env files, host scripts
- HEALTHCHECK in `Dockerfile` + `docker-compose.yml` now points at `/api/health`

### Added (Sprint B — operations/DR, 2026-05-06)
- Off-site backup is now required by default; opt-out via `REQUIRE_OFFSITE_BACKUP=false`
- Optional AES-256-CBC encryption (PBKDF2) on `pg_dump` via `BACKUP_GPG_PASSPHRASE`
- `docs/RESTORE-RUNBOOK.md` — 8-step DB restore procedure + quarterly DR drill
- `docs/OBSERVABILITY.md` — log shipper / uptime monitor / Sentry / Slack setup
- Sentry SDK integration (server + browser, env-gated)
- `server/utils/alerts.ts` — Slack incoming webhook helper
- nginx now has its own healthcheck and depends on app being healthy

### Added (Sprint C — workflow/governance, 2026-05-06)
- `POST /api/auth/logout` — server-side session clear with audit log
- Failed and rate-limited login attempts are now recorded in `ActivityLog`
- Translation-completeness gate at publish: cannot ship `status=PUBLISHED`
  without both EN and TH title + content (M-4 critical)
- `startsAt` / `endsAt` exposed in admin banner UI (audit-2 C-5)
- UTM columns restored on `page_views` and `conversion_events` + parser
  reads from URL, body, and Referer header

### Added (Sprint E — retention, 2026-05-06)
- `Subscriber` table + double-opt-in newsletter signup
  (`/api/public/newsletter/subscribe`, `/confirm`, `/unsubscribe`)
- `/news/feed.xml` RSS 2.0 feed (Redis-cached, 10-min TTL)
- Footer newsletter signup form
- Resend SDK wrapper (env-gated)

### Added (Sprint F — workflow + versioning, 2026-05-06)
- `REVIEWER` role added to `AdminUser.role` enum
- `IN_REVIEW` and `SCHEDULED` statuses added to `ContentStatus` enum
- `NewsArticleRevision` model — auto-snapshots on every successful update
- `server/utils/news-scheduler.ts` — demand-triggered worker that promotes
  `SCHEDULED` articles to `PUBLISHED` once `publishedAt` has passed

### Changed (audit-1 cleanup, 2026-05-05)
- API contract standardized: 422 for Zod validation, `{success: true}` envelope,
  P2025 → 404 mapping across 5 DELETE + 4 PUT + 5 POST endpoints
- Backup import hardened: 50 MB body cap, per-resource Zod whitelist
  (mass-assignment guard), HTML sanitization across all rich-text fields,
  SSRF allowlist + 30 s timeout on import-wp
- i18n webzine ecosystem now translated (`/news`, `/news/topic`, `/news/type`)
- Last-SUPER_ADMIN race closed via `pg_advisory_xact_lock` transaction
- `admin.vue` layout split: 725 → 177 lines (extracted nav constants + CSS)
- Activity log writes are now fire-and-forget (no longer block request path)
- Deploy script no longer falls back to `prisma db push --accept-data-loss`
- `Dockerfile` uses `npm ci` instead of the silent `--frozen-lockfile || install` chain

### Removed (audit-1 cleanup, 2026-05-05)
- `app/utils/api-client.ts` (131 lines, dead wrapper, zero importers)
- `app/composables/useAdminCRUD.ts` (199 lines, dead wrapper, zero importers)
- `MarketingBanner.event` relation include in admin list (referenced removed migration)

### Refactored (Sprint G — design tokens, 2026-05-06)
- 40+ hardcoded hex colors across 24 admin files replaced with `--adm-*`
  CSS variables (W-3 audit fix)

### Added (Sprint H — privacy/security, 2026-05-06)
- DSAR endpoints — `POST /api/public/dsar/export` and `/delete` (subscriber-scoped,
  token-gated; PDPA Articles 30/33 compliance)
- HMAC body signing on `/api/integration/webhook` — `x-webhook-signature`
  `sha256=<hex>` over `<timestamp>.<rawBody>`; legacy shared-secret kept for
  back-compat with current WordPress / Wix consumers

### Added (Sprint K-L — marketing + experiments, 2026-05-06)
- `Campaign` model — first-class marketing entity; articles + banners attach
  via `campaignId` for per-campaign performance rollup
- Editorial calendar (`/admin/calendar`) — banners + articles + campaigns
  active in the selected month
- A/B feature flags via `useFeatureFlag()` composable + `feature_flags`
  siteConfig key (rollout-percentage support)
- Inline download CTA component + `news_click` / `video_play` conversion events
- Test coverage for Campaign zod, feature flags, newsletter, DSAR, RSS

### Added (Sprint M-N — infra hardening, 2026-05-06)
- SSH host-key pinning via `~/.ssh/known_hosts` in deploy scripts
- Self-hosted cert renewal + uptime probe + log shipper helpers

### Fixed (audit-3, 2026-05-06)
- 4 critical regressions caught by 45-reviewer pass (Campaign FK feature broken,
  feature-flag composable dead, migration enum-name mismatch, deploy.sh sed
  miss) (commit `cce8898`)
- 5 high-priority items: DSAR token expiry validation, stale unsubscribeToken
  on re-subscription, email throws in production when `RESEND_API_KEY` missing,
  schema indexes for hot queries, admin i18n holdouts (commit `38c56d0`)

### Added (Sprint A — audit-3 deferred close-out, 2026-05-06)
- `enum SubscriberStatus { PENDING | CONFIRMED | UNSUBSCRIBED }` — typed FK
  replaces free-form String column
- Lifecycle retention crons: `NewsArticleRevision` 365d, orphan PENDING
  subscribers 14d, UNSUBSCRIBED tombstones 90d
- Translation gate is now DB-aware on PUT — body-only `{ status: PUBLISHED }`
  cannot publish an article that is missing one of the 4 bilingual fields in DB
- Public select-field whitelists on `/news/[slug]`, `/pages/[...slug]`, and
  `/webzine/landing` (drop `createdById` / `updatedById` / internal flags)
- Banner reconciler treats `startsAt: null` as "start now" (was stranded in
  SCHEDULED forever)
- Logout audit row uses `logSecurityEvent` with eager-snapshotted user info
  (was lost via async-IIFE race after `clearUserSession`)
- Webhook handler reads raw body once and reuses for both HMAC verify and
  JSON parse (no h3 cache dependency)
- `parsePagination()` + `paginated()` helpers adopted by `/admin/news` and
  `/admin/activity` (was inline math)
- `/api/health?deep=1` issues a real `redis.PING` with 1.5 s timeout (was
  reading a cached boolean)
- `backup-db.sh` integrity check: `gzip -t` + `pg_dump` trailer presence
  before declaring success
- Maintenance-mode middleware — `siteConfig.maintenance.enabled` now returns
  503 + bilingual page (or JSON for `/api`); bypasses `/admin`, authenticated
  sessions, and `MAINTENANCE_BYPASS_TOKEN` header
- a11y: `AdminConfirmDialog` focus trap + Escape + ARIA + focus restoration;
  `AdminToast` aria-live + role="alert"/"status"; `CookieConsent` role
  correction; chevron buttons get aria-labels
- Hex holdouts in 3 site components replaced with `--color-*` tokens
- `toLocaleString('en-US')` in admin analytics/index/milestones now derives
  BCP 47 from active i18n locale

## 2026-05-05 — pre-audit baseline

See git history before commit `0be51a4` for the prior state.
The baseline carried known issues from audit-1 (10-reviewer carpet audit);
the cleanup PR closes 13 critical findings + ~80% of major findings.
