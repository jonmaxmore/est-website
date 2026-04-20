<template>
  <div>
    <section class="mx-auto max-w-[800px] px-6 pt-24">
      <NuxtLink to="/news" class="mb-8 inline-block text-sm text-white/50 no-underline transition-colors duration-200 hover:text-gold">← Back to News</NuxtLink>
      <article v-if="article">
        <div class="mb-4 flex items-center gap-4">
          <span class="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">{{ article.category }}</span>
          <time class="text-sm text-white/30">{{ formatDate(article.publishedAt) }}</time>
        </div>
        <h1 class="mb-8 text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold leading-[1.3]">{{ article.titleEn }}</h1>
        <img v-if="article.featuredImage" :src="article.featuredImage" :alt="article.titleEn" class="mb-8 w-full rounded-xl" />
        <div class="prose prose-invert max-w-none text-white/60 [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_p]:mb-6 [&_p]:leading-[1.8]" v-html="article.contentEn || article.excerptEn || ''" />
      </article>
      <div v-else class="py-32 text-center"><h2>Article not found</h2><NuxtLink to="/news" class="text-white/50 no-underline hover:text-gold">← Back to News</NuxtLink></div>
    </section>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
interface Article { titleEn: string; titleTh: string; category: string; featuredImage?: string | null; publishedAt?: string | null; contentEn?: string | null; excerptEn?: string | null; seoTitle?: string | null; seoDesc?: string | null; ogImage?: string | null }
const { data: article } = await useFetch<Article>(`/api/public/news/${slug}`)
usePageSeo({
  title: article.value?.seoTitle || article.value?.titleEn || 'News',
  description: article.value?.seoDesc || article.value?.excerptEn || 'Read the latest news from Eternal Tower Saga.',
  image: article.value?.ogImage || article.value?.featuredImage || null,
  type: 'article',
})
function formatDate(d: string | null | undefined): string { if (!d) return ''; return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
</script>
