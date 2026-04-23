import { parseMarketingBannerPayload } from '../../../utils/marketing-banners'

export default defineEventHandler(async (event) => {
  let payload: ReturnType<typeof parseMarketingBannerPayload>

  try {
    payload = parseMarketingBannerPayload(await readBody(event))
  } catch (error) {
    throw createError({ statusCode: 400, message: (error as Error).message })
  }

  const banner = await prisma.marketingBanner.create({ data: payload })

  await logActivity(event, 'CREATE', 'marketing_banners', `Created banner: ${banner.titleEn}`, banner.id)

  return banner
})
