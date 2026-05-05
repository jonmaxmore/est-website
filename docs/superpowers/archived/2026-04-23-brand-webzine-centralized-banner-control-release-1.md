# Brand Webzine and Centralized Banner Control Release 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Release 1 of the approved brand-webzine and centralized banner-control system on top of the existing Nuxt CMS, using the current news, events, config, media, and activity-log foundations.

**Architecture:** Extend `NewsArticle` and `GameEvent` with lightweight webzine and campaign-linking fields, introduce a dedicated `MarketingBanner` model plus shared resolver utilities, and keep topic taxonomy in `SiteConfig.webzine_topics` for a controlled v1 registry. Public rendering should preserve existing `/news` routes while expanding them into a real webzine hub, and admin work should stay inside the current admin shell with dedicated Topics and Banner Control pages.

**Tech Stack:** Nuxt 4, Vue 3, Nitro/H3, Prisma/PostgreSQL, Zod, `tsx --test`, Playwright, `sanitize-html`

---

## File Map

### New files

- `app/shared/cms/webzine.ts` - webzine content-type constants, topic normalization, and reading-time helpers
- `app/shared/cms/marketing-banners.ts` - banner placement and scope registries plus placement-config normalization
- `app/shared/cms/admin-dashboard.ts` - dashboard queue helpers for webzine and banner status summaries
- `server/utils/marketing-banners.ts` - Zod-backed payload parsers for banner APIs
- `server/utils/banner-resolver.ts` - banner scope matching and winner selection
- `server/api/admin/banners/index.get.ts` - admin list endpoint for banners
- `server/api/admin/banners/index.post.ts` - admin create endpoint for banners
- `server/api/admin/banners/[id].put.ts` - admin update endpoint for banners
- `server/api/admin/banners/[id].delete.ts` - admin delete endpoint for banners
- `server/api/public/webzine/landing.get.ts` - aggregated landing payload for `/news`
- `server/api/public/banners.get.ts` - placement-aware public banner resolver endpoint
- `app/composables/useResolvedBanners.ts` - client fetch wrapper for current route banner surfaces
- `app/components/site/MarketingBannerSlot.vue` - placement renderer for announcement bar, popup, floating, sidebar, article inline, homepage inline, and footer strip
- `app/components/site/WebzineArticleCard.vue` - reusable article card for landing, type, topic, and related-content sections
- `app/pages/admin/topics.vue` - admin page for `webzine_topics`
- `app/pages/admin/banners.vue` - admin page for centralized banner management
- `app/pages/news/type/[contentType].vue` - public content-type listing page
- `app/pages/news/topic/[topicKey].vue` - public topic listing page
- `tests/cms/webzine.test.ts` - shared webzine helper coverage
- `tests/cms/marketing-banners.test.ts` - shared banner helper coverage
- `tests/cms/marketing-banner-payloads.test.ts` - server payload parser coverage for banner writes
- `tests/cms/banner-resolver.test.ts` - banner winner-selection and scope-matching coverage
- `tests/cms/admin-dashboard.test.ts` - dashboard queue summary coverage
- `e2e/pages/webzine.spec.ts` - public webzine landing, topic, article, and banner behavior
- `e2e/admin/banner-control.spec.ts` - admin topics and banner-control flow

### Existing files to modify

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `server/utils/admin-config.ts`
- `server/api/admin/config.get.ts`
- `server/api/admin/config.put.ts`
- `server/api/admin/news/index.get.ts`
- `server/api/admin/news/index.post.ts`
- `server/api/admin/news/[id].put.ts`
- `server/api/admin/events/index.get.ts`
- `server/api/admin/events/index.post.ts`
- `server/api/admin/events/[id].put.ts`
- `server/api/admin/stats.get.ts`
- `server/api/public/news.get.ts`
- `server/api/public/news/[slug].get.ts`
- `server/api/public/site.get.ts`
- `app/pages/admin/news/index.vue`
- `app/pages/admin/events.vue`
- `app/pages/admin/index.vue`
- `app/layouts/admin.vue`
- `app/components/admin/AdminCommandPalette.vue`
- `app/pages/news/index.vue`
- `app/pages/news/[slug].vue`

## Scope Notes

- This plan implements **Release 1 only** from the approved design.
- Use `prisma/seed.ts` for fixtures needed by tests. Do not rely on `scripts/seed-content.mjs`, which already has unrelated local modifications.
- Admin Playwright flows require a real `TEST_ADMIN_PASSWORD` in `.env.test`. If it stays as `change-me`, those specs should skip locally and run in CI or a configured environment instead.
- If the local machine still has no standalone database, point Prisma and the local Nuxt server at the connected dev database before running the migration and UI verification steps.

### Task 1: Add Shared Webzine and Banner Contracts, Then Extend the Prisma Schema

**Files:**
- Create: `app/shared/cms/webzine.ts`
- Create: `app/shared/cms/marketing-banners.ts`
- Create: `tests/cms/webzine.test.ts`
- Create: `tests/cms/marketing-banners.test.ts`
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Write the failing helper tests**

```ts
// tests/cms/webzine.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  WEBZINE_CONTENT_TYPES,
  estimateReadingTimeMinutes,
  normalizeWebzineTopics,
} from '../../app/shared/cms/webzine'

describe('webzine helpers', () => {
  it('exposes the approved release-1 content pillars', () => {
    assert.deepEqual(WEBZINE_CONTENT_TYPES, [
      'ANNOUNCEMENT',
      'EVENT',
      'PATCH_NOTES',
      'GUIDE',
      'LORE',
      'DEV_BLOG',
    ])
  })

  it('normalizes topic registry records with stable slugs and language fallback', () => {
    const topics = normalizeWebzineTopics([
      { key: 'getting-started', slug: '', labelEn: 'Getting Started', labelTh: '', visible: true },
    ])

    assert.deepEqual(topics, [
      {
        key: 'getting-started',
        slug: 'getting-started',
        labelEn: 'Getting Started',
        labelTh: 'Getting Started',
        descriptionEn: '',
        descriptionTh: '',
        icon: '',
        color: '',
        visible: true,
      },
    ])
  })

  it('estimates reading time from sanitized word count', () => {
    assert.equal(estimateReadingTimeMinutes('<p>' + 'word '.repeat(420) + '</p>'), 3)
    assert.equal(estimateReadingTimeMinutes(''), 1)
  })
})

// tests/cms/marketing-banners.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  BANNER_PLACEMENTS,
  BANNER_SCOPES,
  normalizeBannerConfig,
} from '../../app/shared/cms/marketing-banners'

describe('marketing banner helpers', () => {
  it('exposes the approved release-1 placements and scopes', () => {
    assert.deepEqual(BANNER_PLACEMENTS, [
      'popup',
      'floating',
      'announcement_bar',
      'homepage_inline',
      'sidebar',
      'article_inline',
      'footer_strip',
    ])

    assert.deepEqual(BANNER_SCOPES, [
      'global',
      'homepage',
      'news_index',
      'article_detail',
      'topic_page',
      'event_page',
      'specific_article',
      'specific_topic',
    ])
  })

  it('normalizes popup config with sensible defaults', () => {
    assert.deepEqual(normalizeBannerConfig('popup', { delaySeconds: -10 }), {
      delaySeconds: 3,
      frequency: 'session',
      mobileEnabled: true,
    })
  })

  it('normalizes article-inline config with a minimum insertion position', () => {
    assert.deepEqual(normalizeBannerConfig('article_inline', { insertAfterParagraph: 0 }), {
      insertAfterParagraph: 2,
    })
  })
})
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run:

```bash
npx tsx --test tests/cms/webzine.test.ts tests/cms/marketing-banners.test.ts
```

Expected:

```text
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/webzine
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/marketing-banners
```

- [ ] **Step 3: Add shared helper modules and extend the Prisma schema**

```ts
// app/shared/cms/webzine.ts
import sanitizeHtml from 'sanitize-html'

export const WEBZINE_CONTENT_TYPES = [
  'ANNOUNCEMENT',
  'EVENT',
  'PATCH_NOTES',
  'GUIDE',
  'LORE',
  'DEV_BLOG',
] as const

export type WebzineContentType = (typeof WEBZINE_CONTENT_TYPES)[number]

export type WebzineTopic = {
  key: string
  slug: string
  labelEn: string
  labelTh: string
  descriptionEn?: string
  descriptionTh?: string
  icon?: string
  color?: string
  visible: boolean
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeWebzineTopics(value: Partial<WebzineTopic>[]) {
  return value.map((topic) => {
    const key = String(topic.key || '').trim()
    const labelEn = String(topic.labelEn || '').trim()
    const labelTh = String(topic.labelTh || labelEn).trim()
    const slug = slugify(String(topic.slug || key || labelEn))

    return {
      key,
      slug,
      labelEn,
      labelTh,
      descriptionEn: String(topic.descriptionEn || ''),
      descriptionTh: String(topic.descriptionTh || ''),
      icon: String(topic.icon || ''),
      color: String(topic.color || ''),
      visible: topic.visible !== false,
    }
  })
}

export function estimateReadingTimeMinutes(html: string | null | undefined) {
  const plainText = sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(words / 200))
}

// app/shared/cms/marketing-banners.ts
export const BANNER_PLACEMENTS = [
  'popup',
  'floating',
  'announcement_bar',
  'homepage_inline',
  'sidebar',
  'article_inline',
  'footer_strip',
] as const

export const BANNER_SCOPES = [
  'global',
  'homepage',
  'news_index',
  'article_detail',
  'topic_page',
  'event_page',
  'specific_article',
  'specific_topic',
] as const

export type BannerPlacement = (typeof BANNER_PLACEMENTS)[number]
export type BannerScope = (typeof BANNER_SCOPES)[number]

export function normalizeBannerConfig(placement: BannerPlacement, value: Record<string, unknown> = {}) {
  if (placement === 'popup') {
    return {
      delaySeconds: Math.max(3, Number(value.delaySeconds) || 0),
      frequency: value.frequency === 'always' ? 'always' : 'session',
      mobileEnabled: value.mobileEnabled !== false,
    }
  }

  if (placement === 'article_inline') {
    return {
      insertAfterParagraph: Math.max(2, Number(value.insertAfterParagraph) || 0),
    }
  }

  if (placement === 'floating') {
    return {
      corner: value.corner === 'bottom_left' ? 'bottom_left' : 'bottom_right',
      compact: value.compact === true,
    }
  }

  if (placement === 'announcement_bar') {
    return {
      tone: value.tone === 'warning' ? 'warning' : 'default',
      sticky: value.sticky !== false,
    }
  }

  return value
}
```

```prisma
// prisma/schema.prisma
enum WebzineContentType {
  ANNOUNCEMENT
  EVENT
  PATCH_NOTES
  GUIDE
  LORE
  DEV_BLOG
}

enum MarketingBannerPlacement {
  popup
  floating
  announcement_bar
  homepage_inline
  sidebar
  article_inline
  footer_strip
}

enum MarketingBannerStatus {
  DRAFT
  SCHEDULED
  LIVE
  EXPIRED
}

enum MarketingBannerScope {
  global
  homepage
  news_index
  article_detail
  topic_page
  event_page
  specific_article
  specific_topic
}

enum MarketingBannerTargetType {
  article
  page
  event
  url
}

model NewsArticle {
  id                 Int                 @id @default(autoincrement())
  slug               String              @unique
  titleEn            String
  titleTh            String
  excerptEn          String?
  excerptTh          String?
  contentEn          String?             @db.Text
  contentTh          String?             @db.Text
  category           NewsCategory
  contentType        WebzineContentType  @default(ANNOUNCEMENT)
  primaryTopicKey    String?
  campaignCode       String?
  linkedEventId      String?
  pinned             Boolean             @default(false)
  isEvergreen        Boolean             @default(false)
  readingTimeMinutes Int?
  status             ContentStatus       @default(DRAFT)
  featuredImage      String?
  publishedAt        DateTime?
  featureOnHome      Boolean             @default(false)
  homePriority       Int                 @default(0)
  externalUrl        String?
  openInNewTab       Boolean             @default(false)
  seoTitle           String?
  seoDesc            String?
  ogImage            String?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  linkedEvent        GameEvent?          @relation("LinkedEventForArticle", fields: [linkedEventId], references: [id], onDelete: SetNull)
  targetedBanners    MarketingBanner[]   @relation("BannerTargetArticle")

  @@index([status, publishedAt(sort: Desc)])
  @@index([contentType, status, publishedAt(sort: Desc)])
  @@index([primaryTopicKey, status, publishedAt(sort: Desc)])
  @@map("news_articles")
}

model GameEvent {
  id            String            @id @default(cuid())
  titleEn       String
  titleTh       String
  descriptionEn String?           @db.Text
  descriptionTh String?           @db.Text
  type          EventType
  status        EventStatus       @default(SCHEDULED)
  startsAt      DateTime
  endsAt        DateTime
  timezone      String            @default("Asia/Bangkok")
  multiplier    Float?
  bonusType     String?
  bannerImage   String?
  icon          String?
  color         String?
  visible       Boolean           @default(true)
  campaignCode  String?
  linkedArticleId Int?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  linkedArticle NewsArticle?      @relation("LinkedArticleForEvent", fields: [linkedArticleId], references: [id], onDelete: SetNull)
  relatedArticles NewsArticle[]   @relation("LinkedEventForArticle")
  targetedBanners MarketingBanner[] @relation("BannerTargetEvent")

  @@index([startsAt, endsAt])
  @@index([status])
  @@map("game_events")
}

model PageContent {
  key             String             @id
  slug            String?            @unique
  titleEn         String             @default("")
  titleTh         String             @default("")
  description     String?
  template        String             @default("default")
  seoTitle        String?
  seoTitleTh      String?
  seoDesc         String?
  seoDescTh       String?
  contentEn       String?            @db.Text
  contentTh       String?            @db.Text
  icon            String?
  status          ContentStatus      @default(PUBLISHED)
  showInHeader    Boolean            @default(false)
  showInFooter    Boolean            @default(false)
  headerOrder     Int                @default(0)
  footerOrder     Int                @default(0)
  isSystemPage    Boolean            @default(false)
  updatedAt       DateTime           @updatedAt
  targetedBanners MarketingBanner[]  @relation("BannerTargetPage")

  @@map("page_contents")
}

model MarketingBanner {
  id              String                    @id @default(cuid())
  placement       MarketingBannerPlacement
  status          MarketingBannerStatus     @default(DRAFT)
  scope           MarketingBannerScope
  priority        Int                       @default(0)
  campaignCode    String?
  startsAt        DateTime?
  endsAt          DateTime?
  badgeEn         String?
  badgeTh         String?
  titleEn         String
  titleTh         String
  bodyEn          String?                   @db.Text
  bodyTh          String?                   @db.Text
  desktopImage    String?
  mobileImage     String?
  targetType      MarketingBannerTargetType
  targetArticleId Int?
  targetPageKey   String?
  targetEventId   String?
  targetUrl       String?
  targetNewTab    Boolean                   @default(false)
  dismissible     Boolean                   @default(true)
  isActive        Boolean                   @default(true)
  config          Json
  createdAt       DateTime                  @default(now())
  updatedAt       DateTime                  @updatedAt
  targetArticle   NewsArticle?              @relation("BannerTargetArticle", fields: [targetArticleId], references: [id], onDelete: SetNull)
  targetPage      PageContent?              @relation("BannerTargetPage", fields: [targetPageKey], references: [key], onDelete: SetNull)
  targetEvent     GameEvent?                @relation("BannerTargetEvent", fields: [targetEventId], references: [id], onDelete: SetNull)

  @@index([placement, status, scope, priority])
  @@index([scope, startsAt, endsAt])
  @@map("marketing_banners")
}
```

- [ ] **Step 4: Run the helper tests and apply the Prisma migration**

Run:

```bash
npx tsx --test tests/cms/webzine.test.ts tests/cms/marketing-banners.test.ts
npx prisma migrate dev --name brand-webzine-banner-foundation
```

Expected:

```text
webzine.test.ts passes
marketing-banners.test.ts passes
Prisma migration applies successfully
```

- [ ] **Step 5: Commit the shared contracts and schema foundation**

```bash
git add app/shared/cms/webzine.ts app/shared/cms/marketing-banners.ts tests/cms/webzine.test.ts tests/cms/marketing-banners.test.ts prisma/schema.prisma prisma/migrations
git commit -m "feat: add brand webzine and banner data foundation"
```

### Task 2: Add Topic Registry Support, Banner Payload Validation, and Admin API Contracts

**Files:**
- Create: `server/utils/marketing-banners.ts`
- Create: `server/api/admin/banners/index.get.ts`
- Create: `server/api/admin/banners/index.post.ts`
- Create: `server/api/admin/banners/[id].put.ts`
- Create: `server/api/admin/banners/[id].delete.ts`
- Create: `tests/cms/marketing-banner-payloads.test.ts`
- Modify: `server/utils/admin-config.ts`
- Modify: `server/api/admin/config.get.ts`
- Modify: `server/api/admin/config.put.ts`
- Modify: `server/api/admin/news/index.get.ts`
- Modify: `server/api/admin/news/index.post.ts`
- Modify: `server/api/admin/news/[id].put.ts`
- Modify: `server/api/admin/events/index.get.ts`
- Modify: `server/api/admin/events/index.post.ts`
- Modify: `server/api/admin/events/[id].put.ts`
- Modify: `prisma/seed.ts`
- Modify: `tests/cms/admin-config.test.ts`

- [ ] **Step 1: Write the failing parser and config tests**

```ts
// tests/cms/admin-config.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseAdminConfigWrite } from '../../server/utils/admin-config'

describe('admin config validation', () => {
  it('accepts the controlled webzine topic registry', () => {
    const result = parseAdminConfigWrite({
      key: 'webzine_topics',
      value: [
        {
          key: 'getting-started',
          slug: 'getting-started',
          labelEn: 'Getting Started',
          labelTh: 'Getting Started',
          visible: true,
        },
      ],
    })

    assert.equal(result.key, 'webzine_topics')
    assert.equal(Array.isArray(result.value), true)
  })

  it('rejects topic records without a key', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'webzine_topics',
        value: [{ slug: 'broken', labelEn: 'Broken', labelTh: 'Broken', visible: true }],
      }),
    )
  })
})

// tests/cms/marketing-banner-payloads.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseMarketingBannerPayload } from '../../server/utils/marketing-banners'

describe('marketing banner payload parsing', () => {
  it('accepts a scheduled announcement bar pointing to an article', () => {
    const payload = parseMarketingBannerPayload({
      placement: 'announcement_bar',
      status: 'SCHEDULED',
      scope: 'global',
      priority: 10,
      titleEn: 'Launch Week',
      titleTh: 'Launch Week',
      targetType: 'article',
      targetArticleId: 1,
      startsAt: '2026-04-23T00:00:00.000Z',
      endsAt: '2026-04-30T00:00:00.000Z',
      config: { sticky: true },
    })

    assert.equal(payload.placement, 'announcement_bar')
    assert.equal(payload.targetArticleId, 1)
  })

  it('rejects scoped banners without a valid target', () => {
    assert.throws(() =>
      parseMarketingBannerPayload({
        placement: 'popup',
        status: 'LIVE',
        scope: 'specific_article',
        titleEn: 'Broken',
        titleTh: 'Broken',
        targetType: 'article',
        config: {},
      }),
    )
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npx tsx --test tests/cms/admin-config.test.ts tests/cms/marketing-banner-payloads.test.ts
```

Expected:

```text
admin-config.test.ts fails because webzine_topics is unsupported
ERR_MODULE_NOT_FOUND for ../../server/utils/marketing-banners
```

- [ ] **Step 3: Implement the topic registry parser, banner payload parser, admin API updates, and seed fixtures**

```ts
// server/utils/marketing-banners.ts
import { z } from 'zod'
import { BANNER_PLACEMENTS, BANNER_SCOPES, normalizeBannerConfig } from '../../app/shared/cms/marketing-banners'

const placementSchema = z.enum(BANNER_PLACEMENTS)
const scopeSchema = z.enum(BANNER_SCOPES)
const targetTypeSchema = z.enum(['article', 'page', 'event', 'url'])
const statusSchema = z.enum(['DRAFT', 'SCHEDULED', 'LIVE', 'EXPIRED'])

const bannerPayloadSchema = z.object({
  placement: placementSchema,
  status: statusSchema.default('DRAFT'),
  scope: scopeSchema,
  priority: z.number().int().default(0),
  campaignCode: z.string().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  badgeEn: z.string().optional().nullable(),
  badgeTh: z.string().optional().nullable(),
  titleEn: z.string().min(1),
  titleTh: z.string().min(1),
  bodyEn: z.string().optional().nullable(),
  bodyTh: z.string().optional().nullable(),
  desktopImage: z.string().optional().nullable(),
  mobileImage: z.string().optional().nullable(),
  targetType: targetTypeSchema,
  targetArticleId: z.number().int().optional().nullable(),
  targetPageKey: z.string().optional().nullable(),
  targetEventId: z.string().optional().nullable(),
  targetUrl: z.string().optional().nullable(),
  targetNewTab: z.boolean().optional().default(false),
  dismissible: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  config: z.record(z.string(), z.unknown()).optional().default({}),
})

export function parseMarketingBannerPayload(input: unknown) {
  const parsed = bannerPayloadSchema.parse(input)
  const startsAt = parsed.startsAt ? new Date(parsed.startsAt) : null
  const endsAt = parsed.endsAt ? new Date(parsed.endsAt) : null

  if (parsed.targetType === 'article' && !parsed.targetArticleId) {
    throw new Error('Article banners require targetArticleId')
  }

  if (parsed.targetType === 'page' && !parsed.targetPageKey?.trim()) {
    throw new Error('Page banners require targetPageKey')
  }

  if (parsed.targetType === 'event' && !parsed.targetEventId?.trim()) {
    throw new Error('Event banners require targetEventId')
  }

  if (parsed.targetType === 'url' && !parsed.targetUrl?.trim()) {
    throw new Error('URL banners require targetUrl')
  }

  if (parsed.scope === 'specific_article' && !parsed.targetArticleId) {
    throw new Error('specific_article scope requires targetArticleId')
  }

  if (parsed.scope === 'specific_topic' && !String(parsed.config.topicKey || '').trim()) {
    throw new Error('specific_topic scope requires config.topicKey')
  }

  if (startsAt && endsAt && endsAt <= startsAt) {
    throw new Error('Banner end time must be after start time')
  }

  return {
    ...parsed,
    startsAt,
    endsAt,
    config: normalizeBannerConfig(parsed.placement, parsed.config),
  }
}
```

```ts
// server/utils/admin-config.ts
import { normalizeWebzineTopics } from '../../app/shared/cms/webzine'

const webzineTopicSchema = z.object({
  key: z.string().min(1),
  slug: z.string().optional().default(''),
  labelEn: z.string().min(1),
  labelTh: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  descriptionTh: z.string().optional().default(''),
  icon: z.string().optional().default(''),
  color: z.string().optional().default(''),
  visible: z.boolean().default(true),
})

const webzineTopicsSchema = z.array(webzineTopicSchema)

const configParsers = {
  navigation: parseNavigationConfig,
  seo: (value: unknown) => stringRecordSchema.parse(value),
  social: (value: unknown) => stringRecordSchema.parse(value),
  appearance: (value: unknown) => stringRecordSchema.parse(value),
  maintenance: (value: unknown) => maintenanceSchema.parse(value),
  homepage_sections: (value: unknown) => ({
    sections: normalizeHomepageSections(value),
  }),
  integrations: (value: unknown) => normalizeIntegrationsConfig(value),
  event_page: (value: unknown) => normalizeEventPageConfig(value),
  download_page: (value: unknown) => normalizeDownloadPageConfig(value),
  webzine_topics: (value: unknown) => normalizeWebzineTopics(webzineTopicsSchema.parse(value)),
  faq: (value: unknown) => faqSchema.parse(value),
} satisfies Record<string, (value: unknown) => unknown>

export function readAdminConfigValue(key: string, value: unknown) {
  if (key === 'webzine_topics') {
    return normalizeWebzineTopics(webzineTopicsSchema.parse(Array.isArray(value) ? value : []))
  }

  // keep the existing key handlers unchanged below this branch
  return value
}
```

```ts
// server/api/admin/news/index.post.ts
import { z } from 'zod'
import { WEBZINE_CONTENT_TYPES, estimateReadingTimeMinutes } from '../../../app/shared/cms/webzine'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'

const newsSchema = z.object({
  titleEn: z.string().min(1),
  titleTh: z.string().min(1),
  slug: z.string().min(1),
  excerptEn: z.string().optional().nullable(),
  excerptTh: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  contentTh: z.string().optional().nullable(),
  category: z.enum(['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']),
  contentType: z.enum(WEBZINE_CONTENT_TYPES).default('ANNOUNCEMENT'),
  primaryTopicKey: z.string().optional().nullable(),
  campaignCode: z.string().optional().nullable(),
  linkedEventId: z.string().optional().nullable(),
  pinned: z.boolean().default(false),
  isEvergreen: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featuredImage: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  featureOnHome: z.boolean().default(false),
  homePriority: z.number().default(0),
  externalUrl: z.string().optional().nullable(),
  openInNewTab: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const body = newsSchema.parse(await readBody(event))

  try {
    return await prisma.newsArticle.create({
      data: {
        ...body,
        readingTimeMinutes: estimateReadingTimeMinutes(body.contentEn || body.contentTh || ''),
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      },
    })
  } catch (error) {
    throw toDuplicateConflictError(error as { code?: string; meta?: { target?: string[] | string } }, { resource: 'News article' }) ?? error
  }
})
```

```ts
// server/api/admin/news/[id].put.ts
import { z } from 'zod'
import { WEBZINE_CONTENT_TYPES, estimateReadingTimeMinutes } from '../../../app/shared/cms/webzine'

const updateSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleTh: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerptEn: z.string().optional().nullable(),
  excerptTh: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  contentTh: z.string().optional().nullable(),
  category: z.enum(['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']).optional(),
  contentType: z.enum(WEBZINE_CONTENT_TYPES).optional(),
  primaryTopicKey: z.string().optional().nullable(),
  campaignCode: z.string().optional().nullable(),
  linkedEventId: z.string().optional().nullable(),
  pinned: z.boolean().optional(),
  isEvergreen: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featuredImage: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  featureOnHome: z.boolean().optional(),
  homePriority: z.number().optional(),
  externalUrl: z.string().optional().nullable(),
  openInNewTab: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = updateSchema.parse(await readBody(event))
  const nextHtml = body.contentEn ?? body.contentTh ?? ''

  return prisma.newsArticle.update({
    where: { id },
    data: {
      ...body,
      readingTimeMinutes: body.contentEn !== undefined || body.contentTh !== undefined
        ? estimateReadingTimeMinutes(nextHtml)
        : undefined,
      publishedAt: body.publishedAt !== undefined ? (body.publishedAt ? new Date(body.publishedAt) : null) : undefined,
    },
  })
})
```

```ts
// server/api/admin/news/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 20, 100)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit
  const search = (query.search as string) || ''
  const status = (query.status as string) || ''
  const category = (query.category as string) || ''
  const contentType = (query.contentType as string) || ''
  const primaryTopicKey = (query.primaryTopicKey as string) || ''
  const campaignCode = (query.campaignCode as string) || ''

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (category) where.category = category
  if (contentType) where.contentType = contentType
  if (primaryTopicKey) where.primaryTopicKey = primaryTopicKey
  if (campaignCode) where.campaignCode = campaignCode
  if (search) {
    where.OR = [
      { titleEn: { contains: search, mode: 'insensitive' } },
      { titleTh: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({ where, orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }], take: limit, skip }),
    prisma.newsArticle.count({ where }),
  ])

  return { data: articles, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
})
```

```ts
// server/api/admin/events/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const gameEvent = await prisma.gameEvent.create({
    data: {
      titleEn: body.titleEn || '',
      titleTh: body.titleTh || '',
      descriptionEn: body.descriptionEn || null,
      descriptionTh: body.descriptionTh || null,
      type: body.type,
      status: body.status || 'SCHEDULED',
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
      timezone: body.timezone || 'Asia/Bangkok',
      multiplier: body.type === 'HOT_TIME' ? (body.multiplier || null) : null,
      bonusType: body.type === 'HOT_TIME' ? (body.bonusType || null) : null,
      bannerImage: body.bannerImage || null,
      icon: body.icon || null,
      color: body.color || null,
      visible: body.visible !== false,
      campaignCode: body.campaignCode || null,
      linkedArticleId: body.linkedArticleId || null,
    },
  })

  await logActivity(event, 'CREATE', 'events', `Created event: ${gameEvent.titleEn || gameEvent.titleTh}`, gameEvent.id)
  return gameEvent
})
```

```ts
// server/api/admin/banners/index.post.ts
import { parseMarketingBannerPayload } from '../../../utils/marketing-banners'

export default defineEventHandler(async (event) => {
  const payload = parseMarketingBannerPayload(await readBody(event))

  const banner = await prisma.marketingBanner.create({
    data: payload,
  })

  await logActivity(event, 'CREATE', 'marketing_banners', `Created banner: ${banner.titleEn}`, banner.id)
  return banner
})
```

```ts
// server/api/admin/banners/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const where: Record<string, unknown> = {}
  if (query.placement) where.placement = query.placement
  if (query.status) where.status = query.status
  if (query.scope) where.scope = query.scope
  if (query.campaignCode) where.campaignCode = query.campaignCode

  return prisma.marketingBanner.findMany({
    where,
    orderBy: [{ placement: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
  })
})
```

```ts
// prisma/seed.ts
await prisma.siteConfig.upsert({
  where: { key: 'webzine_topics' },
  update: {
    value: [
      {
        key: 'getting-started',
        slug: 'getting-started',
        labelEn: 'Getting Started',
        labelTh: 'Getting Started',
        descriptionEn: 'Beginner and onboarding content for new players.',
        descriptionTh: 'Beginner and onboarding content for new players.',
        icon: 'i-lucide-compass',
        color: '#d4a843',
        visible: true,
      },
      {
        key: 'world-lore',
        slug: 'world-lore',
        labelEn: 'World Lore',
        labelTh: 'World Lore',
        descriptionEn: 'Story, factions, and lore primers.',
        descriptionTh: 'Story, factions, and lore primers.',
        icon: 'i-lucide-book-open',
        color: '#8b5cf6',
        visible: true,
      },
    ],
  },
  create: {
    key: 'webzine_topics',
    value: [
      {
        key: 'getting-started',
        slug: 'getting-started',
        labelEn: 'Getting Started',
        labelTh: 'Getting Started',
        descriptionEn: 'Beginner and onboarding content for new players.',
        descriptionTh: 'Beginner and onboarding content for new players.',
        icon: 'i-lucide-compass',
        color: '#d4a843',
        visible: true,
      },
      {
        key: 'world-lore',
        slug: 'world-lore',
        labelEn: 'World Lore',
        labelTh: 'World Lore',
        descriptionEn: 'Story, factions, and lore primers.',
        descriptionTh: 'Story, factions, and lore primers.',
        icon: 'i-lucide-book-open',
        color: '#8b5cf6',
        visible: true,
      },
    ],
  },
})

await prisma.newsArticle.upsert({
  where: { slug: 'ets-beginner-guide' },
  update: {
    titleEn: 'ETS Beginner Guide',
    titleTh: 'ETS Beginner Guide',
    excerptEn: 'Your first-day checklist for Eternal Tower Saga.',
    excerptTh: 'Your first-day checklist for Eternal Tower Saga.',
    contentEn: '<p>Start with the tutorial, claim your launch rewards, and focus on your first weapon path.</p>',
    contentTh: '<p>Start with the tutorial, claim your launch rewards, and focus on your first weapon path.</p>',
    category: 'UPDATE',
    contentType: 'GUIDE',
    primaryTopicKey: 'getting-started',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-04-23T09:00:00.000Z'),
    pinned: true,
    isEvergreen: true,
    readingTimeMinutes: 2,
  },
  create: {
    slug: 'ets-beginner-guide',
    titleEn: 'ETS Beginner Guide',
    titleTh: 'ETS Beginner Guide',
    excerptEn: 'Your first-day checklist for Eternal Tower Saga.',
    excerptTh: 'Your first-day checklist for Eternal Tower Saga.',
    contentEn: '<p>Start with the tutorial, claim your launch rewards, and focus on your first weapon path.</p>',
    contentTh: '<p>Start with the tutorial, claim your launch rewards, and focus on your first weapon path.</p>',
    category: 'UPDATE',
    contentType: 'GUIDE',
    primaryTopicKey: 'getting-started',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-04-23T09:00:00.000Z'),
    pinned: true,
    isEvergreen: true,
    readingTimeMinutes: 2,
  },
})

await prisma.newsArticle.upsert({
  where: { slug: 'season-zero-patch-notes' },
  update: {
    titleEn: 'Season Zero Patch Notes',
    titleTh: 'Season Zero Patch Notes',
    excerptEn: 'Balance changes and launch-week fixes.',
    excerptTh: 'Balance changes and launch-week fixes.',
    contentEn: '<p>Adjusted early-game rewards, fixed launcher issues, and improved tutorial pacing.</p>',
    contentTh: '<p>Adjusted early-game rewards, fixed launcher issues, and improved tutorial pacing.</p>',
    category: 'UPDATE',
    contentType: 'PATCH_NOTES',
    primaryTopicKey: 'getting-started',
    campaignCode: 'launch-week',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-04-23T10:00:00.000Z'),
    readingTimeMinutes: 1,
  },
  create: {
    slug: 'season-zero-patch-notes',
    titleEn: 'Season Zero Patch Notes',
    titleTh: 'Season Zero Patch Notes',
    excerptEn: 'Balance changes and launch-week fixes.',
    excerptTh: 'Balance changes and launch-week fixes.',
    contentEn: '<p>Adjusted early-game rewards, fixed launcher issues, and improved tutorial pacing.</p>',
    contentTh: '<p>Adjusted early-game rewards, fixed launcher issues, and improved tutorial pacing.</p>',
    category: 'UPDATE',
    contentType: 'PATCH_NOTES',
    primaryTopicKey: 'getting-started',
    campaignCode: 'launch-week',
    status: 'PUBLISHED',
    publishedAt: new Date('2026-04-23T10:00:00.000Z'),
    readingTimeMinutes: 1,
  },
})
```

- [ ] **Step 4: Run the parser tests and seed the new registry fixtures**

Run:

```bash
npx tsx --test tests/cms/admin-config.test.ts tests/cms/marketing-banner-payloads.test.ts
npm run db:seed
```

Expected:

```text
admin-config.test.ts passes
marketing-banner-payloads.test.ts passes
seed completes with webzine_topics and seeded webzine articles upserted
```

- [ ] **Step 5: Commit the topic registry and admin API contract work**

```bash
git add server/utils/marketing-banners.ts server/utils/admin-config.ts server/api/admin/config.get.ts server/api/admin/config.put.ts server/api/admin/news/index.get.ts server/api/admin/news/index.post.ts server/api/admin/news/[id].put.ts server/api/admin/events/index.get.ts server/api/admin/events/index.post.ts server/api/admin/events/[id].put.ts server/api/admin/banners prisma/seed.ts tests/cms/admin-config.test.ts tests/cms/marketing-banner-payloads.test.ts
git commit -m "feat: add webzine topics and marketing banner admin APIs"
```

### Task 3: Build the Public Webzine Landing, Topic Pages, Article Enrichment, and Banner Resolver

**Files:**
- Create: `server/utils/banner-resolver.ts`
- Create: `server/api/public/webzine/landing.get.ts`
- Create: `server/api/public/banners.get.ts`
- Create: `app/composables/useResolvedBanners.ts`
- Create: `app/components/site/MarketingBannerSlot.vue`
- Create: `app/components/site/WebzineArticleCard.vue`
- Create: `app/pages/news/type/[contentType].vue`
- Create: `app/pages/news/topic/[topicKey].vue`
- Create: `tests/cms/banner-resolver.test.ts`
- Create: `e2e/pages/webzine.spec.ts`
- Modify: `server/api/public/news.get.ts`
- Modify: `server/api/public/news/[slug].get.ts`
- Modify: `server/api/public/site.get.ts`
- Modify: `app/pages/news/index.vue`
- Modify: `app/pages/news/[slug].vue`

- [ ] **Step 1: Write the failing resolver and public-page tests**

```ts
// tests/cms/banner-resolver.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveMarketingBanners } from '../../server/utils/banner-resolver'

describe('resolveMarketingBanners', () => {
  it('picks the highest-priority matching banner per placement', () => {
    const now = new Date('2026-04-23T12:00:00.000Z')
    const resolved = resolveMarketingBanners({
      now,
      routeType: 'news_index',
      banners: [
        {
          id: 'low',
          placement: 'announcement_bar',
          status: 'LIVE',
          scope: 'global',
          priority: 10,
          isActive: true,
          updatedAt: new Date('2026-04-23T09:00:00.000Z'),
          startsAt: null,
          endsAt: null,
          config: {},
        },
        {
          id: 'high',
          placement: 'announcement_bar',
          status: 'LIVE',
          scope: 'news_index',
          priority: 50,
          isActive: true,
          updatedAt: new Date('2026-04-23T10:00:00.000Z'),
          startsAt: null,
          endsAt: null,
          config: {},
        },
      ],
    })

    assert.equal(resolved.announcement_bar?.id, 'high')
  })

  it('ignores expired and inactive banners', () => {
    const now = new Date('2026-04-23T12:00:00.000Z')
    const resolved = resolveMarketingBanners({
      now,
      routeType: 'news_index',
      banners: [
        {
          id: 'expired',
          placement: 'floating',
          status: 'LIVE',
          scope: 'global',
          priority: 50,
          isActive: true,
          updatedAt: new Date('2026-04-23T10:00:00.000Z'),
          startsAt: null,
          endsAt: new Date('2026-04-22T10:00:00.000Z'),
          config: {},
        },
      ],
    })

    assert.equal(resolved.floating, null)
  })
})

// e2e/pages/webzine.spec.ts
import { test, expect } from '@playwright/test'

test.describe('brand webzine', () => {
  test('news landing renders the seeded guide and patch notes sections', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.getByText('ETS Beginner Guide')).toBeVisible()
    await expect(page.getByText(/Patch Notes/i)).toBeVisible()
  })

  test('article detail renders related content and the announcement bar slot', async ({ page }) => {
    await page.goto('/news/ets-beginner-guide', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('[data-testid="marketing-banner-announcement_bar"]')).toBeVisible()
    await expect(page.getByText(/related content/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Season Zero Patch Notes/i })).toBeVisible()
  })

  test('topic listing page renders the controlled getting-started topic', async ({ page }) => {
    await page.goto('/news/topic/getting-started', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(/getting started/i)
    await expect(page.getByText('ETS Beginner Guide')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npx tsx --test tests/cms/banner-resolver.test.ts
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/pages/webzine.spec.ts --project="Desktop Chrome"
```

Expected:

```text
ERR_MODULE_NOT_FOUND for ../../server/utils/banner-resolver
webzine Playwright spec fails because the landing and banner surfaces do not exist yet
```

- [ ] **Step 3: Implement the resolver, public endpoints, and webzine pages**

```ts
// server/utils/banner-resolver.ts
import type { BannerPlacement } from '../../app/shared/cms/marketing-banners'

type BannerRecord = {
  id: string
  placement: BannerPlacement
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'EXPIRED'
  scope: 'global' | 'homepage' | 'news_index' | 'article_detail' | 'topic_page' | 'event_page' | 'specific_article' | 'specific_topic'
  priority: number
  isActive: boolean
  startsAt: Date | null
  endsAt: Date | null
  updatedAt: Date
  targetArticleId?: number | null
  config: Record<string, unknown>
}

type ResolveInput = {
  now: Date
  routeType: 'homepage' | 'news_index' | 'article_detail' | 'topic_page' | 'event_page'
  articleId?: number | null
  topicKey?: string | null
  banners: BannerRecord[]
}

const EMPTY_RESULT = {
  announcement_bar: null,
  popup: null,
  floating: null,
  homepage_inline: null,
  sidebar: null,
  article_inline: null,
  footer_strip: null,
} as const

function bannerMatches(input: ResolveInput, banner: BannerRecord) {
  if (!banner.isActive || banner.status !== 'LIVE') return false
  if (banner.startsAt && banner.startsAt > input.now) return false
  if (banner.endsAt && banner.endsAt <= input.now) return false
  if (banner.scope === 'global') return true
  if (banner.scope === input.routeType) return true
  if (banner.scope === 'specific_article' && input.routeType === 'article_detail') {
    return banner.targetArticleId === input.articleId
  }
  if (banner.scope === 'specific_topic' && input.routeType === 'topic_page') {
    return String(banner.config.topicKey || '') === String(input.topicKey || '')
  }
  return false
}

export function resolveMarketingBanners(input: ResolveInput) {
  const resolved = { ...EMPTY_RESULT }

  for (const banner of input.banners.filter((candidate) => bannerMatches(input, candidate))) {
    const current = resolved[banner.placement]
    if (
      !current ||
      banner.priority > current.priority ||
      (banner.priority === current.priority && banner.updatedAt > current.updatedAt) ||
      (banner.priority === current.priority && banner.updatedAt.getTime() === current.updatedAt.getTime() && banner.id < current.id)
    ) {
      resolved[banner.placement] = banner
    }
  }

  return resolved
}
```

```ts
// server/api/public/webzine/landing.get.ts
import { normalizeWebzineTopics } from '../../../app/shared/cms/webzine'

export default defineEventHandler(async () => {
  const [topicConfig, pinnedArticles, latestArticles, patchNotes, guides, activeEvents] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'webzine_topics' } }),
    prisma.newsArticle.findMany({
      where: { status: 'PUBLISHED', pinned: true, OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }] },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 1,
    }),
    prisma.newsArticle.findMany({
      where: { status: 'PUBLISHED', OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }] },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    }),
    prisma.newsArticle.findMany({
      where: { status: 'PUBLISHED', contentType: 'PATCH_NOTES', OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }] },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }),
    prisma.newsArticle.findMany({
      where: { status: 'PUBLISHED', contentType: 'GUIDE', OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }] },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
      take: 4,
    }),
    prisma.gameEvent.findMany({
      where: {
        visible: true,
        OR: [{ status: 'ACTIVE' }, { status: 'SCHEDULED', startsAt: { gte: new Date() } }],
      },
      orderBy: { startsAt: 'asc' },
      take: 3,
    }),
  ])

  return {
    topics: normalizeWebzineTopics(Array.isArray(topicConfig?.value) ? (topicConfig?.value as any[]) : []),
    featured: pinnedArticles[0] || latestArticles[0] || null,
    latest: latestArticles,
    sections: {
      patchNotes,
      guides,
    },
    activeEvents,
  }
})
```

```ts
// server/api/public/banners.get.ts
import { resolveMarketingBanners } from '../../utils/banner-resolver'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const routeType = String(query.routeType || 'news_index') as 'homepage' | 'news_index' | 'article_detail' | 'topic_page' | 'event_page'
  const articleId = query.articleId ? Number(query.articleId) : null
  const topicKey = query.topicKey ? String(query.topicKey) : null

  const banners = await prisma.marketingBanner.findMany({
    where: { isActive: true },
    orderBy: [{ placement: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
    include: {
      targetArticle: { select: { slug: true } },
      targetPage: { select: { slug: true } },
    },
  })

  return resolveMarketingBanners({
    now: new Date(),
    routeType,
    articleId,
    topicKey,
    banners,
  })
})
```

```ts
// server/api/public/news.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 12, 50)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit
  const contentType = (query.contentType as string) || ''
  const topicKey = (query.topicKey as string) || ''

  const where: Record<string, unknown> = {
    status: 'PUBLISHED',
    OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
  }

  if (contentType) where.contentType = contentType
  if (topicKey) where.primaryTopicKey = topicKey

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTh: true,
        excerptEn: true,
        excerptTh: true,
        category: true,
        contentType: true,
        primaryTopicKey: true,
        featuredImage: true,
        publishedAt: true,
        readingTimeMinutes: true,
      },
    }),
    prisma.newsArticle.count({ where }),
  ])

  return { data: articles, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
})
```

```ts
// server/api/public/news/[slug].get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const article = await prisma.newsArticle.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      linkedEvent: true,
    },
  })

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  const related = await prisma.newsArticle.findMany({
    where: {
      id: { not: article.id },
      status: 'PUBLISHED',
      OR: [
        article.campaignCode ? { campaignCode: article.campaignCode } : undefined,
        article.linkedEventId ? { linkedEventId: article.linkedEventId } : undefined,
        article.primaryTopicKey ? { primaryTopicKey: article.primaryTopicKey } : undefined,
        { contentType: article.contentType },
      ].filter(Boolean) as any[],
    },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    take: 4,
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleTh: true,
      featuredImage: true,
      contentType: true,
      publishedAt: true,
    },
  })

  return { article, related }
})
```

```ts
// app/composables/useResolvedBanners.ts
export function useResolvedBanners(params: { routeType: string; articleId?: number | null; topicKey?: string | null }) {
  return useFetch('/api/public/banners', {
    query: params,
    default: () => ({
      announcement_bar: null,
      popup: null,
      floating: null,
      homepage_inline: null,
      sidebar: null,
      article_inline: null,
      footer_strip: null,
    }),
  })
}
```

```vue
<!-- app/components/site/MarketingBannerSlot.vue -->
<template>
  <div
    v-if="banner"
    :data-testid="`marketing-banner-${placement}`"
    class="rounded-xl border border-gold/20 bg-gold/8 px-4 py-3 text-white"
  >
    <NuxtLink :to="href" class="block no-underline text-current">
      <p v-if="currentBadge" class="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-gold">{{ currentBadge }}</p>
      <p class="text-sm font-semibold">{{ currentTitle }}</p>
      <p v-if="currentBody" class="mt-1 text-sm text-white/60">{{ currentBody }}</p>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  placement: string
  banner: Record<string, any> | null
}>()

const { locale } = useI18n()
const currentTitle = computed(() => locale.value === 'th' ? props.banner?.titleTh || props.banner?.titleEn : props.banner?.titleEn || props.banner?.titleTh)
const currentBadge = computed(() => locale.value === 'th' ? props.banner?.badgeTh || props.banner?.badgeEn : props.banner?.badgeEn || props.banner?.badgeTh)
const currentBody = computed(() => locale.value === 'th' ? props.banner?.bodyTh || props.banner?.bodyEn : props.banner?.bodyEn || props.banner?.bodyTh)
const href = computed(() => {
  if (!props.banner) return '/'
  if (props.banner.targetType === 'url') return props.banner.targetUrl || '/'
  if (props.banner.targetType === 'article' && props.banner.targetArticle?.slug) return `/news/${props.banner.targetArticle.slug}`
  if (props.banner.targetType === 'page' && props.banner.targetPage?.slug) return props.banner.targetPage.slug ? `/${props.banner.targetPage.slug}` : '/'
  if (props.banner.targetType === 'event') return '/event'
  return '/'
})
</script>
```

```vue
<!-- app/pages/news/index.vue -->
<script setup lang="ts">
const { data: landing } = await useFetch('/api/public/webzine/landing')
const { data: banners } = await useResolvedBanners({ routeType: 'news_index' })
</script>

<template>
  <div>
    <MarketingBannerSlot placement="announcement_bar" :banner="banners?.announcement_bar || null" />

    <section class="mx-auto max-w-7xl px-6 pt-24 pb-8">
      <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">Eternal Tower Saga News</h1>
      <p class="mt-3 max-w-2xl text-sm text-white/50">Announcements, patch notes, guides, lore, and dev updates from the team.</p>
    </section>

    <section class="mx-auto grid max-w-7xl gap-8 px-6 pb-12 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-8">
        <WebzineArticleCard v-if="landing?.featured" :article="landing.featured" />

        <div>
          <h2 class="mb-4 text-xl font-bold">Latest</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <WebzineArticleCard v-for="article in landing?.latest || []" :key="article.slug" :article="article" />
          </div>
        </div>

        <div>
          <h2 class="mb-4 text-xl font-bold">Patch Notes</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <WebzineArticleCard v-for="article in landing?.sections?.patchNotes || []" :key="article.slug" :article="article" />
          </div>
        </div>
      </div>

      <aside class="space-y-6">
        <MarketingBannerSlot placement="sidebar" :banner="banners?.sidebar || null" />
      </aside>
    </section>
  </div>
</template>
```

```vue
<!-- app/pages/news/[slug].vue -->
<script setup lang="ts">
import { sanitizeRichHtml } from '../../shared/cms/sanitize-html'

const route = useRoute()
const slug = route.params.slug as string
const { data } = await useFetch(`/api/public/news/${slug}`)
const article = computed(() => data.value?.article)
const related = computed(() => data.value?.related || [])
const { data: banners } = await useResolvedBanners({ routeType: 'article_detail', articleId: article.value?.id || null })
const renderedHtml = computed(() => sanitizeRichHtml(article.value?.contentEn || article.value?.excerptEn || ''))
</script>

<template>
  <div>
    <MarketingBannerSlot placement="announcement_bar" :banner="banners?.announcement_bar || null" />

    <section class="mx-auto grid max-w-7xl gap-8 px-6 pt-24 pb-12 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article class="min-w-0">
        <h1 class="mb-4 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold">{{ article?.titleEn }}</h1>
        <div class="prose prose-invert max-w-none" v-html="renderedHtml" />
        <MarketingBannerSlot placement="article_inline" :banner="banners?.article_inline || null" class="mt-8" />

        <section class="mt-12">
          <h2 class="mb-4 text-xl font-bold">Related Content</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <WebzineArticleCard v-for="item in related" :key="item.slug" :article="item" />
          </div>
        </section>
      </article>

      <aside class="space-y-6">
        <MarketingBannerSlot placement="sidebar" :banner="banners?.sidebar || null" />
      </aside>
    </section>
  </div>
</template>
```

- [ ] **Step 4: Run the resolver tests and public Playwright coverage**

Run:

```bash
npx tsx --test tests/cms/banner-resolver.test.ts
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/pages/webzine.spec.ts --project="Desktop Chrome"
```

Expected:

```text
banner-resolver.test.ts passes
webzine Playwright spec passes on Desktop Chrome
```

- [ ] **Step 5: Commit the public webzine and banner-resolution layer**

```bash
git add server/utils/banner-resolver.ts server/api/public/webzine/landing.get.ts server/api/public/banners.get.ts server/api/public/news.get.ts server/api/public/news/[slug].get.ts server/api/public/site.get.ts app/composables/useResolvedBanners.ts app/components/site/MarketingBannerSlot.vue app/components/site/WebzineArticleCard.vue app/pages/news/index.vue app/pages/news/[slug].vue app/pages/news/type/[contentType].vue app/pages/news/topic/[topicKey].vue tests/cms/banner-resolver.test.ts e2e/pages/webzine.spec.ts
git commit -m "feat: add brand webzine landing and public banner resolver"
```

### Task 4: Add the Admin Topics Screen, Banner Control Screen, and Webzine Editing Workflow

**Files:**
- Create: `app/pages/admin/topics.vue`
- Create: `app/pages/admin/banners.vue`
- Create: `e2e/admin/banner-control.spec.ts`
- Modify: `app/pages/admin/news/index.vue`
- Modify: `app/pages/admin/events.vue`
- Modify: `app/pages/admin/index.vue`
- Modify: `app/layouts/admin.vue`
- Modify: `app/components/admin/AdminCommandPalette.vue`

- [ ] **Step 1: Write the failing admin Playwright flow**

```ts
// e2e/admin/banner-control.spec.ts
import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'

test('admin can manage topics and create an announcement bar banner', async ({ page }) => {
  test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

  await page.goto('/admin/login')
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin(?!\/login)/)

  await page.goto('/admin/topics')
  await page.getByRole('button', { name: /new topic/i }).click()
  await page.getByLabel(/key/i).fill('classes')
  await page.getByLabel(/label \(en\)/i).fill('Classes')
  await page.getByRole('button', { name: /save topic/i }).click()
  await expect(page.getByText('Classes')).toBeVisible()

  await page.goto('/admin/banners')
  await page.getByRole('button', { name: /new banner/i }).click()
  await page.getByLabel(/placement/i).selectOption('announcement_bar')
  await page.getByLabel(/scope/i).selectOption('global')
  await page.getByLabel(/title \(en\)/i).fill('Launch Week Guide')
  await page.getByLabel(/title \(th\)/i).fill('Launch Week Guide')
  await page.getByLabel(/target type/i).selectOption('article')
  await page.getByLabel(/target article/i).selectOption({ label: /ETS Beginner Guide/i })
  await page.getByRole('button', { name: /save banner/i }).click()

  await expect(page.getByText('Launch Week Guide')).toBeVisible()
  await expect(page.getByText(/announcement bar/i)).toBeVisible()
})
```

- [ ] **Step 2: Run the admin flow and verify it fails before the screens exist**

Run:

```bash
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/admin/banner-control.spec.ts --project="Desktop Chrome"
```

Expected:

```text
SKIPPED when TEST_ADMIN_PASSWORD is still change-me
or FAIL because /admin/topics and /admin/banners do not exist yet
```

- [ ] **Step 3: Implement the admin topics and banner-control UI plus article/event editor fields**

```vue
<!-- app/layouts/admin.vue -->
const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', icon: 'i-lucide-layout-dashboard', label: 'Dashboard' },
      { to: '/admin/analytics', icon: 'i-lucide-bar-chart-3', label: 'Analytics' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/homepage', icon: 'i-lucide-home', label: 'Homepage' },
      { to: '/admin/news', icon: 'i-lucide-newspaper', label: 'Webzine Articles' },
      { to: '/admin/topics', icon: 'i-lucide-tags', label: 'Topics' },
      { to: '/admin/banners', icon: 'i-lucide-flag', label: 'Banner Control' },
      { to: '/admin/weapons', icon: 'i-lucide-swords', label: 'Weapons' },
      { to: '/admin/features', icon: 'i-lucide-sparkles', label: 'Features' },
      { to: '/admin/highlights', icon: 'i-lucide-star', label: 'Highlights' },
      { to: '/admin/events', icon: 'i-lucide-calendar', label: 'Events & Hot Time' },
      { to: '/admin/milestones', icon: 'i-lucide-trophy', label: 'Milestones' },
      { to: '/admin/download', icon: 'i-lucide-download', label: 'Download Page' },
      { to: '/admin/faq', icon: 'i-lucide-help-circle', label: 'FAQ' },
      { to: '/admin/pages', icon: 'i-lucide-file-text', label: 'Pages' },
      { to: '/admin/media', icon: 'i-lucide-image', label: 'Media' },
    ],
  },
]
```

```vue
<!-- app/components/admin/AdminCommandPalette.vue -->
const commands = [
  { icon: 'HOME', label: 'Homepage', group: 'Content', to: '/admin/homepage' },
  { icon: 'NEWS', label: 'Webzine Articles', group: 'Content', to: '/admin/news' },
  { icon: 'TOPIC', label: 'Topics', group: 'Content', to: '/admin/topics' },
  { icon: 'BANNER', label: 'Banner Control', group: 'Content', to: '/admin/banners' },
  { icon: 'EVENT', label: 'Events', group: 'Content', to: '/admin/events' },
]
```

```vue
<!-- app/pages/admin/topics.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type Topic = {
  key: string
  slug: string
  labelEn: string
  labelTh: string
  descriptionEn: string
  descriptionTh: string
  icon: string
  color: string
  visible: boolean
}

const topics = ref<Topic[]>([])
const editorOpen = ref(false)
const form = reactive<Topic>({
  key: '',
  slug: '',
  labelEn: '',
  labelTh: '',
  descriptionEn: '',
  descriptionTh: '',
  icon: '',
  color: '',
  visible: true,
})

async function loadTopics() {
  topics.value = await $fetch('/api/admin/config?key=webzine_topics')
}

async function saveTopics() {
  await $fetch('/api/admin/config', {
    method: 'PUT',
    body: {
      key: 'webzine_topics',
      value: topics.value,
    },
  })
}

function openNewTopic() {
  Object.assign(form, { key: '', slug: '', labelEn: '', labelTh: '', descriptionEn: '', descriptionTh: '', icon: '', color: '', visible: true })
  editorOpen.value = true
}

function commitTopic() {
  const existingIndex = topics.value.findIndex((topic) => topic.key === form.key)
  if (existingIndex >= 0) {
    topics.value[existingIndex] = { ...form }
  } else {
    topics.value.push({ ...form })
  }
  editorOpen.value = false
  saveTopics()
}

await loadTopics()
</script>
```

```vue
<!-- app/pages/admin/banners.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const banners = ref<any[]>([])
const articles = ref<any[]>([])
const editorOpen = ref(false)
const form = reactive({
  id: '',
  placement: 'announcement_bar',
  scope: 'global',
  status: 'DRAFT',
  priority: 0,
  titleEn: '',
  titleTh: '',
  badgeEn: '',
  badgeTh: '',
  bodyEn: '',
  bodyTh: '',
  targetType: 'article',
  targetArticleId: null as number | null,
  targetPageKey: '',
  targetEventId: '',
  targetUrl: '',
  targetNewTab: false,
  dismissible: true,
  isActive: true,
  config: {},
})

async function loadBanners() {
  banners.value = await $fetch('/api/admin/banners')
}

async function loadArticles() {
  const result = await $fetch<{ data: any[] }>('/api/admin/news', { query: { limit: 100 } })
  articles.value = result.data
}

async function saveBanner() {
  const payload = { ...form }
  if (payload.id) {
    await $fetch(`/api/admin/banners/${payload.id}`, { method: 'PUT', body: payload })
  } else {
    await $fetch('/api/admin/banners', { method: 'POST', body: payload })
  }
  editorOpen.value = false
  await loadBanners()
}

await Promise.all([loadBanners(), loadArticles()])
</script>
```

```vue
<!-- app/pages/admin/news/index.vue -->
<script setup lang="ts">
const filterContentType = ref('')
const filterTopic = ref('')
const filterCampaignCode = ref('')
const topics = ref<any[]>([])

const form = reactive({
  titleEn: '',
  titleTh: '',
  slug: '',
  excerptEn: '',
  excerptTh: '',
  contentEn: '',
  contentTh: '',
  category: 'ANNOUNCEMENT',
  contentType: 'ANNOUNCEMENT',
  primaryTopicKey: '',
  campaignCode: '',
  linkedEventId: null as string | null,
  pinned: false,
  isEvergreen: false,
  status: 'DRAFT',
  featuredImage: '',
  publishedAt: '',
  featureOnHome: false,
  homePriority: 0,
  externalUrl: '',
  openInNewTab: false,
  seoTitle: '',
  seoDesc: '',
  ogImage: '',
})

async function loadTopics() {
  topics.value = await $fetch('/api/admin/config?key=webzine_topics')
}

async function loadArticles() {
  const res = await $fetch<{ data: Article[]; meta: { total: number; totalPages: number } }>('/api/admin/news', {
    query: {
      page: page.value,
      search: search.value,
      status: filterStatus.value,
      category: filterCategory.value,
      contentType: filterContentType.value,
      primaryTopicKey: filterTopic.value,
      campaignCode: filterCampaignCode.value,
    },
  })
  articles.value = res.data
  total.value = res.meta.total
  totalPages.value = res.meta.totalPages
}

await loadTopics()
</script>
```

```vue
<!-- app/pages/admin/events.vue -->
<script setup lang="ts">
const form = reactive({
  titleEn: '',
  titleTh: '',
  descriptionEn: '',
  descriptionTh: '',
  type: 'EVENT',
  status: 'SCHEDULED',
  startsAt: '',
  endsAt: '',
  timezone: 'Asia/Bangkok',
  multiplier: null as number | null,
  bonusType: '',
  bannerImage: '',
  icon: '',
  color: '#d4a843',
  visible: true,
  campaignCode: '',
  linkedArticleId: null as number | null,
})

const articleOptions = ref<any[]>([])
async function loadArticleOptions() {
  const result = await $fetch<{ data: any[] }>('/api/admin/news', { query: { limit: 100 } })
  articleOptions.value = result.data
}

await loadArticleOptions()
</script>
```

```vue
<!-- app/pages/admin/index.vue -->
const quickActions = [
  { icon: 'i-lucide-file-plus', label: 'New CMS Page', to: '/admin/pages' },
  { icon: 'i-lucide-newspaper', label: 'Webzine Articles', to: '/admin/news' },
  { icon: 'i-lucide-tags', label: 'Topics', to: '/admin/topics' },
  { icon: 'i-lucide-flag', label: 'Banner Control', to: '/admin/banners' },
  { icon: 'i-lucide-calendar', label: 'Events', to: '/admin/events' },
  { icon: 'i-lucide-external-link', label: 'View Site', to: '/' },
]
```

- [ ] **Step 4: Run targeted linting and the admin Playwright flow**

Run:

```bash
npx eslint app/layouts/admin.vue app/components/admin/AdminCommandPalette.vue app/pages/admin/index.vue app/pages/admin/news/index.vue app/pages/admin/events.vue app/pages/admin/topics.vue app/pages/admin/banners.vue
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/admin/banner-control.spec.ts --project="Desktop Chrome"
```

Expected:

```text
targeted ESLint run passes
admin banner-control Playwright spec passes when TEST_ADMIN_PASSWORD is configured
or SKIPPED when TEST_ADMIN_PASSWORD remains change-me
```

- [ ] **Step 5: Commit the admin topics and banner-control workflow**

```bash
git add app/layouts/admin.vue app/components/admin/AdminCommandPalette.vue app/pages/admin/index.vue app/pages/admin/news/index.vue app/pages/admin/events.vue app/pages/admin/topics.vue app/pages/admin/banners.vue e2e/admin/banner-control.spec.ts
git commit -m "feat: add admin topics and centralized banner control"
```

### Task 5: Add Dashboard Queues and Run Final Release 1 Verification

**Files:**
- Create: `app/shared/cms/admin-dashboard.ts`
- Create: `tests/cms/admin-dashboard.test.ts`
- Modify: `server/api/admin/stats.get.ts`
- Modify: `app/pages/admin/index.vue`

- [ ] **Step 1: Write the failing dashboard queue test**

```ts
// tests/cms/admin-dashboard.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildWebzineDashboardSummary } from '../../app/shared/cms/admin-dashboard'

describe('buildWebzineDashboardSummary', () => {
  it('summarizes live banners, scheduled banners, and article cleanup queues', () => {
    const summary = buildWebzineDashboardSummary({
      banners: [
        { status: 'LIVE', placement: 'announcement_bar' },
        { status: 'SCHEDULED', placement: 'popup' },
      ],
      articles: [
        { status: 'DRAFT', primaryTopicKey: null, featuredImage: null },
        { status: 'PUBLISHED', primaryTopicKey: 'getting-started', featuredImage: '/x.webp' },
      ],
    })

    assert.deepEqual(summary, {
      liveBanners: 1,
      scheduledBanners: 1,
      draftArticles: 1,
      articlesMissingTopic: 1,
      articlesMissingFeaturedImage: 1,
    })
  })
})
```

- [ ] **Step 2: Run the dashboard queue test to verify it fails**

Run:

```bash
npx tsx --test tests/cms/admin-dashboard.test.ts
```

Expected:

```text
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/admin-dashboard
```

- [ ] **Step 3: Implement the dashboard helper and wire the admin stats payload**

```ts
// app/shared/cms/admin-dashboard.ts
export function buildWebzineDashboardSummary(input: {
  banners: Array<{ status: string; placement: string }>
  articles: Array<{ status: string; primaryTopicKey: string | null; featuredImage: string | null }>
}) {
  return {
    liveBanners: input.banners.filter((item) => item.status === 'LIVE').length,
    scheduledBanners: input.banners.filter((item) => item.status === 'SCHEDULED').length,
    draftArticles: input.articles.filter((item) => item.status === 'DRAFT').length,
    articlesMissingTopic: input.articles.filter((item) => !item.primaryTopicKey).length,
    articlesMissingFeaturedImage: input.articles.filter((item) => !item.featuredImage).length,
  }
}
```

```ts
// server/api/admin/stats.get.ts
import { buildWebzineDashboardSummary } from '../../../app/shared/cms/admin-dashboard'

export default defineEventHandler(async () => {
  const [
    newsCount,
    publishedNewsCount,
    weaponsCount,
    registrationsCount,
    featuresCount,
    highlightsCount,
    mediaCount,
    todayPageViews,
    recentRegistrations,
    recentNews,
    recentActivity,
    platformStats,
    regionStats,
    dailyRegistrations,
    banners,
    articleAudit,
  ] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.weapon.count(),
    prisma.preRegistration.count(),
    prisma.feature.count(),
    prisma.highlight.count(),
    prisma.mediaAsset.count(),
    prisma.pageView.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.preRegistration.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.newsArticle.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.preRegistration.groupBy({ by: ['platform'], _count: { platform: true } }),
    prisma.preRegistration.groupBy({ by: ['region'], _count: { region: true } }),
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') AS date, COUNT(*)::bigint AS count FROM "pre_registrations" WHERE "createdAt" >= NOW() - INTERVAL '14 days' GROUP BY 1 ORDER BY 1`,
    prisma.marketingBanner.findMany({ select: { status: true, placement: true } }),
    prisma.newsArticle.findMany({ select: { status: true, primaryTopicKey: true, featuredImage: true } }),
  ])

  return {
    counts: {
      news: newsCount,
      publishedNews: publishedNewsCount,
      weapons: weaponsCount,
      registrations: registrationsCount,
      features: featuresCount,
      highlights: highlightsCount,
      media: mediaCount,
      todayPageViews,
    },
    platformStats: platformStats.map((item) => ({ platform: item.platform, count: item._count.platform })),
    regionStats: regionStats.map((item) => ({ region: item.region, count: item._count.region })),
    dailyRegistrations: dailyRegistrations.map((item) => ({ date: item.date, count: Number(item.count) })),
    recentRegistrations,
    recentNews,
    recentActivity,
    webzineSummary: buildWebzineDashboardSummary({ banners, articles: articleAudit }),
  }
})
```

```vue
<!-- app/pages/admin/index.vue -->
const contentStatus = computed(() => [
  { icon: 'i-lucide-newspaper', label: 'Webzine Articles', count: stats.value.counts.news },
  { icon: 'i-lucide-flag', label: 'Live Banners', count: stats.value.webzineSummary.liveBanners },
  { icon: 'i-lucide-clock-3', label: 'Scheduled Banners', count: stats.value.webzineSummary.scheduledBanners },
  { icon: 'i-lucide-pencil', label: 'Draft Articles', count: stats.value.webzineSummary.draftArticles },
  { icon: 'i-lucide-tags', label: 'Missing Topic', count: stats.value.webzineSummary.articlesMissingTopic },
  { icon: 'i-lucide-image-off', label: 'Missing Featured Image', count: stats.value.webzineSummary.articlesMissingFeaturedImage },
])
```

- [ ] **Step 4: Run the dashboard test and the full Release 1 verification slice**

Run:

```bash
npx tsx --test tests/cms/*.test.ts
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/pages/webzine.spec.ts e2e/pages/homepage.spec.ts e2e/pages/event.spec.ts --project="Desktop Chrome"
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/admin/banner-control.spec.ts --project="Desktop Chrome"
```

Expected:

```text
all tests/cms/*.test.ts pass
public webzine, homepage, and event Playwright specs pass on Desktop Chrome
admin banner-control spec passes when TEST_ADMIN_PASSWORD is configured
or SKIPPED when TEST_ADMIN_PASSWORD remains change-me
```

- [ ] **Step 5: Commit the dashboard queues and final Release 1 polish**

```bash
git add app/shared/cms/admin-dashboard.ts tests/cms/admin-dashboard.test.ts server/api/admin/stats.get.ts app/pages/admin/index.vue
git commit -m "feat: add webzine and banner dashboard queues"
```

## Self-Review

### Spec coverage

- article model uplift: Task 1 and Task 2
- controlled topic registry: Task 2 and Task 4
- dedicated `MarketingBanner` model: Task 1 and Task 2
- lightweight campaign linking through `campaignCode`: Task 1, Task 2, and Task 4
- `/news` as the webzine landing: Task 3
- content-type and topic pages: Task 3
- centralized public banner resolution: Task 3
- admin Topics and Banner Control pages: Task 4
- dashboard queue visibility: Task 5

No Release 1 requirement from the approved design is left without a task.

### Placeholder scan

- no `TODO`
- no `TBD`
- no "implement later"
- no "similar to Task N"
- every task includes concrete files, commands, code, and expected outcomes

### Type consistency

- webzine content pillars consistently use `WebzineContentType`
- banner placement and scope consistently use `BANNER_PLACEMENTS` and `BANNER_SCOPES`
- topic registry consistently uses `webzine_topics`
- public winner selection consistently flows through `resolveMarketingBanners`
- admin surfaces consistently use `/admin/topics` and `/admin/banners`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-23-brand-webzine-centralized-banner-control-release-1.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
