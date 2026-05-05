<template>
  <main class="min-h-screen bg-[#08070b] px-6 pt-28 pb-16 text-white">
    <SiteMarketingBannerSlot class="mx-auto max-w-7xl mb-6" placement="announcement_bar" :banner="banners?.announcement_bar || null" />
    <SiteMarketingBannerSlot placement="popup" :banner="banners?.popup || null" />
    <SiteMarketingBannerSlot placement="floating" :banner="banners?.floating || null" />

    <section class="mx-auto max-w-7xl">
      <NuxtLink to="/news" class="text-sm font-semibold text-white/45 no-underline hover:text-gold">Back to Chronicle</NuxtLink>
      <p class="mt-10 text-xs font-bold uppercase tracking-[0.28em] text-gold">Content Pillar</p>
      <h1 class="mt-3 text-[clamp(2.2rem,6vw,5rem)] font-black leading-none tracking-[-0.055em]">{{ heading }}</h1>
      <div class="mt-10 grid gap-x-8 md:grid-cols-2">
        <SiteWebzineArticleCard v-for="article in articles" :key="article.slug" :article="article" />
      </div>
      <SiteMarketingBannerSlot class="mt-10" placement="footer_strip" :banner="banners?.footer_strip || null" />
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const contentType = computed(() => String(route.params.contentType || '').toUpperCase())
const heading = computed(() => contentType.value.replaceAll('_', ' '))
interface ArticleCardSummary {
  slug: string
  titleEn: string
  titleTh?: string | null
  excerptEn?: string | null
  excerptTh?: string | null
  contentType?: string | null
  featuredImage?: string | null
  readingTimeMinutes?: number | null
}
const { data } = await useFetch<{ data: ArticleCardSummary[] }>('/api/public/news', {
  query: { contentType, limit: 50 },
  default: () => ({ data: [] }),
})
const articles = computed(() => data.value?.data || [])

// Pillar pages share the news_index banner scope — same global +
// announcement strip + popup mix as /news, with no per-article context.
const { data: banners } = await useResolvedBanners({ routeType: 'news_index' })

usePageSeo({
  title: `${heading.value} | Eternal Tower Saga Chronicle`,
  description: `Browse ${heading.value.toLowerCase()} articles from Eternal Tower Saga.`,
})
</script>
