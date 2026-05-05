import { ok, parseIdParam } from '../../../utils/response'
import { toNotFoundError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event, 'id')

  try {
    await prisma.milestone.delete({ where: { id } })
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Milestone' })
    if (notFound) throw notFound
    throw err
  }

  await logActivity(event, 'DELETE', 'milestones', `Deleted milestone: ${id}`, String(id))
  return ok()
})
