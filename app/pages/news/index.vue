<template>
  <main class="min-h-screen bg-[#08070b] text-white">
    <SiteMarketingBannerSlot class="mx-6 pt-24 md:mx-auto md:max-w-7xl" placement="announcement_bar" :banner="banners?.announcement_bar || null" />

    <section class="relative isolate overflow-hidden px-6 pt-24 pb-16 md:pt-28">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_12%,rgba(212,168,67,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(87,68,146,0.22),transparent_28%),linear-gradient(180deg,#110d17,#08070b_72%)]" />
      <div class="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)] lg:items-end">
        <div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0 }">
          <p class="mb-5 text-xs font-black uppercase tracking-[0.36em] text-gold">{{ t('news.webzine.eyebrow') }}</p>
          <h1 class="max-w-4xl text-[clamp(2.5rem,7vw,6.4rem)] font-black leading-[0.92] tracking-[-0.06em]">
            {{ t('news.webzine.title') }}
          </h1>
          <p class="mt-7 max-w-2xl text-base leading-8 text-white/62">
            {{ t('news.webzine.subtitle') }}
          </p>
        </div>

        <SiteWebzineArticleCard v-if="landing?.featured" :article="landing.featured" class="lg:translate-y-8" />
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-14">
        <section>
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.24em] text-gold/80">{{ t('news.webzine.sections.latestEyebrow') }}</p>
              <h2 class="mt-2 text-2xl font-black tracking-tight">{{ t('news.webzine.sections.latestHeading') }}</h2>
            </div>
            <NuxtLink to="/news/type/GUIDE" class="hidden text-sm font-semibold text-white/50 no-underline hover:text-gold sm:block">{{ t('news.webzine.browseGuides') }}</NuxtLink>
          </div>
          <div class="grid gap-x-8 md:grid-cols-2">
            <SiteWebzineArticleCard v-for="article in landing?.latest || []" :key="article.slug" :article="article" />
          </div>
        </section>

        <section>
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-gold/80">{{ t('news.webzine.sections.patchNotesEyebrow') }}</p>
            <h2 class="mt-2 text-2xl font-black tracking-tight">{{ t('news.webzine.sections.patchNotesHeading') }}</h2>
          </div>
          <div class="grid gap-x-8 md:grid-cols-2">
            <SiteWebzineArticleCard v-for="article in landing?.sections?.patchNotes || []" :key="article.slug" :article="article" />
          </div>
        </section>

        <section>
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-gold/80">{{ t('news.webzine.sections.guidesEyebrow') }}</p>
            <h2 class="mt-2 text-2xl font-black tracking-tight">{{ t('news.webzine.sections.guidesHeading') }}</h2>
          </div>
          <div class="grid gap-x-8 md:grid-cols-2">
            <SiteWebzineArticleCard v-for="article in landing?.sections?.guides || []" :key="article.slug" :article="article" />
          </div>
        </section>

        <section>
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-gold/80">{{ t('news.webzine.sections.loreEyebrow') }}</p>
            <h2 class="mt-2 text-2xl font-black tracking-tight">{{ t('news.webzine.sections.loreHeading') }}</h2>
          </div>
          <div class="grid gap-x-8 md:grid-cols-2">
            <SiteWebzineArticleCard v-for="article in landing?.sections?.lore || []" :key="article.slug" :article="article" />
          </div>
        </section>

        <section>
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-gold/80">{{ t('news.webzine.sections.devBlogsEyebrow') }}</p>
            <h2 class="mt-2 text-2xl font-black tracking-tight">{{ t('news.webzine.sections.devBlogsHeading') }}</h2>
          </div>
          <div class="grid gap-x-8 md:grid-cols-2">
            <SiteWebzineArticleCard v-for="article in landing?.sections?.devBlogs || []" :key="article.slug" :article="article" />
          </div>
        </section>

      </div>

      <aside class="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <SiteMarketingBannerSlot placement="sidebar" :banner="banners?.sidebar || null" />
        <section class="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
          <p class="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-gold/80">{{ t('news.webzine.topicsHeading') }}</p>
          <div class="space-y-2">
            <NuxtLink
              v-for="topic in landing?.topics || []"
              :key="topic.key"
              :to="`/news/topic/${topic.key}`"
              class="block rounded-xl px-3 py-2 text-sm text-white/65 no-underline transition-colors hover:bg-white/7 hover:text-gold"
            >
              {{ localized(topic.labelEn, topic.labelTh) || topic.key }}
            </NuxtLink>
          </div>
        </section>
      </aside>
    </section>

    <section class="mx-6 pb-12 md:mx-auto md:max-w-7xl">
      <SiteMarketingBannerSlot placement="footer_strip" :banner="banners?.footer_strip || null" />
    </section>
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { localized } = useLocalizedField()

usePageSeo({
  title: `${t('news.webzine.title')} | ${t('news.webzine.eyebrow')}`,
  description: t('news.webzine.subtitle'),
})

const { data: landing } = await useFetch('/api/public/webzine/landing')
const { data: banners } = await useResolvedBanners({ routeType: 'news_index' })
</script>
