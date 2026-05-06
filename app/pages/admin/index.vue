<template>
  <div>
    <!-- Welcome header -->
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.dashboard.welcome', { name: (user as any)?.displayName || 'Admin' }) }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.dashboard.subtitle') }}</p>
      </div>
      <div class="text-sm text-white/30 whitespace-nowrap">{{ todayFormatted }}</div>
    </div>

    <!-- Quick Actions -->
    <div class="mb-6 grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))">
      <NuxtLink v-for="action in quickActions" :key="action.to" :to="action.to" class="quick-action-card">
        <UIcon :name="action.icon" class="w-5 h-5" />
        <span class="text-xs font-medium">{{ action.label }}</span>
      </NuxtLink>
    </div>

    <!-- Stat Cards -->
    <div class="mb-6 grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))">
      <div v-for="stat in statCards" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.bg }"><UIcon :name="stat.icon" class="w-6 h-6" /></div>
        <div>
          <p class="text-2xl font-extrabold leading-tight">{{ stat.value }}</p>
          <p class="text-xs font-medium text-white/50">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Content Status + Recent Activity -->
    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <!-- Content Completion -->
      <div class="panel">
        <h3 class="panel-title">Content Status</h3>
        <div class="flex flex-col gap-3">
          <div v-for="item in contentStatus" :key="item.label" class="flex items-center gap-3">
            <UIcon :name="item.icon" class="w-4 h-4 opacity-60" />
            <span class="flex-1 text-sm">{{ item.label }}</span>
            <span class="rounded-full px-2 py-0.5 text-xs font-bold"
              :class="item.count > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/25'">
              {{ item.count }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="panel overflow-hidden">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="panel-title !mb-0">Recent Activity</h3>
          <NuxtLink to="/admin/activity" class="text-xs font-medium text-gold no-underline">View all →</NuxtLink>
        </div>
        <div v-if="recentActivity.length > 0" class="flex flex-col gap-2">
          <div v-for="(a, i) in recentActivity" :key="i" class="flex items-center gap-3 rounded-lg bg-white/2 p-2.5">
            <span class="rounded-full px-1.5 py-0.5 text-[0.5625rem] font-bold"
              :class="a.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' : a.action === 'DELETE' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'">
              {{ a.action }}
            </span>
            <span class="flex-1 truncate text-xs text-white/50">{{ a.resource }}</span>
            <span class="text-xs text-white/20">{{ a.userName }}</span>
          </div>
        </div>
        <p v-else class="py-6 text-center text-sm text-white/30">No recent activity</p>
      </div>
    </div>

    <!-- Recent Articles -->
    <div class="panel overflow-hidden">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="panel-title !mb-0">Recent Articles</h3>
        <NuxtLink to="/admin/news" class="text-xs font-medium text-gold no-underline">View all →</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-white/6">
            <th class="th-cell">Title</th><th class="th-cell">Category</th><th class="th-cell">Status</th><th class="th-cell">Date</th>
          </tr></thead>
          <tbody>
            <tr v-for="a in recentArticles" :key="a.id" class="border-b border-white/3">
              <td class="max-w-[250px] truncate px-3 py-2.5 font-medium">{{ a.titleEn }}</td>
              <td class="px-3 py-2.5"><AdminStatusBadge :status="a.category" /></td>
              <td class="px-3 py-2.5"><AdminStatusBadge :status="a.status" /></td>
              <td class="px-3 py-2.5 text-white/30 whitespace-nowrap">{{ formatDate(a.createdAt) }}</td>
            </tr>
            <tr v-if="recentArticles.length === 0">
              <td colspan="4" class="px-3 py-8 text-center text-white/30">No articles yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<!--
  ═══ Admin Dashboard ═══
  หน้าแรกของ admin panel — แสดงภาพรวมทั้งหมดในที่เดียว

  ส่วนประกอบ:
  - Quick Actions: ทางลัดไป CMS pages, Webzine, Banners
  - Stat Cards: นับข่าว, อาวุธ, media, page views
  - Content Status: live banners, draft articles, missing assets
  - Recent: activity log, บทความ

  ข้อมูลมาจาก: GET /api/admin/stats (ดู stats.get.ts)
-->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t, locale } = useI18n()
const { localizedDate } = useLocalizedField()
const { user } = useUserSession()
// Audit-3 (FE-2 M3): use locale-aware number formatting.
const numLocale = computed(() => (locale.value === 'th' ? 'th-TH' : 'en-US'))

interface Stats {
  counts: {
    news: number; publishedNews: number; weapons: number
    features: number; highlights: number; media: number; todayPageViews: number
  }
  webzineSummary: {
    liveBanners: number
    scheduledBanners: number
    draftArticles: number
    articlesMissingTopic: number
    articlesMissingFeaturedImage: number
  }
  recentNews: Array<{ id: number; titleEn: string; status: string; category: string; createdAt: string }>
  recentActivity: Array<{ action: string; resource: string; userName: string; createdAt: string }>
}

const { data: stats } = await useFetch<Stats>('/api/admin/stats', {
  default: () => ({
    counts: { news: 0, publishedNews: 0, weapons: 0, features: 0, highlights: 0, media: 0, todayPageViews: 0 },
    webzineSummary: { liveBanners: 0, scheduledBanners: 0, draftArticles: 0, articlesMissingTopic: 0, articlesMissingFeaturedImage: 0 },
    recentNews: [], recentActivity: [],
  }),
})

// ⚠️ Compute on client only — `new Date().toLocaleDateString()` produces different
// strings on server (UTC, en-US locale) vs client (browser locale + timezone).
// Hydration mismatch otherwise.
const todayFormatted = ref('')
onMounted(() => {
  todayFormatted.value = localizedDate(new Date(), {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})
// Re-format when user switches locale.
watch(locale, () => {
  if (todayFormatted.value) {
    todayFormatted.value = localizedDate(new Date(), {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  }
})

const quickActions = [
  { icon: 'i-lucide-file-plus', label: 'New CMS Page', to: '/admin/pages' },
  { icon: 'i-lucide-newspaper', label: 'Webzine Articles', to: '/admin/news' },
  { icon: 'i-lucide-tags', label: 'Topics', to: '/admin/topics' },
  { icon: 'i-lucide-flag', label: 'Banner Control', to: '/admin/banners' },
  { icon: 'i-lucide-external-link', label: 'View Site', to: '/' },
]

// ── Stat Cards: แปลงตัวเลขจาก API เป็น UI cards ──
const statCards = computed(() => [
  { icon: 'i-lucide-newspaper', label: 'News', value: stats.value.counts.news.toString(), bg: 'rgba(16,185,129,0.12)' },
  { icon: 'i-lucide-check-circle', label: 'Published', value: stats.value.counts.publishedNews.toString(), bg: 'rgba(245,158,11,0.12)' },
  { icon: 'i-lucide-swords', label: 'Weapons', value: stats.value.counts.weapons.toString(), bg: 'rgba(139,92,246,0.12)' },
  { icon: 'i-lucide-sparkles', label: 'Features', value: stats.value.counts.features.toString(), bg: 'rgba(236,72,153,0.12)' },
  { icon: 'i-lucide-star', label: 'Highlights', value: stats.value.counts.highlights.toString(), bg: 'rgba(14,165,233,0.12)' },
  { icon: 'i-lucide-image', label: 'Media', value: stats.value.counts.media.toString(), bg: 'rgba(168,85,247,0.12)' },
  { icon: 'i-lucide-eye', label: 'Views Today', value: stats.value.counts.todayPageViews.toLocaleString(numLocale.value), bg: 'rgba(251,146,60,0.12)' },
])

const contentStatus = computed(() => [
  { icon: 'i-lucide-newspaper', label: 'Webzine Articles', count: stats.value.counts.news },
  { icon: 'i-lucide-flag', label: 'Live Banners', count: stats.value.webzineSummary.liveBanners },
  { icon: 'i-lucide-clock-3', label: 'Scheduled Banners', count: stats.value.webzineSummary.scheduledBanners },
  { icon: 'i-lucide-pencil', label: 'Draft Articles', count: stats.value.webzineSummary.draftArticles },
  { icon: 'i-lucide-tags', label: 'Missing Topic', count: stats.value.webzineSummary.articlesMissingTopic },
  { icon: 'i-lucide-image-off', label: 'Missing Featured Image', count: stats.value.webzineSummary.articlesMissingFeaturedImage },
])

const recentArticles = computed(() => stats.value.recentNews || [])
const recentActivity = computed(() => stats.value.recentActivity || [])

function formatDate(d: string) { return localizedDate(d, { month: 'short', day: 'numeric' }) }
</script>

<style scoped>
/* Dashboard-specific patterns built on top of admin.css design tokens */
.quick-action-card {
  display: flex; flex-direction: column; align-items: center; gap: var(--adm-sp-2);
  padding: var(--adm-sp-4) var(--adm-sp-3); border-radius: var(--adm-radius-lg);
  border: 1px solid var(--adm-border-soft);
  background: linear-gradient(135deg, var(--adm-surface-2), var(--adm-surface-1));
  text-decoration: none; color: var(--adm-ink-soft);
  transition: all var(--adm-dur) var(--adm-ease); cursor: pointer;
}
.quick-action-card:hover {
  border-color: var(--adm-gold-medium);
  background: var(--adm-gold-soft);
  color: var(--adm-gold-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.stat-card {
  display: flex; align-items: center; gap: var(--adm-sp-4);
  padding: var(--adm-sp-5); border-radius: var(--adm-radius-lg);
  border: 1px solid var(--adm-border-soft);
  background: var(--adm-surface-1);
  transition: transform var(--adm-dur) var(--adm-ease), border-color var(--adm-dur) var(--adm-ease);
}
.stat-card:hover { transform: translateY(-2px); border-color: var(--adm-border-default); }
.stat-icon {
  display: flex; width: 44px; height: 44px; flex-shrink: 0;
  align-items: center; justify-content: center;
  border-radius: var(--adm-radius);
}
.panel {
  border-radius: var(--adm-radius-lg); border: 1px solid var(--adm-border-soft);
  background: var(--adm-surface-1); padding: var(--adm-sp-6);
}
.panel-title {
  margin: 0 0 var(--adm-sp-5); font-size: var(--adm-text-xs); font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--adm-ink-mute);
}
.th-cell {
  padding: var(--adm-sp-2) var(--adm-sp-3); text-align: left; font-size: var(--adm-text-xs);
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--adm-ink-mute);
}
</style>
