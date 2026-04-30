<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="scrolled
      ? 'border-b border-gold/10 bg-bg-0/90 py-3 backdrop-blur-2xl'
      : 'bg-gradient-to-b from-bg-0/85 via-bg-0/40 to-transparent py-5'"
  >
    <!-- Skip-to-content link for keyboard / screen-reader users -->
    <a href="#main-content" class="ets-skip-link">Skip to main content</a>

    <div class="mx-auto flex max-w-7xl items-center justify-between px-6">
      <!-- Logo: Tower mark + wordmark -->
      <NuxtLink to="/" class="z-51 flex items-center gap-3 text-ink no-underline">
        <span class="relative grid h-9 w-9 place-items-center rounded-full border border-gold bg-[radial-gradient(circle_at_30%_30%,rgba(232,181,71,0.18),rgba(7,5,12,0.9)_70%)] shadow-[0_0_18px_rgba(232,181,71,0.35),inset_0_0_12px_rgba(232,181,71,0.15)]">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-gold-bright drop-shadow-[0_0_4px_rgba(232,181,71,0.6)]" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 2 L12 22" />
            <path d="M12 2 L8 6 L8 22 L16 22 L16 6 Z" fill="currentColor" fill-opacity="0.15" />
            <path d="M9 9 L15 9 M9 13 L15 13 M9 17 L15 17" />
            <circle cx="12" cy="4.5" r="0.8" fill="currentColor" />
          </svg>
          <span class="absolute inset-[3px] rounded-full border border-gold/25" />
        </span>
        <div class="flex flex-col leading-tight">
          <span class="font-display text-[13px] font-bold uppercase tracking-[0.32em] text-gold">Eternal Tower Saga</span>
          <span class="font-mono text-[9px] uppercase tracking-[0.4em] text-ink-mute">An Eternal Saga</span>
        </div>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="ml-12 mr-auto hidden gap-10 lg:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="group relative font-mono text-[11px] font-semibold uppercase tracking-[0.25em] no-underline transition-colors duration-300 hover:text-gold"
          :class="isActive(link.href) ? 'text-gold' : 'text-ink-soft hover:text-ink'"
        >
          {{ currentLocale === 'th' ? link.labelTh : link.labelEn }}
          <span
            class="absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-500"
            :class="isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'"
          />
        </NuxtLink>
      </nav>

      <!-- CTA + Lang -->
      <div class="hidden items-center gap-3 lg:flex">
        <SiteLanguageSwitcher />
        <NuxtLink
          to="/event"
          class="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-7 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-bg-0 shadow-[0_0_20px_rgba(232,181,71,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(232,181,71,0.6)]"
        >
          {{ t('nav.register') }}
        </NuxtLink>
      </div>

      <!-- Hamburger -->
      <button
        type="button"
        class="z-51 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-gold/15 bg-bg-1/40 text-ink backdrop-blur-md transition-all duration-200 hover:border-gold/40 hover:bg-bg-1/60 lg:hidden"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="mobileOpen"
        aria-controls="site-mobile-menu"
        @click="mobileOpen = !mobileOpen"
      >
        <svg
          v-if="mobileOpen"
          xmlns="http://www.w3.org/2000/svg"
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
        ><path d="M18 6 6 18M6 6l12 12" /></svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
        ><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </div>

    <!-- Mobile Overlay -->
    <Transition name="slide-down">
      <div
        v-if="mobileOpen"
        id="site-mobile-menu"
        class="fixed inset-x-0 top-[72px] bottom-0 z-49 flex flex-col items-center gap-6 bg-bg-0/97 px-6 pt-12 backdrop-blur-2xl overflow-y-auto"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="font-mono text-base font-semibold uppercase tracking-[0.2em] no-underline transition-colors duration-300"
          :class="isActive(link.href) ? 'text-gold' : 'text-ink-soft hover:text-gold'"
          @click="mobileOpen = false"
        >
          {{ currentLocale === 'th' ? link.labelTh : link.labelEn }}
        </NuxtLink>
        <div class="mt-6">
          <SiteLanguageSwitcher />
        </div>
        <NuxtLink
          to="/event"
          class="mt-4 inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep font-mono text-sm font-bold uppercase tracking-[0.2em] text-bg-0 shadow-[0_0_30px_rgba(232,181,71,0.4)]"
          @click="mobileOpen = false"
        >
          {{ t('nav.register') }}
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const currentLocale = computed(() => locale.value)

const scrolled = ref(false)
const mobileOpen = ref(false)

interface NavItem { labelEn: string; labelTh: string; href: string }

// Default nav links match the original Claude Design source
// (5 links: Home / Weapon / Game Guild / Highlight / News)
const defaultLinks: NavItem[] = [
  { labelEn: 'Home', labelTh: 'หน้าแรก', href: '/' },
  { labelEn: 'Weapon', labelTh: 'อาวุธ', href: '/weapons' },
  { labelEn: 'Game Guild', labelTh: 'กิลด์', href: '/#features' },
  { labelEn: 'Highlight', labelTh: 'ไฮไลท์', href: '/#highlight' },
  { labelEn: 'News', labelTh: 'ข่าวสาร', href: '/news' },
]

const { data: siteConfig } = await useFetch<{ navigation: { main: NavItem[]; footer: NavItem[] } }>(
  '/api/public/site',
  { default: () => ({ navigation: { main: defaultLinks, footer: [] } }), pick: ['navigation'] },
)

const navLinks = computed(() => {
  const main = siteConfig.value?.navigation?.main
  // Filter out garbled UTF-8 (legacy data with mojibake)
  const valid = main?.filter((l) => l.labelEn && l.labelTh && /^[฀-๿a-zA-Z0-9\s/&]+$/u.test(l.labelTh)) || []
  return valid.length > 0 ? valid : defaultLinks
})

/**
 * Is this nav link the active page?
 * - Exact match for /
 * - prefix match for /news (matches /news, /news/article-slug)
 * - hash links (#features) match when hash matches OR currently on home + scrolled near anchor
 *   (anchor highlight via scroll-spy is out of scope; just match path /)
 */
function isActive(href: string): boolean {
  const path = route.path
  const hash = route.hash
  if (href === '/') return path === '/' || path === ''
  if (href.startsWith('/#')) {
    const anchor = href.substring(1) // "#features"
    return path === '/' && hash === anchor
  }
  if (href.startsWith('#')) return hash === href
  // path link — match exact OR any sub-path
  return path === href || path.startsWith(href + '/')
}

// ── Scroll handler ──
let scrollHandler: (() => void) | null = null
function setupScroll() {
  if (!import.meta.client) return
  scrollHandler = () => {
    scrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
}
function teardownScroll() {
  if (scrollHandler && import.meta.client) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
}

// ── Mobile menu: scroll-lock + ESC handler ──
let escHandler: ((e: KeyboardEvent) => void) | null = null

watch(mobileOpen, (open) => {
  if (!import.meta.client) return
  if (open) {
    // Lock both html + body to prevent scroll on mobile
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    // ESC closes mobile menu
    escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') mobileOpen.value = false
    }
    window.addEventListener('keydown', escHandler)
  } else {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    if (escHandler) {
      window.removeEventListener('keydown', escHandler)
      escHandler = null
    }
  }
})

// Close mobile menu on route change
watch(() => route.fullPath, () => { mobileOpen.value = false })

onMounted(setupScroll)
onBeforeUnmount(() => {
  teardownScroll()
  // Ensure scroll-lock cleared on unmount
  if (import.meta.client) {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
  if (escHandler && import.meta.client) {
    window.removeEventListener('keydown', escHandler)
    escHandler = null
  }
})
</script>

<style scoped>
.ets-skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 100;
  padding: 12px 20px;
  background: var(--color-gold);
  color: var(--color-bg-0);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 0 0 8px 0;
}
.ets-skip-link:focus,
.ets-skip-link:focus-visible {
  left: 0;
  outline: 2px solid var(--color-gold-bright);
  outline-offset: 2px;
}
</style>
