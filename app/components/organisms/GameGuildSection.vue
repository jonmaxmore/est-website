<template>
  <section
    id="features"
    class="relative overflow-hidden bg-bg-1 py-32"
    data-screen-label="04 Game Guild"
  >
    <!-- Top gradient seam -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg-0 to-transparent" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-0 to-transparent" />

    <span
      class="pointer-events-none absolute left-[2%] top-[10%] font-serif-kr text-[clamp(220px,30vw,420px)] font-black leading-none text-gold/[0.03] select-none"
      aria-hidden="true"
    >世</span>

    <div class="relative mx-auto max-w-7xl px-6">
      <!-- ── Section header ──────────────────────────── -->
      <header
        class="mb-20 grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-16"
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <div class="flex flex-col gap-5">
          <div class="section-eyebrow">
            <span><span class="num">04</span>&nbsp;&nbsp;THE WORLD</span>
            <span class="h-px w-12 bg-gradient-to-r from-gold/60 to-transparent" />
          </div>
          <h2 class="section-title max-w-[12ch]">{{ t('features.title') }}</h2>
          <p class="font-serif-kr text-gold/60 text-sm tracking-[0.4em] uppercase">세계관</p>
        </div>
        <p class="text-ink-soft max-w-md leading-relaxed lg:text-right">{{ t('features.subtitle') }}</p>
      </header>

      <!-- ── Mosaic grid: 3 + 3 + 2 + 2 + 2 ───────────── -->
      <div class="grid grid-cols-12 gap-4 md:gap-6">
        <article
          v-for="(feature, idx) in items"
          :key="feature.id"
          class="group relative overflow-hidden rounded-[2px] border border-ink/8 bg-bg-2/60 transition-all duration-500 hover:border-gold/40 hover:-translate-y-1"
          :class="cardSpan(idx)"
          :style="{ minHeight: cardHeight(idx) }"
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 700, delay: 80 + idx * 70 } }"
        >
          <!-- Image -->
          <img
            :src="feature.image"
            :alt="localizedTitle(feature)"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
            loading="lazy"
          />

          <!-- Bottom gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-bg-0 via-bg-0/40 to-transparent" />

          <!-- Live preview badge (appears on hover) -->
          <div
            class="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-gold/40 bg-bg-0/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-gold opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-bright" />
            </span>
            Live preview
          </div>

          <!-- Index marker -->
          <span
            class="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70"
          >{{ String(idx + 1).padStart(2, '0') }}</span>

          <!-- Body -->
          <div class="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6">
            <h3 class="font-display text-xl font-bold leading-tight text-ink lg:text-2xl">
              {{ localizedTitle(feature) }}
            </h3>
            <p
              class="line-clamp-2 max-w-[44ch] text-sm leading-relaxed text-ink-soft transition-all duration-500 group-hover:text-ink"
            >
              {{ localizedDescription(feature) }}
            </p>
            <div class="mt-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-gold opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:gap-5">
              <span>Discover</span>
              <span class="block h-px w-8 bg-gold transition-all duration-500 group-hover:w-12" />
              <svg class="h-3 w-3 transition-transform duration-500 group-hover:rotate-[-45deg]" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10 L10 2 M5 2 L10 2 L10 7" /></svg>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface FeatureItem {
  id: string
  titleEn: string
  titleTh: string
  descriptionEn: string
  descriptionTh: string
  image: string
}

const props = defineProps<{
  items: FeatureItem[]
}>()

const { t, locale } = useI18n()

/**
 * Mosaic spans for 12-col grid:
 *  - first 2 → wide (col-span-7 / col-span-5)
 *  - next 3  → equal thirds (col-span-4 each)
 *  - rest    → halves (col-span-6)
 */
function cardSpan(idx: number) {
  if (idx === 0) return 'col-span-12 md:col-span-7'
  if (idx === 1) return 'col-span-12 md:col-span-5'
  if (idx >= 2 && idx <= 4) return 'col-span-12 sm:col-span-6 md:col-span-4'
  // remaining as halves
  return 'col-span-12 md:col-span-6'
}

function cardHeight(idx: number) {
  if (idx === 0) return 'clamp(360px, 42vw, 520px)'
  if (idx === 1) return 'clamp(360px, 42vw, 520px)'
  if (idx >= 2 && idx <= 4) return 'clamp(280px, 28vw, 360px)'
  return 'clamp(300px, 32vw, 420px)'
}

function localizedTitle(f: FeatureItem) {
  return locale.value === 'th' ? (f.titleTh || f.titleEn) : (f.titleEn || f.titleTh)
}
function localizedDescription(f: FeatureItem) {
  return locale.value === 'th' ? (f.descriptionTh || f.descriptionEn) : (f.descriptionEn || f.descriptionTh)
}
</script>
