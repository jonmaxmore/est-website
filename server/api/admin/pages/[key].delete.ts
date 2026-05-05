/**
 * DELETE /api/admin/pages/[key]
 *
 * Removes a CMS page. System pages (FAQ, terms, privacy, support, etc.) are
 * protected from deletion since the seed step recreates them and the public
 * routes assume they exist. Reserved slugs are blocked the same way.
 *
 * Banners with targetPageKey pointing at the deleted page have the FK
 * SetNull-ed automatically (per prisma/schema.prisma MarketingBanner relation
 * "BannerTargetPage", onDelete: SetNull). No cascade-delete fan-out.
 */
import { SYSTEM_CMS_PAGES } from '../../../../app/shared/cms/pages'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, message: 'Invalid page key' })
  }

  const existing = await prisma.pageContent.findUnique({ where: { key } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Page not found' })
  }

  const isSystemPage =
    existing.isSystemPage === true || SYSTEM_CMS_PAGES.some((entry) => entry.key === key)
  if (isSystemPage) {
    throw createError({
      statusCode: 400,
      message: 'System pages cannot be deleted',
    })
  }

  try {
    await prisma.pageContent.delete({ where: { key } })
  } catch (err) {
    const conflict = toDuplicateConflictError(
      err as { code?: string; meta?: { target?: string[] | string } },
      { resource: 'CMS page' },
    )
    if (conflict) throw conflict
    throw err
  }

  await logActivity(
    event,
    'DELETE',
    'pages',
    `Deleted page: ${existing.titleEn} (${existing.slug})`,
    key,
  )

  return { success: true }
})
