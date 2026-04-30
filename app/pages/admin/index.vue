<template>
  <div>
    <!-- Welcome header -->
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h2 class="text-2xl font-bold">Welcome back, {{ (user as any)?.displayName || 'Admin' }}</h2>
        <p class="mt-1 text-sm text-white/50">Here's what's happening with your portal today.</p>
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

    <!-- Chart + Distribution -->
    <div class="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <!-- Registration Chart -->
      <div class="panel">
        <h3 class="panel-title">Registration Trend (14 Days)</h3>
        <div class="flex h-[180px] items-end gap-1">
          <div v-for="day in chartData" :key="day.date" class="flex flex-1 flex-col items-center justify-end h-full" :title="`${day.date}: ${day.count}`">
            <div class="w-full max-w-8 min-h-1 rounded-t bg-gradient-to-t from-gold to-gold-light transition-all duration-500" :style="{ height: barHeight(day.count) }" />
            <span class="mt-1.5 text-[0.625rem] text-white/30">{{ day.date.slice(-2) }}</span>
          </div>
        </div>
      </div>

      <!-- Distributions -->
      <div class="panel">
        <h3 class="panel-title">Platform Distribution</h3>
        <div class="mb-8 flex flex-col gap-3.5">
          <div v-for="p in platformData" :key="p.platform" class="flex items-center gap-3">
            <div class="flex w-[90px] flex-shrink-0 items-center gap-2 text-sm">
              <span>{{ platformIconLabel(p.platform) }}</span><span>{{ p.platform }}</span>
            </div>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/4">
              <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500" :style="{ width: platformPercent(p.count) }" />
            </div>
            <span class="w-10 text-right text-xs text-white/30">{{ p.count }}</span>
          </div>
        </div>
        <h3 class="panel-title">Region Distribution</h3>
        <div class="flex flex-col gap-3.5">
          <div v-for="r in regionData" :key="r.region" class="flex items-center gap-3">
            <div class="flex w-[90px] flex-shrink-0 items-center gap-2 text-sm">
              <span>{{ regionIconLabel(r.region) }}</span><span>{{ r.region }}</span>
            </div>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/4">
              <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" :style="{ width: regionPercent(r.count) }" />
            </div>
            <span class="w-10 text-right text-xs text-white/30">{{ r.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Status + Recent Activity -->
    <div class="mb-6 grid gap-4 lg:grid-cols-3">
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

      <!-- Recent Registrations -->
      <div class="panel overflow-hidden">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="panel-title !mb-0">Recent Registrations</h3>
          <NuxtLink to="/admin/registrations" class="text-xs font-medium text-gold no-underline">View all →</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-white/6">
              <th class="th-cell">Email</th><th class="th-cell">Platform</th><th class="th-cell">Date</th>
            </tr></thead>
            <tbody>
              <tr v-for="r in recentRegs" :key="r.id" class="border-b border-white/3">
                <td class="max-w-[140px] truncate px-3 py-2.5">{{ r.email }}</td>
                <td class="px-3 py-2.5"><AdminStatusBadge :status="r.platform" /></td>
                <td class="px-3 py-2.5 text-white/30 whitespace-nowrap">{{ formatDate(r.createdAt) }}</td>
              </tr>
              <tr v-if="recentRegs.length === 0">
                <td colspan="3" class="px-3 py-8 text-center text-white/30">No registrations yet</td>
              </tr>
            </tbody>
          </table>
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
  - Quick Actions: ทางลัดไป CMS pages, Webzine, Events
  - Stat Cards: นับข่าว, อาวุธ, ลงทะเบียน, media, page views
  - กราฟลงทะเบียนรายวัน (14 วัน) — bar chart
  - Platform/Region distribution — progress bars
  - Content Status: live banners, draft articles, missing assets
  - Recent: ลงทะเบียน, activity log, บทความ

  ข้อมูลมาจาก: GET /api/admin/stats (ดู stats.get.ts)
-->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { user } = useUserSession()

interface Stats {
  counts: {
    news: number; publishedNews: number; weapons: number; registrations: number
    features: number; highlights: number; media: number; todayPageViews: number
  }
  webzineSummary: {
    liveBanners: number
    scheduledBanners: number
    draftArticles: number
    articlesMissingTopic: number
    articlesMissingFeaturedImage: number
  }
  platformStats: Array<{ platform: string; count: number }>
  regionStats: Array<{ region: string; count: number }>
  dailyRegistrations: Array<{ date: string; count: number }>
  recentRegistrations: Array<{ id: string; email: string; platform: string; region: string; createdAt: string }>
  recentNews: Array<{ id: number; titleEn: string; status: string; category: string; createdAt: string }>
  recentActivity: Array<{ action: string; resource: string; userName: string; createdAt: string }>
}

const { data: stats } = await useFetch<Stats>('/api/admin/stats', {
  default: () => ({
    counts: { news: 0, publishedNews: 0, weapons: 0, registrations: 0, features: 0, highlights: 0, media: 0, todayPageViews: 0 },
    webzineSummary: { liveBanners: 0, scheduledBanners: 0, draftArticles: 0, articlesMissingTopic: 0, articlesMissingFeaturedImage: 0 },
    platformStats: [], regionStats: [], dailyRegistrations: [],
    recentRegistrations: [], recentNews: [], recentActivity: [],
  }),
})

// ⚠️ Compute on client only — `new Date().toLocaleDateString()` produces different
// strings on server (UTC, en-US locale) vs client (browser locale + timezone).
// Hydration mismatch otherwise.
const todayFormatted = ref('')
onMounted(() => {
  todayFormatted.value = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})

const quickActions = [
  { icon: 'i-lucide-file-plus', label: 'New CMS Page', to: '/admin/pages' },
  { icon: 'i-lucide-newspaper', label: 'Webzine Articles', to: '/admin/news' },
  { icon: 'i-lucide-tags', label: 'Topics', to: '/admin/topics' },
  { icon: 'i-lucide-flag', label: 'Banner Control', to: '/admin/banners' },
  { icon: 'i-lucide-calendar', label: 'Events', to: '/admin/events' },
  { icon: 'i-lucide-external-link', label: 'View Site', to: '/' },
]

// ── Stat Cards: แปลงตัวเลขจาก API เป็น UI cards ──
const statCards = computed(() => [
  { icon: 'i-lucide-users', label: 'Registrations', value: stats.value.counts.registrations.toLocaleString('en-US'), bg: 'rgba(59,130,246,0.12)' },
  { icon: 'i-lucide-newspaper', label: 'News', value: stats.value.counts.news.toString(), bg: 'rgba(16,185,129,0.12)' },
  { icon: 'i-lucide-check-circle', label: 'Published', value: stats.value.counts.publishedNews.toString(), bg: 'rgba(245,158,11,0.12)' },
  { icon: 'i-lucide-swords', label: 'Weapons', value: stats.value.counts.weapons.toString(), bg: 'rgba(139,92,246,0.12)' },
  { icon: 'i-lucide-sparkles', label: 'Features', value: stats.value.counts.features.toString(), bg: 'rgba(236,72,153,0.12)' },
  { icon: 'i-lucide-star', label: 'Highlights', value: stats.value.counts.highlights.toString(), bg: 'rgba(14,165,233,0.12)' },
  { icon: 'i-lucide-image', label: 'Media', value: stats.value.counts.media.toString(), bg: 'rgba(168,85,247,0.12)' },
  { icon: 'i-lucide-eye', label: 'Views Today', value: stats.value.counts.todayPageViews.toLocaleString('en-US'), bg: 'rgba(251,146,60,0.12)' },
])

const contentStatus = computed(() => [
  { icon: 'i-lucide-newspaper', label: 'Webzine Articles', count: stats.value.counts.news },
  { icon: 'i-lucide-flag', label: 'Live Banners', count: stats.value.webzineSummary.liveBanners },
  { icon: 'i-lucide-clock-3', label: 'Scheduled Banners', count: stats.value.webzineSummary.scheduledBanners },
  { icon: 'i-lucide-pencil', label: 'Draft Articles', count: stats.value.webzineSummary.draftArticles },
  { icon: 'i-lucide-tags', label: 'Missing Topic', count: stats.value.webzineSummary.articlesMissingTopic },
  { icon: 'i-lucide-image-off', label: 'Missing Featured Image', count: stats.value.webzineSummary.articlesMissingFeaturedImage },
])

const chartData = computed(() => stats.value.dailyRegistrations || [])
const platformData = computed(() => stats.value.platformStats || [])
const regionData = computed(() => stats.value.regionStats || [])
const recentRegs = computed(() => stats.value.recentRegistrations || [])
const recentArticles = computed(() => stats.value.recentNews || [])
const recentActivity = computed(() => stats.value.recentActivity || [])
const maxChart = computed(() => Math.max(1, ...chartData.value.map((d) => d.count)))
const maxPlatform = computed(() => Math.max(1, ...platformData.value.map((p) => p.count)))
const maxRegion = computed(() => Math.max(1, ...regionData.value.map((r) => r.count)))

function barHeight(count: number) { return `${(count / maxChart.value) * 100}%` }
function platformPercent(count: number) { return `${(count / maxPlatform.value) * 100}%` }
function regionPercent(count: number) { return `${(count / maxRegion.value) * 100}%` }
function platformIconLabel(p: string) { return p === 'IOS' ? 'iOS' : p === 'ANDROID' ? 'AND' : 'PC' }
function regionIconLabel(r: string) { return r === 'TH' ? 'TH' : r === 'SEA' ? 'SEA' : 'GLB' }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
</script>

<style scoped>
.quick-action-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 12px; border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.04);
  background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  text-decoration: none; color: rgba(255,255,255,0.5);
  transition: all 0.25s; cursor: pointer;
}
.quick-action-card:hover {
  border-color: rgba(212,168,67,0.2);
  background: rgba(212,168,67,0.04);
  color: #d4a843;
  transform: translateY(-2px);
}
.stat-card {
  display: flex; align-items: center; gap: 16px;
  padding: 20px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
}
.stat-icon {
  display: flex; width: 48px; height: 48px; flex-shrink: 0;
  align-items: center; justify-content: center;
  border-radius: 12px; font-size: 1.5rem;
}
.panel {
  border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03); padding: 24px;
}
.panel-title {
  margin-bottom: 20px; font-size: 0.6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.4);
}
.th-cell {
  padding: 8px 12px; text-align: left; font-size: 0.6875rem;
  font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.3);
}
</style>
