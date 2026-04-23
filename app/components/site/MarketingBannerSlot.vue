<template>
  <div v-if="shouldRender" :data-testid="testId" :class="containerClass">
    <div
      v-if="placement === 'popup'"
      class="relative overflow-hidden rounded-[1.7rem] border border-gold/30 bg-[#110d17]/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
    >
      <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <button
        v-if="banner?.dismissible !== false"
        type="button"
        aria-label="Close popup"
        class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        @click="dismissPopup"
      >X</button>
      <p v-if="currentBadge" class="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-gold">
        {{ currentBadge }}
      </p>
      <p class="max-w-[18rem] text-xl font-black leading-tight">{{ currentTitle }}</p>
      <p v-if="currentBody" class="mt-3 max-w-[22rem] text-sm leading-7 text-white/62">{{ currentBody }}</p>
      <NuxtLink
        :to="href"
        :target="target"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-black no-underline transition-transform hover:-translate-y-0.5"
      >
        {{ actionLabel }}
      </NuxtLink>
    </div>

    <NuxtLink
      v-else
      :to="href"
      :target="target"
      :class="linkClass"
    >
      <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
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
</template>

<script setup lang="ts">
import { normalizeBannerConfig, type BannerPlacement } from '../../shared/cms/marketing-banners'

const props = defineProps<{
  placement: BannerPlacement
  banner: Record<string, any> | null
}>()

const { locale } = useI18n()

const popupVisible = ref(false)
let popupTimer: ReturnType<typeof window.setTimeout> | null = null

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
  if (props.banner.targetType === 'event') return '/event'
  return '/'
})
const target = computed(() => props.banner?.targetNewTab ? '_blank' : undefined)
const testId = computed(() => `marketing-banner-${props.placement}`)
const actionLabel = computed(() => {
  if (props.banner?.targetType === 'event') return 'View Event'
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
    return 'fixed inset-x-4 bottom-4 z-50 mx-auto w-full max-w-md'
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
const popupSessionKey = computed(() => `marketing-banner-popup:${props.banner?.id || 'default'}`)
const shouldRender = computed(() => {
  if (!props.banner) return false
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

  if (props.placement !== 'popup') return

  popupVisible.value = false

  if (!props.banner || !import.meta.client) return

  const config = normalizedConfig.value as {
    delaySeconds?: number
    frequency?: string
    mobileEnabled?: boolean
  }

  if (config?.mobileEnabled === false && window.innerWidth < 768) return
  if (config?.frequency === 'session' && window.sessionStorage.getItem(popupSessionKey.value) === 'dismissed') return

  const elapsedSeconds = typeof window.performance !== 'undefined' ? window.performance.now() / 1000 : 0
  const remainingDelaySeconds = Math.max(0, (config?.delaySeconds || 3) - elapsedSeconds)

  if (remainingDelaySeconds === 0) {
    popupVisible.value = true
    return
  }

  popupTimer = window.setTimeout(() => {
    popupVisible.value = true
  }, remainingDelaySeconds * 1000)
}

function dismissPopup() {
  popupVisible.value = false

  if (!import.meta.client || props.placement !== 'popup') return

  const config = normalizedConfig.value as { frequency?: string }
  if (config?.frequency === 'session') {
    window.sessionStorage.setItem(popupSessionKey.value, 'dismissed')
  }
}

watch(() => props.banner?.id, schedulePopup)
watch(() => props.placement, schedulePopup)
onMounted(() => {
  schedulePopup()
})

onBeforeUnmount(() => {
  clearPopupTimer()
})
</script>
