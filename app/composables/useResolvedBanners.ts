type ResolvedBannerMap = {
  announcement_bar: Record<string, any> | null
  popup: Record<string, any> | null
  floating: Record<string, any> | null
  homepage_inline: Record<string, any> | null
  sidebar: Record<string, any> | null
  article_inline: Record<string, any> | null
  footer_strip: Record<string, any> | null
}

const emptyResolvedBanners = (): ResolvedBannerMap => ({
  announcement_bar: null,
  popup: null,
  floating: null,
  homepage_inline: null,
  sidebar: null,
  article_inline: null,
  footer_strip: null,
})

export function useResolvedBanners(params: { routeType: string; articleId?: number | null; topicKey?: string | null }) {
  return useFetch<ResolvedBannerMap>('/api/public/banners', {
    query: params,
    default: emptyResolvedBanners,
  })
}
