export function buildWebzineDashboardSummary(input: {
  banners: Array<{ status: string; placement: string }>
  articles: Array<{ status: string; primaryTopicKey: string | null; featuredImage: string | null }>
}) {
  return {
    liveBanners: input.banners.filter((item) => item.status === 'LIVE').length,
    scheduledBanners: input.banners.filter((item) => item.status === 'SCHEDULED').length,
    draftArticles: input.articles.filter((item) => item.status === 'DRAFT').length,
    articlesMissingTopic: input.articles.filter((item) => !item.primaryTopicKey).length,
    articlesMissingFeaturedImage: input.articles.filter((item) => !item.featuredImage).length,
  }
}
