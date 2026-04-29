<template>
  <div data-testid="homepage-shell" :data-ready="hydrated ? 'true' : 'false'">
    <!-- Sitewide announcement bar (above hero) -->
    <SiteMarketingBannerSlot
      class="mx-6 pt-24 md:mx-auto md:max-w-7xl"
      placement="announcement_bar"
      :banner="bannerMap.announcement_bar"
    />

    <!-- ════════════════════════════════════════════════
         CMS-driven sections — explicit type → component
         (avoids `<component :is="STRING">` resolution failure)
    ════════════════════════════════════════════════ -->
    <template v-if="sections.length > 0">
      <template v-for="section in sections" :key="section.id">
        <OrganismsHeroSection
          v-if="section.type === 'hero'"
          :background="section.background || heroBackground"
          :config="(section.config as Record<string, unknown>) || heroConfig"
        />
        <OrganismsWeaponSelector
          v-else-if="section.type === 'weapons'"
          :items="getSectionItems(section, 'items', weaponsFallback)"
        />
        <OrganismsGameGuildSection
          v-else-if="section.type === 'features'"
          :items="getSectionItems(section, 'items', featuresFallback)"
        />
        <OrganismsHighlightReel
          v-else-if="section.type === 'highlight' || section.type === 'highlights'"
          :slides="getSectionItems(section, 'slides', highlightSlidesFallback)"
        />
        <OrganismsNewsSection
          v-else-if="section.type === 'news'"
          :articles="getSectionItems(section, 'articles', newsArticlesFallback)"
        />
        <OrganismsCTASection
          v-else-if="section.type === 'cta'"
          :background="section.background || ctaBackground"
          :stats="getSectionItems(section, 'stats', ctaStats)"
        />
      </template>
    </template>

    <!-- ════════════════════════════════════════════════
         Fallback when CMS returns 0 sections
    ════════════════════════════════════════════════ -->
    <template v-else>
      <OrganismsHeroSection :background="heroBackground" :config="heroConfig" />
      <OrganismsWeaponSelector :items="weaponsFallback" />
      <SiteMarketingBannerSlot
        class="mx-auto my-12 max-w-7xl px-6"
        placement="homepage_inline"
        :banner="bannerMap.homepage_inline"
      />
      <OrganismsGameGuildSection :items="featuresFallback" />
      <OrganismsHighlightReel :slides="highlightSlidesFallback" />
      <OrganismsNewsSection :articles="newsArticlesFallback" />
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
 *  1. CMS mode — sections come from /api/public/sections; explicit
 *     v-if chain for each type (compile-time resolved, no string lookup).
 *  2. Fallback — if CMS returns no sections, renders the default order
 *     using static fixtures so the page is never empty.
 *
 * Layout: default.vue handles SiteNavigation + SiteFooter + outer <main>.
 *
 * Banners use useBannerOrchestrator (popup⇄floating + announcement⇄footer
 * mutex) to prevent visual chaos.
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

/**
 * เลือก data จาก section.config ก่อน (CMS fill ได้) ถ้าว่างใช้ fallback
 * รองรับทั้ง section.config.items และ section[key] โดยตรง
 */
function getSectionItems<T>(section: PublicSection, key: string, fallback: T[]): T[] {
  const cfg = section.config as Record<string, unknown> | undefined
  const fromConfig = cfg && Array.isArray(cfg[key]) ? (cfg[key] as T[]) : null
  if (fromConfig && fromConfig.length > 0) return fromConfig
  return fallback
}

// ── Sections from CMS ──
const { data: sectionsData } = await useFetch<{ sections: PublicSection[] }>(
  '/api/public/sections',
  { default: () => ({ sections: [] }) },
)

const sections = computed(() =>
  [...(sectionsData.value?.sections ?? [])].sort((a, b) => a.order - b.order),
)

// ── Marketing banners (orchestrated) ──
const { data: bannersData } = useBannerOrchestrator({ routeType: 'homepage' })
const bannerMap = computed(() => bannersData.value || {
  announcement_bar: null, popup: null, floating: null,
  homepage_inline: null, sidebar: null, article_inline: null, footer_strip: null,
})

/* ──────────────────────────────────────────────────────────
   Fallback fixtures (used when CMS returns 0 sections)
   ────────────────────────────────────────────────────────── */
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

const weaponsFallback = [
  { id: 'crimson-blade', nameEn: 'Crimson Blade', nameTh: 'ดาบโลหิตทมิฬ', kr: '검', roleEn: 'Vanguard', roleTh: 'แนวหน้า',
    descriptionEn: 'A blade forged in the blood of fallen kings. Strikes faster than thought.',
    descriptionTh: 'ดาบที่หล่อขึ้นจากเลือดของกษัตริย์ที่ล้มลง รวดเร็วกว่าความคิด',
    image: '/images/weapons/crimson-blade.webp',
    stats: [{ label: 'Power', value: 92 }, { label: 'Speed', value: 78 }, { label: 'Range', value: 45 }, { label: 'Mastery', value: 68 }] },
  { id: 'void-bow', nameEn: 'Void Bow', nameTh: 'ธนูแห่งห้วงเหว', kr: '궁', roleEn: 'Marksman', roleTh: 'นักล่า',
    descriptionEn: 'Arrows that pierce dimensions. Distance is no longer a barrier.',
    descriptionTh: 'ลูกธนูทะลุมิติ ระยะทางไม่ใช่อุปสรรคอีกต่อไป',
    image: '/images/weapons/void-bow.webp',
    stats: [{ label: 'Power', value: 76 }, { label: 'Speed', value: 88 }, { label: 'Range', value: 96 }, { label: 'Mastery', value: 72 }] },
  { id: 'storm-staff', nameEn: 'Storm Staff', nameTh: 'ไม้เท้าพายุ', kr: '장', roleEn: 'Mage', roleTh: 'ผู้ใช้เวทย์',
    descriptionEn: 'Channel the wrath of seven storms in a single incantation.',
    descriptionTh: 'รวบรวมพลังพายุทั้งเจ็ดในคาถาเดียว',
    image: '/images/weapons/storm-staff.webp',
    stats: [{ label: 'Power', value: 95 }, { label: 'Speed', value: 52 }, { label: 'Range', value: 84 }, { label: 'Mastery', value: 89 }] },
]

const featuresFallback = [
  { id: 'f1', titleEn: 'Endless Tower', titleTh: 'หอคอยไร้สิ้นสุด',
    descriptionEn: 'Every floor reshapes itself. No two climbs are the same.',
    descriptionTh: 'ทุกชั้นเปลี่ยนรูปร่าง ไม่มีการปีนใดที่เหมือนกัน',
    image: '/images/features/tower.webp' },
  { id: 'f2', titleEn: 'Living Guilds', titleTh: 'กิลด์ที่มีชีวิต',
    descriptionEn: 'Build alliances that influence the world map in real time.',
    descriptionTh: 'สร้างพันธมิตรที่ส่งผลต่อแผนที่โลกแบบเรียลไทม์',
    image: '/images/features/guild.webp' },
  { id: 'f3', titleEn: 'Open World', titleTh: 'โลกเปิดกว้าง',
    descriptionEn: 'Stylish action with deep mastery systems across an open continent.',
    descriptionTh: 'แอ็กชันที่มีสไตล์พร้อมระบบความชำนาญที่ลึกซึ้งบนทวีปเปิด',
    image: '/images/features/open-world.webp' },
  { id: 'f4', titleEn: 'Forge & Craft', titleTh: 'หลอมและสร้าง',
    descriptionEn: 'Refine weapons through ancient rituals.',
    descriptionTh: 'ปรับแต่งอาวุธผ่านพิธีกรรมโบราณ',
    image: '/images/features/craft.webp' },
  { id: 'f5', titleEn: 'Ranked PvP', titleTh: 'PvP จัดอันดับ',
    descriptionEn: 'Climb the seasonal ladder for exclusive rewards.',
    descriptionTh: 'ปีนบันไดประจำฤดูกาลเพื่อรับรางวัลพิเศษ',
    image: '/images/features/pvp.webp' },
  { id: 'f6', titleEn: 'Soulbound Pets', titleTh: 'สัตว์เลี้ยงผูกวิญญาณ',
    descriptionEn: 'Companions that grow with your saga.',
    descriptionTh: 'เพื่อนร่วมทางที่เติบโตไปกับตำนานของคุณ',
    image: '/images/features/pets.webp' },
]

const highlightSlidesFallback = [
  { id: 'h1', titleEn: 'The Climb Begins', titleTh: 'การปีนเริ่มต้น',
    kickerEn: 'Chapter 01', kickerTh: 'บทที่ 01',
    descriptionEn: 'Step into a world where every floor tests both blade and spirit.',
    descriptionTh: 'ก้าวเข้าสู่โลกที่ทุกชั้นทดสอบทั้งดาบและจิตวิญญาณ',
    image: '/images/highlight/reel-1.webp' },
  { id: 'h2', titleEn: 'Forge of Heroes', titleTh: 'เตาหลอมวีรบุรุษ',
    kickerEn: 'Chapter 02', kickerTh: 'บทที่ 02',
    descriptionEn: 'Where legends are tempered by fire, fury, and friendship.',
    descriptionTh: 'ที่ที่ตำนานถูกหล่อหลอมด้วยไฟ ความโกรธ และมิตรภาพ',
    image: '/images/highlight/reel-2.webp' },
  { id: 'h3', titleEn: 'Shadows of the Tower', titleTh: 'เงามืดแห่งหอคอย',
    kickerEn: 'Chapter 03', kickerTh: 'บทที่ 03',
    descriptionEn: 'Not all who climb seek the light at the summit.',
    descriptionTh: 'ไม่ใช่ทุกคนที่ปีนแสวงหาแสงสว่างบนยอดหอคอย',
    image: '/images/highlight/reel-3.webp' },
]

const newsArticlesFallback = [
  { id: 'n1', titleEn: 'Closed Beta opens November 14', titleTh: 'Closed Beta เปิด 14 พฤศจิกายน',
    excerptEn: 'Selected climbers will be the first to step into the tower. Sign-ups close midnight Friday.',
    excerptTh: 'นักผจญภัยที่ได้รับเลือกจะได้เข้าหอคอยเป็นกลุ่มแรก ลงทะเบียนถึงเที่ยงคืนวันศุกร์',
    categoryEn: 'Announcement', categoryTh: 'ประกาศ',
    image: '/images/news/closed-beta.webp', date: '2026-04-14', href: '/news/closed-beta', featured: true },
  { id: 'n2', titleEn: 'Patch 0.9: Crimson Floors', titleTh: 'แพตช์ 0.9: ชั้นโลหิต',
    categoryEn: 'Patch', categoryTh: 'แพตช์',
    image: '/images/news/patch-09.webp', date: '2026-04-04', href: '/news/patch-09' },
  { id: 'n3', titleEn: 'Lore Drop: The First Climber', titleTh: 'ตำนาน: นักปีนคนแรก',
    categoryEn: 'Lore', categoryTh: 'ตำนาน',
    image: '/images/news/first-climber.webp', date: '2026-03-28', href: '/news/first-climber' },
]

const ctaBackground = '/images/cta-bg.webp'
const ctaStats = [
  { label: 'Floors', value: '∞' },
  { label: 'Classes', value: '12' },
  { label: 'Players', value: '500K+' },
]

useHead({
  title: 'Eternal Tower Saga — 영원한 탑의 전설',
  meta: [
    { name: 'description', content: 'Climb the eternal tower. Forge your saga. A stylized action MMORPG inspired by Korean dark fantasy.' },
    { property: 'og:title', content: 'Eternal Tower Saga' },
    { property: 'og:description', content: 'Climb the eternal tower. Forge your saga.' },
  ],
})
</script>
