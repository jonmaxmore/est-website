<template>
  <section ref="heroRef" class="relative flex min-h-dvh w-full items-center justify-center overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 z-0">
      <!-- Video background -->
      <video
        v-if="isVideoMode && heroVideoUrl"
        ref="videoRef"
        :src="heroVideoUrl"
        :poster="heroBackground"
        autoplay
        loop
        muted
        playsinline
        class="h-full w-full object-cover object-[center_30%]"
      />
      <!-- Image background (fallback) -->
      <img v-else :src="heroBackground" alt="" class="h-full w-full object-cover object-[center_30%]" loading="eager" />
      <div class="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[rgba(10,10,15,0.8)] to-transparent" />
      <div class="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-surface-primary to-transparent" />
    </div>

    <!-- Particles -->
    <div
      class="pointer-events-none absolute inset-0 z-[1] animate-[particle-drift_20s_linear_infinite]"
      style="background-image: radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 60% 70%, rgba(212,168,67,0.2), transparent), radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.2), transparent)"
    />

    <!-- Content -->
    <div
      ref="contentRef"
      class="relative z-[2] flex flex-col items-center gap-6 px-6 text-center"
      v-motion
      :initial="{ opacity: 0, y: 40 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 1200, ease: 'easeOut' } }"
    >
      <div ref="logoRef" class="w-[clamp(200px,40vw,400px)]">
        <img :src="heroConfig.logo" :alt="SITE.name" class="w-full drop-shadow-[0_0_40px_rgba(212,168,67,0.3)]" />
      </div>

      <h1 class="max-w-[600px] font-display text-[clamp(1rem,2.5vw,1.5rem)] font-normal uppercase tracking-[0.15em] text-white/60">
        {{ localizedSubtitle }}
      </h1>

      <div v-if="visibleButtons.length > 0" class="mt-4 flex max-w-[min(92vw,720px)] flex-wrap items-center justify-center gap-3">
        <NuxtLink
          v-for="button in visibleButtons"
          :key="button.id"
          :to="button.href"
          :target="button.target"
          :rel="button.target === '_blank' ? 'noopener noreferrer' : undefined"
          class="group relative inline-flex min-h-[52px] max-w-full items-center justify-center overflow-hidden rounded-full px-8 text-center text-[0.875rem] font-extrabold uppercase tracking-wider transition-all duration-500 hover:-translate-y-0.5 sm:px-10 sm:text-[0.9375rem]"
          :class="buttonClass(button.variant)"
          @click="trackHeroButton(button)"
        >
          <span class="relative z-[1] break-words">{{ localizedButtonLabel(button) }}</span>
          <span v-if="button.variant === 'primary'" class="absolute inset-0 -left-full animate-[glow-sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </NuxtLink>
      </div>

      <div v-if="heroConfig.showSocialLinks && socialItems.length > 0" class="mt-4 flex flex-wrap items-center justify-center gap-2">
        <a
          v-for="item in socialItems"
          :key="item.platform"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="item.platform"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/25 text-white/70 no-underline backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:text-gold"
          @click="trackSocial(item.platform, item.platform)"
        >
          <UIcon :name="socialIcon(item.platform)" class="h-4 w-4" />
        </a>
      </div>
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

const videoRef = ref<HTMLVideoElement | null>(null)

const defaultHeroConfig: HeroConfig = {
  logo: '/images/logo.webp',
  subtitleEn: '',
  subtitleTh: '',
  showSocialLinks: true,
  backgroundMode: 'image',
  backgroundVideo: '',
  buttons: [
    { id: 'pre-register', labelEn: 'Pre-register', labelTh: 'Pre-register', href: '/event', variant: 'primary', visible: true, order: 0, target: '_self' },
    { id: 'download', labelEn: 'Download', labelTh: 'Download', href: '/download', variant: 'secondary', visible: true, order: 1, target: '_self' },
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
    .filter((button) => button.visible !== false && button.href && (button.labelEn || button.labelTh))
    .sort((left, right) => left.order - right.order)
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
    return 'border border-gold/25 bg-black/35 text-gold shadow-[0_0_20px_rgba(212,168,67,0.12)] backdrop-blur-md hover:border-gold/50 hover:bg-gold/10'
  }

  if (variant === 'ghost') {
    return 'border border-white/12 bg-black/20 text-white/75 backdrop-blur-md hover:border-white/30 hover:bg-white/8 hover:text-white'
  }

  return 'bg-gradient-to-br from-gold to-gold-light text-black shadow-[0_0_30px_rgba(212,168,67,0.3)] hover:shadow-[0_0_50px_rgba(212,168,67,0.5)]'
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
  if (href.includes('/download')) {
    trackDownload('hero', label)
    return
  }

  if (href.includes('/event')) {
    trackPreRegister()
  }
}
</script>
