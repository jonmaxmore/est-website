import { parseMarketingBannerPayload } from '../../../utils/marketing-banners'
import { rethrowAsInternalError, toDuplicateConflictError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid banner ID' })
  }

  let payload: ReturnType<typeof parseMarketingBannerPayload>

  try {
    payload = parseMarketingBannerPayload(await readBody(event))
  } catch (error) {
    throw createError({ statusCode: 422, message: (error as Error).message })
  }

  try {
    const banner = await prisma.marketingBanner.update({
      where: { id },
      data: payload as Parameters<typeof prisma.marketingBanner.update>[0]['data'],
    })

    await logActivity(
      event,
      'UPDATE',
      'marketing_banners',
      `Updated banner: ${banner.titleEn}`,
      banner.id,
    )

    return banner
  } catch (err) {
    const e = err as { code?: string }
    if (e.code === 'P2025') {
      throw createError({ statusCode: 404, message: 'Banner not found' })
    }
    const conflict = toDuplicateConflictError(err as never, { resource: 'MarketingBanner' })
    if (conflict) throw conflict
    rethrowAsInternalError(err, 'Admin Banners PUT')
  }
})
