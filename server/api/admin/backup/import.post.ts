/** Import site data from JSON backup — supports all content types */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imported = { news: 0, weapons: 0, config: 0, features: 0, highlights: 0, pages: 0 }
  const errors: string[] = []

  // News
  if (body.news?.length) {
    for (const article of body.news) {
      try {
        const { id, createdAt, updatedAt, ...data } = article
        await prisma.newsArticle.upsert({
          where: { slug: data.slug },
          update: data,
          create: data,
        })
        imported.news++
      } catch (e) {
        errors.push(`News "${article.slug}": ${(e as Error).message}`)
      }
    }
  }

  // Weapons
  if (body.weapons?.length) {
    for (const weapon of body.weapons) {
      try {
        const { createdAt, updatedAt, ...data } = weapon
        await prisma.weapon.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        })
        imported.weapons++
      } catch (e) {
        errors.push(`Weapon "${weapon.name}": ${(e as Error).message}`)
      }
    }
  }

  // Config
  if (body.config?.length) {
    for (const cfg of body.config) {
      try {
        await prisma.siteConfig.upsert({
          where: { key: cfg.key },
          update: { value: cfg.value },
          create: { key: cfg.key, value: cfg.value },
        })
        imported.config++
      } catch (e) {
        errors.push(`Config "${cfg.key}": ${(e as Error).message}`)
      }
    }
  }

  // Features
  if (body.features?.length) {
    for (const feature of body.features) {
      try {
        const { createdAt, updatedAt, ...data } = feature
        await prisma.feature.upsert({
          where: { key: data.key },
          update: data,
          create: data,
        })
        imported.features++
      } catch (e) {
        errors.push(`Feature "${feature.key}": ${(e as Error).message}`)
      }
    }
  }

  // Highlights
  if (body.highlights?.length) {
    for (const highlight of body.highlights) {
      try {
        const { createdAt, updatedAt, ...data } = highlight
        await prisma.highlight.upsert({
          where: { key: data.key },
          update: data,
          create: data,
        })
        imported.highlights++
      } catch (e) {
        errors.push(`Highlight "${highlight.key}": ${(e as Error).message}`)
      }
    }
  }

  // Pages (stored in SiteConfig with page_ prefix)
  if (body.pages?.length) {
    for (const page of body.pages) {
      try {
        await prisma.siteConfig.upsert({
          where: { key: page.key },
          update: { value: page.value },
          create: { key: page.key, value: page.value },
        })
        imported.pages++
      } catch (e) {
        errors.push(`Page "${page.key}": ${(e as Error).message}`)
      }
    }
  }

  await logActivity(event, 'IMPORT', 'backup', `Imported: ${JSON.stringify(imported)}`)

  return { success: errors.length === 0, imported, errors }
})
