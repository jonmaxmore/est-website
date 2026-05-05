<template>
  <Transition
    :enter-active-class="placement === 'popup' ? 'transition-all duration-500 ease-out' : 'transition-opacity duration-300'"
    :leave-active-class="placement === 'popup' ? 'transition-all duration-300 ease-in' : 'transition-opacity duration-200'"
    :enter-from-class="placement === 'popup' ? 'opacity-0 translate-y-4 scale-95' : 'opacity-0'"
    :leave-to-class="placement === 'popup' ? 'opacity-0 translate-y-2 scale-95' : 'opacity-0'"
  >
    <div v-if="shouldRender" :data-testid="testId" :class="containerClass">
      <!-- ── POPUP ── -->
      <div
        v-if="placement === 'popup'"
        class="ets-popup-card relative overflow-hidden rounded-[1.7rem] border border-gold/30 bg-[#110d17]/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        role="dialog"
        aria-modal="false"
        :aria-label="currentTitle || 'Promotional popup'"
      >
        <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        <button
          v-if="banner?.dismissible !== false"
          type="button"
          aria-label="Close popup"
          class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          @click="dismiss"
        >X</button>

        <picture v-if="banner?.desktopImage || banner?.mobileImage">
          <source
            v-if="banner?.desktopImage"
            media="(min-width: 768px)"
            :srcset="banner.desktopImage"
          />
          <img
            :src="banner?.mobileImage || banner?.desktopImage"
            :alt="currentTitle || ''"
            class="-mx-5 -mt-5 mb-4 h-40 w-[calc(100%+2.5rem)] rounded-t-[1.7rem] object-cover"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <p v-if="currentBadge" class="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-gold">
          {{ currentBadge }}
        </p>
        <p class="max-w-[18rem] text-xl font-black leading-tight">{{ currentTitle }}</p>
        <p v-if="currentBody" class="mt-3 max-w-[22rem] text-sm leading-7 text-white/62">{{ currentBody }}</p>
        <NuxtLink
          :to="href"
          :target="target"
          class="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-black no-underline transition-transform hover:-translate-y-0.5"
          @click="dismiss"
        >
          {{ actionLabel }}
        </NuxtLink>
      </div>

      <!-- ── ANNOUNCEMENT_BAR / FLOATING / FOOTER_STRIP / OTHERS ── -->
      <div v-else class="relative">
        <button
          v-if="canDismissNonPopup"
          type="button"
          aria-label="Dismiss banner"
          class="absolute -right-2 -top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/60 text-sm text-white/60 backdrop-blur-md transition hover:bg-black/80 hover:text-white"
          @click.stop.prevent="dismiss"
        >X</button>

        <NuxtLink
          :to="href"
          :target="target"
          :class="linkClass"
        >
          <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

          <picture v-if="banner?.desktopImage || banner?.mobileImage">
            <source
              v-if="banner?.desktopImage"
              media="(min-width: 768px)"
              :srcset="banner.desktopImage"
            />
            <img
              :src="banner?.mobileImage || banner?.desktopImage"
              :alt="currentTitle || ''"
              class="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
              loading="lazy"
              decoding="async"
            />
          </picture>

          <div class="relative flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p v-if="currentBadge" class="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-gold">
                {{ currentBadge }}
              </p>
              <p :class="titleClass">{{ currentTitle }}</p>
              <p v-if="currentBody" class="mt-2 text-sm leading-relaxed text-white/58">{{ currentBody }}</p>
            </div>
            <span class="shrink-0 pt-1 text-xs font-bold uppercase tracking-[0.22em] text-gold/80">
              {{ actionLabel }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { normalizeBannerConfig, type BannerPlacement } from '../../shared/cms/marketing-banners'

const props = defineProps<{
  placement: BannerPlacement
  banner: Record<string, any> | null
}>()

const { locale } = useI18n()

const popupVisible = ref(false)
const dismissed = ref(false)
let popupTimer: ReturnType<typeof setTimeout> | null = null
let escHandler: ((e: KeyboardEvent) => void) | null = null

// ── Persistence policy ──
// popup        → localStorage 7 days, mutex global (1 popup per session)
// announcement → localStorage 7 days
// floating     → sessionStorage (re-show in new tab)
// others       → no persistence (inline content)
const POPUP_GLOBAL_KEY = 'est_marketing_popup_seen'
const POPUP_THROTTLE_MS = 7 * 24 * 60 * 60 * 1000

const dismissalKey = computed(() => {
  if (!props.banner?.id) return null
  if (props.placement === 'popup') return POPUP_GLOBAL_KEY
  return `est_banner_dismissed:${props.placement}:${props.banner.id}`
})

function readDismissed(): boolean {
  if (!import.meta.client || !dismissalKey.value) return false
  try {
    const storage = props.placement === 'floating' ? window.sessionStorage : window.localStorage
    const raw = storage.getItem(dismissalKey.value)
    if (!raw) return false
    if (raw === 'dismissed') return true
    const ts = Number(raw)
    if (!Number.isFinite(ts)) return false
    if (props.placement === 'popup' && Date.now() - ts > POPUP_THROTTLE_MS) {
      storage.removeItem(dismissalKey.value)
      return false
    }
    return true
  } catch {
    return false
  }
}

function writeDismissed() {
  if (!import.meta.client || !dismissalKey.value) return
  try {
    const storage = props.placement === 'floating' ? window.sessionStorage : window.localStorage
    storage.setItem(dismissalKey.value, String(Date.now()))
  } catch {
    /* storage disabled */
  }
}

const canDismissNonPopup = computed(() => {
  if (props.placement === 'popup') return false
  if (props.placement === 'homepage_inline' || props.placement === 'article_inline' || props.placement === 'sidebar') return false
  return props.banner?.dismissible !== false
})

const currentTitle = computed(() =>
  locale.value === 'th'
    ? props.banner?.titleTh || props.banner?.titleEn
    : props.banner?.titleEn || props.banner?.titleTh,
)
const currentBadge = computed(() =>
  locale.value === 'th'
    ? props.banner?.badgeTh || props.banner?.badgeEn
    : props.banner?.badgeEn || props.banner?.badgeTh,
)
const currentBody = computed(() =>
  locale.value === 'th'
    ? props.banner?.bodyTh || props.banner?.bodyEn
    : props.banner?.bodyEn || props.banner?.bodyTh,
)
const normalizedConfig = computed(() =>
  normalizeBannerConfig(props.placement, (props.banner?.config as Record<string, unknown> | null | undefined) ?? null),
)
const href = computed(() => {
  if (!props.banner) return '/'
  if (props.banner.targetType === 'url') return props.banner.targetUrl || '/'
  if (props.banner.targetType === 'article' && props.banner.article?.slug) return `/news/${props.banner.article.slug}`
  if (props.banner.targetType === 'page' && props.banner.page?.slug) return props.banner.page.slug ? `/${props.banner.page.slug}` : '/'
  return '/'
})
const target = computed(() => props.banner?.targetNewTab ? '_blank' : undefined)
const testId = computed(() => `marketing-banner-${props.placement}`)
const actionLabel = computed(() => {
  if (props.banner?.targetType === 'page') return 'Open Page'
  if (props.banner?.targetType === 'url') return 'Learn More'
  return 'Read More'
})
const titleClass = computed(() => {
  if (props.placement === 'announcement_bar') return 'text-base font-black leading-snug'
  if (props.placement === 'footer_strip') return 'text-sm font-bold leading-snug'
  return 'text-sm font-semibold leading-snug'
})
const containerClass = computed(() => {
  if (props.placement === 'popup') {
    return 'fixed inset-x-4 bottom-4 z-[60] mx-auto w-full max-w-md'
  }
  if (props.placement === 'floating') {
    const config = normalizedConfig.value as { corner?: string } | null
    return [
      'fixed bottom-6 z-40 w-[min(92vw,21rem)]',
      config?.corner === 'bottom_left' ? 'left-6' : 'right-6',
    ]
  }
  return ''
})
const linkClass = computed(() => {
  const shared = 'group relative block overflow-hidden text-white no-underline transition-transform duration-300 hover:-translate-y-0.5'
  switch (props.placement) {
    case 'announcement_bar':
      return `${shared} rounded-[1.5rem] border border-gold/25 bg-[linear-gradient(135deg,rgba(212,168,67,0.18),rgba(255,255,255,0.045)_45%,rgba(83,57,23,0.18))] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]`
    case 'homepage_inline':
      return `${shared} rounded-[1.8rem] border border-gold/20 bg-[linear-gradient(135deg,rgba(212,168,67,0.14),rgba(255,255,255,0.04)_38%,rgba(17,13,23,0.94))] px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]`
    case 'floating':
      return `${shared} rounded-[1.4rem] border border-gold/22 bg-[#110d17]/92 px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl`
    case 'footer_strip':
      return `${shared} rounded-[1.4rem] border border-gold/20 bg-[#110d17]/88 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.26)]`
    case 'article_inline':
      return `${shared} rounded-[1.5rem] border border-gold/18 bg-[#110d17]/88 px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]`
    case 'sidebar':
      return `${shared} rounded-[1.5rem] border border-gold/18 bg-[#110d17]/88 px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]`
    default:
      return `${shared} rounded-[1.5rem] border border-gold/18 bg-[#110d17]/88 px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]`
  }
})

const shouldRender = computed(() => {
  if (!props.banner) return false
  if (dismissed.value) return false
  if (props.placement !== 'popup') return true
  return popupVisible.value
})

function clearPopupTimer() {
  if (popupTimer !== null && import.meta.client) {
    window.clearTimeout(popupTimer)
    popupTimer = null
  }
}

function schedulePopup() {
  clearPopupTimer()
  if (props.placement !== 'popup') {
    // For non-popup placements, just check dismissed state
    if (import.meta.client && readDismissed()) {
      dismissed.value = true
    }
    return
  }

  popupVisible.value = false
  if (!props.banner || !import.meta.client) return

  if (readDismissed()) {
    dismissed.value = true
    return
  }

  const config = normalizedConfig.value as {
    delaySeconds?: number
    frequency?: string
    mobileEnabled?: boolean
  }

  if (config?.mobileEnabled === false && window.innerWidth < 768) return

  const delay = Math.max(config?.delaySeconds || 3, 3) * 1000
  popupTimer = setTimeout(() => {
    popupVisible.value = true
  }, delay)
}

function dismiss() {
  popupVisible.value = false
  dismissed.value = true
  writeDismissed()
}

function setupEsc() {
  if (!import.meta.client || props.placement !== 'popup') return
  escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && popupVisible.value) dismiss()
  }
  window.addEventListener('keydown', escHandler)
}

function teardownEsc() {
  if (escHandler && import.meta.client) {
    window.removeEventListener('keydown', escHandler)
    escHandler = null
  }
}

watch(() => props.banner?.id, () => {
  dismissed.value = false
  schedulePopup()
})
watch(() => props.placement, schedulePopup)
onMounted(() => {
  schedulePopup()
  setupEsc()
})
onBeforeUnmount(() => {
  clearPopupTimer()
  teardownEsc()
})
</script>
