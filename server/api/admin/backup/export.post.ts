export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result: Record<string, unknown> = {}

  if (body.news) {
    result.news = await prisma.newsArticle.findMany()
  }
  if (body.weapons) {
    result.weapons = await prisma.weapon.findMany()
  }
  if (body.registrations) {
    result.registrations = await prisma.preRegistration.findMany()
  }
  if (body.config) {
    result.config = await prisma.siteConfig.findMany()
  }
  if (body.users) {
    result.users = await prisma.adminUser.findMany({
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
    })
  }

  return JSON.stringify(result, null, 2)
})
