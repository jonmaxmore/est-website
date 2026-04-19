export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')!
  const body = await readBody(event)
  await prisma.siteConfig.upsert({
    where: { key: `page_${key}` },
    update: { value: body },
    create: { key: `page_${key}`, value: body },
  })
  return { success: true }
})
