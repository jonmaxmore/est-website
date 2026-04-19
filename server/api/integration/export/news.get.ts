export default defineEventHandler(async () => {
  const news = await prisma.newsArticle.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, titleEn: true, titleTh: true, excerptEn: true, excerptTh: true, category: true, publishedAt: true },
  })
  return news
})
