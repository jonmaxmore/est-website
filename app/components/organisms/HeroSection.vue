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
    <div class="relative z-[10] flex flex-col items-center gap-6 px-6 text-center max-w-[920px]">
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

      <div
        v-if="visibleButtons.length > 0"
        class="mt-8 flex max-w-[min(92vw,720px)] flex-wrap items-center justify-center gap-4"
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
        class="mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-mute"
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

    <!-- ── Bottom meta row (left chapter; right scroll cue) per design source ── -->
    <div class="absolute bottom-8 left-8 right-8 z-[10] hidden items-end justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute md:flex">
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
  font-size: clamp(48px, 9vw, 132px);
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

@keyframes scroll-down {
  0% { transform: translateY(-12px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(40px); opacity: 0; }
}
</style>
