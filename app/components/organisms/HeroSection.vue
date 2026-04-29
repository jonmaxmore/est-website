<template>
  <section
    ref="heroRef"
    class="relative flex min-h-dvh w-full items-center justify-center overflow-hidden"
  >
    <!-- ── Layer 1: Background image (deepest parallax) ── -->
    <div ref="bgLayer" class="absolute inset-0 z-0 will-change-transform">
      <video
        v-if="isVideoMode && heroVideoUrl"
        :src="heroVideoUrl"
        :poster="heroBackground"
        autoplay
        loop
        muted
        playsinline
        class="h-[120%] w-full object-cover object-[center_30%]"
      />
      <img
        v-else
        :src="heroBackground"
        alt=""
        class="h-[120%] w-full object-cover object-[center_30%]"
        loading="eager"
      />
      <div class="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-bg-0 to-transparent" />
      <div class="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-bg-0 via-bg-0/85 to-transparent" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,transparent,rgba(7,5,12,0.6))]" />
    </div>

    <!-- ── Layer 2: Particles (medium parallax) ── -->
    <div
      ref="midLayer"
      class="pointer-events-none absolute inset-0 z-[1] will-change-transform"
      style="background-image:
        radial-gradient(1px 1px at 12% 22%, rgba(244,208,118,0.5), transparent 60%),
        radial-gradient(1.5px 1.5px at 67% 78%, rgba(232,181,71,0.4), transparent 60%),
        radial-gradient(1px 1px at 82% 18%, rgba(244,236,223,0.3), transparent 60%),
        radial-gradient(2px 2px at 35% 65%, rgba(232,181,71,0.25), transparent 60%);
        animation: particle-drift 22s linear infinite;"
    />

    <!-- ── Layer 3: Korean rune glyphs (subtle, decorative) ── -->
    <div
      ref="fgLayer"
      class="pointer-events-none absolute inset-0 z-[2] will-change-transform"
      aria-hidden="true"
    >
      <span class="absolute right-[8%] top-[18%] font-serif-kr text-[120px] font-bold text-gold/[0.06] leading-none select-none">永</span>
      <span class="absolute left-[6%] bottom-[28%] font-serif-kr text-[90px] font-bold text-gold/[0.05] leading-none select-none">塔</span>
    </div>

    <!-- ── Cinematic frame corners ── -->
    <div class="pointer-events-none absolute inset-6 z-[3] cinematic-corners hidden md:block" />

    <!-- ── Layer 4: Content (foreground, no parallax) ── -->
    <div class="relative z-[5] flex flex-col items-center gap-6 px-6 text-center max-w-[920px]">
      <div
        class="section-eyebrow"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <span class="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
        <span><span class="num">01</span>&nbsp;&nbsp;CHAPTER&nbsp;ZERO</span>
        <span class="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1100, delay: 100 } }"
        class="w-[clamp(180px,32vw,340px)]"
      >
        <img
          :src="heroConfig.logo"
          :alt="SITE.name"
          class="w-full drop-shadow-[0_0_60px_rgba(232,181,71,0.4)]"
        />
      </div>

      <h1
        class="display-title text-[clamp(2.75rem,7vw,5.5rem)] max-w-[820px]"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1100, delay: 250 } }"
      >
        Eternal Tower Saga
      </h1>

      <p
        class="font-serif-kr text-gold/70 text-[clamp(0.95rem,1.5vw,1.125rem)] tracking-[0.4em] uppercase"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 1200, delay: 450 } }"
      >영원한 탑의 전설</p>

      <p
        class="text-ink-soft text-[clamp(0.95rem,1.4vw,1.125rem)] max-w-[560px] leading-relaxed"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1100, delay: 600 } }"
      >
        {{ localizedSubtitle }}
      </p>

      <div
        v-if="visibleButtons.length > 0"
        class="mt-6 flex max-w-[min(92vw,720px)] flex-wrap items-center justify-center gap-4"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 800 } }"
      >
        <NuxtLink
          v-for="button in visibleButtons"
          :key="button.id"
          :to="button.href"
          :target="button.target"
          :rel="button.target === '_blank' ? 'noopener noreferrer' : undefined"
          class="btn-magnetic group relative inline-flex min-h-[56px] items-center justify-center overflow-hidden rounded-full px-10 text-[0.875rem] font-bold uppercase tracking-[0.18em] transition-all duration-500"
          :class="buttonClass(button.variant)"
          @click="trackHeroButton(button)"
        >
          <span class="relative z-[1]">{{ localizedButtonLabel(button) }}</span>
          <span
            v-if="button.variant === 'primary'"
            class="absolute inset-0 -left-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style="animation: glow-sweep 3.5s ease-in-out infinite;"
          />
        </NuxtLink>
      </div>

      <!-- Platform pills -->
      <div
        class="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-ink-mute"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 1000, delay: 1000 } }"
      >
        <span class="rounded-full border border-gold/20 px-3 py-1">iOS</span>
        <span class="rounded-full border border-gold/20 px-3 py-1">Android</span>
        <span class="rounded-full border border-gold/20 px-3 py-1">PC</span>
        <span class="rounded-full border border-gold/20 px-3 py-1">Mac</span>
      </div>

      <div
        v-if="heroConfig.showSocialLinks && socialItems.length > 0"
        class="mt-6 flex flex-wrap items-center justify-center gap-2"
      >
        <a
          v-for="item in socialItems"
          :key="item.platform"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="item.platform"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-gold/15 bg-bg-1/40 text-ink-soft no-underline backdrop-blur-md transition-all duration-300 hover:border-gold/50 hover:text-gold"
          @click="trackSocial(item.platform, item.platform)"
        >
          <UIcon :name="socialIcon(item.platform)" class="h-4 w-4" />
        </a>
      </div>
    </div>

    <!-- ── Scroll cue ── -->
    <div
      class="absolute bottom-8 left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-ink-mute"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 1400 } }"
    >
      <span>Scroll</span>
      <span class="h-12 w-px bg-gradient-to-b from-gold/60 to-transparent" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { SITE } from '~/shared/constants'

interface HeroButtonConfig {
  id: string
  labelEn: string
  labelTh: string
  href: string
  variant: 'primary' | 'secondary' | 'ghost'
  visible: boolean
  order: number
  target: '_self' | '_blank'
}

interface HeroConfig {
  logo: string
  subtitleEn: string
  subtitleTh: string
  showSocialLinks: boolean
  backgroundMode: 'image' | 'video'
  backgroundVideo: string
  buttons: HeroButtonConfig[]
}

const props = defineProps<{
  background?: string
  config?: Partial<HeroConfig>
}>()

const { t, locale } = useI18n()
const { trackDownload, trackPreRegister, trackSocial } = useTracking()

// Parallax layer refs
const heroRef = ref<HTMLElement>()
const bgLayer = ref<HTMLElement>()
const midLayer = ref<HTMLElement>()
const fgLayer = ref<HTMLElement>()

useParallax([
  { el: bgLayer, factor: 0.35 },
  { el: midLayer, factor: 0.18 },
  { el: fgLayer, factor: 0.08 },
])

const defaultHeroConfig: HeroConfig = {
  logo: '/images/logo.webp',
  subtitleEn: '',
  subtitleTh: '',
  showSocialLinks: true,
  backgroundMode: 'image',
  backgroundVideo: '',
  buttons: [
    { id: 'pre-register', labelEn: 'Pre-register', labelTh: 'ลงทะเบียน', href: '/event', variant: 'primary', visible: true, order: 0, target: '_self' },
    { id: 'download', labelEn: 'Download', labelTh: 'ดาวน์โหลด', href: '/download', variant: 'secondary', visible: true, order: 1, target: '_self' },
  ],
}

const heroConfig = computed<HeroConfig>(() => ({
  ...defaultHeroConfig,
  ...(props.config || {}),
  buttons: props.config?.buttons?.length ? props.config.buttons as HeroButtonConfig[] : defaultHeroConfig.buttons,
}))

const heroBackground = computed(() => props.background || '/images/hero-bg.webp')
const isVideoMode = computed(() => heroConfig.value.backgroundMode === 'video')
const heroVideoUrl = computed(() => heroConfig.value.backgroundVideo || '')

const localizedSubtitle = computed(() => {
  const subtitle = locale.value === 'th' ? heroConfig.value.subtitleTh : heroConfig.value.subtitleEn
  return subtitle || t('hero.tagline')
})

const visibleButtons = computed(() =>
  heroConfig.value.buttons
    .filter((b) => b.visible !== false && b.href && (b.labelEn || b.labelTh))
    .sort((a, b) => a.order - b.order)
)

const { data: siteConfig } = await useFetch<{ social: Record<string, string> }>('/api/public/site', {
  default: () => ({ social: {} }),
  pick: ['social'],
})

const socialItems = computed(() =>
  Object.entries(siteConfig.value?.social || {})
    .filter(([, url]) => typeof url === 'string' && url.trim())
    .map(([platform, url]) => ({ platform, url }))
)

function localizedButtonLabel(button: HeroButtonConfig) {
  return locale.value === 'th' ? button.labelTh || button.labelEn : button.labelEn || button.labelTh
}

function buttonClass(variant: HeroButtonConfig['variant']) {
  if (variant === 'secondary') {
    return 'border border-gold/30 bg-bg-1/40 text-gold backdrop-blur-md hover:border-gold/60 hover:bg-gold/10 hover:text-gold-bright'
  }
  if (variant === 'ghost') {
    return 'border border-ink/15 bg-bg-1/30 text-ink-soft backdrop-blur-md hover:border-ink/30 hover:text-ink'
  }
  return 'bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-bg-0 shadow-[0_0_40px_rgba(232,181,71,0.4)] hover:shadow-[0_0_60px_rgba(232,181,71,0.6)]'
}

function socialIcon(platform: string) {
  const icons: Record<string, string> = {
    facebook: 'i-lucide-facebook',
    instagram: 'i-lucide-instagram',
    twitter: 'i-lucide-twitter',
    x: 'i-lucide-twitter',
    youtube: 'i-lucide-youtube',
    discord: 'i-lucide-message-circle',
    line: 'i-lucide-message-circle',
    tiktok: 'i-lucide-music-2',
  }
  return icons[platform.toLowerCase()] || 'i-lucide-globe'
}

function trackHeroButton(button: HeroButtonConfig) {
  const href = button.href.toLowerCase()
  const label = localizedButtonLabel(button)
  if (href.includes('/download')) { trackDownload('hero', label); return }
  if (href.includes('/event')) { trackPreRegister() }
}
</script>
