<template>
  <div data-testid="homepage-shell" :data-ready="hydrated ? 'true' : 'false'">
    <!-- Sitewide announcement bar (above hero) -->
    <SiteMarketingBannerSlot
      class="mx-6 pt-24 md:mx-auto md:max-w-7xl"
      placement="announcement_bar"
      :banner="bannerMap.announcement_bar"
    />

    <!-- ════════════════════════════════════════════════
         CMS-driven sections — explicit type → component.
         Content sections (weapons/features/highlights/news) only render
         when admin has populated their respective tables. Hero & CTA
         always render because they are structural/branding, not content.
    ════════════════════════════════════════════════ -->
    <template v-for="section in sections" :key="section.id">
      <OrganismsHeroSection
        v-if="section.type === 'hero'"
        :background="section.background || heroBackground"
        :config="(section.config as Record<string, unknown>) || heroConfig"
      />
      <OrganismsWeaponSelector
        v-else-if="section.type === 'weapons' && liveWeapons.length > 0"
        :items="liveWeapons"
      />
      <SiteMarketingBannerSlot
        v-if="section.type === 'weapons' && bannerMap.homepage_inline"
        class="mx-auto my-12 max-w-7xl px-6"
        placement="homepage_inline"
        :banner="bannerMap.homepage_inline"
      />
      <OrganismsGameGuildSection
        v-else-if="section.type === 'features' && liveFeatures.length > 0"
        :items="liveFeatures"
      />
      <OrganismsHighlightReel
        v-else-if="(section.type === 'highlight' || section.type === 'highlights') && liveHighlights.length > 0"
        :slides="liveHighlights"
      />
      <OrganismsNewsSection
        v-else-if="section.type === 'news' && liveNews.length > 0"
        :articles="liveNews"
      />
      <OrganismsCTASection
        v-else-if="section.type === 'cta'"
        :background="section.background || ctaBackground"
        :stats="ctaStats"
      />
    </template>

    <!-- Fallback when CMS returns 0 sections: render hero + cta only (no fake content) -->
    <template v-if="sections.length === 0">
      <OrganismsHeroSection :background="heroBackground" :config="heroConfig" />
      <OrganismsCTASection :background="ctaBackground" :stats="ctaStats" />
    </template>

    <!-- Footer strip (auto-hidden by orchestrator if announcement_bar is showing) -->
    <SiteMarketingBannerSlot
      class="mx-auto mb-8 max-w-7xl px-6"
      placement="footer_strip"
      :banner="bannerMap.footer_strip"
    />

    <!-- Floating + popup overlays (mutex via orchestrator: popup wins) -->
    <SiteMarketingBannerSlot placement="popup" :banner="bannerMap.popup" />
    <SiteMarketingBannerSlot placement="floating" :banner="bannerMap.floating" />
  </div>
</template>

<script setup lang="ts">
/**
 * app/pages/index.vue — Eternal Tower Saga landing
 *
 * Render strategy:
 *  - Hero & CTA: always render (structural, not content). Defaults below.
 *  - Weapons / Features / Highlights / News: render ONLY when admin has
 *    populated the underlying tables via /admin/{section}. No fake demo
 *    fallbacks — empty admin data means empty section.
 */

useCursorGlow()

interface PublicSection {
  id: string
  type: string
  order: number
  visible?: boolean
  background?: string
  config?: unknown
}

const hydrated = ref(false)
onMounted(() => { hydrated.value = true })

// ── Sections from CMS (controls which sections appear on homepage) ──
const { data: sectionsData } = await useFetch<{ sections: PublicSection[] }>(
  '/api/public/sections',
  { default: () => ({ sections: [] }) },
)

const sections = computed(() =>
  [...(sectionsData.value?.sections ?? [])].sort((a, b) => a.order - b.order),
)

// ── Live CMS data: weapons, features, highlights, news ──
interface RawWeapon { id: number; name: string; nameEn?: string; descriptionEn?: string; descriptionTh?: string; portrait?: string; infoImage?: string; backgroundImage?: string; sortOrder?: number; visible?: boolean; statSTR?: number; statINT?: number; statAGI?: number; statDEX?: number; statHP?: number }
interface RawFeature { id: number; key: string; titleEn: string; titleTh: string; descriptionEn?: string; descriptionTh?: string; image?: string; sortOrder?: number; visible?: boolean }
interface RawHighlight { id: number; key: string; titleEn: string; titleTh: string; descriptionEn?: string; descriptionTh?: string; image?: string; sortOrder?: number; visible?: boolean }
interface RawNews { id: number; slug: string; titleEn: string; titleTh: string; excerptEn?: string | null; excerptTh?: string | null; category: string; featuredImage?: string | null; publishedAt?: string | null }

const { data: liveWeaponsRaw } = await useFetch<RawWeapon[]>('/api/public/weapons', { default: () => [] })
const { data: liveFeaturesRaw } = await useFetch<RawFeature[]>('/api/public/features', { default: () => [] })
const { data: liveHighlightsRaw } = await useFetch<RawHighlight[]>('/api/public/highlights', { default: () => [] })
const { data: liveNewsRaw } = await useFetch<{ data: RawNews[] }>('/api/public/news', { default: () => ({ data: [] }) })

const liveWeapons = computed(() =>
  (liveWeaponsRaw.value || [])
    .filter((w) => w.visible !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((w) => ({
      id: String(w.id),
      nameEn: w.nameEn || w.name,
      nameTh: w.name || w.nameEn || '',
      roleEn: '',
      roleTh: '',
      descriptionEn: w.descriptionEn || '',
      descriptionTh: w.descriptionTh || '',
      image: w.portrait || w.backgroundImage || w.infoImage || '',
      stats: [
        { label: 'STR', value: w.statSTR ?? 0 },
        { label: 'INT', value: w.statINT ?? 0 },
        { label: 'AGI', value: w.statAGI ?? 0 },
        { label: 'DEX', value: w.statDEX ?? 0 },
        { label: 'HP', value: w.statHP ?? 0 },
      ],
    })),
)

const liveFeatures = computed(() =>
  (liveFeaturesRaw.value || [])
    .filter((f) => f.visible !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((f) => ({
      id: f.key,
      titleEn: f.titleEn,
      titleTh: f.titleTh,
      descriptionEn: f.descriptionEn || '',
      descriptionTh: f.descriptionTh || '',
      image: f.image || '',
    })),
)

const liveHighlights = computed(() =>
  (liveHighlightsRaw.value || [])
    .filter((h) => h.visible !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((h) => ({
      id: h.key,
      titleEn: h.titleEn,
      titleTh: h.titleTh,
      kickerEn: '',
      kickerTh: '',
      descriptionEn: h.descriptionEn || '',
      descriptionTh: h.descriptionTh || '',
      image: h.image || '',
    })),
)

const liveNews = computed(() =>
  (liveNewsRaw.value?.data || []).map((n) => ({
    id: String(n.id),
    titleEn: n.titleEn,
    titleTh: n.titleTh,
    excerptEn: n.excerptEn || '',
    excerptTh: n.excerptTh || '',
    categoryEn: n.category,
    categoryTh: n.category,
    image: n.featuredImage || '',
    date: n.publishedAt || new Date().toISOString(),
    href: `/news/${n.slug}`,
    featured: false,
  })),
)

// ── Marketing banners (orchestrated) ──
const { data: bannersData } = useBannerOrchestrator({ routeType: 'homepage' })
const bannerMap = computed(() => bannersData.value || {
  announcement_bar: null, popup: null, floating: null,
  homepage_inline: null, sidebar: null, article_inline: null, footer_strip: null,
})

/* Structural defaults — branding/layout, not demo content */
const heroBackground = '/images/hero-bg.webp'
const heroConfig = {
  logo: '/images/logo.webp',
  subtitleEn: 'Climb the eternal tower. Forge your saga.',
  subtitleTh: 'ปีนหอคอยนิรันดร์ สร้างตำนานของคุณ',
  showSocialLinks: true,
  backgroundMode: 'image' as const,
  backgroundVideo: '',
  buttons: [
    { id: 'pre-register', labelEn: 'Pre-register', labelTh: 'ลงทะเบียน', href: '/event', variant: 'primary' as const, visible: true, order: 0, target: '_self' as const },
    { id: 'download', labelEn: 'Download', labelTh: 'ดาวน์โหลด', href: '/download', variant: 'secondary' as const, visible: true, order: 1, target: '_self' as const },
  ],
}

const ctaBackground = '/images/cta-bg.webp'
const ctaStats = [
  { label: 'Floors', value: '∞' },
  { label: 'Classes', value: '12' },
  { label: 'Players', value: '500K+' },
]

useHead({
  title: 'Eternal Tower Saga — An Eternal Saga',
  meta: [
    { name: 'description', content: 'Eternal Tower Saga — climb the eternal tower, forge your saga. A stylized action MMORPG inspired by Korean dark fantasy.' },
    { property: 'og:title', content: 'Eternal Tower Saga' },
    { property: 'og:description', content: 'Eternal Tower Saga — climb the eternal tower, forge your saga.' },
  ],
})
</script>
