import { buildPagePath, SYSTEM_CMS_PAGES } from '../../../../app/shared/cms/pages'

type LegacyPageValue = Partial<{
  titleEn: string
  titleTh: string
  seoTitle: string
  seoTitleTh: string
  seoDesc: string
  seoDescTh: string
  content: string
  contentEn: string
  contentTh: string
  icon: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}>

function readLegacyPageValue(value: unknown): LegacyPageValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return value as LegacyPageValue
}

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, message: 'Invalid page key' })
  }

  const [page, legacyConfig] = await Promise.all([
    prisma.pageContent.findUnique({ where: { key } }),
    prisma.siteConfig.findUnique({ where: { key: `page_${key}` } }),
  ])

  const systemPage = SYSTEM_CMS_PAGES.find((entry) => entry.key === key)
  const legacyValue = readLegacyPageValue(legacyConfig?.value)
  const slug = page?.slug || key
  const route = buildPagePath({ key, slug, isSystemPage: page?.isSystemPage ?? Boolean(systemPage) })

  return {
    key,
    slug,
    titleEn: page?.titleEn || legacyValue.titleEn || systemPage?.titleEn || '',
    titleTh: page?.titleTh || legacyValue.titleTh || systemPage?.titleTh || '',
    description: page?.description || systemPage?.description || '',
    template: page?.template || 'default',
    seoTitle: legacyValue.seoTitle ?? page?.seoTitle ?? '',
    seoTitleTh: legacyValue.seoTitleTh ?? page?.seoTitleTh ?? '',
    seoDesc: legacyValue.seoDesc ?? page?.seoDesc ?? '',
    seoDescTh: legacyValue.seoDescTh ?? page?.seoDescTh ?? '',
    content: legacyValue.content ?? legacyValue.contentEn ?? page?.contentEn ?? '',
    contentEn: legacyValue.contentEn ?? legacyValue.content ?? page?.contentEn ?? '',
    contentTh: legacyValue.contentTh ?? page?.contentTh ?? '',
    icon: page?.icon || systemPage?.icon || legacyValue.icon || '',
    status: legacyValue.status ?? page?.status ?? 'PUBLISHED',
    showInHeader: page?.showInHeader ?? false,
    showInFooter: page?.showInFooter ?? false,
    headerOrder: page?.headerOrder ?? 0,
    footerOrder: page?.footerOrder ?? 0,
    isSystemPage: page?.isSystemPage ?? Boolean(systemPage),
    route,
    updatedAt: page?.updatedAt ?? legacyConfig?.updatedAt ?? null,
  }
})
