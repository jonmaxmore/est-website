<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="scrolled
      ? 'border-b border-white/5 bg-black/85 py-3 backdrop-blur-xl'
      : 'bg-gradient-to-b from-black/80 to-transparent py-5'"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6">
      <!-- Logo -->
      <NuxtLink to="/" class="z-51 flex items-center gap-3 text-white no-underline">
        <img src="/images/logo.webp" alt="Eternal Tower Saga" class="h-10 w-10 object-contain" />
        <div class="flex flex-col">
          <span class="text-sm font-bold uppercase tracking-widest">Eternal Tower Saga</span>
          <span class="text-[0.625rem] uppercase tracking-[0.15em] text-white/40">เกม RPG บนมือถือ</span>
        </div>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="ml-8 mr-auto hidden gap-8 lg:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.href"
          :to="link.href"
          class="group relative text-sm font-medium tracking-wide text-white/60 no-underline transition-colors duration-300 hover:text-white"
        >
          {{ t(link.labelKey) }}
          <span class="absolute -bottom-1 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full" />
        </NuxtLink>
      </nav>

      <!-- CTA -->
      <div class="hidden items-center gap-3 lg:flex">
        <NuxtLink
          to="/event"
          class="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light px-7 text-sm font-bold tracking-wider text-black shadow-[0_0_15px_rgba(212,168,67,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(212,168,67,0.5)]"
        >
          {{ t('nav.register') }}
        </NuxtLink>
      </div>

      <!-- Hamburger -->
      <button
        class="z-51 flex h-11 w-11 cursor-pointer items-center justify-center border-none bg-none text-2xl text-white lg:hidden"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
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
        class="fixed inset-x-0 top-[72px] bottom-0 z-49 flex flex-col items-center gap-6 bg-black/95 px-6 pt-12 backdrop-blur-xl"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.href"
          :to="link.href"
          class="text-xl font-medium text-white/60 no-underline transition-colors duration-300 hover:text-white"
          @click="mobileOpen = false"
        >
          {{ t(link.labelKey) }}
        </NuxtLink>
        <NuxtLink
          to="/event"
          class="mt-8 inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light text-base font-bold text-black shadow-[0_0_30px_rgba(212,168,67,0.3)]"
          @click="mobileOpen = false"
        >
          {{ t('nav.register') }}
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()

const scrolled = ref(false)
const mobileOpen = ref(false)

const links = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/weapons', labelKey: 'nav.characters' },
  { href: '/news', labelKey: 'nav.news' },
  { href: '/game-guide', labelKey: 'nav.features' },
  { href: '/support', labelKey: 'nav.support' },
]

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

watch(mobileOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
</script>
