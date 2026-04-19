<template>
  <div>
    <!-- 1. HERO SECTION -->
    <OrganismsHeroSection />

    <!-- 2. WEAPONS SHOWCASE -->
    <section class="mx-auto max-w-7xl px-6 py-[clamp(4rem,8vw,8rem)]">
      <div class="mb-12 text-center">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('nav.characters') }}</span>
        <h2 class="mx-auto max-w-lg text-[clamp(1.5rem,4vw,2.75rem)] font-extrabold tracking-tight">
          {{ t('weapons.title') }}
        </h2>
        <p class="mx-auto mt-3 max-w-md text-white/50">{{ t('weapons.subtitle') }}</p>
      </div>
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
        <NuxtLink
          v-for="weapon in weapons"
          :key="weapon.id"
          to="/weapons"
          class="group flex flex-col items-center rounded-2xl border border-white/6 bg-white/4 p-6 text-center no-underline transition-all duration-500 hover:-translate-y-2 hover:border-gold/30 hover:shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(212,168,67,0.1)]"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { delay: 100 * weapons.indexOf(weapon) } }"
        >
          <img
            :src="weapon.portrait || '/images/logo.webp'"
            :alt="weapon.nameEn || weapon.name"
            class="mb-4 h-36 w-36 object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <h3 class="text-sm font-bold uppercase tracking-widest">{{ weapon.nameEn || weapon.name }}</h3>
        </NuxtLink>
      </div>
    </section>

    <!-- 3. FEATURES SECTION -->
    <section class="relative overflow-hidden bg-gradient-to-b from-surface-primary via-surface-secondary to-surface-primary py-[clamp(4rem,8vw,8rem)]">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,168,67,0.04),transparent_60%)]" />
      <div class="relative mx-auto max-w-7xl px-6">
        <div class="mb-12 text-center">
          <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('features.title') }}</span>
          <h2 class="mx-auto max-w-lg text-[clamp(1.5rem,4vw,2.75rem)] font-extrabold tracking-tight">{{ t('features.subtitle') }}</h2>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(feature, index) in featureItems"
            :key="feature.key"
            class="group rounded-2xl border border-white/6 bg-white/4 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/20 hover:bg-white/6"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { delay: index * 80 } }"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold/8 text-2xl transition-all duration-300 group-hover:bg-gold/15 group-hover:scale-110">
              {{ feature.icon }}
            </div>
            <h3 class="mb-2 text-lg font-bold">{{ t(`features.${feature.key}`) }}</h3>
            <p class="text-sm leading-relaxed text-white/50">{{ t(`features.${feature.key}Desc`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. HIGHLIGHT SECTION -->
    <section class="py-[clamp(4rem,8vw,8rem)]">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mb-12 text-center">
          <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('highlight.title') }}</span>
          <h2 class="mx-auto max-w-lg text-[clamp(1.5rem,4vw,2.75rem)] font-extrabold tracking-tight">{{ t('highlight.subtitle') }}</h2>
        </div>
        <div class="grid gap-8 lg:grid-cols-3">
          <div
            v-for="(hl, index) in highlightItems"
            :key="hl.key"
            class="group relative overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-br from-white/6 to-white/2 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :visibleOnce="{ opacity: 1, scale: 1, transition: { delay: index * 120 } }"
          >
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/5 blur-2xl transition-all duration-500 group-hover:bg-gold/10" />
            <div class="relative">
              <div class="mb-5 text-4xl">{{ hl.icon }}</div>
              <h3 class="mb-3 text-xl font-bold">{{ t(`highlight.${hl.key}`) }}</h3>
              <p class="text-sm leading-relaxed text-white/50">{{ t(`highlight.${hl.key}Desc`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. NEWS SECTION -->
    <section class="relative overflow-hidden bg-gradient-to-b from-surface-primary via-surface-secondary to-surface-primary py-[clamp(4rem,8vw,8rem)]">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('news.title') }}</span>
            <h2 class="text-[clamp(1.5rem,4vw,2.75rem)] font-extrabold tracking-tight">{{ t('news.latestNews') }}</h2>
          </div>
          <NuxtLink to="/news" class="inline-flex items-center gap-2 text-sm font-semibold text-gold no-underline transition-colors hover:text-gold-light">
            {{ t('news.allNews') }} →
          </NuxtLink>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="(article, index) in newsArticles"
            :key="article.id"
            :to="`/news/${article.slug}`"
            class="group overflow-hidden rounded-2xl border border-white/6 bg-white/4 no-underline transition-all duration-500 hover:-translate-y-1 hover:border-gold/20"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
          >
            <div class="relative aspect-video overflow-hidden">
              <img
                :src="article.featuredImage || '/images/og-cover.png'"
                :alt="article.titleTh || article.titleEn"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute left-3 top-3">
                <span class="rounded-full bg-gold/90 px-3 py-1 text-[0.625rem] font-bold uppercase tracking-wider text-black">{{ article.category }}</span>
              </div>
            </div>
            <div class="p-5">
              <h3 class="mb-2 line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-gold">{{ article.titleTh || article.titleEn }}</h3>
              <p class="line-clamp-2 text-sm text-white/50">{{ article.excerptTh || article.excerptEn }}</p>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs text-white/30">{{ formatDate(article.publishedAt) }}</span>
                <span class="text-xs font-semibold text-gold transition-colors group-hover:text-gold-light">{{ t('news.readMore') }} →</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div v-if="!newsArticles || newsArticles.length === 0" class="py-12 text-center text-white/30">
          {{ t('news.noNews') }}
        </div>
      </div>
    </section>

    <!-- 6. CTA SECTION -->
    <section class="mx-auto max-w-7xl px-6 py-[clamp(4rem,8vw,6rem)] text-center">
      <h2
        class="mb-4 text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0 }"
      >
        {{ t('hero.cta') }}
      </h2>
      <p
        class="mx-auto mb-8 max-w-lg text-white/60"
        v-motion
        :initial="{ opacity: 0 }"
        :visibleOnce="{ opacity: 1, transition: { delay: 200 } }"
      >
        {{ t('hero.tagline') }}
      </p>
      <NuxtLink
        to="/event"
        class="inline-flex h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light px-10 text-[0.9375rem] font-extrabold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(212,168,67,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(212,168,67,0.5)]"
      >
        {{ t('event.registerButton') }}
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ title: 'Eternal Tower Saga — เกม RPG บนมือถือ' })

// Weapons from API
const { data: weapons } = await useFetch('/api/public/weapons', {
  default: () => [
    { id: 1, name: 'Sword', nameEn: 'Sword', portrait: '/images/characters/weapon-info-sword.png' },
    { id: 2, name: 'Bow', nameEn: 'Bow', portrait: '/images/characters/weapon-info-bow.png' },
    { id: 3, name: 'Wand', nameEn: 'Wand', portrait: '/images/characters/weapon-info-wand.png' },
    { id: 4, name: 'Axe', nameEn: 'Axe', portrait: '/images/characters/weapon-info-axe.png' },
  ],
})

// News from API
interface NewsArticle {
  id: number
  slug: string
  titleEn: string
  titleTh: string
  excerptEn: string | null
  excerptTh: string | null
  category: string
  featuredImage: string | null
  publishedAt: string
}
const { data: newsData } = await useFetch<{ data: NewsArticle[] }>('/api/public/news', {
  query: { limit: 3 },
  default: () => ({ data: [] }),
})
const newsArticles = computed(() => newsData.value?.data || [])

// Features list
const featureItems = [
  { key: 'openWorld', icon: '🌍' },
  { key: 'realTimePvP', icon: '⚔️' },
  { key: 'guildSystem', icon: '🏰' },
  { key: 'petSystem', icon: '🐉' },
  { key: 'craftSystem', icon: '🔨' },
  { key: 'towerClimb', icon: '🗼' },
]

// Highlight list
const highlightItems = [
  { key: 'graphics', icon: '✨' },
  { key: 'crossPlatform', icon: '📱' },
  { key: 'freeToPlay', icon: '🎮' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
