export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let imported = { news: 0, weapons: 0, config: 0 }

  if (body.news?.length) {
    for (const article of body.news) {
      await prisma.newsArticle.upsert({
        where: { slug: article.slug },
        update: article,
        create: article,
      })
      imported.news++
    }
  }

  if (body.weapons?.length) {
    for (const weapon of body.weapons) {
      await prisma.weapon.upsert({
        where: { id: weapon.id },
        update: weapon,
        create: weapon,
      })
      imported.weapons++
    }
  }

  if (body.config?.length) {
    for (const cfg of body.config) {
      await prisma.siteConfig.upsert({
        where: { key: cfg.key },
        update: { value: cfg.value },
        create: { key: cfg.key, value: cfg.value },
      })
      imported.config++
    }
  }

  return { success: true, imported }
})
