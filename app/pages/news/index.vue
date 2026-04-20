<template>
  <div>
    <!-- Hero -->
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('nav.news') }}</span>
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">{{ t('news.latestNews') }}</h1>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-12">
      <!-- Filters -->
      <div class="mb-10 flex flex-wrap justify-center gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="cursor-pointer rounded-full border px-5 py-2 text-xs font-medium transition-all duration-300"
          :class="activeCategory === cat.value
            ? 'border-gold/30 bg-gold/10 text-gold'
            : 'border-white/8 bg-transparent text-white/50 hover:border-white/20 hover:text-white'"
          @click="activeCategory = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Grid -->
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))">
        <NuxtLink
          v-for="(article, i) in filteredNews"
          :key="article.slug"
          :to="`/news/${article.slug}`"
          class="group overflow-hidden rounded-2xl border border-white/6 bg-white/4 no-underline transition-all duration-400 hover:-translate-y-1.5 hover:border-white/15 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { delay: i * 80 } }"
        >
          <div class="h-[200px] overflow-hidden">
            <img
              v-if="article.featuredImage"
              :src="article.featuredImage"
              :alt="article.titleEn"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full items-center justify-center bg-surface-elevated text-5xl">📰</div>
          </div>
          <div class="p-5">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-[0.6875rem] font-semibold uppercase tracking-wider text-gold">{{ article.category }}</span>
              <time class="text-xs text-white/30">{{ formatDate(article.publishedAt) }}</time>
            </div>
            <h3 class="mb-2 text-base font-semibold leading-snug">{{ article.titleEn }}</h3>
            <p v-if="article.excerptEn" class="line-clamp-2 text-sm leading-relaxed text-white/50">{{ article.excerptEn }}</p>
          </div>
        </NuxtLink>
      </div>

      <p v-if="filteredNews.length === 0" class="py-16 text-center text-white/30">No articles found.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: `${t('nav.news')} | Eternal Tower Saga`,
  description: 'Stay up-to-date with the latest announcements, events, and updates from Eternal Tower Saga.',
})
const activeCategory = ref('ALL')
const categories = [
  { value: 'ALL', label: 'All' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'EVENT', label: 'Event' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'MEDIA', label: 'Media' },
]
interface NewsItem { slug: string; titleEn: string; excerptEn?: string | null; category: string; featuredImage?: string | null; publishedAt?: string | null }
const { data: newsData } = await useFetch<{ data: NewsItem[] }>('/api/public/news', { query: { limit: 50 }, default: () => ({ data: [] }) })
const filteredNews = computed(() => {
  const articles = newsData.value?.data || []
  if (activeCategory.value === 'ALL') return articles
  return articles.filter((a) => a.category === activeCategory.value)
})
function formatDate(d: string | null | undefined): string { if (!d) return ''; return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
</script>
