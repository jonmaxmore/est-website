import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const totalRegistrations = await prisma.preRegistration.count()
  return { totalRegistrations }
})
