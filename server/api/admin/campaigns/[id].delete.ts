import { ok } from '../../../utils/response'
import { toNotFoundError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  let campaign: { name: string; slug: string }
  try {
    campaign = await prisma.campaign.delete({ where: { id }, select: { name: true, slug: true } })
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Campaign' })
    if (notFound) throw notFound
    throw err
  }

  logActivity(event, 'DELETE', 'campaigns', `Deleted campaign: ${campaign.name} (${campaign.slug})`, id)
  return ok()
})
