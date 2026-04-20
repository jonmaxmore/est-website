import { prisma } from '~~/server/utils/prisma'
import { logActivity } from '~~/server/utils/activity'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const weapon = await prisma.weapon.create({ data: body })
  await logActivity(event, 'CREATE', 'weapon', `Created weapon: ${weapon.name}`)
  return weapon
})
