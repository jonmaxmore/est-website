/**
 * POST /api/admin/backup/import — Import JSON backup
 *
 * Compatible schema versions: 1.0, 2.0
 * - 1.0: news, weapons, config, users, features, highlights, pages, media
 * - 2.0: เพิ่ม banners, events, milestones
 *
 * Behaviour:
 * - แต่ละ resource batch รันใน transaction แยก (per-row fault isolation)
 * - sanitize HTML ของ news.contentEn/contentTh และ pages.contentEn/contentTh
 * - คืน per-row error log
 */
import { sanitizeRichText } from '../../../utils/sanitize'
import { SYSTEM_CMS_PAGES, normalizeCmsSlug } from '../../../../app/shared/cms/pages'

const SUPPORTED_VERSIONS = new Set(['1.0', '2.0'])

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
  const body = await readBody(event)

  // ── Schema version check ──
  const meta = body?._meta || {}
  const version = String(meta.version || '1.0')
  if (!SUPPORTED_VERSIONS.has(version)) {
    throw createError({
      statusCode: 422,
      message: `Unsupported backup version: ${version}. Supported: ${[...SUPPORTED_VERSIONS].join(', ')}`,
    })
  }

  const imported: Record<string, number> = {}
  const errors: string[] = []

  // ── FK remap: backup carries the OLD newsArticle.id (autoincrement), but
  // after upsert-by-slug on a fresh DB the article gets a NEW id. Banners
  // that referenced the old id would otherwise become orphan FKs (or fail
  // the constraint outright). We build oldArticleId → newArticleId during
  // the news pass and remap banners.targetArticleId during their pass.
  const articleIdMap = new Map<number, number>()

  type ImportFn<T> = (item: T) => Promise<void>

  async function importBatch<T>(name: string, items: T[] | undefined, fn: ImportFn<T>) {
    if (!items?.length) return
    imported[name] = 0
    for (const item of items) {
      try {
        await fn(item)
        imported[name] = (imported[name] || 0) + 1
      } catch (error) {
        errors.push(`${name}: ${(error as Error).message}`)
      }
    }
  }

  await importBatch('news', body.news as Array<Record<string, unknown>>, async (article) => {
    const oldId = (article as { id?: number }).id
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...data } = article as Record<string, unknown>
    const safeContentEn = data.contentEn ? sanitizeRichText(String(data.contentEn)) : null
    const safeContentTh = data.contentTh ? sanitizeRichText(String(data.contentTh)) : null
    const cleanData = { ...data, contentEn: safeContentEn, contentTh: safeContentTh }
    const upserted = await prisma.newsArticle.upsert({
      where: { slug: data.slug as string },
      update: cleanData as never,
      create: cleanData as never,
      select: { id: true },
    })
    if (typeof oldId === 'number') {
      articleIdMap.set(oldId, upserted.id)
    }
  })

  await importBatch('weapons', body.weapons as Array<Record<string, unknown>>, async (weapon) => {
    const { createdAt: _ca, updatedAt: _ua, ...data } = weapon as Record<string, unknown>
    await prisma.weapon.upsert({
      where: { id: data.id as number },
      update: data as never,
      create: data as never,
    })
  })

  await importBatch('config', body.config as Array<{ key: string; value: unknown }>, async (cfg) => {
    await prisma.siteConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value as never },
      create: { key: cfg.key, value: cfg.value as never },
    })
  })

  await importBatch('features', body.features as Array<Record<string, unknown>>, async (feature) => {
    const { createdAt: _ca, updatedAt: _ua, ...data } = feature as Record<string, unknown>
    await prisma.feature.upsert({
      where: { key: data.key as string },
      update: data as never,
      create: data as never,
    })
  })

  await importBatch(
    'highlights',
    body.highlights as Array<Record<string, unknown>>,
    async (highlight) => {
      const { createdAt: _ca, updatedAt: _ua, ...data } = highlight as Record<string, unknown>
      await prisma.highlight.upsert({
        where: { key: data.key as string },
        update: data as never,
        create: data as never,
      })
    },
  )

  await importBatch('pages', body.pages as Array<LegacyPageBackup | PageBackup>, async (page) => {
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
  await importBatch('banners', body.banners as Array<Record<string, unknown>>, async (banner) => {
    const { createdAt: _ca, updatedAt: _ua, ...data } = banner as Record<string, unknown>

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

    await prisma.marketingBanner.upsert({
      where: { id: data.id as string },
      update: data as never,
      create: data as never,
    })
  })

  await importBatch(
    'milestones',
    body.milestones as Array<Record<string, unknown>>,
    async (milestone) => {
      const data = milestone as never
      await prisma.milestone.upsert({
        where: { tier: (data as { tier: number }).tier },
        update: data,
        create: data,
      })
    },
  )

  await logActivity(
    event,
    'IMPORT',
    'backup',
    `Imported v${version}: ${JSON.stringify(imported)}${errors.length ? ` (${errors.length} errors)` : ''}`,
  )

  return {
    success: errors.length === 0,
    version,
    imported,
    errors,
  }
})
