import { prisma } from '~~/server/utils/prisma'
import { logActivity } from '~~/server/utils/activity'
import { ok, parseIdParam } from '~~/server/utils/response'
import { toNotFoundError } from '~~/server/utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event, 'id')

  let weapon: { name: string }
  try {
    weapon = await prisma.weapon.delete({ where: { id }, select: { name: true } })
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Weapon' })
    if (notFound) throw notFound
    throw err
  }

  await logActivity(event, 'DELETE', 'weapon', `Deleted weapon: ${weapon.name}`)
  return ok()
})
