# Admin Tools Coverage Map

สรุปว่า admin tools ครอบคลุมระบบทั้งหมดของ EST Website แค่ไหน + by-design patterns

อ้างอิงเดิม: รายงาน audit 2026-04-30
อัปเดตล่าสุด: 2026-05-05 (post-launch cleanup — ลบ Event + PreRegistration ใน PR #29; เพิ่ม `DELETE /api/admin/pages/[key]` ใน PR #31)

---

## ✅ Coverage Matrix

| Model | List | Get | Create | Update | Delete | Admin Page | Status |
|---|---|---|---|---|---|---|---|
| AdminUser | ✅ | — | ✅ | ✅ | ✅ | [users.vue](../app/pages/admin/users.vue) | ครบ (SUPER_ADMIN-only) |
| NewsArticle | ✅ | — | ✅ | ✅ | ✅ | [news/index.vue](../app/pages/admin/news/index.vue) | ครบ |
| MediaAsset | ✅ | ✅ | ✅ (upload) | ✅ patch | ✅ | [media.vue](../app/pages/admin/media.vue) | ครบ |
| Weapon | ✅ | — | ✅ | ✅ | ✅ | [weapons.vue](../app/pages/admin/weapons.vue) | ครบ |
| Feature | ✅ | — | ✅ | ✅ | ✅ | [features.vue](../app/pages/admin/features.vue) | ครบ |
| Highlight | ✅ | — | ✅ | ✅ | ✅ | [highlights.vue](../app/pages/admin/highlights.vue) | ครบ |
| Milestone | ✅ | — | ✅ | ✅ | ✅ | [milestones.vue](../app/pages/admin/milestones.vue) | ครบ |
| MarketingBanner | ✅ | — | ✅ | ✅ | ✅ | [banners.vue](../app/pages/admin/banners.vue) | ครบ |
| PageContent | ✅ | ✅ | ✅ | ✅ | ✅ (ห้ามลบ system pages) | [pages.vue](../app/pages/admin/pages.vue) | ครบ |
| SiteConfig | ✅ | ✅ | — | ✅ (upsert) | — | settings/menus/seo/integrations/faq/topics | ครบ (ผ่าน upsert) |
| ActivityLog | ✅ | — | (auto) | — | — | [activity.vue](../app/pages/admin/activity.vue) | Read-only — เขียนผ่าน `logActivity()` ใน mutation handlers |

**Removed at official launch (PR #29):**
- `GameEvent` (model + admin page + API + 'event_page'/'event'/'EVENT' enum values)
- `PreRegistration` (model + admin page + /api/register + Platform/Region enums)

**Summary:** 11 active models, ~50 admin endpoints, ครอบคลุมทุก content type ที่ schema มี

---

## 🧠 By-design patterns (อย่าเพิ่ง refactor)

These look like missing features at first glance but are intentional choices.

### 1. `Topic` + `FAQ` — array-as-config, ไม่มี per-row CRUD endpoint
ทั้งคู่เก็บใน `siteConfig` (key = `webzine_topics`, `faq`) เป็น JSON array
ไม่ใช่ table แยก. หน้า admin/topics + admin/faq อ่านทั้ง array, แก้ใน
memory, แล้ว PUT ทั้งก้อนกลับไปที่ `/api/admin/config`. ผลคือ:
- ไม่มี `DELETE /api/admin/topics/:id` (ลบ = filter out + PUT)
- ไม่มี `POST /api/admin/topics` (เพิ่ม = push + PUT)
- เหมาะกับ list ที่สั้น (< ~30 รายการ) และไม่มี FK relation

ถ้าต้อง scale เกิน ~50 รายการ หรือต้อง relation ที่มี FK ค่อยย้ายเป็น
table จริง.

### 2. `MarketingBanner.targetType` ↔ `target*` field consistency
รับประกันโดย Zod (`server/utils/marketing-banners.ts:parseMarketingBannerPayload`)
ไม่ใช่ DB constraint. กล่าวคือ:
- `targetType='article'` → ต้องส่ง `targetArticleId`
- `targetType='page'` → ต้องส่ง `targetPageKey`
- `targetType='url'` → ต้องส่ง `targetUrl`

ระดับ DB columns ทั้ง 3 nullable + ไม่มี check constraint cross-column.
ทุกการเขียนผ่าน admin/webhook ผ่าน Zod อยู่แล้ว เลยไม่เพิ่มความซับซ้อน
ของ migration. ถ้าจะ tighten ในอนาคต ใช้ Postgres `CHECK` คู่กับ
`ALTER TABLE` แต่ enum-aware check + nullable mix ทำได้ลำบากมากใน Prisma.

### 3. `POST /api/integration/webhook` — last-write-wins on `slug`
Webhook ingress รับ news article จาก upstream (WordPress, Wix, …) แล้ว
upsert by `slug`. ถ้ามี 2 source ส่ง slug เดียวกัน, source ที่มาทีหลัง
ทับ source แรกแบบเงียบ. การออกแบบนี้เลือกเพราะ:
- slug ของ ETS เป็น URL path (unique, stable) — ผู้ดูแลเป็นคนเลือก
- ถ้าจะ "merge" จาก 2 source ต้องเลือกกฎ (ใครชนะ, รวม field ไหน)
- ปัจจุบัน upstream แต่ละตัวมี secret + role แยก (ดู
  `server/utils/admin-config.ts` integrationsSchema) ไม่ใช่ pattern free-for-all

ถ้าต้องการแยก source ในอนาคต ให้เพิ่ม `source` column (`'wordpress'` /
`'wix'` / `'manual'`) แล้วเปลี่ยน upsert key เป็น `(source, sourceId)`
แทน `slug`.

### 4. `MarketingBanner` per-key RBAC ใน `/api/admin/config` (PR #36)
EDITOR แก้ navigation/seo/social/appearance/homepage_sections/
webzine_topics/faq/download_page ได้, แต่ `integrations` + `maintenance`
ต้อง SUPER_ADMIN. การ gate อยู่ใน handler (`config.put.ts`) ไม่ใช่
middleware path-match เพราะ path เดียวกัน (`/api/admin/config`) ใช้กับ
ทุก key.

---

## 🛠️ Admin Components ที่มีอยู่แล้ว (พร้อมใช้)

ใน [app/components/admin/](app/components/admin/):

| Component | จุดประสงค์ |
|---|---|
| **AdminCommandPalette** | Cmd+K palette ค้นหา + navigate ทุกหน้า admin |
| **AdminBreadcrumb** | path navigation ใน topbar |
| **AdminConfirmDialog** | dialog ยืนยันก่อน destructive action |
| **AdminEmptyState** | placeholder state ตอนยังไม่มีข้อมูล |
| **AdminStatusBadge** | DRAFT/PUBLISHED/etc status pills |
| **AdminToast** | notification toasts |
| **ContentLanguageTabs** | TH/EN tab switcher สำหรับ i18n content |
| **DateTimeRangePicker** | startsAt/endsAt picker (banners, events) |
| **MediaPicker** | media library picker (สำหรับ image fields) |
| **RichTextEditor** | Tiptap WYSIWYG editor |

ใน [app/composables/](app/composables/):

| Composable | จุดประสงค์ |
|---|---|
| **useAdminCRUD<T>** | generic CRUD logic ที่ใช้ซ้ำได้ทุกหน้า list |
| **useAdminMediaUpload** | XHR upload with progress |
| **useAdminToast** | toast notifications |

---

## 🏗️ Information Architecture (Sidebar 5 sections)

ดู [app/layouts/admin.vue](app/layouts/admin.vue):

```
DASHBOARD
  ├─ Dashboard
  └─ Analytics

CONTENT (เนื้อหา publishable)
  ├─ Homepage
  ├─ Webzine Articles
  ├─ Topics
  ├─ Banner Control
  ├─ Weapons
  ├─ Features
  ├─ Highlights
  ├─ Milestones
  ├─ Download Page
  ├─ FAQ
  ├─ Pages
  └─ Media

APPEARANCE
  ├─ Navigation
  ├─ Theme
  └─ SEO

SYSTEM (เฉพาะ SUPER_ADMIN)
  ├─ Users
  ├─ Integrations
  ├─ Activity Log
  ├─ Backup
  └─ Settings
```

ตรงตาม research best practice ของ Strapi/Payload/Sanity (5 top-level groups).

---

## 🎯 Top 5 UX Issues (จาก audit)

| # | จุด | ไฟล์ | แก้อย่างไร | effort |
|---|---|---|---|---|
| 1 | News autosave silent fail | [news/index.vue:494-507](app/pages/admin/news/index.vue:494) | retry logic + warning toast หลัง 2 ครั้ง | 2h |
| 2 | Banner conditional fields ไม่บังคับ | [banners.vue:124-161](app/pages/admin/banners.vue:124) | client-side validation ตาม scope+targetType combo | 3h |
| 3 | Selection หาย ตอน filter/page change | [news/index.vue:326](app/pages/admin/news/index.vue:326) | persist selectedIds ใน sessionStorage | 2h |
| 4 | Bulk delete ไม่บอก row ไหน fail | [media.vue:431-443](app/pages/admin/media.vue:431) | API คืน array failed IDs + retry button | 4h |
| 5 | Dashboard stats ไม่ refresh real-time | [admin/index.vue:201-208](app/pages/admin/index.vue:201) | refresh button + auto-poll toggle | 2h |

**Total:** ~13 ชั่วโมง dev สำหรับ Top 5

---

## 🚀 Top 5 Missing Features ที่น่าทำ

| # | Feature | กระทบหน้า | Business value | Effort |
|---|---|---|---|---|
| 1 | **Drag-drop reordering** (sortOrder fields) | features, highlights, weapons | จัดเรียงโดยไม่ต้องแก้ทีละ row | 4h |
| 2 | **Batch publish/unpublish** | news, pages | publish 20 articles ในครั้งเดียว | 3h |
| 3 | **Inline field edit** (double-click row) | news list | แก้ status/category ไม่ต้องเปิด modal | 5h |
| 4 | **Filter state persistence** | news, banners, media | จำ filter ระหว่าง session | 3h |
| 5 | **Live preview iframe** ตอนแก้ page | pages | เห็น page ที่ render จริงข้างๆ form | 6h |

**Total:** ~21 ชั่วโมง dev

---

## 📐 Banner UX Simplification Plan

ปัจจุบัน 7 placements × 8 scopes = 56 combos ที่ admin ต้องเลือกถูก

**Recommendation:** 3-step wizard

1. **Step 1 — Visual placement picker**: thumbnail หน้าเว็บ + hotspot overlays
2. **Step 2 — Scope cascading**: dropdown filtered ตาม placement (ลด combos จาก 56 → 3-5 ต่อ click)
3. **Step 3 — Content + live preview**: form + iframe preview

ระบบ preset templates ที่เพิ่มไว้แล้ว ([app/shared/cms/marketing-banners.ts](app/shared/cms/marketing-banners.ts) — `BANNER_PRESETS` 8 ตัว) — รอทำ UI

---

## ⚠️ Limitations ของ admin ตอนนี้

1. **News editor 672 บรรทัด** — ใหญ่เกินไป ควรแตกเป็น list / editor / composable (Sprint 3 deferred)
2. **typeCheck: false** ใน nuxt.config — มี `Record<string, any>` หลายจุด (Sprint 3 deferred)
3. **Translation queue** — ไม่มีหน้ารวม "บทความที่ EN ยังไม่เสร็จ" (suggestion future)
4. **Live preview** — ไม่มี iframe preview เหมือน Sanity Studio (suggestion future)
5. **Email campaigns** — ยังไม่มี module (มี registrations data พร้อมส่งแล้ว, แต่ไม่มี UI broadcast)

---

## 🎯 Recommended Next Sprint

**Priority 1 (1 week)** — UX safety nets
- News autosave error handling + retry (2h)
- Banner conditional field validation (3h)
- Dashboard refresh button + auto-poll (2h)
- Selection persistence (2h)

**Priority 2 (1-2 weeks)** — Workflow accelerators
- Drag-drop reordering (4h)
- Batch publish/unpublish (3h)
- Filter state persistence (3h)

**Priority 3 (planned)** — Power-user features
- Inline editing (5h)
- Live preview iframe (6h)
- Translation queue page (4h)
- Banner visual placement picker (8h)

**Total scoped work:** ~42 hours (~1 sprint)
