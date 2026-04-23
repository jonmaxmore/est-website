export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid banner ID' })
  }

  const banner = await prisma.marketingBanner.delete({ where: { id } })

  await logActivity(event, 'DELETE', 'marketing_banners', `Deleted banner: ${banner.titleEn}`, banner.id)

  return { ok: true }
})
