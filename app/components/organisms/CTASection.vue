<template>
  <section
    id="cta"
    class="relative overflow-hidden bg-bg-0 py-32"
    data-screen-label="07 CTA"
  >
    <!-- Background image with heavy overlay -->
    <div class="absolute inset-0">
      <img
        :src="background"
        alt=""
        class="h-full w-full object-cover opacity-30"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-bg-0 via-bg-0/85 to-bg-0" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent,rgba(7,5,12,0.7))]" />
    </div>

    <!-- Decorative numeric watermark -->
    <span
      class="pointer-events-none absolute left-1/2 top-[10%] -translate-x-1/2 font-display text-[clamp(280px,40vw,560px)] font-black italic leading-none text-gold/[0.04] select-none"
      aria-hidden="true"
    >∞</span>

    <!-- Particles -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background-image:
        radial-gradient(1.5px 1.5px at 25% 30%, rgba(244,208,118,0.4), transparent 60%),
        radial-gradient(1px 1px at 75% 70%, rgba(232,181,71,0.35), transparent 60%),
        radial-gradient(2px 2px at 50% 85%, rgba(232,181,71,0.25), transparent 60%);
        animation: particle-drift 24s linear infinite;"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 text-center">
      <div
        class="section-eyebrow"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <span class="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
        <span><span class="num">07</span>&nbsp;&nbsp;ASCEND</span>
        <span class="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
      </div>

      <h2
        class="display-title text-[clamp(2.5rem,6vw,4.5rem)] max-w-[20ch]"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 150 } }"
      >
        {{ t('cta.title') }}
      </h2>

      <p
        class="text-ink-soft max-w-[600px] text-[clamp(0.95rem,1.4vw,1.125rem)] leading-relaxed"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 500 } }"
      >
        {{ t('cta.subtitle') }}
      </p>

      <!-- Stats bar -->
      <div
        class="my-4 grid w-full max-w-3xl grid-cols-3 gap-4 border-y border-gold/15 py-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 900, delay: 650 } }"
      >
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex flex-col items-center gap-2 border-r border-gold/10 last:border-r-0 px-2"
        >
          <span class="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-none text-gold-bright tabular-nums">
            {{ stat.value }}
          </span>
          <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">{{ stat.label }}</span>
        </div>
      </div>

      <!-- Dual CTA -->
      <div
        class="flex flex-wrap items-center justify-center gap-4"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 900, delay: 800 } }"
      >
        <NuxtLink
          to="/event"
          class="btn-magnetic group relative inline-flex min-h-[60px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-12 font-mono text-sm font-bold uppercase tracking-[0.2em] text-bg-0 shadow-[0_0_40px_rgba(232,181,71,0.4)] transition-all duration-500 hover:shadow-[0_0_70px_rgba(232,181,71,0.7)]"
          @click="trackPreRegister"
        >
          <span class="relative z-[1] flex items-center gap-3">
            {{ t('cta.preRegister') }}
            <svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8 H13 M9 4 L13 8 L9 12" /></svg>
          </span>
          <span
            class="absolute inset-0 -left-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style="animation: glow-sweep 3.5s ease-in-out infinite;"
          />
        </NuxtLink>
        <NuxtLink
          to="/download"
          class="btn-magnetic inline-flex min-h-[60px] items-center justify-center gap-3 rounded-full border border-gold/30 bg-bg-1/40 px-10 font-mono text-sm font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md transition-all duration-500 hover:border-gold/60 hover:bg-gold/10 hover:text-gold-bright"
          @click="trackDownload('cta', 'Download')"
        >
          <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2 V11 M4 7 L8 11 L12 7 M3 14 H13" /></svg>
          {{ t('cta.download') }}
        </NuxtLink>
      </div>

      <!-- Platform pills -->
      <div
        class="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-mute"
        v-motion
        :initial="{ opacity: 0 }"
        :visible-once="{ opacity: 1, transition: { duration: 900, delay: 1000 } }"
      >
        <span class="rounded-full border border-gold/20 px-3 py-1">iOS</span>
        <span class="rounded-full border border-gold/20 px-3 py-1">Android</span>
        <span class="rounded-full border border-gold/20 px-3 py-1">PC</span>
        <span class="rounded-full border border-gold/20 px-3 py-1">Mac</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CTAStat { label: string; value: string }

const props = withDefaults(defineProps<{
  background?: string
  stats?: CTAStat[]
}>(), {
  background: '/images/cta-bg.webp',
})

const { t } = useI18n()
const { trackDownload, trackPreRegister } = useTracking()

const fallbackStats: CTAStat[] = [
  { label: 'Floors', value: '∞' },
  { label: 'Classes', value: '12' },
  { label: 'Players', value: '500K+' },
]
const stats = computed<CTAStat[]>(() => (props.stats?.length ? props.stats : fallbackStats))
</script>
