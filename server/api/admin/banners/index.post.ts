import { parseMarketingBannerPayload } from '../../../utils/marketing-banners'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  let payload: ReturnType<typeof parseMarketingBannerPayload>

  try {
    payload = parseMarketingBannerPayload(await readBody(event))
  } catch (error) {
    throw createError({ statusCode: 422, message: (error as Error).message })
  }

  try {
    const banner = await prisma.marketingBanner.create({
      data: payload as Parameters<typeof prisma.marketingBanner.create>[0]['data'],
    })

    await logActivity(
      event,
      'CREATE',
      'marketing_banners',
      `Created banner: ${banner.titleEn}`,
      banner.id,
    )

    return banner
  } catch (err) {
    const conflict = toDuplicateConflictError(err as never, { resource: 'MarketingBanner' })
    if (conflict) throw conflict
    throw err
  }
})
