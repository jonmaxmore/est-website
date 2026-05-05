import { ok, parseIdParam } from '../../../utils/response'
import { toNotFoundError } from '../../../utils/prisma-errors'

/** Admin — delete a highlight */
export default defineEventHandler(async (event) => {
  const id = parseIdParam(event, 'id')

  try {
    await prisma.highlight.delete({ where: { id } })
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Highlight' })
    if (notFound) throw notFound
    throw err
  }

  await logActivity(event, 'DELETE', 'highlights', `Deleted highlight #${id}`, String(id))
  return ok()
})
