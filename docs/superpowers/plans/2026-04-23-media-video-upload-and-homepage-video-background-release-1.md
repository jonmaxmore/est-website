# Media Video Upload and Homepage Video Background Release 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-class video handling to the existing CMS so admins can upload and preview video assets, select a media-library video for the homepage hero background, and keep the public hero safe with poster-image fallback behavior.

**Architecture:** Extend the shared media and homepage contracts instead of adding a new media subsystem. Keep `MediaAsset` as the only storage model, add explicit `backgroundMode` and `backgroundVideo` fields to hero config normalization, upgrade the admin media surfaces to understand `video/mp4`, and render the public hero with a mode-aware `<video>` background that falls back to the current image flow.

**Tech Stack:** Nuxt 4, Vue 3, Nitro/H3, Prisma/PostgreSQL, Zod, `tsx --test`, Playwright

---

## File Map

### New files

- `e2e/admin/homepage.spec.ts` - authenticated admin flow for selecting a media-library video as the hero background and verifying the saved config persists

### Existing files to modify

- `app/shared/cms/media.ts` - shared media-kind helpers and picker accept-mode utilities
- `app/shared/cms/homepage.ts` - hero background-mode constants, types, and guards
- `server/utils/admin-config.ts` - hero config normalization plus homepage write validation for video mode
- `app/components/admin/MediaPicker.vue` - picker accept filtering, video tiles, and stable test selectors
- `app/pages/admin/media.vue` - video-aware library cards, badges, and detail preview
- `app/pages/admin/homepage.vue` - hero background mode controls plus image/video media pickers
- `app/components/organisms/HeroSection.vue` - public hero background video rendering and image fallback behavior
- `tests/cms/media.test.ts` - shared media helper coverage
- `tests/cms/homepage.test.ts` - hero background mode registry coverage
- `tests/cms/admin-config.test.ts` - homepage config normalization and validation coverage for hero video mode
- `e2e/admin/media.spec.ts` - authenticated admin video upload and media preview flow
- `e2e/pages/homepage.spec.ts` - public hero video rendering and reduced-motion fallback coverage

## Scope Notes

- This plan implements only the approved v1: `video upload in Media Library + homepage hero background video only`.
- Do not touch `scripts/seed-content.mjs`; it already has unrelated local modifications in the main workspace.
- Do not add a Prisma migration. `MediaAsset.mimeType` already gives the image-vs-video distinction needed for this release.
- Admin Playwright specs still require a real `TEST_ADMIN_PASSWORD` in `.env.test`. If it remains `change-me`, those specs should skip locally and pass in CI or another configured environment.
- Playwright video-upload coverage can use a synthetic `File` created in the browser with `type: 'video/mp4'`; the upload endpoint already validates by mime type and extension rather than decoding media frames.

### Task 1: Add Shared Media and Hero Video Contracts, Then Tighten Homepage Config Validation

**Files:**
- Modify: `app/shared/cms/media.ts`
- Modify: `app/shared/cms/homepage.ts`
- Modify: `server/utils/admin-config.ts`
- Test: `tests/cms/media.test.ts`
- Test: `tests/cms/homepage.test.ts`
- Test: `tests/cms/admin-config.test.ts`

- [ ] **Step 1: Write the failing shared-contract tests**

```ts
// tests/cms/media.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_UPLOAD_BYTES,
  MEDIA_PICKER_ACCEPT_VALUES,
  buildMediaUploadError,
  getMediaAssetKind,
  isAllowedMediaExtension,
  isAllowedMediaMimeType,
  isAllowedMediaUpload,
  matchesMediaPickerAccept,
  resolveMediaInputAccept,
} from '../../app/shared/cms/media'

describe('media helpers', () => {
  it('accepts configured image and video mime types', () => {
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4']) {
      assert.equal(isAllowedMediaMimeType(mime), true)
    }
  })

  it('derives media asset kinds from mime type', () => {
    assert.equal(getMediaAssetKind('image/png'), 'image')
    assert.equal(getMediaAssetKind('video/mp4'), 'video')
  })

  it('filters picker assets by accept mode', () => {
    assert.deepEqual(MEDIA_PICKER_ACCEPT_VALUES, ['image', 'video', 'all'])
    assert.equal(matchesMediaPickerAccept('image/png', 'image'), true)
    assert.equal(matchesMediaPickerAccept('image/png', 'video'), false)
    assert.equal(matchesMediaPickerAccept('video/mp4', 'video'), true)
    assert.equal(matchesMediaPickerAccept('video/mp4', 'all'), true)
  })

  it('maps picker accept modes to file-input filters', () => {
    assert.equal(resolveMediaInputAccept('image'), 'image/*')
    assert.equal(resolveMediaInputAccept('video'), 'video/*')
    assert.equal(resolveMediaInputAccept('all'), 'image/*,video/*')
  })

  it('accepts supported file extensions when mime types are missing', () => {
    assert.equal(isAllowedMediaExtension('hero-banner.webp'), true)
    assert.equal(isAllowedMediaExtension('document.pdf'), false)
    assert.equal(isAllowedMediaUpload('hero-banner.webp', ''), true)
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
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  HERO_BACKGROUND_MODES,
  SUPPORTED_HOMEPAGE_SECTION_TYPES,
  isHeroBackgroundMode,
  isSupportedHomepageSectionType,
  normalizeHeroBackgroundMode,
} from '../../app/shared/cms/homepage'

describe('homepage section registry', () => {
  it('allows only release-1 section types', () => {
    assert.deepEqual(SUPPORTED_HOMEPAGE_SECTION_TYPES, ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'])
  })

  it('supports only image and video hero background modes', () => {
    assert.deepEqual(HERO_BACKGROUND_MODES, ['image', 'video'])
    assert.equal(isHeroBackgroundMode('video'), true)
    assert.equal(isHeroBackgroundMode('cinematic'), false)
    assert.equal(normalizeHeroBackgroundMode('cinematic'), 'image')
  })

  it('rejects legacy unsupported section types', () => {
    assert.equal(isSupportedHomepageSectionType('custom_html'), false)
    assert.equal(isSupportedHomepageSectionType('gallery'), false)
    assert.equal(isSupportedHomepageSectionType('video'), false)
  })
})

// tests/cms/admin-config.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  normalizeDownloadPageConfig,
  normalizeEventPageConfig,
  normalizeHeroSectionConfig,
  normalizeIntegrationsConfig,
  parseAdminConfigWrite,
} from '../../server/utils/admin-config'

describe('admin config validation', () => {
  it('accepts supported homepage sections only', () => {
    const result = parseAdminConfigWrite({
      key: 'homepage_sections',
      value: { sections: [{ id: 'hero', type: 'hero', visible: true, order: 0, background: '', config: {} }] },
    })

    assert.equal(result.key, 'homepage_sections')
  })

  it('accepts hero video config when a poster image and video URL are both present', () => {
    const result = parseAdminConfigWrite({
      key: 'homepage_sections',
      value: {
        sections: [
          {
            id: 'hero',
            type: 'hero',
            visible: true,
            order: 0,
            background: '/images/hero-poster.webp',
            config: {
              backgroundMode: 'video',
              backgroundVideo: '/uploads/hero-background.mp4',
            },
          },
        ],
      },
    })

    const hero = (result.value as { sections: Array<{ config: { backgroundMode: string; backgroundVideo: string } }> }).sections[0]
    assert.equal(hero.config.backgroundMode, 'video')
    assert.equal(hero.config.backgroundVideo, '/uploads/hero-background.mp4')
  })

  it('rejects hero video config without a poster image fallback', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'homepage_sections',
        value: {
          sections: [
            {
              id: 'hero',
              type: 'hero',
              visible: true,
              order: 0,
              background: '',
              config: {
                backgroundMode: 'video',
                backgroundVideo: '/uploads/hero-background.mp4',
              },
            },
          ],
        },
      }),
    )
  })

  it('normalizes homepage hero buttons for admin-controlled CTAs', () => {
    const result = normalizeHeroSectionConfig({
      subtitleEn: 'Cross-platform fantasy RPG',
      subtitleTh: 'Cross-platform fantasy RPG',
      backgroundMode: 'video',
      backgroundVideo: '/uploads/hero-background.mp4',
      buttons: [
        { id: 'secondary', labelEn: 'Download', labelTh: 'Download', href: '/download', variant: 'secondary', visible: false, order: 2 },
        { id: 'primary', labelEn: 'Pre-register', labelTh: 'Pre-register', href: '/event', variant: 'primary', visible: true, order: 1 },
      ],
      showSocialLinks: true,
    })

    assert.equal(result.buttons.length, 2)
    assert.deepEqual(result.buttons.map((button) => button.id), ['primary', 'secondary'])
    assert.equal(result.showSocialLinks, true)
    assert.equal(result.backgroundMode, 'video')
    assert.equal(result.backgroundVideo, '/uploads/hero-background.mp4')
  })

  it('rejects unknown config keys', () => {
    assert.throws(() => parseAdminConfigWrite({ key: 'totally_unknown', value: {} }))
  })

  it('normalizes event landing controls with real and marketing registration counts', () => {
    const result = normalizeEventPageConfig({
      targetDate: '2026-10-01T00:00:00+07:00',
      registrationDisplayMode: 'actual_plus_manual',
      manualRegistrationCount: 5000,
      baseRewards: [
        { id: 'sr-box', titleEn: 'SR Weapon Box', titleTh: 'SR Weapon Box', descriptionEn: 'Choose one SR weapon', descriptionTh: 'Choose one SR weapon', order: 2, visible: true },
        { id: 'gems', titleEn: 'Gems x1000', titleTh: 'Gems x1000', descriptionEn: 'Premium currency', descriptionTh: 'Premium currency', order: 1, visible: true },
      ],
    })

    assert.equal(result.registrationDisplayMode, 'actual_plus_manual')
    assert.equal(result.manualRegistrationCount, 5000)
    assert.deepEqual(result.baseRewards.map((reward) => reward.id), ['gems', 'sr-box'])
  })

  it('normalizes cross-platform download buttons', () => {
    const result = normalizeDownloadPageConfig({
      heroTitleEn: 'Download Eternal Tower Saga',
      platforms: [
        { id: 'pc', label: 'Windows PC', url: 'https://example.com/installer.exe', platform: 'pc', order: 3, visible: true },
        { id: 'ios', label: 'App Store', url: 'https://apps.apple.com/app/example', platform: 'ios', order: 1, visible: true },
        { id: 'android', label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=example', platform: 'android', order: 2, visible: true },
      ],
    })

    assert.deepEqual(result.platforms.map((platform) => platform.id), ['ios', 'android', 'pc'])
  })

  it('keeps public tracking IDs while protecting server-side tracking secrets', () => {
    const result = normalizeIntegrationsConfig({
      analytics: {
        enabled: true,
        googleAnalyticsId: 'G-ABC1234567',
        googleTagManagerId: 'GTM-ABC1234',
        metaPixelId: '1234567890',
        metaConversionsApiToken: 'secret-token',
      },
    })

    assert.equal(result.analytics.enabled, true)
    assert.equal(result.analytics.googleAnalyticsId, 'G-ABC1234567')
    assert.equal(result.analytics.metaConversionsApiToken, 'secret-token')
  })
})
```

- [ ] **Step 2: Run the shared tests to verify they fail**

Run:

```bash
npx tsx --test tests/cms/media.test.ts tests/cms/homepage.test.ts tests/cms/admin-config.test.ts
```

Expected:

```text
SyntaxError or TypeError for missing exports:
- MEDIA_PICKER_ACCEPT_VALUES
- getMediaAssetKind
- matchesMediaPickerAccept
- resolveMediaInputAccept
- HERO_BACKGROUND_MODES
- isHeroBackgroundMode
- normalizeHeroBackgroundMode
```

- [ ] **Step 3: Add the shared helpers and homepage video validation**

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
export const MEDIA_PICKER_ACCEPT_VALUES = ['image', 'video', 'all'] as const

export type MediaPickerAccept = (typeof MEDIA_PICKER_ACCEPT_VALUES)[number]
export type MediaAssetKind = 'image' | 'video'

export function getMediaAssetKind(mimeType: string): MediaAssetKind {
  return mimeType.startsWith('video/') ? 'video' : 'image'
}

export function matchesMediaPickerAccept(mimeType: string, accept: MediaPickerAccept = 'image') {
  if (accept === 'all') {
    return true
  }

  return getMediaAssetKind(mimeType) === accept
}

export function resolveMediaInputAccept(accept: MediaPickerAccept = 'image') {
  if (accept === 'all') {
    return 'image/*,video/*'
  }

  return accept === 'video' ? 'video/*' : 'image/*'
}

// app/shared/cms/homepage.ts
export const SUPPORTED_HOMEPAGE_SECTION_TYPES = ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'] as const
export const HERO_BACKGROUND_MODES = ['image', 'video'] as const

export type HomepageSectionType = (typeof SUPPORTED_HOMEPAGE_SECTION_TYPES)[number]
export type HeroBackgroundMode = (typeof HERO_BACKGROUND_MODES)[number]

export function isSupportedHomepageSectionType(value: string): value is HomepageSectionType {
  return (SUPPORTED_HOMEPAGE_SECTION_TYPES as readonly string[]).includes(value)
}

export function isHeroBackgroundMode(value: string): value is HeroBackgroundMode {
  return (HERO_BACKGROUND_MODES as readonly string[]).includes(value)
}

export function normalizeHeroBackgroundMode(value: unknown): HeroBackgroundMode {
  return typeof value === 'string' && isHeroBackgroundMode(value) ? value : 'image'
}

// server/utils/admin-config.ts
import { HERO_BACKGROUND_MODES, isSupportedHomepageSectionType, normalizeHeroBackgroundMode } from '../../app/shared/cms/homepage'

const heroSectionConfigSchema = z.object({
  logo: z.string().optional().default('/images/logo.webp'),
  subtitleEn: z.string().optional().default(''),
  subtitleTh: z.string().optional().default(''),
  showSocialLinks: z.boolean().optional().default(false),
  backgroundMode: z.enum(HERO_BACKGROUND_MODES).optional().default('image'),
  backgroundVideo: z.string().optional().default(''),
  buttons: z.array(heroButtonSchema).optional().default([]),
})

export const DEFAULT_HERO_SECTION_CONFIG = {
  logo: '/images/logo.webp',
  subtitleEn: '',
  subtitleTh: '',
  showSocialLinks: true,
  backgroundMode: 'image' as const,
  backgroundVideo: '',
  buttons: [
    { id: 'pre-register', labelEn: 'Pre-register', labelTh: 'Pre-register', href: '/event', variant: 'primary' as const, visible: true, order: 0, target: '_self' as const },
    { id: 'download', labelEn: 'Download', labelTh: 'Download', href: '/download', variant: 'secondary' as const, visible: true, order: 1, target: '_self' as const },
  ],
}

export function normalizeHeroSectionConfig(value: unknown) {
  const parsed = heroSectionConfigSchema.safeParse(value)
  const config = parsed.success ? parsed.data : DEFAULT_HERO_SECTION_CONFIG
  const fallback = parsed.success ? DEFAULT_HERO_SECTION_CONFIG : config
  const buttons = config.buttons.length > 0 ? config.buttons : fallback.buttons

  return {
    ...DEFAULT_HERO_SECTION_CONFIG,
    ...config,
    backgroundMode: normalizeHeroBackgroundMode(config.backgroundMode),
    backgroundVideo: String(config.backgroundVideo || '').trim(),
    buttons: normalizeOrderedItems(buttons, 'hero-button')
      .map((button) => ({
        ...button,
        labelEn: button.labelEn || button.labelTh,
        labelTh: button.labelTh || button.labelEn,
      }))
      .filter((button) => button.href.trim() && (button.labelEn.trim() || button.labelTh.trim())),
  }
}

function validateHomepageSectionsForWrite(
  sections: Array<z.infer<typeof homepageSectionSchema> & { config: ReturnType<typeof normalizeHeroSectionConfig> | Record<string, unknown> }>,
) {
  for (const section of sections) {
    if (section.type !== 'hero') {
      continue
    }

    const config = normalizeHeroSectionConfig(section.config)
    if (config.backgroundMode !== 'video') {
      continue
    }

    if (!section.background.trim()) {
      throw new Error('Hero video background requires a poster image')
    }

    if (!config.backgroundVideo.trim()) {
      throw new Error('Hero video background requires a video URL')
    }
  }
}

const configParsers = {
  homepage_sections: (value: unknown) => {
    const parsed = homepageSectionsSchema.safeParse(value)
    if (!parsed.success) {
      throw parsed.error
    }

    const sections = [...parsed.data.sections]
      .map(normalizeHomepageSectionConfig)
      .sort((left, right) => left.order - right.order)

    validateHomepageSectionsForWrite(sections)

    return { sections }
  },
}
```

- [ ] **Step 4: Run the shared tests to verify they pass**

Run:

```bash
npx tsx --test tests/cms/media.test.ts tests/cms/homepage.test.ts tests/cms/admin-config.test.ts
```

Expected:

```text
# tests 3
# pass 3
```

- [ ] **Step 5: Commit the shared-contract groundwork**

```bash
git add app/shared/cms/media.ts app/shared/cms/homepage.ts server/utils/admin-config.ts tests/cms/media.test.ts tests/cms/homepage.test.ts tests/cms/admin-config.test.ts
git commit -m "feat: add hero video config contracts"
```

### Task 2: Make the Admin Media Library and Media Picker Video-Aware

**Files:**
- Modify: `app/components/admin/MediaPicker.vue`
- Modify: `app/pages/admin/media.vue`
- Test: `e2e/admin/media.spec.ts`

- [ ] **Step 1: Add the failing authenticated admin media e2e**

```ts
// e2e/admin/media.spec.ts
import { expect, test } from '@playwright/test'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

import { resolvePgConnectionString } from '../../server/utils/database-url'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'
const DATABASE_URL = resolvePgConnectionString(process.env.DATABASE_URL)
const TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zk1gAAAAASUVORK5CYII='

async function deleteUploadedMediaByOriginalName(fileName: string) {
  if (!DATABASE_URL) {
    return
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  try {
    const result = await pool.query<{ filename: string }>('SELECT "filename" FROM media_assets WHERE "originalName" = $1', [fileName])
    const filenames = result.rows.map((row) => row.filename)
    await pool.query('DELETE FROM media_assets WHERE "originalName" = $1', [fileName])

    for (const filename of filenames) {
      try {
        await unlink(join(process.cwd(), 'public', 'uploads', filename))
      } catch {
      }
    }
  } finally {
    await pool.end()
  }
}

test.describe('admin media flows', () => {
  test('uploads an image and persists alt text edits', async ({ page }) => {
    test.slow()
    test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

    const fileName = `test-image-${Date.now()}.png`
    const altText = `Test image alt ${Date.now()}`

    try {
      await page.goto('/admin/login')
      const loginStatus = await page.evaluate(
        async ({ email, password }) => {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          return response.status
        },
        { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      )
      expect(loginStatus).toBe(200)

      await page.goto('/admin/media')
      await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()

      const uploadStatus = await page.evaluate(
        async ({ name, base64 }) => {
          const binary = atob(base64)
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
          const file = new File([bytes], name, { type: 'image/png' })
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          })

          return response.status
        },
        { name: fileName, base64: TEST_IMAGE_BASE64 },
      )
      expect(uploadStatus).toBe(200)

      await page.reload({ waitUntil: 'domcontentloaded' })
      const assetName = page.getByText(fileName)
      await expect(assetName).toBeVisible({ timeout: 30000 })
      await assetName.click()
      const altTextInput = page.getByPlaceholder('Describe this image...')
      await expect(altTextInput).toBeVisible()
      await altTextInput.fill(altText)
      await page.getByRole('button', { name: /^save$/i }).click()
      await expect(page.getByText('Alt text saved')).toBeVisible()

      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByText(fileName).click()
      await expect(page.getByPlaceholder('Describe this image...')).toHaveValue(altText)
    } finally {
      await deleteUploadedMediaByOriginalName(fileName)
    }
  })

  test('uploads a video and previews it in the detail modal', async ({ page }) => {
    test.slow()
    test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

    const fileName = `test-video-${Date.now()}.mp4`

    try {
      await page.goto('/admin/login')
      const loginStatus = await page.evaluate(
        async ({ email, password }) => {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          return response.status
        },
        { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      )
      expect(loginStatus).toBe(200)

      await page.goto('/admin/media')
      const uploadStatus = await page.evaluate(
        async ({ name }) => {
          const file = new File([new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0])], name, { type: 'video/mp4' })
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          })

          return response.status
        },
        { name: fileName },
      )
      expect(uploadStatus).toBe(200)

      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByText(fileName).click()
      await expect(page.locator('video[controls]')).toBeVisible()
      await expect(page.getByText('video/mp4')).toBeVisible()
    } finally {
      await deleteUploadedMediaByOriginalName(fileName)
    }
  })
})
```

- [ ] **Step 2: Run the admin media spec to verify the new test fails when credentials are configured**

Run:

```bash
npx playwright test e2e/admin/media.spec.ts --project="Desktop Chrome"
```

Expected:

```text
If TEST_ADMIN_PASSWORD is still change-me: both tests skip.
If TEST_ADMIN_PASSWORD is configured: the new video test fails because the detail modal does not render a <video controls> preview yet.
```

- [ ] **Step 3: Upgrade the picker and media library UI for mixed image/video assets**

```vue
<!-- app/components/admin/MediaPicker.vue -->
<script setup lang="ts">
import {
  type MediaPickerAccept,
  getMediaAssetKind,
  matchesMediaPickerAccept,
  resolveMediaInputAccept,
} from '../../shared/cms/media'

interface MediaAssetItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: number
  altText?: string | null
  url: string
  thumbnailUrl?: string | null
  createdAt: string
}

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  accept?: MediaPickerAccept
  testId?: string
}>(), {
  modelValue: '',
  accept: 'image',
  testId: '',
})

const selectedAsset = computed(() => assets.value.find((asset) => asset.url === selectedUrl.value || asset.url === props.modelValue))
const selectedKind = computed(() => (selectedAsset.value ? getMediaAssetKind(selectedAsset.value.mimeType) : props.accept === 'video' ? 'video' : 'image'))
const inputAccept = computed(() => resolveMediaInputAccept(props.accept))

const filteredAssets = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const visibleAssets = assets.value.filter((asset) => matchesMediaPickerAccept(asset.mimeType, props.accept))
  if (!query) {
    return visibleAssets
  }

  return visibleAssets.filter((asset) => asset.originalName.toLowerCase().includes(query))
})
</script>

<template>
  <div class="media-picker-field" :data-testid="testId || undefined">
    <label v-if="label" class="mp-label">{{ label }}</label>
    <div class="mp-preview-row">
      <div v-if="modelValue" class="mp-thumb" @click="openModal">
        <img v-if="selectedKind === 'image'" :src="modelValue" :alt="label || 'Selected image'" />
        <div v-else class="mp-video-thumb">
          <UIcon name="i-lucide-film" class="h-5 w-5" />
          <span class="mp-video-label">{{ selectedAsset?.originalName || 'Selected video' }}</span>
        </div>
        <button type="button" class="mp-clear" title="Remove" @click.stop="emit('update:modelValue', '')">
          <UIcon name="i-lucide-x" class="h-3 w-3" />
        </button>
      </div>
      <button type="button" class="mp-browse-btn" :data-testid="testId ? `${testId}-browse` : undefined" @click="openModal">
        {{ modelValue ? 'Change' : 'Browse Media' }}
      </button>
    </div>

    <input id="mp-file-input" type="file" class="mp-hidden" :accept="inputAccept" @change="handleFileSelect" />

    <div class="mp-grid">
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="mp-item"
        :class="{ selected: selectedUrl === asset.url }"
        @click="selectedUrl = asset.url"
      >
        <img
          v-if="getMediaAssetKind(asset.mimeType) === 'image'"
          :src="asset.thumbnailUrl || asset.url"
          :alt="asset.altText || asset.originalName"
          loading="lazy"
        />
        <div v-else class="mp-video-card">
          <UIcon name="i-lucide-film" class="h-5 w-5" />
          <span class="mp-video-kind">VIDEO</span>
        </div>
        <div class="mp-item-name">{{ asset.originalName }}</div>
      </div>
    </div>
  </div>
</template>

<!-- app/pages/admin/media.vue -->
<script setup lang="ts">
import { getMediaAssetKind } from '../../shared/cms/media'

function assetKind(asset: MediaAssetItem) {
  return getMediaAssetKind(asset.mimeType)
}
</script>

<template>
  <div
    v-for="asset in filteredAssets"
    :key="asset.id"
    class="group relative cursor-pointer overflow-hidden rounded-2xl border bg-white/4 transition-all hover:-translate-y-0.5"
    :class="selectedIds.has(asset.id) ? 'border-[#d4a843] bg-[#d4a843]/5' : 'border-white/6 hover:border-white/15'"
  >
    <div class="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-white/70">
      {{ assetKind(asset) }}
    </div>
    <div class="h-[140px] overflow-hidden bg-black/20" @click="selectAsset(asset)">
      <img
        v-if="assetKind(asset) === 'image'"
        :src="asset.thumbnailUrl || asset.url"
        :alt="asset.altText || asset.originalName"
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      <div v-else class="flex h-full items-center justify-center gap-2 text-white/40">
        <UIcon name="i-lucide-film" class="h-8 w-8" />
        <span class="text-xs font-semibold uppercase tracking-[0.2em]">MP4</span>
      </div>
    </div>
  </div>

  <UModal v-model:open="detailOpen" title="Asset Details" class="sm:max-w-lg">
    <template #body>
      <div v-if="selectedAsset" class="flex flex-col gap-4 p-4">
        <img v-if="assetKind(selectedAsset) === 'image'" :src="selectedAsset.url" class="max-h-[250px] w-full rounded-lg bg-black/20 object-contain" />
        <video v-else controls preload="metadata" class="max-h-[250px] w-full rounded-lg bg-black/30">
          <source :src="selectedAsset.url" :type="selectedAsset.mimeType" />
        </video>
        <UFormField :label="assetKind(selectedAsset) === 'video' ? 'Description (optional)' : 'Alt Text (for SEO & accessibility)'">
          <UInput v-model="editAltText" :placeholder="assetKind(selectedAsset) === 'video' ? 'Describe this video...' : 'Describe this image...'" />
        </UFormField>
      </div>
    </template>
  </UModal>
</template>
```

- [ ] **Step 4: Re-run the media tests**

Run:

```bash
npx tsx --test tests/cms/media.test.ts
npx playwright test e2e/admin/media.spec.ts --project="Desktop Chrome"
```

Expected:

```text
tests/cms/media.test.ts passes.
e2e/admin/media.spec.ts passes when TEST_ADMIN_PASSWORD is configured, otherwise skips cleanly.
```

- [ ] **Step 5: Commit the media-surface upgrade**

```bash
git add app/components/admin/MediaPicker.vue app/pages/admin/media.vue e2e/admin/media.spec.ts
git commit -m "feat: make admin media surfaces video aware"
```

### Task 3: Add Homepage Hero Video Controls in Admin and Render Them Publicly

**Files:**
- Modify: `app/pages/admin/homepage.vue`
- Modify: `app/components/organisms/HeroSection.vue`
- Test: `e2e/pages/homepage.spec.ts`

- [ ] **Step 1: Add the failing public hero video tests**

```ts
// e2e/pages/homepage.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('should load with correct title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Eternal Tower Saga/)
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /Eternal Tower Saga/)
  })

  test('should render hero section', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('renders hero background video when homepage config selects video mode', async ({ page }) => {
    await page.route('**/api/public/sections', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          sections: [
            {
              id: 'hero',
              type: 'hero',
              visible: true,
              order: 0,
              background: '/images/hero-bg.webp',
              config: {
                logo: '/images/logo.webp',
                subtitleEn: 'Video hero',
                subtitleTh: 'Video hero',
                showSocialLinks: false,
                backgroundMode: 'video',
                backgroundVideo: '/uploads/test-hero.mp4',
                buttons: [],
              },
            },
          ],
        }),
      })
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const video = page.locator('section video').first()
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('poster', '/images/hero-bg.webp')
    await expect(video.locator('source')).toHaveAttribute('src', '/uploads/test-hero.mp4')
    await expect(video).toHaveJSProperty('muted', true)
    await expect(video).toHaveJSProperty('loop', true)
  })

  test('falls back to the poster image when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.route('**/api/public/sections', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          sections: [
            {
              id: 'hero',
              type: 'hero',
              visible: true,
              order: 0,
              background: '/images/hero-bg.webp',
              config: {
                logo: '/images/logo.webp',
                subtitleEn: 'Video hero',
                subtitleTh: 'Video hero',
                showSocialLinks: false,
                backgroundMode: 'video',
                backgroundVideo: '/uploads/test-hero.mp4',
                buttons: [],
              },
            },
          ],
        }),
      })
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('section video')).toHaveCount(0)
    await expect(page.locator('section img').first()).toHaveAttribute('src', '/images/hero-bg.webp')
  })
})
```

- [ ] **Step 2: Run the public homepage spec to verify the new tests fail**

Run:

```bash
npx playwright test e2e/pages/homepage.spec.ts --project="Desktop Chrome"
```

Expected:

```text
The two new homepage tests fail because HeroSection still renders only an <img> background and the admin config has no video-mode UI yet.
```

- [ ] **Step 3: Add hero background mode controls and public video rendering**

```vue
<!-- app/pages/admin/homepage.vue -->
<script setup lang="ts">
import { SUPPORTED_HOMEPAGE_SECTION_TYPES } from '../../shared/cms/homepage'

interface HeroButtonConfig {
  id: string
  labelEn: string
  labelTh: string
  href: string
  variant: 'primary' | 'secondary' | 'ghost'
  visible: boolean
  order: number
  target: '_self' | '_blank'
}

function defaultHeroConfig() {
  return {
    logo: '/images/logo.webp',
    subtitleEn: '',
    subtitleTh: '',
    showSocialLinks: true,
    backgroundMode: 'image' as const,
    backgroundVideo: '',
    buttons: [
      { id: 'pre-register', labelEn: 'Pre-register', labelTh: 'Pre-register', href: '/event', variant: 'primary', visible: true, order: 0, target: '_self' },
      { id: 'download', labelEn: 'Download', labelTh: 'Download', href: '/download', variant: 'secondary', visible: true, order: 1, target: '_self' },
    ],
  }
}

function ensureHeroConfig(section: SectionConfig) {
  if (section.type !== 'hero') return
  section.config = {
    ...defaultHeroConfig(),
    ...(section.config || {}),
    buttons: Array.isArray(section.config?.buttons) && section.config.buttons.length
      ? section.config.buttons
      : defaultHeroConfig().buttons,
  }
}
</script>

<template>
  <div class="mb-4">
    <label class="mb-1 block text-sm font-medium text-white/60">Background Image / Poster</label>
    <AdminMediaPicker v-model="editingSection.background" accept="image" test-id="hero-background-poster-picker" />
  </div>

  <div v-if="editingSection.type === 'hero'" class="mb-4 rounded-xl border border-white/6 bg-white/3 p-4">
    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-white/60">Background Mode</label>
      <select
        v-model="editingSection.config.backgroundMode"
        data-testid="hero-background-mode"
        class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50"
      >
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
    </div>

    <div v-if="editingSection.config.backgroundMode === 'video'" class="mb-3">
      <AdminMediaPicker
        v-model="editingSection.config.backgroundVideo"
        label="Background Video"
        accept="video"
        test-id="hero-background-video-picker"
      />
      <p v-if="!editingSection.background" class="mt-2 text-xs text-amber-300">
        Video mode requires a background image for poster and fallback rendering.
      </p>
    </div>
  </div>
</template>

<!-- app/components/organisms/HeroSection.vue -->
<script setup lang="ts">
import { SITE } from '~/shared/constants'

interface HeroButtonConfig {
  id: string
  labelEn: string
  labelTh: string
  href: string
  variant: 'primary' | 'secondary' | 'ghost'
  visible: boolean
  order: number
  target: '_self' | '_blank'
}

interface HeroConfig {
  logo: string
  subtitleEn: string
  subtitleTh: string
  showSocialLinks: boolean
  backgroundMode: 'image' | 'video'
  backgroundVideo: string
  buttons: HeroButtonConfig[]
}

const props = defineProps<{
  background?: string
  config?: Partial<HeroConfig>
}>()

const videoFailed = ref(false)
const prefersReducedMotion = ref(false)

const defaultHeroConfig: HeroConfig = {
  logo: '/images/logo.webp',
  subtitleEn: '',
  subtitleTh: '',
  showSocialLinks: true,
  backgroundMode: 'image',
  backgroundVideo: '',
  buttons: [
    { id: 'pre-register', labelEn: 'Pre-register', labelTh: 'Pre-register', href: '/event', variant: 'primary', visible: true, order: 0, target: '_self' },
    { id: 'download', labelEn: 'Download', labelTh: 'Download', href: '/download', variant: 'secondary', visible: true, order: 1, target: '_self' },
  ],
}

const heroConfig = computed<HeroConfig>(() => ({
  ...defaultHeroConfig,
  ...(props.config || {}),
  buttons: props.config?.buttons?.length ? props.config.buttons as HeroButtonConfig[] : defaultHeroConfig.buttons,
}))

const heroBackground = computed(() => props.background || '/images/hero-bg.webp')
const heroVideoSource = computed(() => String(heroConfig.value.backgroundVideo || '').trim())
const shouldRenderVideo = computed(() =>
  heroConfig.value.backgroundMode === 'video' &&
  heroVideoSource.value.length > 0 &&
  heroBackground.value.length > 0 &&
  !videoFailed.value &&
  !prefersReducedMotion.value,
)

function onHeroVideoError() {
  videoFailed.value = true
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<template>
  <section ref="heroRef" class="relative flex min-h-dvh w-full items-center justify-center overflow-hidden">
    <div class="absolute inset-0 z-0">
      <video
        v-if="shouldRenderVideo"
        class="h-full w-full object-cover object-[center_30%]"
        autoplay
        muted
        loop
        playsinline
        :poster="heroBackground"
        @error="onHeroVideoError"
      >
        <source :src="heroVideoSource" type="video/mp4" />
      </video>
      <img v-else :src="heroBackground" alt="" class="h-full w-full object-cover object-[center_30%]" loading="eager" />
      <div class="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[rgba(10,10,15,0.8)] to-transparent" />
      <div class="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-surface-primary to-transparent" />
    </div>
  </section>
</template>
```

- [ ] **Step 4: Re-run the public homepage tests**

Run:

```bash
npx playwright test e2e/pages/homepage.spec.ts --project="Desktop Chrome"
```

Expected:

```text
All homepage tests pass, including the new hero video and reduced-motion fallback cases.
```

- [ ] **Step 5: Commit the hero video UI and renderer**

```bash
git add app/pages/admin/homepage.vue app/components/organisms/HeroSection.vue e2e/pages/homepage.spec.ts
git commit -m "feat: support homepage hero video backgrounds"
```

### Task 4: Add Authenticated Homepage-Builder Coverage and Run the Full Verification Suite

**Files:**
- Create: `e2e/admin/homepage.spec.ts`
- Modify: `app/components/admin/MediaPicker.vue`

- [ ] **Step 1: Add the failing admin homepage-builder e2e**

```ts
// e2e/admin/homepage.spec.ts
import { expect, test, type Page } from '@playwright/test'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

import { resolvePgConnectionString } from '../../server/utils/database-url'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'
const DATABASE_URL = resolvePgConnectionString(process.env.DATABASE_URL)

async function login(page: Page) {
  const status = await page.evaluate(
    async ({ email, password }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      return response.status
    },
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  )

  expect(status).toBe(200)
}

async function uploadVideo(page: Page, fileName: string) {
  const status = await page.evaluate(
    async ({ name }) => {
      const file = new File([new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0])], name, { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      return response.status
    },
    { name: fileName },
  )

  expect(status).toBe(200)
}

async function deleteUploadedMediaByOriginalName(fileName: string) {
  if (!DATABASE_URL) {
    return
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  try {
    const result = await pool.query<{ filename: string }>('SELECT "filename" FROM media_assets WHERE "originalName" = $1', [fileName])
    const filenames = result.rows.map((row) => row.filename)
    await pool.query('DELETE FROM media_assets WHERE "originalName" = $1', [fileName])

    for (const filename of filenames) {
      try {
        await unlink(join(process.cwd(), 'public', 'uploads', filename))
      } catch {
      }
    }
  } finally {
    await pool.end()
  }
}

test.describe('admin homepage builder hero video mode', () => {
  test('saves a media-library video as the hero background source', async ({ page }) => {
    test.slow()
    test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

    const fileName = `homepage-hero-${Date.now()}.mp4`

    try {
      await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
      await login(page)
      await uploadVideo(page, fileName)

      await page.goto('/admin/homepage', { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('heading', { name: 'Homepage Builder' })).toBeVisible()

      await page.getByRole('button', { name: /edit/i }).first().click()
      await page.getByTestId('hero-background-mode').selectOption('video')
      await page.getByTestId('hero-background-video-picker-browse').click()
      await page.getByText(fileName).click()
      await page.getByRole('button', { name: /^select$/i }).click()

      await page.getByRole('button', { name: /save layout/i }).click()
      await expect(page.getByText('Homepage layout saved!')).toBeVisible()

      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: /edit/i }).first().click()
      await expect(page.getByTestId('hero-background-mode')).toHaveValue('video')
      await expect(page.getByTestId('hero-background-video-picker')).toContainText(fileName)
    } finally {
      await deleteUploadedMediaByOriginalName(fileName)
    }
  })
})
```

- [ ] **Step 2: Run the authenticated homepage-builder spec to verify it fails before the final selector polish**

Run:

```bash
npx playwright test e2e/admin/homepage.spec.ts --project="Desktop Chrome"
```

Expected:

```text
If TEST_ADMIN_PASSWORD is still change-me: the spec skips.
If TEST_ADMIN_PASSWORD is configured: the spec fails until MediaPicker and homepage.vue expose the stable test IDs and the saved picker preview shows the selected video filename.
```

- [ ] **Step 3: Finish the selector plumbing, then run the full verification suite**

```vue
<!-- app/components/admin/MediaPicker.vue -->
<template>
  <div class="media-picker-field" :data-testid="testId || undefined">
    <label v-if="label" class="mp-label">{{ label }}</label>
    <div class="mp-preview-row">
      <div v-if="modelValue" class="mp-thumb" @click="openModal">
        <img v-if="selectedKind === 'image'" :src="modelValue" :alt="label || 'Selected image'" />
        <div v-else class="mp-video-thumb">
          <UIcon name="i-lucide-film" class="h-5 w-5" />
          <span class="mp-video-label">{{ selectedAsset?.originalName || 'Selected video' }}</span>
        </div>
      </div>
      <button
        type="button"
        class="mp-browse-btn"
        :data-testid="testId ? `${testId}-browse` : undefined"
        @click="openModal"
      >
        {{ modelValue ? 'Change' : 'Browse Media' }}
      </button>
    </div>
  </div>
</template>
```

Run:

```bash
npx tsx --test tests/cms/media.test.ts tests/cms/homepage.test.ts tests/cms/admin-config.test.ts
npx playwright test e2e/pages/homepage.spec.ts --project="Desktop Chrome"
npx playwright test e2e/admin/media.spec.ts e2e/admin/homepage.spec.ts --project="Desktop Chrome"
```

Expected:

```text
Shared cms tests pass.
Public homepage spec passes.
Authenticated admin specs pass when TEST_ADMIN_PASSWORD is configured, otherwise skip cleanly.
```

- [ ] **Step 4: Commit the final verification changes**

```bash
git add app/components/admin/MediaPicker.vue e2e/admin/homepage.spec.ts
git commit -m "test: cover admin homepage video background flow"
```
