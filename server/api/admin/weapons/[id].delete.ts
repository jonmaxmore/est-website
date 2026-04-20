import { prisma } from '~~/server/utils/prisma'
import { logActivity } from '~~/server/utils/activity'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const weapon = await prisma.weapon.delete({ where: { id } })
  await logActivity(event, 'DELETE', 'weapon', `Deleted weapon: ${weapon.name}`)
  return { success: true }
})
