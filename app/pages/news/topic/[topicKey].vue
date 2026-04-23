<template>
  <main class="min-h-screen bg-[#08070b] text-white">
    <SiteMarketingBannerSlot class="mx-6 pt-24 md:mx-auto md:max-w-7xl" placement="announcement_bar" :banner="banners?.announcement_bar || null" />

    <section class="mx-auto max-w-7xl px-6 pt-24 pb-16">
      <NuxtLink to="/news" class="text-sm font-semibold text-white/45 no-underline hover:text-gold">Back to Chronicle</NuxtLink>
      <p class="mt-10 text-xs font-bold uppercase tracking-[0.28em] text-gold">Topic Registry</p>
      <h1 class="mt-3 text-[clamp(2.2rem,6vw,5rem)] font-black leading-none tracking-[-0.055em]">{{ topicLabel }}</h1>
      <p v-if="topicDescription" class="mt-5 max-w-2xl text-base leading-8 text-white/58">{{ topicDescription }}</p>

      <div class="mt-10 grid gap-x-8 md:grid-cols-2">
        <SiteWebzineArticleCard v-for="article in articles" :key="article.slug" :article="article" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const topicKey = computed(() => String(route.params.topicKey || ''))
const { data: landing } = await useFetch('/api/public/webzine/landing')
const { data } = await useFetch<{ data: any[] }>('/api/public/news', {
  query: { topicKey, limit: 50 },
  default: () => ({ data: [] }),
})
const { data: banners } = await useResolvedBanners({ routeType: 'topic_page', topicKey: topicKey.value })

const topic = computed(() => (landing.value?.topics || []).find((item: any) => item.key === topicKey.value || item.slug === topicKey.value))
const topicLabel = computed(() => topic.value?.labelEn || topicKey.value.replaceAll('-', ' '))
const topicDescription = computed(() => topic.value?.descriptionEn || '')
const articles = computed(() => data.value?.data || [])

usePageSeo({
  title: `${topicLabel.value} | Eternal Tower Saga Chronicle`,
  description: topicDescription.value || `Browse ${topicLabel.value} articles from Eternal Tower Saga.`,
})
</script>
