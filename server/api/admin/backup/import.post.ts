/**
 * POST /api/admin/backup/import — Import JSON backup
 *
 * Compatible schema versions: 1.0, 2.0
 * - 1.0: news, weapons, config, users, features, highlights, pages, media
 * - 2.0: เพิ่ม banners, milestones (events dropped at official launch)
 *
 * Hardening (Step 4 audit fixes):
 * - Reject bodies over MAX_IMPORT_BYTES (DoS guard)
 * - Reject non-object body / missing _meta (TypeError guard)
 * - Whitelist accepted columns per resource (mass-assignment guard)
 * - Sanitize all rich-text fields across resources, not just news/pages (stored XSS guard)
 *
 * Behaviour:
 * - แต่ละ resource batch รันใน loop แยก (per-row fault isolation)
 * - คืน per-row error log + partialSuccess flag เพื่อให้ client distinguish
 *   total-failure จาก partial-success ได้
 */
import { sanitizeRichText, sanitizeRichTextOptional } from '../../../utils/sanitize'
import { pickKnown } from '../../../utils/pick-known'
import { SYSTEM_CMS_PAGES, normalizeCmsSlug } from '../../../../app/shared/cms/pages'

const SUPPORTED_VERSIONS = new Set(['1.0', '2.0'])
const MAX_IMPORT_BYTES = 50 * 1024 * 1024 // 50 MB

const NEWS_FIELDS = ['slug', 'titleEn', 'titleTh', 'excerptEn', 'excerptTh', 'contentEn', 'contentTh', 'status', 'contentType', 'primaryTopicKey', 'category', 'featuredImage', 'ogImage', 'seoTitle', 'seoTitleTh', 'seoDesc', 'seoDescTh', 'publishedAt', 'pinned', 'sortOrder', 'campaignCode', 'readingTimeMinutes'] as const
const WEAPON_FIELDS = ['id', 'name', 'nameEn', 'descriptionEn', 'descriptionTh', 'portrait', 'infoImage', 'backgroundImage', 'icon', 'videoType', 'videoUrl', 'sortOrder', 'visible', 'statSTR', 'statINT', 'statAGI', 'statDEX', 'statHP'] as const
const FEATURE_FIELDS = ['key', 'titleEn', 'titleTh', 'descriptionEn', 'descriptionTh', 'detailEn', 'detailTh', 'icon', 'image', 'sortOrder', 'visible'] as const
const HIGHLIGHT_FIELDS = FEATURE_FIELDS
const BANNER_FIELDS = ['id', 'placement', 'scope', 'status', 'priority', 'campaignCode', 'badgeEn', 'badgeTh', 'titleEn', 'titleTh', 'bodyEn', 'bodyTh', 'desktopImage', 'mobileImage', 'targetType', 'targetArticleId', 'targetPageKey', 'targetTopicKey', 'targetUrl', 'targetNewTab', 'dismissible', 'isActive', 'config'] as const
const MILESTONE_FIELDS = ['tier', 'targetCount', 'rewardEn', 'rewardTh', 'icon', 'reached', 'sortOrder'] as const

type LegacyPageBackup = {
  key: string
  value: Record<string, unknown>
}

type PageBackup = {
  key: string
  slug?: string | null
  titleEn?: string
  titleTh?: string
  description?: string | null
  template?: string
  seoTitle?: string | null
  seoTitleTh?: string | null
  seoDesc?: string | null
  seoDescTh?: string | null
  contentEn?: string | null
  contentTh?: string | null
  icon?: string | null
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  showInHeader?: boolean
  showInFooter?: boolean
  headerOrder?: number
  footerOrder?: number
  isSystemPage?: boolean
}

function normalizeImportedPage(page: LegacyPageBackup | PageBackup): PageBackup {
  if ('value' in page) {
    const key = page.key.replace(/^page_/, '')
    const legacyValue = page.value || {}
    const systemPage = SYSTEM_CMS_PAGES.find((entry) => entry.key === key)

    return {
      key,
      slug: normalizeCmsSlug(String((legacyValue.slug as string | undefined) || key)),
      titleEn: String((legacyValue.titleEn as string | undefined) || systemPage?.titleEn || ''),
      titleTh: String((legacyValue.titleTh as string | undefined) || systemPage?.titleTh || ''),
      description: systemPage?.description || null,
      template: 'default',
      seoTitle: (legacyValue.seoTitle as string | undefined) || null,
      seoTitleTh: (legacyValue.seoTitleTh as string | undefined) || null,
      seoDesc: (legacyValue.seoDesc as string | undefined) || null,
      seoDescTh: (legacyValue.seoDescTh as string | undefined) || null,
      contentEn:
        (legacyValue.contentEn as string | undefined) ||
        (legacyValue.content as string | undefined) ||
        '',
      contentTh: (legacyValue.contentTh as string | undefined) || '',
      icon: systemPage?.icon || (legacyValue.icon as string | undefined) || null,
      status: (legacyValue.status as PageBackup['status'] | undefined) || 'PUBLISHED',
      showInHeader: false,
      showInFooter: false,
      headerOrder: 0,
      footerOrder: 0,
      isSystemPage: Boolean(systemPage),
    }
  }

  const systemPage = SYSTEM_CMS_PAGES.find((entry) => entry.key === page.key)
  return {
    key: page.key,
    slug: normalizeCmsSlug(page.slug || page.key),
    titleEn: page.titleEn || systemPage?.titleEn || '',
    titleTh: page.titleTh || systemPage?.titleTh || '',
    description: page.description ?? systemPage?.description ?? null,
    template: page.template || 'default',
    seoTitle: page.seoTitle ?? null,
    seoTitleTh: page.seoTitleTh ?? null,
    seoDesc: page.seoDesc ?? null,
    seoDescTh: page.seoDescTh ?? null,
    contentEn: page.contentEn ?? '',
    contentTh: page.contentTh ?? '',
    icon: page.icon ?? systemPage?.icon ?? null,
    status: page.status || 'PUBLISHED',
    showInHeader: page.showInHeader ?? false,
    showInFooter: page.showInFooter ?? false,
    headerOrder: page.headerOrder ?? 0,
    footerOrder: page.footerOrder ?? 0,
    isSystemPage: page.isSystemPage ?? Boolean(systemPage),
  }
}

export default defineEventHandler(async (event) => {
  // ── Body size guard (DoS) ──
  const contentLength = Number(getRequestHeader(event, 'content-length') || '0')
  if (contentLength > MAX_IMPORT_BYTES) {
    throw createError({ statusCode: 413, message: `Backup exceeds ${MAX_IMPORT_BYTES} bytes` })
  }

  const body = await readBody(event)

  // ── Body shape guard ──
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 422, message: 'Backup body must be a JSON object' })
  }

  // ── Schema version check ──
  const meta = (body as { _meta?: { version?: unknown } })._meta || {}
  const version = String(meta.version || '1.0')
  if (!SUPPORTED_VERSIONS.has(version)) {
    throw createError({
      statusCode: 422,
      message: `Unsupported backup version: ${version}. Supported: ${[...SUPPORTED_VERSIONS].join(', ')}`,
    })
  }

  const typedBody = body as Record<string, unknown>
  const imported: Record<string, number> = {}
  const errors: string[] = []
  let totalAttempted = 0

  // ── FK remap: backup carries the OLD newsArticle.id (autoincrement), but
  // after upsert-by-slug on a fresh DB the article gets a NEW id. Banners
  // that referenced the old id would otherwise become orphan FKs (or fail
  // the constraint outright). We build oldArticleId → newArticleId during
  // the news pass and remap banners.targetArticleId during their pass.
  const articleIdMap = new Map<number, number>()

  type ImportFn<T> = (item: T) => Promise<void>

  async function importBatch<T>(name: string, items: unknown, fn: ImportFn<T>) {
    if (!Array.isArray(items) || items.length === 0) return
    imported[name] = 0
    for (const item of items) {
      totalAttempted++
      try {
        await fn(item as T)
        imported[name] = (imported[name] || 0) + 1
      } catch (error) {
        errors.push(`${name}: ${(error as Error).message}`)
      }
    }
  }

  await importBatch('news', typedBody.news, async (article: Record<string, unknown>) => {
    const oldId = article.id as number | undefined
    const data = pickKnown(article, NEWS_FIELDS)
    data.contentEn = sanitizeRichTextOptional(data.contentEn as string | null | undefined)
    data.contentTh = sanitizeRichTextOptional(data.contentTh as string | null | undefined)
    if (!data.slug || typeof data.slug !== 'string') {
      throw new Error('news article missing slug')
    }
    const upserted = await prisma.newsArticle.upsert({
      where: { slug: data.slug as string },
      update: data as never,
      create: data as never,
      select: { id: true },
    })
    if (typeof oldId === 'number') {
      articleIdMap.set(oldId, upserted.id)
    }
  })

  await importBatch('weapons', typedBody.weapons, async (weapon: Record<string, unknown>) => {
    const data = pickKnown(weapon, WEAPON_FIELDS)
    if (typeof data.id !== 'number') throw new Error('weapon missing numeric id')
    data.descriptionEn = sanitizeRichTextOptional(data.descriptionEn as string | null | undefined)
    data.descriptionTh = sanitizeRichTextOptional(data.descriptionTh as string | null | undefined)
    await prisma.weapon.upsert({
      where: { id: data.id as number },
      update: data as never,
      create: data as never,
    })
  })

  await importBatch('config', typedBody.config, async (cfg: { key?: unknown; value?: unknown }) => {
    if (!cfg || typeof cfg !== 'object' || typeof cfg.key !== 'string') {
      throw new Error('config row missing key')
    }
    await prisma.siteConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value as never },
      create: { key: cfg.key, value: cfg.value as never },
    })
  })

  await importBatch('features', typedBody.features, async (feature: Record<string, unknown>) => {
    const data = pickKnown(feature, FEATURE_FIELDS)
    data.detailEn = sanitizeRichTextOptional(data.detailEn as string | null | undefined)
    data.detailTh = sanitizeRichTextOptional(data.detailTh as string | null | undefined)
    if (typeof data.key !== 'string') throw new Error('feature missing key')
    await prisma.feature.upsert({
      where: { key: data.key as string },
      update: data as never,
      create: data as never,
    })
  })

  await importBatch('highlights', typedBody.highlights, async (highlight: Record<string, unknown>) => {
    const data = pickKnown(highlight, HIGHLIGHT_FIELDS)
    data.detailEn = sanitizeRichTextOptional(data.detailEn as string | null | undefined)
    data.detailTh = sanitizeRichTextOptional(data.detailTh as string | null | undefined)
    if (typeof data.key !== 'string') throw new Error('highlight missing key')
    await prisma.highlight.upsert({
      where: { key: data.key as string },
      update: data as never,
      create: data as never,
    })
  })

  await importBatch('pages', typedBody.pages, async (page: LegacyPageBackup | PageBackup) => {
    const normalized = normalizeImportedPage(page)
    normalized.contentEn = sanitizeRichText(normalized.contentEn ?? '')
    normalized.contentTh = sanitizeRichText(normalized.contentTh ?? '')
    await prisma.pageContent.upsert({
      where: { key: normalized.key },
      update: normalized,
      create: normalized,
    })
  })

  // ── v2.0+: banners, milestones (events dropped at official launch) ──
  await importBatch('banners', typedBody.banners, async (banner: Record<string, unknown>) => {
    const data = pickKnown(banner, BANNER_FIELDS)
    data.bodyEn = sanitizeRichTextOptional(data.bodyEn as string | null | undefined)
    data.bodyTh = sanitizeRichTextOptional(data.bodyTh as string | null | undefined)

    // FK remap: targetArticleId points to OLD article.id (from export).
    // Look up the new id from the map built during the news pass.
    const oldArticleId = data.targetArticleId
    if (typeof oldArticleId === 'number') {
      const newArticleId = articleIdMap.get(oldArticleId)
      if (typeof newArticleId === 'number') {
        data.targetArticleId = newArticleId
      } else {
        // Article wasn't part of this import (maybe news section was
        // unselected, or the article was deleted upstream). Don't fail
        // the banner row — deactivate it and reset the target so the
        // FK constraint accepts the row.
        data.targetArticleId = null
        if (data.targetType === 'article') {
          data.targetType = 'url'
          data.targetUrl = data.targetUrl || ''
        }
        data.isActive = false
      }
    }

    if (typeof data.id !== 'string') throw new Error('banner missing string id')
    await prisma.marketingBanner.upsert({
      where: { id: data.id as string },
      update: data as never,
      create: data as never,
    })
  })

  await importBatch('milestones', typedBody.milestones, async (milestone: Record<string, unknown>) => {
    const data = pickKnown(milestone, MILESTONE_FIELDS)
    if (typeof data.tier !== 'number') throw new Error('milestone missing tier')
    await prisma.milestone.upsert({
      where: { tier: data.tier as number },
      update: data as never,
      create: data as never,
    })
  })

  await logActivity(
    event,
    'IMPORT',
    'backup',
    `Imported v${version}: ${JSON.stringify(imported)}${errors.length ? ` (${errors.length} errors)` : ''}`,
  )

  const importedTotal = Object.values(imported).reduce((sum, n) => sum + n, 0)

  return {
    success: errors.length === 0,
    partialSuccess: errors.length > 0 && importedTotal > 0,
    version,
    imported,
    failed: errors.length,
    attempted: totalAttempted,
    errors,
  }
})
