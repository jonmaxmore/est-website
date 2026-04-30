<template>
  <section
    id="highlight"
    class="relative overflow-hidden bg-bg-0 py-32"
    data-screen-label="03 Highlight Reel"
  >
    <span
      class="pointer-events-none absolute right-[5%] top-[8%] font-display text-[clamp(220px,30vw,420px)] font-black italic leading-none text-gold/[0.025] select-none"
      aria-hidden="true"
    >III</span>

    <div class="relative mx-auto max-w-7xl px-6">
      <!-- ── Header ─────────────────────────────────── -->
      <header
        class="mb-16 flex flex-col items-center gap-5 text-center"
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <div class="section-eyebrow">
          <span class="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
          <span><span class="num">03</span>&nbsp;&nbsp;CINEMATIC&nbsp;REEL</span>
          <span class="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
        </div>
        <h2 class="section-title">{{ t('highlight.title') }}</h2>
      </header>

      <!-- ── 21:9 Reel ──────────────────────────────── -->
      <div
        class="relative mx-auto w-full overflow-hidden rounded-[2px] border border-gold/15 bg-bg-1"
        style="aspect-ratio: 21 / 9;"
        v-motion
        :initial="{ opacity: 0, scale: 0.96 }"
        :visible-once="{ opacity: 1, scale: 1, transition: { duration: 900, delay: 100 } }"
      >
        <Transition name="reveal" mode="out-in">
          <div :key="activeIdx" class="absolute inset-0">
            <img
              v-if="!activeSlide.video"
              :src="activeSlide.image"
              :alt="localizedTitle(activeSlide)"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <video
              v-else
              :src="activeSlide.video"
              :poster="activeSlide.image"
              autoplay
              loop
              muted
              playsinline
              class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-bg-0 via-bg-0/30 to-transparent" />
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,transparent,rgba(7,5,12,0.5))]" />

            <!-- Cinematic frame -->
            <div class="cinematic-corners absolute inset-6" />

            <!-- Title block -->
            <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 p-10 md:p-14">
              <div class="flex max-w-[60%] flex-col gap-3">
                <span
                  v-if="localizedKicker(activeSlide)"
                  class="font-mono text-[10px] uppercase tracking-[0.32em] text-gold-bright"
                >{{ localizedKicker(activeSlide) }}</span>
                <h3 class="font-display text-[clamp(1.75rem,3.6vw,3rem)] font-bold leading-[1.05] text-ink">
                  {{ localizedTitle(activeSlide) }}
                </h3>
                <p
                  v-if="localizedDescription(activeSlide)"
                  class="hidden max-w-[50ch] text-sm leading-relaxed text-ink-soft md:block"
                >
                  {{ localizedDescription(activeSlide) }}
                </p>
              </div>

              <!-- Play CTA (decorative on autoplay reels) -->
              <button
                v-if="activeSlide.video"
                type="button"
                class="hidden h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-bg-0/40 text-gold backdrop-blur-md transition-all duration-400 hover:scale-110 hover:border-gold hover:bg-gold/10 md:flex"
                aria-label="Play reel"
              >
                <svg viewBox="0 0 24 24" class="h-6 w-6 translate-x-0.5" fill="currentColor"><path d="M8 5v14l11-7L8 5z" /></svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ── Controls row ───────────────────────────── -->
      <div class="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <!-- Counter + thumbnails -->
        <div class="flex items-center gap-4">
          <span class="font-mono text-xs uppercase tracking-[0.3em] text-ink-mute">
            <span class="font-display text-2xl font-bold text-gold-bright">{{ String(activeIdx + 1).padStart(2, '0') }}</span>
            <span class="mx-2 text-ink-mute">/</span>
            <span>{{ String(slides.length).padStart(2, '0') }}</span>
          </span>
          <div class="flex gap-1.5">
            <button
              v-for="(_, idx) in slides"
              :key="idx"
              type="button"
              class="h-px transition-all duration-500"
              :class="activeIdx === idx
                ? 'w-12 bg-gold'
                : 'w-6 bg-ink/20 hover:bg-gold/50'"
              :aria-label="`Slide ${idx + 1}`"
              @click="goTo(idx)"
            />
          </div>
        </div>

        <!-- Prev/Next -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="group flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 bg-bg-1/60 text-ink-soft transition-all duration-300 hover:border-gold/50 hover:text-gold"
            aria-label="Previous"
            @click="prev"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button
            type="button"
            class="group flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold transition-all duration-300 hover:border-gold hover:bg-gold/20"
            aria-label="Next"
            @click="next"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ReelSlide {
  id: string
  titleEn: string
  titleTh: string
  kickerEn?: string
  kickerTh?: string
  descriptionEn?: string
  descriptionTh?: string
  image: string
  video?: string
}

const props = withDefaults(defineProps<{
  slides: ReelSlide[]
  autoAdvanceMs?: number
}>(), { autoAdvanceMs: 6500 })

const { t, locale } = useI18n()

const slides = computed<ReelSlide[]>(() => props.slides)
const activeIdx = ref(0)
// Parent guards `slides.length > 0` before rendering; we use a non-null
// assertion here so the template doesn't have to deal with `undefined`.
const activeSlide = computed<ReelSlide>(() => slides.value[activeIdx.value] ?? slides.value[0]!)

let timer: ReturnType<typeof setInterval> | null = null

function goTo(i: number) {
  activeIdx.value = (i + slides.value.length) % slides.value.length
  resetTimer()
}
function next() { goTo(activeIdx.value + 1) }
function prev() { goTo(activeIdx.value - 1) }

function resetTimer() {
  if (timer) clearInterval(timer)
  if (props.autoAdvanceMs > 0 && slides.value.length > 1) {
    timer = setInterval(() => { activeIdx.value = (activeIdx.value + 1) % slides.value.length }, props.autoAdvanceMs)
  }
}

onMounted(resetTimer)
onUnmounted(() => { if (timer) clearInterval(timer) })

function localizedTitle(s: ReelSlide) { return locale.value === 'th' ? (s.titleTh || s.titleEn) : (s.titleEn || s.titleTh) }
function localizedKicker(s: ReelSlide) { return locale.value === 'th' ? (s.kickerTh || s.kickerEn || '') : (s.kickerEn || s.kickerTh || '') }
function localizedDescription(s: ReelSlide) { return locale.value === 'th' ? (s.descriptionTh || s.descriptionEn || '') : (s.descriptionEn || s.descriptionTh || '') }
</script>
