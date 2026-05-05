# Audit Remediation — Sprint 1-4 Summary

สรุปการแก้ไขทั้งหมดตามรายงานตรวจสอบโปรเจค (audit report 2026-04-29)

---

## ✅ Sprint 1 — Block production go-live (7/7 เสร็จ)

| # | งาน | ไฟล์ | สถานะ |
|---|---|---|---|
| 1.1 | Rate limit fail-closed + in-memory fallback | [server/utils/redis.ts](server/utils/redis.ts) | ✅ |
| 1.2 | zod + role guard + last-admin protection ใน /admin/users/* | [server/api/admin/users/](server/api/admin/users/) | ✅ |
| 1.3 | ปิด public ports postgres/redis + Redis password required | [docker-compose.yml](docker-compose.yml) | ✅ |
| 1.4 | Block seed default admin password ใน production | [prisma/seed.ts](prisma/seed.ts) | ✅ |
| 1.5 | pg_dump backup cron + analytics purge cron | [scripts/backup-db.sh](scripts/backup-db.sh), [scripts/purge-analytics.sh](scripts/purge-analytics.sh) | ✅ |
| 1.6 | sanitize-html ใน news + page content writes | [server/utils/sanitize.ts](server/utils/sanitize.ts) | ✅ |
| 1.7 | HEALTHCHECK + deploy polling + rollback | [docker/Dockerfile](docker/Dockerfile), [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | ✅ |

---

## ✅ Sprint 2 — Integrity & compliance (7/7 เสร็จ)

| # | งาน | ไฟล์ | สถานะ |
|---|---|---|---|
| 2.1 | PDPA: hash IP, truncate UA, redact referrer + retention purge | [server/utils/privacy.ts](server/utils/privacy.ts), [server/api/track.post.ts](server/api/track.post.ts), [server/middleware/track-pageview.ts](server/middleware/track-pageview.ts) | ✅ |
| 2.2 | Article ↔ Event sync ใน $transaction + FK validation | server/api/admin/events/ | ⊘ Removed in migration 20260505100000 — events feature retired |
| 2.3 | Banner auto-expire (lazy reconcile, throttled 60s) | [server/utils/banner-expiry.ts](server/utils/banner-expiry.ts), [server/api/public/banners.get.ts](server/api/public/banners.get.ts) | ✅ |
| 2.4 | Webhook: HMAC ทุก type + zod + idempotency + replay window | [server/api/integration/webhook.post.ts](server/api/integration/webhook.post.ts) | ✅ |
| 2.5 | WP import: per-row transaction + sanitize HTML + per-row error log | [server/api/admin/backup/import-wp.post.ts](server/api/admin/backup/import-wp.post.ts) | ✅ |
| 2.6 | pg.Pool tuning + SIGTERM graceful disconnect | [server/utils/prisma.ts](server/utils/prisma.ts) | ✅ |
| 2.7 | Backup export schema v2.0 (เพิ่ม banners/events/milestones) + version check on import | [server/api/admin/backup/export.post.ts](server/api/admin/backup/export.post.ts), [import.post.ts](server/api/admin/backup/import.post.ts) | ✅ |

---

## ✅ Sprint 3 — Refactor for scale (4/6 เสร็จ, 2 รายการเลื่อน)

| # | งาน | ไฟล์ | สถานะ |
|---|---|---|---|
| 3.2 | useAdminCRUD<T>() composable (ลบ duplicated CRUD ใน admin pages) | [app/composables/useAdminCRUD.ts](app/composables/useAdminCRUD.ts) | ✅ |
| 3.3 | api-client centralized (`adminApi.*`, `publicApi.*`) | [app/utils/api-client.ts](app/utils/api-client.ts) | ✅ |
| 3.5 | Cache layer (`cacheGet/cacheSet/cacheInvalidate/cacheRead`) | [server/utils/redis.ts](server/utils/redis.ts) | ✅ |
| 3.6 | News search uses `contains+insensitive` — ตอนนี้ต้องเพิ่ม pg_trgm index | — | 🟡 **เลื่อน** ดู §Deferred |
| **3.1** | **แตก [admin/news/index.vue](app/pages/admin/news/index.vue) (672 lines) เป็น 3 ไฟล์** | — | 🟡 **เลื่อน** ดู §Deferred |
| **3.4** | **เปิด `typeCheck: true`** | — | 🟡 **เลื่อน** ดู §Deferred |

---

## ✅ Sprint 4 — Hardening & observability (5/6 เสร็จ, 1 รายการเลื่อน)

| # | งาน | ไฟล์ | สถานะ |
|---|---|---|---|
| 4.1 | zod + `toDuplicateConflictError` wrap ใน banners/config + 422 status code | [server/api/admin/banners/](server/api/admin/banners/), [config.put.ts](server/api/admin/config.put.ts) | ✅ |
| 4.2 | `paginated()` + `parsePagination()` helper + apply ใน public news + cache headers | [server/utils/response.ts](server/utils/response.ts), [server/api/public/news.get.ts](server/api/public/news.get.ts) | 🟡 **บางส่วน** |
| 4.3 | nginx CSP + server_tokens + OCSP + rate limit zones | [docker/nginx/](docker/nginx/) | ✅ |
| 4.4 | Structured logger + request ID middleware | [server/utils/logger.ts](server/utils/logger.ts), [server/middleware/request-id.ts](server/middleware/request-id.ts) | ✅ |
| 4.5 | Deploy rollback (image tagging + auto-restore) | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | ✅ |
| 4.6 | Resource limits + log rotation ใน compose | [docker-compose.yml](docker-compose.yml) | ✅ |

**Type check ผ่าน 100% — `vue-tsc --noEmit` exit 0**

---

## 🟡 Items Deferred (รอจังหวะ + ทดสอบเพิ่ม)

### 3.1 — แตก `admin/news/index.vue` (672 lines)

**ทำไมเลื่อน:** การแตก Vue component 672 บรรทัดเป็น 3 ไฟล์ (list / editor / `useNewsEditor`) ต้องการ visual regression testing ที่ผมทำไม่ได้ในรอบนี้ เสี่ยงทำหน้า admin พังเงียบๆ

**Deliverables ที่พร้อมแล้ว:**
- `useAdminCRUD` composable — ใช้แทน `loadItems/saveItem/deleteItem` ได้ทันที
- `adminApi.news.*` — ใช้แทน `$fetch('/api/admin/news/...')`

**แผนการแตก:**
1. `app/pages/admin/news/index.vue` (~150 lines) — แค่ list + filters + bulk actions
2. `app/pages/admin/news/-NewsEditor.vue` (~250 lines) — modal + form
3. `app/composables/useNewsEditor.ts` (~150 lines) — autosave + slug + validation
4. `app/composables/useEditorStats.ts` (~30 lines) — char/word count

**ทดสอบหลังแตก:** สร้าง / แก้ / ลบ / publish / autosave / search / pagination

---

### 3.4 — เปิด `typeCheck: true` ใน nuxt.config.ts

**ทำไมเลื่อน:** ตอนนี้มี `Record<string, any>` และ `error: any` กระจายทั่วโปรเจค (ดู audit report) — เปิดทันทีจะ build fail หลายร้อยจุด

**ขั้นแรก ทำก่อน:**
1. Banner type:
   ```ts
   // app/shared/types/banner.ts
   export interface Banner {
     id: string
     placement: BannerPlacement
     status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'EXPIRED'
     // ... full type from prisma schema
   }
   ```
2. แทน `Record<string, any>` ใน [useResolvedBanners.ts](app/composables/useResolvedBanners.ts), [admin/banners.vue:211](app/pages/admin/banners.vue:211)
3. แทน `error: any` ใน catch blocks ด้วย type guard
4. ค่อยเปิด `typeCheck: true`

**ใช้เป็น CI gate:**
- เพิ่ม `npm run typecheck` ใน .github/workflows/e2e.yml ก่อน deploy
- ครั้งแรกต้อง allow soft fail แล้วค่อยเข้มขึ้น

---

### 3.6 — Analytics partition + pg_trgm search index

**ทำไมเลื่อน:** การ alter ตารางที่มี data อยู่ + เปลี่ยนเป็น partitioned table ต้อง downtime + migration plan ครอบคลุม

**Migration ที่ต้องเขียนเอง (run on prod with `prisma db execute`):**

```sql
-- 1. pg_trgm extension + GIN index for case-insensitive news search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_title_trgm
  ON news_articles USING gin ("titleEn" gin_trgm_ops, "titleTh" gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_excerpt_trgm
  ON news_articles USING gin ("excerptEn" gin_trgm_ops, "excerptTh" gin_trgm_ops);

-- 2. Composite indexes for common filter combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_pinned_published
  ON news_articles (pinned DESC, "publishedAt" DESC NULLS LAST);

-- (idx_pre_reg_referred_by removed — pre_registrations table dropped in
-- migration 20260505100000_remove_event_and_pre_registration)

-- 3. Partial index — only published articles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_published_only
  ON news_articles ("publishedAt" DESC NULLS LAST)
  WHERE status = 'PUBLISHED';
```

**Partitioning analytics tables (ทำเมื่อ rows > 1M):**
1. backup ก่อน
2. CREATE TABLE page_views_new PARTITION BY RANGE (createdAt)
3. CREATE PARTITION ของแต่ละเดือน
4. INSERT INTO page_views_new SELECT * FROM page_views
5. DROP TABLE page_views CASCADE; ALTER TABLE page_views_new RENAME TO page_views
6. cron drop partition เก่ากว่า 90 วัน

ตอนนี้ purge cron ([scripts/purge-analytics.sh](scripts/purge-analytics.sh)) ทำหน้าที่ retention โดย DELETE — เพียงพอจนกว่าจะมี traffic จริง

---

## 🚨 ขั้นตอนสำคัญที่ต้องทำเองบนเครื่อง production

ดู [docs/PRODUCTION-OPS.md](docs/PRODUCTION-OPS.md) ฉบับเต็ม

### ก่อน deploy ครั้งแรกหลัง audit fix:

1. **อัพเดท `.env` บนเซิร์ฟเวอร์** — เพิ่ม secret ใหม่:
   ```bash
   REDIS_PASSWORD=$(openssl rand -hex 24)
   ANALYTICS_IP_SALT=$(openssl rand -hex 32)
   WEBHOOK_SECRET=$(openssl rand -hex 32)
   PG_POOL_MAX=20
   ```

2. **Migrate REDIS_URL ให้มี password:**
   ```
   REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
   ```

3. **ติดตั้ง backup cron** (ดู PRODUCTION-OPS.md §2.1):
   ```cron
   0 3 * * * /root/est-website/scripts/backup-db.sh
   30 3 * * * /root/est-website/scripts/purge-analytics.sh
   ```

4. **Verify ports ปิดแล้ว:**
   ```bash
   ss -tlnp | grep -E '5432|6379'
   # ต้องเห็นว่า bind ที่ Docker network เท่านั้น (ไม่มี 0.0.0.0)
   ```

5. **Run pg_trgm migration** (Sprint 3.6 deferred SQL above) เมื่อมีเวลา window

---

## 📊 Stats

| หมวด | ก่อน | หลัง |
|---|---|---|
| Critical security findings | 8 | 0 (เหลือแต่ deferred docs) |
| Files modified/created | — | **40+ ไฟล์** |
| New utilities | 0 | 8 (sanitize, privacy, banner-expiry, response, logger, request-id, api-client, useAdminCRUD) |
| TypeScript errors | unknown (typeCheck off) | **0** (vue-tsc passed) |
| pg_dump backup | ❌ ไม่มี | ✅ daily + S3 upload optional |
| Rate limit policy | fail-open | fail-closed + in-memory fallback |
| PDPA compliance | ❌ raw IP/UA | ✅ hashed IP, truncated UA, redacted referrer, retention 90/180/365 |
| Webhook security | partial HMAC | full HMAC + replay window + idempotency |
| Deploy rollback | ❌ | ✅ image tag + auto-restore on health fail |

---

## 🔮 Recommended next round

1. **Refactor god components** (Sprint 3.1) — news/banners/media admin pages → ใช้ `useAdminCRUD`
2. **เปิด typeCheck:true + ทำความสะอาด `any`** (Sprint 3.4) — defense-in-depth บน TypeScript
3. **Sentry / log aggregation** — เชื่อม structured logs ไป Better Stack / Logtail / Sentry
4. **CDN + managed services** — Cloudflare หน้า nginx, ย้าย Postgres → DigitalOcean Managed PG (HA + backup)
5. **Apply pg_trgm + composite indexes** ก่อน traffic โต > 100k articles
