<template>
  <div>
    <!-- Dynamic Section Renderer -->
    <template v-for="section in visibleSections" :key="section.id">
      <!-- HERO -->
      <OrganismsHeroSection v-if="section.type === 'hero'" :background="section.background" />

      <!-- WEAPONS (Korean MMO Class Selector — Premium Edition) -->
      <section
        v-else-if="section.type === 'weapons'"
        class="relative overflow-hidden py-[clamp(5rem,10vw,10rem)]"
        :style="sectionBgStyle(section)"
      >
        <!-- Ambient glow effects -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,168,67,0.06),transparent_60%)]" />
        <div class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div class="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div class="relative mx-auto max-w-7xl px-6">
          <!-- Section Title — Korean fantasy style -->
          <div class="mb-12 text-center">
            <div class="mb-3 flex items-center justify-center gap-4">
              <span class="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
              <span class="text-xs font-bold uppercase tracking-[0.3em] text-gold/60">CLASS SELECT</span>
              <span class="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            <h2 class="font-display text-[clamp(2.5rem,6vw,4rem)] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gold via-gold-light to-gold/60 drop-shadow-[0_4px_30px_rgba(212,168,67,0.3)]">
              {{ t('weapons.title') }}
            </h2>
            <p class="mt-3 text-sm text-white/40 tracking-wide">{{ t('weapons.subtitle') }}</p>
          </div>

          <!-- Main Layout: Sidebar + Character Stage -->
          <div class="grid gap-0 lg:grid-cols-[240px_1fr] min-h-[580px]">
            <!-- Left: Class List with ornate styling -->
            <div class="relative flex flex-row overflow-x-auto lg:flex-col gap-1.5 rounded-l-2xl border border-white/8 bg-gradient-to-b from-[#0d1117] to-[#0a0e14] p-4 lg:overflow-y-auto">
              <!-- Decorative top accent -->
              <div class="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

              <button
                v-for="(weapon, wIdx) in weapons"
                :key="weapon.id"
                @click="selectWeapon(weapon)"
                class="group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-400 cursor-pointer border-none whitespace-nowrap"
                :class="selectedWeapon?.id === weapon.id
                  ? 'bg-gradient-to-r from-gold/15 to-gold/5 text-gold shadow-[0_0_25px_rgba(212,168,67,0.12),inset_0_0_20px_rgba(212,168,67,0.05)] border-l-2 border-l-gold'
                  : 'bg-transparent text-white/50 hover:bg-white/4 hover:text-white/80'"
              >
                <!-- Class Icon -->
                <div class="relative flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0"
                  :class="selectedWeapon?.id === weapon.id ? 'bg-gold/15 ring-1 ring-gold/30' : 'bg-white/5'"
                >
                  <img v-if="weapon.icon" :src="weapon.icon" class="h-7 w-7 object-contain" :alt="weapon.name" />
                  <span v-else class="text-base font-bold" :class="selectedWeapon?.id === weapon.id ? 'text-gold' : 'text-white/30'">{{ (weapon.nameEn || weapon.name).charAt(0) }}</span>
                </div>

                <!-- Class Name -->
                <div class="hidden lg:block">
                  <span class="block text-sm font-bold tracking-wide">{{ weapon.nameEn || weapon.name }}</span>
                  <span class="block text-[0.625rem] text-white/30 uppercase tracking-widest">{{ weapon.name }}</span>
                </div>

                <!-- Active indicator -->
                <span v-if="selectedWeapon?.id === weapon.id" class="absolute right-3 h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,168,67,0.6)]" />
              </button>
            </div>

            <!-- Right: Character Showcase Stage -->
            <div class="relative flex overflow-hidden rounded-r-2xl border border-l-0 border-white/8 bg-[#080b10]">
              <!-- Dynamic background per weapon -->
              <div
                class="absolute inset-0 transition-all duration-700"
                :style="selectedWeapon?.backgroundImage ? { backgroundImage: `url(${selectedWeapon.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
              />
              <!-- Gradient overlays -->
              <div class="absolute inset-0 bg-gradient-to-r from-[#080b10]/90 via-[#080b10]/40 to-[#080b10]/70" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#080b10] via-transparent to-[#080b10]/30" />

              <!-- Radial glow behind character -->
              <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gold/5 blur-[100px] transition-all duration-1000" />

              <!-- Content grid: Info left, Character right -->
              <div class="relative flex w-full flex-col items-center gap-6 p-8 lg:flex-row lg:items-center lg:p-12">
                <!-- Left: Character Info -->
                <div class="flex-1 min-w-0 order-2 lg:order-1 text-center lg:text-left">
                  <!-- Weapon Name with decorative lines -->
                  <div class="mb-1 flex items-center gap-3 justify-center lg:justify-start">
                    <span class="hidden lg:block h-px w-8 bg-gold/40" />
                    <span class="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-gold/50">WEAPON CLASS</span>
                  </div>
                  <h3
                    class="mb-4 text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60"
                    :key="selectedWeapon?.id"
                  >{{ selectedWeapon?.nameEn || selectedWeapon?.name || '' }}</h3>

                  <!-- Description -->
                  <p class="mb-8 text-sm leading-relaxed text-white/45 max-w-sm">
                    {{ selectedWeapon?.descriptionTh || selectedWeapon?.descriptionEn || t('weapons.subtitle') }}
                  </p>

                  <!-- Stat Bars — Animated, glowing -->
                  <div class="flex flex-col gap-3 max-w-sm mx-auto lg:mx-0">
                    <div v-for="stat in statLabels" :key="stat.key" class="flex items-center gap-3">
                      <span class="w-8 text-[0.625rem] font-extrabold uppercase tracking-[0.2em]" :class="stat.textColor">{{ stat.label }}</span>
                      <div class="h-3 flex-1 overflow-hidden rounded-full bg-white/5 border border-white/5">
                        <div
                          class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          :class="stat.barColor"
                          :style="{ width: `${(selectedWeapon as any)?.[stat.key] || 50}%` }"
                        >
                          <!-- Shine effect -->
                          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[glow-sweep_3s_ease-in-out_infinite]" />
                        </div>
                      </div>
                      <span class="w-6 text-right text-[0.625rem] font-mono text-white/25">{{ (selectedWeapon as any)?.[stat.key] || 50 }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right: Character Portrait with effects -->
                <div class="order-1 lg:order-2 flex-shrink-0 relative">
                  <!-- Glow ring -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="h-[280px] w-[280px] rounded-full border border-gold/10 animate-[spin_20s_linear_infinite]" />
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="h-[320px] w-[320px] rounded-full border border-gold/5 animate-[spin_30s_linear_infinite_reverse]" />
                  </div>

                  <!-- Character image -->
                  <img
                    :src="selectedWeapon?.portrait || '/images/logo.webp'"
                    :alt="selectedWeapon?.nameEn || ''"
                    class="relative h-[350px] w-auto object-contain drop-shadow-[0_0_80px_rgba(212,168,67,0.15)] transition-all duration-700"
                    :key="'portrait-' + selectedWeapon?.id"
                  />
                </div>
              </div>

              <!-- Bottom decorative line -->
              <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES (Luna Game Feature style — horizontal image cards) -->
      <section
        v-else-if="section.type === 'features'"
        class="relative overflow-hidden py-[clamp(4rem,8vw,8rem)]"
        :style="sectionBgStyle(section)"
      >
        <div class="absolute inset-0 bg-black/40" v-if="section.background" />
        <div class="relative mx-auto max-w-7xl px-6">
          <div class="mb-10 text-center">
            <h2 class="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight text-gold drop-shadow-[0_4px_20px_rgba(212,168,67,0.4)]">
              {{ t('features.title') }}
            </h2>
            <p class="mt-2 text-white/50">{{ t('features.subtitle') }}</p>
          </div>

          <!-- Luna-style Feature Cards (image-first) -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(feature, index) in featureItems"
              :key="feature.key"
              class="group relative overflow-hidden rounded-2xl border border-white/8 aspect-[4/3] cursor-pointer transition-all duration-500 hover:border-gold/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visibleOnce="{ opacity: 1, y: 0, transition: { delay: index * 80 } }"
            >
              <!-- Feature Image -->
              <img
                :src="feature.image"
                :alt="t(`features.${feature.key}`)"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <!-- Content overlay -->
              <div class="absolute bottom-0 left-0 right-0 p-6">
                <div class="mb-2 text-3xl">{{ feature.icon }}</div>
                <h3 class="text-xl font-extrabold leading-tight drop-shadow-lg">{{ t(`features.${feature.key}`) }}</h3>
                <p class="mt-1 text-sm text-white/60 line-clamp-2">{{ t(`features.${feature.key}Desc`) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HIGHLIGHTS (Luna News Banner style — big + small) -->
      <section
        v-else-if="section.type === 'highlights'"
        class="relative overflow-hidden py-[clamp(4rem,8vw,8rem)]"
        :style="sectionBgStyle(section)"
      >
        <div class="absolute inset-0 bg-black/40" v-if="section.background" />
        <div class="relative mx-auto max-w-7xl px-6">
          <div class="mb-10 text-center">
            <h2 class="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight text-gold drop-shadow-[0_4px_20px_rgba(212,168,67,0.4)]">
              {{ t('highlight.title') }}
            </h2>
            <p class="mt-2 text-white/50">{{ t('highlight.subtitle') }}</p>
          </div>

          <!-- Luna-style: 1 big + 2 small -->
          <div class="grid gap-6 lg:grid-cols-2 lg:grid-rows-2">
            <!-- Big Banner -->
            <div
              class="group relative overflow-hidden rounded-2xl border border-white/8 lg:row-span-2 min-h-[300px] lg:min-h-0 cursor-pointer transition-all duration-500 hover:border-gold/30"
              v-motion :initial="{ opacity: 0, x: -30 }" :visibleOnce="{ opacity: 1, x: 0 }"
            >
              <img :src="highlightItems[0]?.image || '/images/og-cover.png'" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <div class="mb-3 text-4xl">{{ highlightItems[0]?.icon }}</div>
                <h3 class="text-2xl font-extrabold drop-shadow-lg">{{ t(`highlight.${highlightItems[0]?.key}`) }}</h3>
                <p class="mt-2 text-sm text-white/60 max-w-md">{{ t(`highlight.${highlightItems[0]?.key}Desc`) }}</p>
              </div>
            </div>

            <!-- Small Banners -->
            <div
              v-for="(hl, idx) in highlightItems.slice(1)"
              :key="hl.key"
              class="group relative overflow-hidden rounded-2xl border border-white/8 min-h-[200px] cursor-pointer transition-all duration-500 hover:border-gold/30"
              v-motion :initial="{ opacity: 0, x: 30 }" :visibleOnce="{ opacity: 1, x: 0, transition: { delay: idx * 100 } }"
            >
              <img :src="hl.image || '/images/og-cover.png'" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div class="absolute bottom-0 left-0 right-0 p-6">
                <div class="mb-2 text-2xl">{{ hl.icon }}</div>
                <h3 class="text-lg font-extrabold drop-shadow-lg">{{ t(`highlight.${hl.key}`) }}</h3>
                <p class="mt-1 text-sm text-white/60">{{ t(`highlight.${hl.key}Desc`) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- NEWS (Luna News style — banner carousel + cards) -->
      <section
        v-else-if="section.type === 'news'"
        class="relative overflow-hidden py-[clamp(4rem,8vw,8rem)]"
        :style="sectionBgStyle(section)"
      >
        <div class="absolute inset-0 bg-black/40" v-if="section.background" />
        <div class="relative mx-auto max-w-7xl px-6">
          <div class="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <h2 class="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold tracking-tight">{{ t('news.latestNews') }}</h2>
            </div>
            <NuxtLink to="/news" class="inline-flex items-center gap-2 text-sm font-semibold text-gold no-underline hover:text-gold-light">
              {{ t('news.allNews') }} →
            </NuxtLink>
          </div>

          <!-- Featured News Banner -->
          <div v-if="newsArticles.length > 0" class="mb-8 relative overflow-hidden rounded-2xl border border-white/8 aspect-[21/9] group cursor-pointer" @click="navigateTo(`/news/${newsArticles[0]?.slug}`)">
            <img :src="newsArticles[0]?.featuredImage || '/images/og-cover.png'" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <span class="mb-2 inline-block rounded-full bg-gold/90 px-3 py-1 text-[0.625rem] font-bold uppercase text-black">{{ newsArticles[0]?.category }}</span>
              <h3 class="text-2xl font-extrabold drop-shadow-lg">{{ newsArticles[0]?.titleTh || newsArticles[0]?.titleEn }}</h3>
              <p class="mt-1 text-sm text-white/60 max-w-lg">{{ newsArticles[0]?.excerptTh || newsArticles[0]?.excerptEn }}</p>
            </div>
            <!-- Carousel dots -->
            <div class="absolute bottom-4 right-6 flex gap-2">
              <span v-for="(_, di) in Math.min(newsArticles.length, 3)" :key="di" class="h-2 w-2 rounded-full" :class="di === 0 ? 'bg-gold' : 'bg-white/30'" />
            </div>
          </div>

          <!-- News Cards -->
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="(article, index) in newsArticles.slice(0, 3)"
              :key="article.id"
              :to="`/news/${article.slug}`"
              class="group overflow-hidden rounded-2xl border border-white/6 bg-white/4 no-underline transition-all duration-500 hover:-translate-y-1 hover:border-gold/20"
              v-motion :initial="{ opacity: 0, y: 30 }" :visibleOnce="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
            >
              <div class="relative aspect-video overflow-hidden">
                <img :src="article.featuredImage || '/images/og-cover.png'" :alt="article.titleTh || article.titleEn" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div class="absolute left-3 top-3">
                  <span class="rounded-full bg-gold/90 px-3 py-1 text-[0.625rem] font-bold uppercase tracking-wider text-black">{{ article.category }}</span>
                </div>
              </div>
              <div class="p-5">
                <h3 class="mb-2 line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-gold">{{ article.titleTh || article.titleEn }}</h3>
                <p class="line-clamp-2 text-sm text-white/50">{{ article.excerptTh || article.excerptEn }}</p>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-xs text-white/30">{{ formatDate(article.publishedAt) }}</span>
                  <span class="text-xs font-semibold text-gold">{{ t('news.readMore') }} →</span>
                </div>
              </div>
            </NuxtLink>
          </div>
          <div v-if="!newsArticles || newsArticles.length === 0" class="py-12 text-center text-white/30">{{ t('news.noNews') }}</div>
        </div>
      </section>

      <!-- CTA -->
      <section
        v-else-if="section.type === 'cta'"
        class="relative overflow-hidden py-[clamp(4rem,8vw,6rem)]"
        :style="sectionBgStyle(section)"
      >
        <div class="absolute inset-0 bg-black/40" v-if="section.background" />
        <div class="relative mx-auto max-w-7xl px-6 text-center">
          <h2 class="mb-4 text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold" v-motion :initial="{ opacity: 0, y: 20 }" :visibleOnce="{ opacity: 1, y: 0 }">
            {{ t('hero.cta') }}
          </h2>
          <p class="mx-auto mb-8 max-w-lg text-white/60" v-motion :initial="{ opacity: 0 }" :visibleOnce="{ opacity: 1, transition: { delay: 200 } }">
            {{ t('hero.tagline') }}
          </p>
          <NuxtLink
            to="/event"
            class="inline-flex h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light px-10 text-[0.9375rem] font-extrabold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(212,168,67,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(212,168,67,0.5)]"
          >
            {{ t('event.registerButton') }}
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ title: 'Eternal Tower Saga — เกม RPG บนมือถือ' })

// Dynamic sections from API
interface Section { id: string; type: string; visible: boolean; order: number; background: string; config: Record<string, unknown> }
const { data: sectionsData } = await useFetch<{ sections: Section[] }>('/api/public/sections', {
  default: () => ({
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0, background: '/images/hero-bg.webp', config: {} },
      { id: 'weapons', type: 'weapons', visible: true, order: 1, background: '', config: {} },
      { id: 'features', type: 'features', visible: true, order: 2, background: '', config: {} },
      { id: 'highlights', type: 'highlights', visible: true, order: 3, background: '', config: {} },
      { id: 'news', type: 'news', visible: true, order: 4, background: '', config: {} },
      { id: 'cta', type: 'cta', visible: true, order: 5, background: '', config: {} },
    ],
  }),
})
const visibleSections = computed(() =>
  (sectionsData.value?.sections || []).filter((s) => s.visible).sort((a, b) => a.order - b.order)
)

function sectionBgStyle(section: Section) {
  if (!section.background) return {}
  return { backgroundImage: `url(${section.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
}

// Weapons from API
interface WeaponData {
  id: number; name: string; nameEn?: string; descriptionEn?: string; descriptionTh?: string
  portrait?: string; infoImage?: string; backgroundImage?: string; icon?: string
  statSTR?: number; statINT?: number; statAGI?: number; statDEX?: number; statHP?: number
}
const { data: weaponsRaw } = await useFetch<WeaponData[]>('/api/public/weapons', { default: () => [] })
const weapons = computed(() => weaponsRaw.value || [])
const selectedWeapon = ref<WeaponData | null>(null)
watch(weapons, (val) => { if (val.length && !selectedWeapon.value) selectedWeapon.value = val[0] }, { immediate: true })

function selectWeapon(weapon: WeaponData) {
  selectedWeapon.value = weapon
}

const statLabels = [
  { key: 'statSTR', label: 'STR', textColor: 'text-red-400/70', barColor: 'bg-gradient-to-r from-red-600 via-red-500 to-red-400' },
  { key: 'statINT', label: 'INT', textColor: 'text-blue-400/70', barColor: 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400' },
  { key: 'statAGI', label: 'AGI', textColor: 'text-emerald-400/70', barColor: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400' },
  { key: 'statDEX', label: 'DEX', textColor: 'text-amber-400/70', barColor: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400' },
  { key: 'statHP', label: 'HP', textColor: 'text-rose-400/70', barColor: 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400' },
]

// News from API
interface NewsArticle {
  id: number; slug: string; titleEn: string; titleTh: string
  excerptEn: string | null; excerptTh: string | null; category: string; featuredImage: string | null; publishedAt: string
}
const { data: newsData } = await useFetch<{ data: NewsArticle[] }>('/api/public/news', { query: { limit: 6 }, default: () => ({ data: [] }) })
const newsArticles = computed(() => newsData.value?.data || [])

// Features (configurable via admin later — static default)
const featureItems = [
  { key: 'openWorld', icon: '🌍', image: '/images/features/open-world.webp' },
  { key: 'realTimePvP', icon: '⚔️', image: '/images/features/pvp.webp' },
  { key: 'guildSystem', icon: '🏰', image: '/images/features/guild.webp' },
  { key: 'petSystem', icon: '🐉', image: '/images/features/pets.webp' },
  { key: 'craftSystem', icon: '🔨', image: '/images/features/craft.webp' },
  { key: 'towerClimb', icon: '🗼', image: '/images/features/tower.webp' },
]

// Highlights
const highlightItems = [
  { key: 'graphics', icon: '✨', image: '/images/highlights/k-fantasy.webp' },
  { key: 'crossPlatform', icon: '📱', image: '/images/highlights/cross-play.webp' },
  { key: 'freeToPlay', icon: '🎮', image: '/images/highlights/free.webp' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
