import { SYSTEM_CMS_PAGES, normalizeCmsSlug } from '../../../../app/shared/cms/pages'

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
      contentEn: (legacyValue.contentEn as string | undefined) || (legacyValue.content as string | undefined) || '',
      contentTh: (legacyValue.contentTh as string | undefined) || '',
      icon: systemPage?.icon || (legacyValue.icon as string | undefined) || null,
      status: ((legacyValue.status as PageBackup['status'] | undefined) || 'PUBLISHED'),
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

/** Import site data from JSON backup - supports all content types */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imported = { news: 0, weapons: 0, config: 0, features: 0, highlights: 0, pages: 0 }
  const errors: string[] = []

  if (body.news?.length) {
    for (const article of body.news) {
      try {
        const { id, createdAt, updatedAt, ...data } = article
        await prisma.newsArticle.upsert({
          where: { slug: data.slug },
          update: data,
          create: data,
        })
        imported.news += 1
      } catch (error) {
        errors.push(`News "${article.slug}": ${(error as Error).message}`)
      }
    }
  }

  if (body.weapons?.length) {
    for (const weapon of body.weapons) {
      try {
        const { createdAt, updatedAt, ...data } = weapon
        await prisma.weapon.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        })
        imported.weapons += 1
      } catch (error) {
        errors.push(`Weapon "${weapon.name}": ${(error as Error).message}`)
      }
    }
  }

  if (body.config?.length) {
    for (const cfg of body.config) {
      try {
        await prisma.siteConfig.upsert({
          where: { key: cfg.key },
          update: { value: cfg.value },
          create: { key: cfg.key, value: cfg.value },
        })
        imported.config += 1
      } catch (error) {
        errors.push(`Config "${cfg.key}": ${(error as Error).message}`)
      }
    }
  }

  if (body.features?.length) {
    for (const feature of body.features) {
      try {
        const { createdAt, updatedAt, ...data } = feature
        await prisma.feature.upsert({
          where: { key: data.key },
          update: data,
          create: data,
        })
        imported.features += 1
      } catch (error) {
        errors.push(`Feature "${feature.key}": ${(error as Error).message}`)
      }
    }
  }

  if (body.highlights?.length) {
    for (const highlight of body.highlights) {
      try {
        const { createdAt, updatedAt, ...data } = highlight
        await prisma.highlight.upsert({
          where: { key: data.key },
          update: data,
          create: data,
        })
        imported.highlights += 1
      } catch (error) {
        errors.push(`Highlight "${highlight.key}": ${(error as Error).message}`)
      }
    }
  }

  if (body.pages?.length) {
    for (const page of body.pages) {
      try {
        const normalizedPage = normalizeImportedPage(page as LegacyPageBackup | PageBackup)
        await prisma.pageContent.upsert({
          where: { key: normalizedPage.key },
          update: normalizedPage,
          create: normalizedPage,
        })
        imported.pages += 1
      } catch (error) {
        const pageKey = typeof page?.key === 'string' ? page.key : 'unknown'
        errors.push(`Page "${pageKey}": ${(error as Error).message}`)
      }
    }
  }

  await logActivity(event, 'IMPORT', 'backup', `Imported: ${JSON.stringify(imported)}`)

  return { success: errors.length === 0, imported, errors }
})
