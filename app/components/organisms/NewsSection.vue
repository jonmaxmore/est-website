<template>
  <section
    id="news"
    class="relative overflow-hidden bg-bg-1 py-32"
    data-screen-label="04 News"
  >
    <div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg-0 to-transparent" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-0 to-transparent" />

    <div class="relative mx-auto max-w-7xl px-6">
      <!-- ── Header ─────────────────────────────────── -->
      <header
        class="mb-16 flex flex-wrap items-end justify-between gap-6"
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <div class="flex flex-col gap-4">
          <div class="section-eyebrow">
            <span><span class="num">04</span>&nbsp;&nbsp;LATEST&nbsp;UPDATES</span>
            <span class="h-px w-12 bg-gradient-to-r from-gold/60 to-transparent" />
          </div>
          <h2 class="section-title">{{ t('news.title') }}</h2>
        </div>
        <NuxtLink
          to="/news"
          class="group inline-flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold no-underline transition-all duration-300 hover:gap-5"
        >
          {{ t('news.viewAll') }}
          <span class="block h-px w-10 bg-gold transition-all duration-300 group-hover:w-16" />
          <svg class="h-3 w-3 transition-transform duration-300 group-hover:rotate-[-45deg]" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10 L10 2 M5 2 L10 2 L10 7" /></svg>
        </NuxtLink>
      </header>

      <!-- ── Asymmetric grid: 1 feature + 2 small ─── -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
        <!-- ▼ Featured (left, large) -->
        <NuxtLink
          v-if="featuredArticle"
          :to="featuredArticle.href"
          class="group relative overflow-hidden rounded-[2px] border border-ink/8 bg-bg-2 no-underline transition-all duration-500 hover:border-gold/40"
          style="min-height: clamp(380px, 44vw, 560px);"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 800, delay: 100 } }"
        >
          <img
            :src="featuredArticle.image"
            :alt="localizedTitle(featuredArticle)"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-bg-0 via-bg-0/50 to-transparent" />
          <div class="cinematic-corners absolute inset-5" />

          <span
            class="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-bg-0/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold backdrop-blur-md"
          >
            <span class="h-1 w-1 rounded-full bg-gold-bright" />
            {{ t('news.featured') }}
          </span>

          <div class="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-8 md:p-10">
            <div class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
              <span class="text-gold-bright">{{ formatDate(featuredArticle.date) }}</span>
              <span class="h-px flex-1 max-w-[60px] bg-ink/20" />
              <span>{{ localizedCategory(featuredArticle) }}</span>
            </div>
            <h3 class="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-bold leading-tight text-ink transition-colors duration-300 group-hover:text-gold-bright">
              {{ localizedTitle(featuredArticle) }}
            </h3>
            <p
              v-if="localizedExcerpt(featuredArticle)"
              class="line-clamp-2 max-w-[60ch] text-sm leading-relaxed text-ink-soft"
            >
              {{ localizedExcerpt(featuredArticle) }}
            </p>
            <div class="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-gold opacity-80 transition-all duration-300 group-hover:gap-5 group-hover:opacity-100">
              <span>{{ t('news.readMore') }}</span>
              <span class="block h-px w-8 bg-gold transition-all duration-300 group-hover:w-12" />
            </div>
          </div>
        </NuxtLink>

        <!-- ▼ Small column (right, 2 stacked) -->
        <div class="flex flex-col gap-6">
          <NuxtLink
            v-for="(article, idx) in smallArticles"
            :key="article.id"
            :to="article.href"
            class="group relative flex-1 overflow-hidden rounded-[2px] border border-ink/8 bg-bg-2 no-underline transition-all duration-500 hover:border-gold/40"
            style="min-height: clamp(180px, 22vw, 270px);"
            v-motion
            :initial="{ opacity: 0, y: 32 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 700, delay: 200 + idx * 120 } }"
          >
            <img
              :src="article.image"
              :alt="localizedTitle(article)"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-bg-0 via-bg-0/55 to-transparent" />

            <div class="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6">
              <div class="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-ink-mute">
                <span class="text-gold-bright">{{ formatDate(article.date) }}</span>
                <span class="h-px w-6 bg-ink/20" />
                <span>{{ localizedCategory(article) }}</span>
              </div>
              <h3 class="line-clamp-2 font-display text-lg font-bold leading-tight text-ink transition-colors duration-300 group-hover:text-gold-bright">
                {{ localizedTitle(article) }}
              </h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface NewsArticle {
  id: string
  titleEn: string
  titleTh: string
  excerptEn?: string
  excerptTh?: string
  categoryEn?: string
  categoryTh?: string
  image: string
  date: string | Date
  href: string
  featured?: boolean
}

const props = defineProps<{
  articles: NewsArticle[]
}>()

const { t, locale } = useI18n()

// Pick the first featured (or first overall) for the big slot, next 2 for the column
const featuredArticle = computed<NewsArticle | undefined>(() => {
  return props.articles.find((a) => a.featured) || props.articles[0]
})
const smallArticles = computed<NewsArticle[]>(() => {
  const featured = featuredArticle.value
  return props.articles.filter((a) => a !== featured).slice(0, 2)
})

function localizedTitle(a: NewsArticle) { return locale.value === 'th' ? (a.titleTh || a.titleEn) : (a.titleEn || a.titleTh) }
function localizedExcerpt(a: NewsArticle) { return locale.value === 'th' ? (a.excerptTh || a.excerptEn || '') : (a.excerptEn || a.excerptTh || '') }
function localizedCategory(a: NewsArticle) { return locale.value === 'th' ? (a.categoryTh || a.categoryEn || '') : (a.categoryEn || a.categoryTh || '') }

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return ''
  const fmt = new Intl.DateTimeFormat(locale.value === 'th' ? 'th-TH' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  return fmt.format(date).toUpperCase()
}
</script>
