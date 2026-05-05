import { ok, parseIdParam } from '../../../utils/response'
import { toNotFoundError } from '../../../utils/prisma-errors'

/** Admin — delete a feature */
export default defineEventHandler(async (event) => {
  const id = parseIdParam(event, 'id')

  try {
    await prisma.feature.delete({ where: { id } })
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Feature' })
    if (notFound) throw notFound
    throw err
  }

  await logActivity(event, 'DELETE', 'features', `Deleted feature #${id}`, String(id))
  return ok()
})
