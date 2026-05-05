import { ok } from '../../../utils/response'
import { toNotFoundError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid banner ID' })
  }

  let banner: { titleEn: string; id: string }
  try {
    banner = await prisma.marketingBanner.delete({
      where: { id },
      select: { titleEn: true, id: true },
    })
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Banner' })
    if (notFound) throw notFound
    throw err
  }

  await logActivity(event, 'DELETE', 'marketing_banners', `Deleted banner: ${banner.titleEn}`, banner.id)

  return ok()
})
