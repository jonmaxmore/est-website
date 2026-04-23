import { parseMarketingBannerPayload } from '../../../utils/marketing-banners'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid banner ID' })
  }

  let payload: ReturnType<typeof parseMarketingBannerPayload>

  try {
    payload = parseMarketingBannerPayload(await readBody(event))
  } catch (error) {
    throw createError({ statusCode: 400, message: (error as Error).message })
  }

  const banner = await prisma.marketingBanner.update({
    where: { id },
    data: payload,
  })

  await logActivity(event, 'UPDATE', 'marketing_banners', `Updated banner: ${banner.titleEn}`, banner.id)

  return banner
})
