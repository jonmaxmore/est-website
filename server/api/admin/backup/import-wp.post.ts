export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const wpUrl = body.url?.replace(/\/$/, '')

  if (!wpUrl) throw createError({ statusCode: 400, statusMessage: 'WordPress URL required' })

  // Fetch posts from WordPress REST API
  const posts = await $fetch<Array<{
    slug: string; title: { rendered: string }; excerpt: { rendered: string }; content: { rendered: string }
    date: string; featured_media: number; categories: number[]
  }>>(`${wpUrl}/wp-json/wp/v2/posts?per_page=50&_embed`)

  let imported = 0
  for (const post of posts) {
    const title = post.title.rendered.replace(/<[^>]*>/g, '')
    const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').trim()

    await prisma.newsArticle.upsert({
      where: { slug: post.slug },
      update: {
        titleEn: title,
        titleTh: title,
        excerptEn: excerpt,
        excerptTh: excerpt,
        contentEn: post.content.rendered,
        contentTh: post.content.rendered,
        status: 'PUBLISHED',
        publishedAt: new Date(post.date),
      },
      create: {
        slug: post.slug,
        titleEn: title,
        titleTh: title,
        excerptEn: excerpt,
        excerptTh: excerpt,
        contentEn: post.content.rendered,
        contentTh: post.content.rendered,
        category: 'ANNOUNCEMENT',
        status: 'PUBLISHED',
        publishedAt: new Date(post.date),
      },
    })
    imported++
  }

  return { success: true, imported }
})
