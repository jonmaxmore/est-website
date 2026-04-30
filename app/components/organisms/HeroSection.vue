<template>
  <section
    ref="heroRef"
    class="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden py-24 md:py-32"
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

    <!-- ── Layer 2: Petals/particles (medium parallax) ── -->
    <div
      ref="midLayer"
      class="pointer-events-none absolute inset-0 z-[1] will-change-transform"
      style="background-image:
        radial-gradient(2px 2px at 12% 28%, rgba(255,200,230,0.6), transparent),
        radial-gradient(2px 2px at 78% 18%, rgba(232,181,71,0.5), transparent),
        radial-gradient(1px 1px at 42% 72%, rgba(255,255,255,0.5), transparent),
        radial-gradient(1.5px 1.5px at 88% 58%, rgba(180,200,255,0.5), transparent),
        radial-gradient(1px 1px at 22% 82%, rgba(232,181,71,0.4), transparent),
        radial-gradient(2px 2px at 62% 42%, rgba(255,255,255,0.3), transparent);
        animation: particle-drift 28s linear infinite;"
    />

    <!-- ── Layer 3: Floating diamond sigils (replaces KR runes per design source) ── -->
    <div
      ref="fgLayer"
      class="pointer-events-none absolute inset-0 z-[2] opacity-50 will-change-transform"
      aria-hidden="true"
    >
      <span class="ets-sigil" style="top:20%; left:9%;" />
      <span class="ets-sigil" style="top:64%; left:14%; width:32px; height:32px;" />
      <span class="ets-sigil" style="top:26%; right:13%; width:28px; height:28px;" />
      <span class="ets-sigil" style="top:74%; right:18%;" />
      <span class="ets-sigil" style="top:46%; right:7%; width:14px; height:14px;" />
    </div>

    <!-- ── Cinematic vignette + corners ── -->
    <div class="pointer-events-none absolute inset-0 z-[3] hidden md:block" style="box-shadow: inset 0 0 200px 40px rgba(7,5,12,0.7);" />
    <div class="pointer-events-none absolute inset-8 z-[4] hidden md:block">
      <span class="absolute left-0 top-0 h-8 w-8 border-l border-t border-gold/40" />
      <span class="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-gold/40" />
    </div>

    <!-- ── Layer 4: Content (foreground) ── -->
    <div class="relative z-[10] flex w-full flex-col items-center gap-5 px-4 text-center sm:gap-6 sm:px-6 max-w-[920px]">
      <div
        class="section-eyebrow"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        <span class="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
        <span>{{ heroEyebrow }}</span>
        <span class="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
      </div>

      <h1
        class="hero-title"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1100, delay: 200 } }"
      >
        ETERNAL<br>TOWER
        <span class="hero-title-accent">{{ titleAccent }}</span>
      </h1>

      <p
        class="text-ink-soft text-[clamp(0.95rem,1.4vw,1.125rem)] max-w-[560px] leading-relaxed mt-2"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1100, delay: 600 } }"
      >
        {{ localizedSubtitle }}
      </p>

      <!-- Primary action buttons (Pre-register / Watch Trailer) -->
      <div
        v-if="visibleButtons.length > 0"
        class="mt-6 flex max-w-[min(92vw,720px)] flex-wrap items-center justify-center gap-3 sm:gap-4"
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
          class="btn-magnetic group relative inline-flex min-h-[52px] items-center justify-center overflow-hidden rounded-full px-8 text-[0.8125rem] font-bold uppercase tracking-[0.18em] transition-all duration-500 sm:min-h-[56px] sm:px-10 sm:text-[0.875rem]"
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

      <!-- ── Platform download cards (App Store / Google Play / PC) ── -->
      <div
        v-if="visiblePlatforms.length > 0"
        class="mt-4 flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 1000 } }"
      >
        <a
          v-for="p in visiblePlatforms"
          :key="p.id"
          :href="p.url"
          :target="p.url.startsWith('http') ? '_blank' : '_self'"
          :rel="p.url.startsWith('http') ? 'noopener noreferrer' : undefined"
          :aria-label="p.label"
          class="ets-platform"
          @click="trackDownload('hero', p.id)"
        >
          <span class="ets-platform-icon" v-html="p.iconSvg" />
          <span class="ets-platform-meta">
            <span class="ets-platform-small">{{ p.smallEn }}</span>
            <span class="ets-platform-big">{{ p.bigEn }}</span>
          </span>
        </a>
      </div>

      <div
        v-if="heroConfig.showSocialLinks && socialItems.length > 0"
        class="mt-4 flex flex-wrap items-center justify-center gap-2"
      >
        <a
          v-for="item in socialItems"
          :key="item.platform"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="item.platform"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-gold/15 bg-bg-1/40 text-ink-soft no-underline backdrop-blur-md transition-all duration-300 hover:border-gold/50 hover:text-gold"
          @click="trackSocial(item.platform, item.platform)"
        >
          <UIcon :name="socialIcon(item.platform)" class="h-4 w-4" />
        </a>
      </div>
    </div>

    <!-- ── Bottom meta row (desktop only) — left chapter; right scroll cue ── -->
    <div class="absolute bottom-8 left-8 right-8 z-[10] hidden items-end justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute lg:flex">
      <span>{{ metaLeft }}</span>
      <div class="flex items-center gap-3">
        <span>Scroll</span>
        <span class="block h-12 w-px overflow-hidden bg-gradient-to-b from-gold/60 to-transparent">
          <span class="block h-3 w-full bg-gold-bright" style="animation: scroll-down 2.4s ease-in-out infinite;" />
        </span>
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

interface HeroPlatformConfig {
  id: 'ios' | 'android' | 'pc' | 'mac' | string
  url: string
  visible?: boolean
}

interface HeroConfig {
  logo: string
  subtitleEn: string
  subtitleTh: string
  showSocialLinks: boolean
  backgroundMode: 'image' | 'video'
  backgroundVideo: string
  buttons: HeroButtonConfig[]
  platforms?: HeroPlatformConfig[]
}

const props = defineProps<{
  background?: string
  config?: Partial<HeroConfig>
}>()

const { locale } = useI18n()
const { trackDownload, trackPreRegister, trackSocial } = useTracking()

const heroRef = ref<HTMLElement>()
const bgLayer = ref<HTMLElement>()
const midLayer = ref<HTMLElement>()
const fgLayer = ref<HTMLElement>()

useParallax([
  { el: bgLayer, factor: 0.3 },
  { el: midLayer, factor: 0.55 },
  { el: fgLayer, factor: 0.7 },
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
    { id: 'trailer', labelEn: 'Watch Trailer', labelTh: 'ดูตัวอย่าง', href: '#trailer', variant: 'ghost', visible: true, order: 1, target: '_self' },
  ],
  platforms: [
    { id: 'ios', url: '/download', visible: true },
    { id: 'android', url: '/download', visible: true },
    { id: 'pc', url: '/download', visible: true },
  ],
}

const heroConfig = computed<HeroConfig>(() => ({
  ...defaultHeroConfig,
  ...(props.config || {}),
  buttons: props.config?.buttons?.length ? props.config.buttons as HeroButtonConfig[] : defaultHeroConfig.buttons,
  platforms: props.config?.platforms?.length ? props.config.platforms : defaultHeroConfig.platforms,
}))

const heroBackground = computed(() => props.background || '/images/hero-bg.webp')
const isVideoMode = computed(() => heroConfig.value.backgroundMode === 'video')
const heroVideoUrl = computed(() => heroConfig.value.backgroundVideo || '')

const heroEyebrow = computed(() =>
  locale.value === 'th' ? 'บทศูนย์ · ตื่นจากนิทรา' : 'CHAPTER ZERO · AWAKEN',
)

const titleAccent = computed(() =>
  locale.value === 'th' ? 'ตำนานไร้กาลเวลา' : 'an eternal saga',
)

const metaLeft = computed(() =>
  locale.value === 'th' ? 'ETS · เปิดบริการ พ.ศ. 2569' : 'ETS · Launching 2026',
)

const localizedSubtitle = computed(() => {
  const subtitle = locale.value === 'th' ? heroConfig.value.subtitleTh : heroConfig.value.subtitleEn
  if (subtitle) return subtitle
  return locale.value === 'th'
    ? 'ปีนหอคอยนิรันดร์ ปลอมตำนานของคุณ — เกม MMORPG บนทุกแพลตฟอร์ม'
    : 'Climb the eternal tower. Forge your saga. A stylized action MMORPG, everywhere you play.'
})

const visibleButtons = computed(() =>
  heroConfig.value.buttons
    .filter((b) => b.visible !== false && b.href && (b.labelEn || b.labelTh))
    .sort((a, b) => a.order - b.order),
)

// ── Platform download cards ──
const PLATFORM_META: Record<string, { label: string; smallEn: string; bigEn: string; iconSvg: string }> = {
  ios: {
    label: 'Download on the App Store',
    smallEn: 'Download on',
    bigEn: 'App Store',
    iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
  },
  android: {
    label: 'Get it on Google Play',
    smallEn: 'Get it on',
    bigEn: 'Google Play',
    iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814 13.792 12 3.61 22.186a1 1 0 0 1-.609-.92V2.734a1 1 0 0 1 .608-.92zM14.5 12.707l2.302 2.303-10.85 6.198 8.548-8.5zm3.184-3.156 2.853 1.633a1 1 0 0 1 0 1.736l-2.853 1.633L15.207 12l2.477-2.449zM5.952 1.81l10.85 6.197-2.302 2.303L5.952 1.81z"/></svg>',
  },
  pc: {
    label: 'Download for Windows PC',
    smallEn: 'Download for',
    bigEn: 'Windows · PC',
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg>',
  },
  mac: {
    label: 'Download for macOS',
    smallEn: 'Download for',
    bigEn: 'macOS',
    iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
  },
}

const visiblePlatforms = computed(() => {
  const list = heroConfig.value.platforms || []
  return list
    .filter((p) => p.visible !== false && p.url && PLATFORM_META[p.id])
    .map((p) => ({
      id: p.id,
      url: p.url,
      ...PLATFORM_META[p.id]!,
    }))
})

const { data: siteConfig } = await useFetch<{ social: Record<string, string> }>('/api/public/site', {
  default: () => ({ social: {} }),
  pick: ['social'],
})

const socialItems = computed(() =>
  Object.entries(siteConfig.value?.social || {})
    .filter(([, url]) => typeof url === 'string' && url.trim())
    .map(([platform, url]) => ({ platform, url })),
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

void SITE
</script>

<style scoped>
.hero-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(40px, 9vw, 132px);
  line-height: 0.92;
  letter-spacing: -0.01em;
  margin: 0;
  background: linear-gradient(180deg, #FFF8E7 0%, var(--color-gold-bright) 50%, var(--color-gold-deep) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 80px rgba(232, 181, 71, 0.25);
}

.hero-title-accent {
  display: block;
  font-style: italic;
  font-weight: 500;
  font-size: 0.32em;
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.6) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-top: 12px;
}

.ets-sigil {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 1px solid var(--color-gold);
  transform: rotate(45deg);
  opacity: 0.18;
  box-shadow: 0 0 22px rgba(232, 181, 71, 0.35);
}
.ets-sigil::after {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid var(--color-gold);
  opacity: 0.5;
}

/* ── Platform download cards ── */
.ets-platform {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(7, 5, 12, 0.55);
  border: 1px solid rgba(232, 181, 71, 0.25);
  border-radius: 12px;
  color: var(--color-ink);
  text-decoration: none;
  backdrop-filter: blur(14px);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  min-width: 154px;
}
.ets-platform:hover {
  border-color: var(--color-gold);
  background: rgba(232, 181, 71, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(232, 181, 71, 0.18);
}
.ets-platform-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gold);
  flex-shrink: 0;
}
.ets-platform-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
.ets-platform-meta {
  display: inline-flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.1;
}
.ets-platform-small {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: var(--color-ink-mute);
  text-transform: uppercase;
  margin-bottom: 3px;
  transition: color 0.3s;
}
.ets-platform-big {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-ink);
}
.ets-platform:hover .ets-platform-small { color: var(--color-gold); }

@keyframes scroll-down {
  0% { transform: translateY(-12px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(40px); opacity: 0; }
}

@media (max-width: 480px) {
  .ets-platform {
    min-width: 0;
    flex: 1 1 calc(50% - 6px);
    max-width: 100%;
    padding: 8px 12px;
  }
  .ets-platform-big { font-size: 12px; }
}
</style>
