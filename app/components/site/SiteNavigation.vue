<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="scrolled
      ? 'border-b border-gold/10 bg-bg-0/90 py-3 backdrop-blur-2xl'
      : 'bg-gradient-to-b from-bg-0/85 via-bg-0/40 to-transparent py-5'"
  >
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
          <span class="font-serif-kr text-[10px] uppercase tracking-[0.2em] text-ink-mute">영원한 탑의 전설</span>
        </div>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="ml-12 mr-auto hidden gap-10 lg:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="group relative font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-soft no-underline transition-colors duration-300 hover:text-gold"
        >
          {{ currentLocale === 'th' ? link.labelTh : link.labelEn }}
          <span class="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
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
        class="z-51 flex h-11 w-11 cursor-pointer items-center justify-center border-none bg-transparent text-2xl text-ink lg:hidden"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="mobileOpen"
        aria-controls="site-mobile-menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span v-if="mobileOpen">✕</span>
        <span v-else>☰</span>
      </button>
    </div>

    <!-- Mobile Overlay -->
    <Transition name="slide-down">
      <div
        v-if="mobileOpen"
        id="site-mobile-menu"
        class="fixed inset-x-0 top-[72px] bottom-0 z-49 flex flex-col items-center gap-6 bg-bg-0/97 px-6 pt-12 backdrop-blur-2xl"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="font-mono text-base font-semibold uppercase tracking-[0.2em] text-ink-soft no-underline transition-colors duration-300 hover:text-gold"
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
const currentLocale = computed(() => locale.value)

const scrolled = ref(false)
const mobileOpen = ref(false)

interface NavItem { labelEn: string; labelTh: string; href: string }
const defaultLinks: NavItem[] = [
  { labelEn: 'Home', labelTh: 'หน้าแรก', href: '/' },
  { labelEn: 'Weapon', labelTh: 'อาวุธ', href: '/weapons' },
  { labelEn: 'Game Guild', labelTh: 'กิลด์', href: '/#features' },
  { labelEn: 'Highlight', labelTh: 'ไฮไลท์', href: '/#highlight' },
  { labelEn: 'News', labelTh: 'ข่าวสาร', href: '/news' },
  { labelEn: 'Support', labelTh: 'ช่วยเหลือ', href: '/support' },
]

const { data: siteConfig } = await useFetch<{ navigation: { main: NavItem[]; footer: NavItem[] } }>(
  '/api/public/site',
  { default: () => ({ navigation: { main: defaultLinks, footer: [] } }), pick: ['navigation'] }
)

const navLinks = computed(() => {
  const main = siteConfig.value?.navigation?.main
  return main && main.length > 0 ? main : defaultLinks
})

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

watch(mobileOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
</script>
