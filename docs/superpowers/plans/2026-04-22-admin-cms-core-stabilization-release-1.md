# Admin CMS Core Stabilization Release 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-safe CMS foundation for media upload, CMS pages, navigation, homepage configuration, and public HTML rendering in the existing Nuxt admin panel.

**Architecture:** Introduce shared CMS helper modules under `app/shared/cms` and `server/utils`, move CMS page state onto `PageContent`, and make both admin and public rendering consume the same validated models. Use `tsx --test` for pure helper logic and Playwright API/E2E coverage for request and UI regressions, with local Playwright runs pointed at the local Nuxt server instead of the remote droplet by default.

**Tech Stack:** Nuxt 4, Vue 3, Nitro/H3, Prisma/PostgreSQL, Zod, Playwright, `tsx --test`, `nuxt-auth-utils`

---

## File Map

### New files

- `app/shared/cms/media.ts` — shared media constants, file-type helpers, and structured upload error codes
- `app/shared/cms/homepage.ts` — supported homepage section registry and validation helpers
- `app/shared/cms/navigation.ts` — navigation item types, page-backed resolver helpers, and fallback normalization
- `app/shared/cms/pages.ts` — CMS page types, reserved route helpers, slug utilities, and system-page defaults
- `app/shared/cms/sanitize-html.ts` — shared HTML sanitization helper used by public rendering and admin preview
- `app/composables/useAdminMediaUpload.ts` — unified client upload flow shared by the media library and media picker
- `server/utils/admin-config.ts` — key-based config schemas and parse helpers for admin config writes
- `server/api/admin/media/[id].patch.ts` — persist media metadata updates such as alt text
- `server/api/admin/pages/index.get.ts` — list CMS pages for the admin page manager
- `server/api/admin/pages/index.post.ts` — create CMS pages with server-side slug and key validation
- `server/api/public/pages/[...slug].get.ts` — fetch published CMS pages by slug segments
- `app/components/site/CmsPageRenderer.vue` — shared public renderer for CMS-backed pages
- `app/pages/[...slug].vue` — catch-all public page route for published CMS pages
- `tests/cms/media.test.ts` — `tsx --test` coverage for shared media rules
- `tests/cms/homepage.test.ts` — `tsx --test` coverage for homepage section validation
- `tests/cms/navigation.test.ts` — `tsx --test` coverage for navigation normalization and route-safe behavior
- `tests/cms/pages.test.ts` — `tsx --test` coverage for slug and reserved-route helpers
- `tests/cms/admin-config.test.ts` — `tsx --test` coverage for config key validation
- `tests/cms/sanitize-html.test.ts` — `tsx --test` coverage for allowed/disallowed HTML
- `e2e/api/integration-webhook.spec.ts` — webhook authentication regression coverage
- `e2e/admin/media.spec.ts` — authenticated media upload and alt-text persistence flow
- `e2e/admin/cms-pages.spec.ts` — authenticated page creation, publish, and navigation flow
- `e2e/pages/cms-rendering.spec.ts` — public rendering checks for CMS pages and sanitized output

### Existing files to modify

- `package.json`
- `playwright.config.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `server/api/admin/config.get.ts`
- `server/api/admin/config.put.ts`
- `server/api/admin/media/index.get.ts`
- `server/api/admin/media/upload.post.ts`
- `server/api/admin/pages/[key].get.ts`
- `server/api/admin/pages/[key].put.ts`
- `server/api/admin/backup/export.post.ts`
- `server/api/admin/backup/import.post.ts`
- `server/api/integration/webhook.post.ts`
- `server/api/public/site.get.ts`
- `server/api/public/sections.get.ts`
- `server/routes/sitemap.xml.ts`
- `app/pages/admin/media.vue`
- `app/components/admin/MediaPicker.vue`
- `app/pages/admin/pages.vue`
- `app/pages/admin/menus.vue`
- `app/pages/admin/homepage.vue`
- `app/pages/admin/integrations.vue`
- `app/pages/admin/settings.vue`
- `app/pages/admin/index.vue`
- `app/pages/admin/news/index.vue`
- `app/pages/news/[slug].vue`
- `app/pages/support.vue`
- `app/pages/story.vue`
- `app/pages/terms.vue`
- `app/pages/privacy.vue`
- `app/pages/download.vue`
- `app/pages/game-guide.vue`
- `app/pages/gallery.vue`
- `app/components/site/SiteNavigation.vue`
- `app/components/site/SiteFooter.vue`

## Scope Notes

This plan intentionally covers **Release 1 only** from the approved design:

- security and upload stabilization
- `PageContent` migration and public CMS rendering
- route-safe navigation editing
- homepage registry cleanup
- focused admin polish needed to support those flows

Release 2 and Release 3 from the design document need separate plans after this foundation is working.

### Task 1: Establish Local Test Harness and Shared CMS Helper Modules

**Files:**
- Create: `app/shared/cms/media.ts`
- Create: `app/shared/cms/homepage.ts`
- Create: `app/shared/cms/navigation.ts`
- Create: `app/shared/cms/pages.ts`
- Create: `tests/cms/media.test.ts`
- Create: `tests/cms/homepage.test.ts`
- Create: `tests/cms/navigation.test.ts`
- Create: `tests/cms/pages.test.ts`
- Modify: `package.json`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Write the failing helper tests**

```ts
// tests/cms/media.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_UPLOAD_BYTES,
  buildMediaUploadError,
  isAllowedMediaMimeType,
} from '../../app/shared/cms/media'

describe('media helpers', () => {
  it('accepts configured image and video mime types', () => {
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4']) {
      assert.equal(isAllowedMediaMimeType(mime), true)
    }
  })

  it('rejects unsupported mime types', () => {
    assert.equal(isAllowedMediaMimeType('application/pdf'), false)
  })

  it('uses a single shared upload limit', () => {
    assert.equal(MAX_MEDIA_UPLOAD_BYTES, 10 * 1024 * 1024)
    assert.ok(ALLOWED_MEDIA_MIME_TYPES.length >= 6)
  })

  it('creates structured upload errors', () => {
    assert.deepEqual(
      buildMediaUploadError('UNSUPPORTED_TYPE', 'Unsupported file type', 'file'),
      { code: 'UNSUPPORTED_TYPE', message: 'Unsupported file type', field: 'file' },
    )
  })
})

// tests/cms/homepage.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SUPPORTED_HOMEPAGE_SECTION_TYPES, isSupportedHomepageSectionType } from '../../app/shared/cms/homepage'

describe('homepage section registry', () => {
  it('allows only release-1 section types', () => {
    assert.deepEqual(SUPPORTED_HOMEPAGE_SECTION_TYPES, ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'])
  })

  it('rejects legacy unsupported section types', () => {
    assert.equal(isSupportedHomepageSectionType('custom_html'), false)
    assert.equal(isSupportedHomepageSectionType('gallery'), false)
    assert.equal(isSupportedHomepageSectionType('video'), false)
  })
})

// tests/cms/navigation.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeNavigationConfig, resolveNavigationHref } from '../../app/shared/cms/navigation'

describe('navigation helpers', () => {
  it('normalizes legacy flat navigation arrays into main/footer buckets', () => {
    const normalized = normalizeNavigationConfig([{ labelEn: 'Home', labelTh: 'หน้าแรก', href: '/' }])
    assert.equal(normalized.main.length, 1)
    assert.equal(normalized.footer.length, 0)
  })

  it('resolves page-backed href values from page records', () => {
    const href = resolveNavigationHref(
      { id: 'nav-home', type: 'page', labelEn: 'Home', labelTh: 'หน้าแรก', pageKey: 'home', visible: true },
      { key: 'home', slug: '', isSystemPage: true },
    )
    assert.equal(href, '/')
  })
})

// tests/cms/pages.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildPagePath, isReservedCmsSlug } from '../../app/shared/cms/pages'

describe('page helpers', () => {
  it('builds system and custom paths correctly', () => {
    assert.equal(buildPagePath({ slug: 'support', isSystemPage: true }), '/support')
    assert.equal(buildPagePath({ slug: 'about-us', isSystemPage: false }), '/about-us')
  })

  it('rejects reserved cms slugs', () => {
    assert.equal(isReservedCmsSlug('news'), true)
    assert.equal(isReservedCmsSlug('event'), true)
    assert.equal(isReservedCmsSlug('about-us'), false)
  })
})
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run:

```bash
npx tsx --test tests/cms/*.test.ts
```

Expected:

```text
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/media
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/homepage
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/navigation
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/pages
```

- [ ] **Step 3: Add the shared CMS modules and local test scripts**

```ts
// app/shared/cms/media.ts
export const MAX_MEDIA_UPLOAD_BYTES = 10 * 1024 * 1024

export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
] as const

export const ALLOWED_MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.mp4'] as const

export type MediaUploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_TYPE'
  | 'NO_FILE'
  | 'UPLOAD_WRITE_FAILED'
  | 'INVALID_METADATA'

export function isAllowedMediaMimeType(mimeType: string) {
  return (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mimeType)
}

export function buildMediaUploadError(code: MediaUploadErrorCode, message: string, field?: string) {
  return field ? { code, message, field } : { code, message }
}

// app/shared/cms/homepage.ts
export const SUPPORTED_HOMEPAGE_SECTION_TYPES = ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'] as const
export type HomepageSectionType = (typeof SUPPORTED_HOMEPAGE_SECTION_TYPES)[number]

export function isSupportedHomepageSectionType(value: string): value is HomepageSectionType {
  return (SUPPORTED_HOMEPAGE_SECTION_TYPES as readonly string[]).includes(value)
}

// app/shared/cms/pages.ts
const RESERVED_CMS_SLUGS = new Set(['admin', 'api', 'news', 'event', 'weapons'])

export function isReservedCmsSlug(slug: string) {
  return RESERVED_CMS_SLUGS.has(slug)
}

export function buildPagePath(page: { slug: string; isSystemPage: boolean }) {
  return page.slug === '' ? '/' : `/${page.slug}`
}

// app/shared/cms/navigation.ts
export type NavigationItem = {
  id: string
  type: 'page' | 'custom'
  labelEn: string
  labelTh: string
  pageKey?: string
  href?: string
  target?: '_self' | '_blank'
  visible: boolean
}

export function normalizeNavigationConfig(value: unknown): { main: NavigationItem[]; footer: NavigationItem[] } {
  if (Array.isArray(value)) {
    return {
      main: value.map((item, index) => ({
        id: `legacy-main-${index}`,
        type: 'custom',
        labelEn: String((item as any).labelEn || (item as any).label || ''),
        labelTh: String((item as any).labelTh || (item as any).label || ''),
        href: String((item as any).href || '/'),
        visible: (item as any).visible !== false,
        target: '_self',
      })),
      footer: [],
    }
  }

  const nav = (value && typeof value === 'object' ? value : {}) as { main?: NavigationItem[]; footer?: NavigationItem[] }
  return {
    main: nav.main || [],
    footer: nav.footer || [],
  }
}

export function resolveNavigationHref(item: NavigationItem, page?: { key: string; slug: string; isSystemPage: boolean }) {
  if (item.type === 'page' && page) {
    return page.slug === '' ? '/' : `/${page.slug}`
  }
  return item.href || '/'
}
```

```json
// package.json
{
  "scripts": {
    "test:node": "tsx --test tests/cms/*.test.ts",
    "test:e2e": "playwright test"
  }
}
```

```ts
// playwright.config.ts
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000'
```

- [ ] **Step 4: Run the helper tests to verify they pass**

Run:

```bash
npm run test:node
```

Expected:

```text
4 test files passed
0 failures
```

- [ ] **Step 5: Commit the shared helper baseline**

```bash
git add package.json playwright.config.ts app/shared/cms tests/cms
git commit -m "test: add shared cms helper modules and local test harness"
```

### Task 2: Harden Admin Config Writes and Integration Webhook Authentication

**Files:**
- Create: `server/utils/admin-config.ts`
- Create: `tests/cms/admin-config.test.ts`
- Create: `e2e/api/integration-webhook.spec.ts`
- Modify: `server/api/admin/config.put.ts`
- Modify: `server/api/admin/config.get.ts`
- Modify: `server/api/public/site.get.ts`
- Modify: `server/api/public/sections.get.ts`
- Modify: `server/api/integration/webhook.post.ts`
- Modify: `app/pages/admin/homepage.vue`
- Modify: `app/pages/admin/integrations.vue`

- [ ] **Step 1: Write the failing config and webhook tests**

```ts
// tests/cms/admin-config.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseAdminConfigWrite } from '../../server/utils/admin-config'

describe('admin config validation', () => {
  it('accepts supported homepage sections only', () => {
    const result = parseAdminConfigWrite({
      key: 'homepage_sections',
      value: { sections: [{ id: 'hero', type: 'hero', visible: true, order: 0, background: '', config: {} }] },
    })
    assert.equal(result.key, 'homepage_sections')
  })

  it('rejects unknown config keys', () => {
    assert.throws(() => parseAdminConfigWrite({ key: 'totally_unknown', value: {} }))
  })

  it('rejects unsupported homepage section types', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'homepage_sections',
        value: { sections: [{ id: 'bad', type: 'custom_html', visible: true, order: 0, background: '', config: {} }] },
      }),
    )
  })
})

// e2e/api/integration-webhook.spec.ts
import { test, expect } from '@playwright/test'

test('integration webhook rejects unsigned content mutation requests', async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/integration/webhook`, {
    data: {
      type: 'news',
      action: 'create',
      data: { slug: 'unsigned-news', title: 'Unsigned' },
    },
  })

  expect(response.status()).toBe(401)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npx tsx --test tests/cms/admin-config.test.ts
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/api/integration-webhook.spec.ts --project="Desktop Chrome"
```

Expected:

```text
ERR_MODULE_NOT_FOUND for ../../server/utils/admin-config
integration webhook test returns 200 instead of 401
```

- [ ] **Step 3: Implement config registries, homepage validation, and webhook auth**

```ts
// server/utils/admin-config.ts
import { z } from 'zod'
import { isSupportedHomepageSectionType } from '../../app/shared/cms/homepage'
import type { NavigationItem } from '../../app/shared/cms/navigation'

const navigationItemSchema: z.ZodType<NavigationItem> = z.object({
  id: z.string().min(1),
  type: z.enum(['page', 'custom']),
  labelEn: z.string().min(1),
  labelTh: z.string().min(1),
  pageKey: z.string().optional(),
  href: z.string().optional(),
  target: z.enum(['_self', '_blank']).optional(),
  visible: z.boolean(),
})

const homepageSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().refine(isSupportedHomepageSectionType, 'Unsupported homepage section type'),
  visible: z.boolean(),
  order: z.number().int().nonnegative(),
  background: z.string(),
  config: z.record(z.string(), z.unknown()),
})

const configSchemas = {
  navigation: z.object({
    main: z.array(navigationItemSchema),
    footer: z.array(navigationItemSchema),
  }),
  seo: z.object({
    titleEn: z.string().optional(),
    titleTh: z.string().optional(),
    descriptionEn: z.string().optional(),
    descriptionTh: z.string().optional(),
  }),
  social: z.record(z.string(), z.string()),
  appearance: z.record(z.string(), z.union([z.string(), z.boolean()])),
  maintenance: z.object({
    enabled: z.boolean(),
    messageEn: z.string().optional(),
    messageTh: z.string().optional(),
  }),
  homepage_sections: z.object({
    sections: z.array(homepageSectionSchema),
  }),
  integrations: z.object({
    webhookSecret: z.string().min(1).optional(),
    wordpress: z.object({
      enabled: z.boolean(),
      url: z.string().optional(),
      apiKey: z.string().optional(),
      syncDirection: z.enum(['pull', 'push', 'bidirectional']).optional(),
    }).optional(),
    wix: z.object({
      enabled: z.boolean(),
      accountId: z.string().optional(),
      apiKey: z.string().optional(),
      webhookSecret: z.string().optional(),
    }).optional(),
  }),
  faq: z.array(z.object({
    labelEn: z.string().min(1),
    labelTh: z.string().min(1),
    contentEn: z.string().min(1),
    contentTh: z.string().min(1),
    visible: z.boolean(),
  })),
} satisfies Record<string, z.ZodTypeAny>

export function parseAdminConfigWrite(input: { key: string; value: unknown }) {
  const schema = configSchemas[input.key as keyof typeof configSchemas]
  if (!schema) {
    throw new Error(`Unsupported config key: ${input.key}`)
  }

  return {
    key: input.key,
    value: schema.parse(input.value),
  }
}

export function normalizeHomepageSections(value: unknown) {
  const parsed = configSchemas.homepage_sections.safeParse(value)
  if (!parsed.success) {
    return [
      { id: 'hero', type: 'hero', visible: true, order: 0, background: '/images/hero-bg.webp', config: {} },
      { id: 'weapons', type: 'weapons', visible: true, order: 1, background: '', config: {} },
      { id: 'features', type: 'features', visible: true, order: 2, background: '', config: {} },
      { id: 'highlights', type: 'highlights', visible: true, order: 3, background: '', config: {} },
      { id: 'news', type: 'news', visible: true, order: 4, background: '', config: {} },
      { id: 'cta', type: 'cta', visible: true, order: 5, background: '', config: {} },
    ]
  }

  return parsed.data.sections
}
```

```ts
// server/api/admin/config.put.ts
import { z } from 'zod'
import { parseAdminConfigWrite } from '../../utils/admin-config'

const configSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
})

export default defineEventHandler(async (event) => {
  const body = configSchema.parse(await readBody(event))
  let parsed: ReturnType<typeof parseAdminConfigWrite>

  try {
    parsed = parseAdminConfigWrite(body)
  } catch (error) {
    throw createError({ statusCode: 400, message: (error as Error).message })
  }

  const config = await prisma.siteConfig.upsert({
    where: { key: parsed.key },
    update: { value: parsed.value as object },
    create: { key: parsed.key, value: parsed.value as object },
  })

  await logActivity(event, 'UPDATE', 'config', `Updated config: ${parsed.key}`, parsed.key)
  return config
})
```

```ts
// server/api/integration/webhook.post.ts
export default defineEventHandler(async (event) => {
  const integrations = await prisma.siteConfig.findUnique({ where: { key: 'integrations' } })
  const configuredSecret = (integrations?.value as any)?.webhookSecret
  const providedSecret = getHeader(event, 'x-integration-secret')

  if (!configuredSecret || !providedSecret || providedSecret !== configuredSecret) {
    throw createError({ statusCode: 401, message: 'Invalid integration secret' })
  }

  const body = await readBody(event)
  const { type, action, data } = body

  if (type === 'news' || type === 'post') {
    if (action === 'create' || action === 'update') {
      const slug = String(data.slug || `imported-${Date.now()}`)
      await prisma.newsArticle.upsert({
        where: { slug },
        update: {
          titleEn: data.title || data.titleEn,
          titleTh: data.titleTh || data.title || data.titleEn,
          excerptEn: data.excerpt || data.excerptEn,
          excerptTh: data.excerptTh || data.excerpt || data.excerptEn,
          contentEn: data.content || data.contentEn,
          contentTh: data.contentTh || data.content || data.contentEn,
          status: 'PUBLISHED',
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        },
        create: {
          slug,
          titleEn: data.title || data.titleEn || 'Untitled',
          titleTh: data.titleTh || data.title || data.titleEn || 'Untitled',
          category: 'ANNOUNCEMENT',
          status: 'PUBLISHED',
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        },
      })
      await logActivity(event, 'IMPORT', 'integration-webhook', `Webhook upserted news: ${slug}`, slug)
      return { success: true, message: 'News synced' }
    }
  }

  throw createError({ statusCode: 400, message: 'Unsupported webhook payload' })
})
```

```ts
// server/api/public/sections.get.ts
import { normalizeHomepageSections } from '../../utils/admin-config'

export default defineEventHandler(async () => {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'homepage_sections' } })
  return {
    sections: normalizeHomepageSections(config?.value),
  }
})
```

```vue
<!-- app/pages/admin/homepage.vue -->
<select v-model="editingSection.type" class="...">
  <option value="hero">Hero Banner</option>
  <option value="weapons">Weapons / Class Selector</option>
  <option value="features">Game Features</option>
  <option value="highlights">Highlights</option>
  <option value="news">News</option>
  <option value="cta">Call to Action</option>
</select>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```bash
npx tsx --test tests/cms/admin-config.test.ts
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/api/integration-webhook.spec.ts --project="Desktop Chrome"
```

Expected:

```text
admin-config.test.ts passes
integration-webhook.spec.ts passes with 401 on unsigned request
```

- [ ] **Step 5: Commit the config and webhook hardening changes**

```bash
git add server/utils/admin-config.ts server/api/admin/config.put.ts server/api/admin/config.get.ts server/api/public/site.get.ts server/api/public/sections.get.ts server/api/integration/webhook.post.ts app/pages/admin/homepage.vue app/pages/admin/integrations.vue tests/cms/admin-config.test.ts e2e/api/integration-webhook.spec.ts
git commit -m "feat: validate admin config writes and secure integration webhook"
```

### Task 3: Unify Media Upload and Persist Media Metadata

**Files:**
- Create: `app/composables/useAdminMediaUpload.ts`
- Create: `server/api/admin/media/[id].patch.ts`
- Create: `e2e/admin/media.spec.ts`
- Modify: `server/api/admin/media/upload.post.ts`
- Modify: `server/api/admin/media/index.get.ts`
- Modify: `app/pages/admin/media.vue`
- Modify: `app/components/admin/MediaPicker.vue`
- Modify: `app/components/admin/RichTextEditor.vue`

- [ ] **Step 1: Write the failing media regression tests**

```ts
// e2e/admin/media.spec.ts
import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'

test.describe('admin media flows', () => {
  test('uploads an image and persists alt text edits', async ({ page }) => {
    test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

    await page.goto('/admin/login')
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/admin(?!\/login)/)

    await page.goto('/admin/media')
    await page.locator('input[type="file"]').first().setInputFiles('e2e/fixtures/test-image.png')
    await expect(page.getByText(/uploaded 1 file/i)).toBeVisible()

    await page.getByText('test-image.png').click()
    await page.getByLabel(/alt text/i).fill('Test image alt')
    await page.getByRole('button', { name: /save/i }).click()

    await page.reload()
    await page.getByText('test-image.png').click()
    await expect(page.getByLabel(/alt text/i)).toHaveValue('Test image alt')
  })
})
```

- [ ] **Step 2: Run the media regression test to verify the current behavior fails**

Run:

```bash
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/admin/media.spec.ts --project="Desktop Chrome"
```

Expected:

```text
upload succeeds inconsistently or alt text is not persisted after reload
```

- [ ] **Step 3: Implement a single shared upload flow and alt-text persistence**

```ts
// app/composables/useAdminMediaUpload.ts
import { buildMediaUploadError } from '../shared/cms/media'

export function useAdminMediaUpload() {
  async function uploadFile(file: File, onProgress?: (percent: number) => void) {
    const formData = new FormData()
    formData.append('file', file)

    return await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
          return
        }

        try {
          const parsed = JSON.parse(xhr.responseText)
          reject(parsed)
        } catch {
          reject(buildMediaUploadError('UPLOAD_WRITE_FAILED', `Upload failed (${xhr.status})`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(buildMediaUploadError('UPLOAD_WRITE_FAILED', 'Network error during upload'))
      })

      xhr.open('POST', '/api/admin/media/upload')
      xhr.withCredentials = true
      xhr.send(formData)
    })
  }

  return { uploadFile }
}
```

```ts
// server/api/admin/media/[id].patch.ts
import { z } from 'zod'

const mediaMetadataSchema = z.object({
  altText: z.string().trim().max(255).nullable(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid media asset id' })
  }

  const body = mediaMetadataSchema.parse(await readBody(event))

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: { altText: body.altText },
  })

  await logActivity(event, 'UPDATE', 'media', `Updated media metadata: ${asset.originalName}`, asset.id)
  return asset
})
```

```ts
// server/api/admin/media/upload.post.ts
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { ALLOWED_MEDIA_MIME_TYPES, MAX_MEDIA_UPLOAD_BYTES, isAllowedMediaMimeType, buildMediaUploadError } from '../../../app/shared/cms/media'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export default defineEventHandler(async (event) => {
  await mkdir(UPLOAD_DIR, { recursive: true })

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, data: buildMediaUploadError('NO_FILE', 'No file provided', 'file') })
  }

  const results = []

  for (const part of formData) {
    if (!part.filename || !part.type) continue

    if (!isAllowedMediaMimeType(part.type)) {
      throw createError({ statusCode: 400, data: buildMediaUploadError('UNSUPPORTED_TYPE', `Unsupported file type: ${part.type}`, 'file') })
    }

    if (part.data.length > MAX_MEDIA_UPLOAD_BYTES) {
      throw createError({ statusCode: 400, data: buildMediaUploadError('FILE_TOO_LARGE', 'File too large. Max 10MB', 'file') })
    }

    const ext = extname(part.filename).toLowerCase() || '.bin'
    const filename = `${randomUUID()}${ext}`
    const filePath = join(UPLOAD_DIR, filename)
    await writeFile(filePath, part.data)

    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName: part.filename,
        mimeType: part.type,
        sizeBytes: part.data.length,
        url: `/uploads/${filename}`,
      },
    })

    results.push(asset)
  }

  await logActivity(event, 'CREATE', 'media', `Uploaded ${results.length} file(s)`)
  return results
})
```

```vue
<!-- app/pages/admin/media.vue -->
const { uploadFile } = useAdminMediaUpload()

async function uploadFiles(fileList: FileList | File[]) {
  const files = Array.from(fileList)
  if (!files.length) return

  const { valid, rejected } = validateFiles(files)
  for (const message of rejected) showToast(message, 'error', 5000)
  if (!valid.length) return

  const newItems = valid.map((file, index) => ({
    id: `upload-${Date.now()}-${index}`,
    name: file.name,
    size: file.size,
    progress: 0,
    status: 'pending' as const,
  }))
  uploadQueue.value.push(...newItems)

  for (let index = 0; index < valid.length; index++) {
    const queueItem = newItems[index]
    try {
      queueItem.status = 'uploading'
      await uploadFile(valid[index], (percent) => { queueItem.progress = percent })
      queueItem.status = 'done'
      queueItem.progress = 100
    } catch (error: any) {
      queueItem.status = 'error'
      queueItem.error = error?.message || error?.data?.message || 'Upload failed'
    }
  }

  await loadAssets()
}

async function saveAltText() {
  if (!selectedAsset.value) return
  selectedAsset.value = await $fetch(`/api/admin/media/${selectedAsset.value.id}`, {
    method: 'PATCH',
    body: { altText: editAltText.value.trim() || null },
  })
  showToast('Alt text saved')
  detailOpen.value = false
}
```

```vue
<!-- app/components/admin/MediaPicker.vue -->
const { uploadFile } = useAdminMediaUpload()

async function uploadFiles(files: FileList | File[]) {
  if (!files || files.length === 0) return
  uploading.value = true
  uploadProgress.value = `0/${files.length}`

  try {
    for (let index = 0; index < files.length; index++) {
      uploadProgress.value = `${index + 1}/${files.length}`
      await uploadFile(files[index])
    }
    await loadAssets()
  } catch (err: any) {
    console.error('[MediaPicker] Upload failed:', err?.message || err?.data?.message)
  } finally {
    uploading.value = false
    uploadProgress.value = ''
  }
}
```

- [ ] **Step 4: Run the media regression test to verify it passes**

Run:

```bash
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/admin/media.spec.ts --project="Desktop Chrome"
```

Expected:

```text
admin media upload flow passes
alt text remains populated after reload
```

- [ ] **Step 5: Commit the media stabilization work**

```bash
git add app/composables/useAdminMediaUpload.ts server/api/admin/media app/pages/admin/media.vue app/components/admin/MediaPicker.vue app/components/admin/RichTextEditor.vue e2e/admin/media.spec.ts
git commit -m "feat: unify admin media uploads and persist media metadata"
```

### Task 4: Migrate CMS Page Storage to `PageContent` and Update Admin/Backup Data Flows

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `server/api/admin/pages/[key].get.ts`
- Modify: `server/api/admin/pages/[key].put.ts`
- Create: `server/api/admin/pages/index.get.ts`
- Create: `server/api/admin/pages/index.post.ts`
- Modify: `server/api/admin/backup/export.post.ts`
- Modify: `server/api/admin/backup/import.post.ts`
- Modify: `server/routes/sitemap.xml.ts`

- [ ] **Step 1: Write the failing page-storage test**

```ts
// tests/cms/pages.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizePageCreateInput } from '../../app/shared/cms/pages'

describe('page create helpers', () => {
  it('creates a stable key and slug for custom pages', () => {
    const page = normalizePageCreateInput({ titleEn: 'About Us', titleTh: 'เกี่ยวกับเรา', slug: 'about-us' })
    assert.equal(page.key, 'about-us')
    assert.equal(page.slug, 'about-us')
    assert.equal(page.isSystemPage, false)
  })
})
```

- [ ] **Step 2: Run the failing page-storage test**

Run:

```bash
npx tsx --test tests/cms/pages.test.ts
```

Expected:

```text
normalizePageCreateInput is not exported yet
```

- [ ] **Step 3: Add the Prisma fields, admin page APIs, and backup/sitemap migration**

```prisma
// prisma/schema.prisma
model PageContent {
  key          String        @id
  slug         String        @unique
  titleEn      String        @default("")
  titleTh      String        @default("")
  description  String?
  template     String        @default("default")
  seoTitle     String?
  seoDesc      String?
  contentEn    String?       @db.Text
  contentTh    String?       @db.Text
  icon         String?
  status       ContentStatus @default(PUBLISHED)
  showInHeader Boolean       @default(false)
  showInFooter Boolean       @default(false)
  headerOrder  Int           @default(0)
  footerOrder  Int           @default(0)
  isSystemPage Boolean       @default(false)
  updatedAt    DateTime      @updatedAt

  @@map("page_contents")
}
```

```ts
// app/shared/cms/pages.ts
export function normalizePageCreateInput(input: { titleEn: string; titleTh: string; slug: string }) {
  return {
    key: input.slug,
    slug: input.slug,
    titleEn: input.titleEn,
    titleTh: input.titleTh,
    isSystemPage: false,
    template: 'default',
    status: 'DRAFT' as const,
    showInHeader: false,
    showInFooter: false,
    headerOrder: 0,
    footerOrder: 0,
  }
}
```

```ts
// server/api/admin/pages/index.get.ts
export default defineEventHandler(async () => {
  return await prisma.pageContent.findMany({
    orderBy: [{ isSystemPage: 'desc' }, { headerOrder: 'asc' }, { updatedAt: 'desc' }],
  })
})

// server/api/admin/pages/index.post.ts
import { z } from 'zod'
import { isReservedCmsSlug, normalizePageCreateInput } from '../../../app/shared/cms/pages'

const createPageSchema = z.object({
  titleEn: z.string().min(1),
  titleTh: z.string().min(1),
  slug: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = createPageSchema.parse(await readBody(event))
  if (isReservedCmsSlug(body.slug)) {
    throw createError({ statusCode: 400, message: `Slug "${body.slug}" is reserved` })
  }

  const page = await prisma.pageContent.create({ data: normalizePageCreateInput(body) })
  await logActivity(event, 'CREATE', 'pages', `Created page: ${page.slug}`, page.key)
  return page
})
```

```ts
// server/api/admin/pages/[key].get.ts
export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')!
  const page = await prisma.pageContent.findUnique({ where: { key } })
  if (!page) {
    throw createError({ statusCode: 404, message: 'Page not found' })
  }
  return page
})

// server/api/admin/pages/[key].put.ts
export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')!
  const body = await readBody(event)
  const page = await prisma.pageContent.update({
    where: { key },
    data: body,
  })

  await logActivity(event, 'UPDATE', 'pages', `Updated page: ${page.slug}`, key)
  return page
})
```

```ts
// server/api/admin/backup/export.post.ts
if (body.pages) {
  result.pages = await prisma.pageContent.findMany()
}
```

```ts
// server/api/admin/backup/import.post.ts
if (body.pages?.length) {
  for (const page of body.pages) {
    try {
      const { updatedAt, ...data } = page
      await prisma.pageContent.upsert({
        where: { key: data.key },
        update: data,
        create: data,
      })
      imported.pages++
    } catch (e) {
      errors.push(`Page "${page.key}": ${(e as Error).message}`)
    }
  }
}
```

```ts
// server/routes/sitemap.xml.ts
const cmsPages = await prisma.pageContent.findMany({
  where: { status: 'PUBLISHED' },
  select: { slug: true, updatedAt: true },
})

for (const page of cmsPages) {
  const loc = page.slug === '' ? '/' : `/${page.slug}`
  if (staticPages.some((staticPage) => staticPage.loc === loc)) continue

  xml += `  <url>\n`
  xml += `    <loc>${baseUrl}${loc}</loc>\n`
  xml += `    <lastmod>${page.updatedAt.toISOString()}</lastmod>\n`
  xml += `    <changefreq>monthly</changefreq>\n`
  xml += `    <priority>0.6</priority>\n`
  xml += `  </url>\n`
}
```

- [ ] **Step 4: Create and apply the Prisma migration, then rerun the page test**

Run:

```bash
npx prisma migrate dev --name page-content-cms-fields
npx tsx --test tests/cms/pages.test.ts
```

Expected:

```text
Prisma migration applies successfully
pages.test.ts passes
```

- [ ] **Step 5: Commit the `PageContent` migration and admin page API**

```bash
git add prisma/schema.prisma prisma/migrations prisma/seed.ts app/shared/cms/pages.ts server/api/admin/pages server/api/admin/backup/export.post.ts server/api/admin/backup/import.post.ts server/routes/sitemap.xml.ts tests/cms/pages.test.ts
git commit -m "feat: move cms pages to page content model"
```

### Task 5: Build Public CMS Rendering and Convert System Pages to Shared Rendering

**Files:**
- Create: `server/api/public/pages/[...slug].get.ts`
- Create: `app/components/site/CmsPageRenderer.vue`
- Create: `app/pages/[...slug].vue`
- Create: `e2e/pages/cms-rendering.spec.ts`
- Modify: `app/pages/support.vue`
- Modify: `app/pages/story.vue`
- Modify: `app/pages/terms.vue`
- Modify: `app/pages/privacy.vue`
- Modify: `app/pages/download.vue`
- Modify: `app/pages/game-guide.vue`
- Modify: `app/pages/gallery.vue`

- [ ] **Step 1: Write the failing public CMS rendering test**

```ts
// e2e/pages/cms-rendering.spec.ts
import { test, expect } from '@playwright/test'

test.describe('public cms rendering', () => {
  test('system pages still render after moving to shared cms renderer', async ({ page }) => {
    const response = await page.goto('/support', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await expect(page.locator('body')).toContainText(/support/i)
  })

  test('unknown cms routes still return 404', async ({ page }) => {
    const response = await page.goto('/this-route-should-not-exist-anywhere', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })
})
```

- [ ] **Step 2: Run the CMS rendering test and verify it fails after the new files are still missing**

Run:

```bash
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/pages/cms-rendering.spec.ts --project="Desktop Chrome"
```

Expected:

```text
the new shared CMS rendering path is not wired yet
```

- [ ] **Step 3: Add the public page API, shared renderer, catch-all route, and thin system-page wrappers**

```ts
// server/api/public/pages/[...slug].get.ts
export default defineEventHandler(async (event) => {
  const slugParts = getRouterParam(event, 'slug')
  const slug = Array.isArray(slugParts) ? slugParts.join('/') : String(slugParts || '')

  const page = await prisma.pageContent.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
  })

  if (!page) {
    throw createError({ statusCode: 404, message: 'Page not found' })
  }

  return page
})
```

```vue
<!-- app/components/site/CmsPageRenderer.vue -->
<template>
  <div>
    <section class="relative flex min-h-[40vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12">
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">
          {{ currentLocale === 'th' ? page.titleTh : page.titleEn }}
        </h1>
      </div>
    </section>
    <section class="mx-auto max-w-[800px] px-6 py-12">
      <div class="prose prose-invert max-w-none" v-html="renderedHtml" />
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: {
    titleEn: string
    titleTh: string
    seoTitle?: string | null
    seoDesc?: string | null
    contentEn?: string | null
    contentTh?: string | null
  }
}>()

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const renderedHtml = computed(() => {
  const source = currentLocale.value === 'th' ? props.page.contentTh : props.page.contentEn
  return source || ''
})

usePageSeo({
  title: props.page.seoTitle || props.page.titleEn,
  description: props.page.seoDesc || '',
})
</script>
```

```vue
<!-- app/pages/[...slug].vue -->
<template>
  <CmsPageRenderer :page="page" />
</template>

<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug || '')

const { data: page } = await useFetch(`/api/public/pages/${slug}`)
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>
```

```vue
<!-- app/pages/support.vue -->
<template>
  <CmsPageRenderer :page="page" />
</template>

<script setup lang="ts">
const { data: page } = await useFetch('/api/public/pages/support')
</script>
```

Use the same wrapper pattern for:

```text
app/pages/story.vue
app/pages/terms.vue
app/pages/privacy.vue
app/pages/download.vue
app/pages/game-guide.vue
app/pages/gallery.vue
```

Each wrapper should fetch its own `PageContent` record through the public CMS page API instead of keeping hard-coded copy.

- [ ] **Step 4: Run the CMS rendering regression test to verify it passes**

Run:

```bash
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/pages/cms-rendering.spec.ts --project="Desktop Chrome"
```

Expected:

```text
support page renders with 200
unknown routes still return 404
```

- [ ] **Step 5: Commit the public CMS rendering layer**

```bash
git add server/api/public/pages app/components/site/CmsPageRenderer.vue app/pages/[...slug].vue app/pages/support.vue app/pages/story.vue app/pages/terms.vue app/pages/privacy.vue app/pages/download.vue app/pages/game-guide.vue app/pages/gallery.vue e2e/pages/cms-rendering.spec.ts
git commit -m "feat: render cms pages through shared public renderer"
```

### Task 6: Rebuild Admin Pages and Navigation Around Route-Safe Page References

**Files:**
- Modify: `app/pages/admin/pages.vue`
- Modify: `app/pages/admin/menus.vue`
- Modify: `app/pages/admin/settings.vue`
- Modify: `server/api/public/site.get.ts`
- Modify: `app/components/site/SiteNavigation.vue`
- Modify: `app/components/site/SiteFooter.vue`
- Create: `e2e/admin/cms-pages.spec.ts`

- [ ] **Step 1: Write the failing CMS page and navigation E2E flow**

```ts
// e2e/admin/cms-pages.spec.ts
import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'

test('admin can create a page and add it to header navigation without 404s', async ({ page }) => {
  test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

  await page.goto('/admin/login')
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin(?!\/login)/)

  await page.goto('/admin/pages')
  await page.getByRole('button', { name: /new page/i }).click()
  await page.getByLabel(/title \(en\)/i).fill('About Us')
  await page.getByLabel(/title \(th\)/i).fill('เกี่ยวกับเรา')
  await page.getByLabel(/slug/i).fill('about-us')
  await page.getByRole('button', { name: /create/i }).click()

  await page.goto('/admin/menus')
  await page.getByRole('button', { name: /add page to header/i }).click()
  await page.getByText('About Us').click()
  await page.getByRole('button', { name: /save navigation/i }).click()

  await page.goto('/')
  await page.getByRole('link', { name: /about us/i }).click()
  await page.waitForURL(/\/about-us/)
  expect(page.url()).toContain('/about-us')
})
```

- [ ] **Step 2: Run the CMS page and navigation flow to verify it fails**

Run:

```bash
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/admin/cms-pages.spec.ts --project="Desktop Chrome"
```

Expected:

```text
no "New Page" flow exists
menus cannot add page-backed items yet
```

- [ ] **Step 3: Replace fixed page cards and raw href entry with page-backed management**

```vue
<!-- app/pages/admin/pages.vue -->
const pages = ref<any[]>([])
const createOpen = ref(false)
const createForm = reactive({
  titleEn: '',
  titleTh: '',
  slug: '',
})

async function loadPages() {
  pages.value = await $fetch('/api/admin/pages')
}

async function createPage() {
  await $fetch('/api/admin/pages', { method: 'POST', body: createForm })
  await loadPages()
  createOpen.value = false
}
```

```vue
<!-- app/pages/admin/menus.vue -->
const availablePages = ref<any[]>([])
const navigation = reactive({ main: [], footer: [] })

async function loadAvailablePages() {
  availablePages.value = await $fetch('/api/admin/pages')
}

function addPageNav(target: 'main' | 'footer', page: any) {
  navigation[target].push({
    id: `nav-${target}-${page.key}`,
    type: 'page',
    pageKey: page.key,
    labelEn: page.titleEn,
    labelTh: page.titleTh,
    visible: true,
    target: '_self',
  })
}

async function save() {
  await $fetch('/api/admin/config', {
    method: 'PUT',
    body: {
      key: 'navigation',
      value: navigation,
    },
  })
}
```

```ts
// server/api/public/site.get.ts
import { normalizeNavigationConfig, resolveNavigationHref } from '../../app/shared/cms/navigation'

const normalizedNavigation = normalizeNavigationConfig(configMap.get('navigation'))
const pageRecords = await prisma.pageContent.findMany({
  where: { key: { in: [...normalizedNavigation.main, ...normalizedNavigation.footer].map((item) => item.pageKey).filter(Boolean) as string[] } },
  select: { key: true, slug: true, isSystemPage: true },
})

const pageMap = new Map(pageRecords.map((page) => [page.key, page]))

return {
  navigation: {
    main: normalizedNavigation.main
      .filter((item) => item.visible !== false)
      .map((item) => ({ ...item, href: resolveNavigationHref(item, item.pageKey ? pageMap.get(item.pageKey) : undefined) })),
    footer: normalizedNavigation.footer
      .filter((item) => item.visible !== false)
      .map((item) => ({ ...item, href: resolveNavigationHref(item, item.pageKey ? pageMap.get(item.pageKey) : undefined) })),
  },
  // keep the rest of the response unchanged
}
```

```vue
<!-- app/components/site/SiteNavigation.vue -->
interface NavItem {
  id: string
  labelEn: string
  labelTh: string
  href: string
  target?: '_self' | '_blank'
}
```

```vue
<!-- app/pages/admin/settings.vue -->
<div class="settings-card">
  <div class="settings-card-header">
    <h3 class="font-semibold">Navigation</h3>
    <p class="text-xs text-white/30">Navigation is now managed from the dedicated Menus screen.</p>
  </div>
  <div class="flex-1 p-5">
    <NuxtLink to="/admin/menus" class="text-sm text-gold no-underline">Open Navigation Manager</NuxtLink>
  </div>
</div>
```

- [ ] **Step 4: Run the CMS page and navigation E2E flow to verify it passes**

Run:

```bash
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/admin/cms-pages.spec.ts --project="Desktop Chrome"
```

Expected:

```text
page creation succeeds
header navigation links to /about-us
public route returns 200 with no 404
```

- [ ] **Step 5: Commit the route-safe pages and navigation workflow**

```bash
git add app/pages/admin/pages.vue app/pages/admin/menus.vue app/pages/admin/settings.vue server/api/public/site.get.ts app/components/site/SiteNavigation.vue app/components/site/SiteFooter.vue e2e/admin/cms-pages.spec.ts
git commit -m "feat: add route-safe cms page and navigation management"
```

### Task 7: Sanitize Public HTML and Finish Release-1 Homepage/Dashboard Cleanup

**Files:**
- Create: `app/shared/cms/sanitize-html.ts`
- Create: `tests/cms/sanitize-html.test.ts`
- Modify: `app/pages/news/[slug].vue`
- Modify: `app/pages/admin/news/index.vue`
- Modify: `app/components/site/CmsPageRenderer.vue`
- Modify: `app/pages/admin/homepage.vue`
- Modify: `app/pages/admin/index.vue`

- [ ] **Step 1: Write the failing HTML sanitization test**

```ts
// tests/cms/sanitize-html.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeRichHtml } from '../../app/shared/cms/sanitize-html'

describe('sanitizeRichHtml', () => {
  it('keeps safe TipTap markup', () => {
    assert.equal(
      sanitizeRichHtml('<p><strong>Hello</strong></p>'),
      '<p><strong>Hello</strong></p>',
    )
  })

  it('strips inline scripts and javascript: urls', () => {
    const sanitized = sanitizeRichHtml('<img src=x onerror=alert(1)><a href="javascript:alert(1)">bad</a><script>alert(1)</script>')
    assert.equal(sanitized.includes('onerror'), false)
    assert.equal(sanitized.includes('javascript:'), false)
    assert.equal(sanitized.includes('<script>'), false)
  })
})
```

- [ ] **Step 2: Run the sanitization test to verify it fails**

Run:

```bash
npx tsx --test tests/cms/sanitize-html.test.ts
```

Expected:

```text
ERR_MODULE_NOT_FOUND for ../../app/shared/cms/sanitize-html
```

- [ ] **Step 3: Implement sanitization and apply it to public/news rendering and admin preview**

```ts
// app/shared/cms/sanitize-html.ts
import sanitizeHtml from 'sanitize-html'

export function sanitizeRichHtml(input: string | null | undefined) {
  return sanitizeHtml(input || '', {
    allowedTags: [
      'p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li',
      'strong', 'em', 'u', 's', 'a', 'img', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'hr', 'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}
```

```vue
<!-- app/pages/news/[slug].vue -->
<div class="prose prose-invert max-w-none ..." v-html="renderedHtml" />

<script setup lang="ts">
import { sanitizeRichHtml } from '../../shared/cms/sanitize-html'

const { data: article } = await useFetch<Article>(`/api/public/news/${slug}`)
const renderedHtml = computed(() => sanitizeRichHtml(article.value?.contentEn || article.value?.excerptEn || ''))
</script>
```

```vue
<!-- app/components/site/CmsPageRenderer.vue -->
import { sanitizeRichHtml } from '../../shared/cms/sanitize-html'

const renderedHtml = computed(() => {
  const source = currentLocale.value === 'th' ? props.page.contentTh : props.page.contentEn
  return sanitizeRichHtml(source)
})
```

```vue
<!-- app/pages/admin/news/index.vue -->
import { sanitizeRichHtml } from '../../../shared/cms/sanitize-html'

const previewContent = computed(() => sanitizeRichHtml(previewLang.value === 'th' ? form.contentTh : form.contentEn))
```

```vue
<!-- app/pages/admin/homepage.vue -->
const defaultTypes = ['hero', 'weapons', 'features', 'highlights', 'news', 'cta']
function addSection() {
  sections.value.push({
    id: `section_${Date.now()}`,
    type: 'cta',
    visible: true,
    order: sections.value.length,
    background: '',
    config: {},
  })
}
```

```vue
<!-- app/pages/admin/index.vue -->
const quickActions = [
  { icon: 'i-lucide-file-plus', label: 'New CMS Page', to: '/admin/pages' },
  { icon: 'i-lucide-upload', label: 'Upload Media', to: '/admin/media' },
  { icon: 'i-lucide-menu', label: 'Manage Menus', to: '/admin/menus' },
  { icon: 'i-lucide-home', label: 'Edit Homepage', to: '/admin/homepage' },
  { icon: 'i-lucide-newspaper', label: 'News Workflow', to: '/admin/news' },
  { icon: 'i-lucide-external-link', label: 'View Site', to: '/' },
]
```

- [ ] **Step 4: Install the sanitizer dependency, run the sanitization test, and run the release-1 verification slice**

Run:

```bash
npm install sanitize-html
npx tsx --test tests/cms/sanitize-html.test.ts
BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/api/integration-webhook.spec.ts e2e/admin/media.spec.ts e2e/admin/cms-pages.spec.ts e2e/pages/cms-rendering.spec.ts --project="Desktop Chrome"
```

Expected:

```text
sanitize-html installed successfully
sanitize-html.test.ts passes
Release-1 Playwright specs pass on Desktop Chrome
```

- [ ] **Step 5: Commit the sanitization and release-1 polish changes**

```bash
git add package.json package-lock.json app/shared/cms/sanitize-html.ts tests/cms/sanitize-html.test.ts app/pages/news/[slug].vue app/pages/admin/news/index.vue app/components/site/CmsPageRenderer.vue app/pages/admin/homepage.vue app/pages/admin/index.vue
git commit -m "feat: sanitize public cms html and finish release-1 cms polish"
```

## Self-Review

### Spec coverage

- media upload stabilization: covered by Task 1 and Task 3
- key-based config validation and webhook auth: covered by Task 2
- `PageContent` migration, backup, sitemap, and admin CRUD: covered by Task 4
- public CMS rendering and system-page conversion: covered by Task 5
- route-safe menus and page creation without 404: covered by Task 6
- homepage builder support limits and cleanup: covered by Task 2 and Task 7
- public HTML sanitization and professional content handling baseline: covered by Task 7
- dashboard polish needed to support the new flows: covered by Task 7

No Release-1 requirement from the approved spec is left without a task.

### Placeholder scan

- no `TODO`
- no `TBD`
- no “implement later”
- no “similar to Task N”
- each task includes concrete files, code, commands, and expected outputs

### Type consistency

- shared media rules flow through `app/shared/cms/media.ts`
- navigation items consistently use `NavigationItem`
- homepage sections consistently use the supported Release-1 registry
- page-backed links consistently resolve through `pageKey` plus `slug`
- public HTML rendering consistently routes through `sanitizeRichHtml`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-22-admin-cms-core-stabilization-release-1.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
