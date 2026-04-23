<template>
  <main class="min-h-screen bg-[#08070b] text-white">
    <SiteMarketingBannerSlot class="mx-6 pt-24 md:mx-auto md:max-w-7xl" placement="announcement_bar" :banner="banners?.announcement_bar || null" />

    <section class="mx-auto grid max-w-7xl gap-10 px-6 pt-24 pb-14 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article v-if="article" class="min-w-0">
        <NuxtLink to="/news" class="mb-8 inline-block text-sm font-semibold text-white/45 no-underline transition-colors hover:text-gold">
          Back to Chronicle
        </NuxtLink>

        <div class="mb-5 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">
          <span>{{ article.contentType?.replaceAll('_', ' ') || article.category }}</span>
          <span v-if="article.readingTimeMinutes" class="text-white/35">{{ article.readingTimeMinutes }} min read</span>
          <time v-if="article.publishedAt" class="text-white/35">{{ formatDate(article.publishedAt) }}</time>
        </div>

        <h1 class="max-w-4xl text-[clamp(2.2rem,6vw,5.4rem)] font-black leading-[0.98] tracking-[-0.055em]">
          {{ article.titleEn }}
        </h1>
        <p v-if="article.excerptEn" class="mt-6 max-w-2xl text-lg leading-8 text-white/58">{{ article.excerptEn }}</p>

        <img
          v-if="article.featuredImage"
          :src="article.featuredImage"
          :alt="article.titleEn"
          class="mt-10 max-h-[520px] w-full rounded-[2rem] object-cover shadow-[0_30px_90px_rgba(0,0,0,0.38)]"
        />

        <div class="prose prose-invert mt-10 max-w-none text-white/70 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-black [&_p]:mb-6 [&_p]:leading-[1.9]" v-html="renderedHtml" />
        <SiteMarketingBannerSlot class="mt-10" placement="article_inline" :banner="banners?.article_inline || null" />

        <section class="mt-16">
          <p class="text-xs font-bold uppercase tracking-[0.24em] text-gold/80">Related Content</p>
          <h2 class="mt-2 text-2xl font-black tracking-tight">Continue The Thread</h2>
          <div class="mt-4 grid gap-x-8 md:grid-cols-2">
            <SiteWebzineArticleCard v-for="item in related" :key="item.slug" :article="item" />
          </div>
        </section>
      </article>

      <aside class="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <SiteMarketingBannerSlot placement="sidebar" :banner="banners?.sidebar || null" />
      </aside>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-16">
      <SiteMarketingBannerSlot placement="footer_strip" :banner="banners?.footer_strip || null" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { sanitizeRichHtml } from '../../shared/cms/sanitize-html'

const route = useRoute()
const slug = route.params.slug as string
const { data } = await useFetch(`/api/public/news/${slug}`)
const article = computed(() => data.value?.article || null)
const related = computed(() => data.value?.related || [])
const { data: banners } = await useResolvedBanners({ routeType: 'article_detail', articleId: article.value?.id || null })
const renderedHtml = computed(() => sanitizeRichHtml(article.value?.contentEn || article.value?.excerptEn || ''))

usePageSeo({
  title: article.value?.seoTitle || article.value?.titleEn || 'News',
  description: article.value?.seoDesc || article.value?.excerptEn || 'Read the latest news from Eternal Tower Saga.',
  image: article.value?.ogImage || article.value?.featuredImage || null,
  type: 'article',
})

function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
