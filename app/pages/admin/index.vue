<template>
  <div>
    <!-- Welcome header -->
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h2 class="text-2xl font-bold">Welcome back, {{ user?.displayName || 'Admin' }} 👋</h2>
        <p class="mt-1 text-sm text-white/50">Here's what's happening with your portal today.</p>
      </div>
      <div class="text-sm text-white/30 whitespace-nowrap">{{ todayFormatted }}</div>
    </div>

    <!-- Stat Cards -->
    <div class="mb-6 grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
      <div v-for="stat in statCards" :key="stat.label" class="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/4 p-5">
        <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl" :style="{ background: stat.bg }">{{ stat.icon }}</div>
        <div>
          <p class="text-2xl font-extrabold leading-tight">{{ stat.value }}</p>
          <p class="text-xs font-medium text-white/50">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Chart + Distribution -->
    <div class="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <!-- Registration Chart -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Registration Trend (14 Days)</h3>
        <div class="flex h-[180px] items-end gap-1">
          <div v-for="day in chartData" :key="day.date" class="flex flex-1 flex-col items-center justify-end h-full" :title="`${day.date}: ${day.count}`">
            <div class="w-full max-w-8 min-h-1 rounded-t bg-gradient-to-t from-gold to-gold-light transition-all duration-500" :style="{ height: barHeight(day.count) }" />
            <span class="mt-1.5 text-[0.625rem] text-white/30">{{ day.date.slice(-2) }}</span>
          </div>
        </div>
      </div>

      <!-- Distributions -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Platform Distribution</h3>
        <div class="mb-8 flex flex-col gap-3.5">
          <div v-for="p in platformData" :key="p.platform" class="flex items-center gap-3">
            <div class="flex w-[90px] flex-shrink-0 items-center gap-2 text-sm">
              <span>{{ platformIcon(p.platform) }}</span><span>{{ p.platform }}</span>
            </div>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/4">
              <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500" :style="{ width: platformPercent(p.count) }" />
            </div>
            <span class="w-10 text-right text-xs text-white/30">{{ p.count }}</span>
          </div>
        </div>
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Region Distribution</h3>
        <div class="flex flex-col gap-3.5">
          <div v-for="r in regionData" :key="r.region" class="flex items-center gap-3">
            <div class="flex w-[90px] flex-shrink-0 items-center gap-2 text-sm">
              <span>{{ regionIcon(r.region) }}</span><span>{{ r.region }}</span>
            </div>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/4">
              <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" :style="{ width: regionPercent(r.count) }" />
            </div>
            <span class="w-10 text-right text-xs text-white/30">{{ r.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <!-- Recent Registrations -->
      <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4 p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-xs font-semibold uppercase tracking-widest text-white/50">Recent Registrations</h3>
          <NuxtLink to="/admin/registrations" class="text-xs font-medium text-gold no-underline">View all →</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-white/6"><th class="px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Email</th><th class="px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Platform</th><th class="px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Region</th><th class="px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Date</th></tr></thead>
            <tbody>
              <tr v-for="r in recentRegs" :key="r.id" class="border-b border-white/3">
                <td class="max-w-[180px] truncate px-3 py-2.5">{{ r.email }}</td>
                <td class="px-3 py-2.5"><span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[0.625rem] font-semibold text-blue-400">{{ r.platform }}</span></td>
                <td class="px-3 py-2.5"><span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.625rem] font-semibold text-emerald-400">{{ r.region }}</span></td>
                <td class="px-3 py-2.5 text-white/30 whitespace-nowrap">{{ formatDate(r.createdAt) }}</td>
              </tr>
              <tr v-if="recentRegs.length === 0"><td colspan="4" class="px-3 py-8 text-center text-white/30">No registrations yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent News -->
      <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4 p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-xs font-semibold uppercase tracking-widest text-white/50">Recent Articles</h3>
          <NuxtLink to="/admin/news" class="text-xs font-medium text-gold no-underline">View all →</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-white/6"><th class="px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Title</th><th class="px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Status</th><th class="px-3 py-2.5 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Date</th></tr></thead>
            <tbody>
              <tr v-for="a in recentArticles" :key="a.id" class="border-b border-white/3">
                <td class="max-w-[200px] truncate px-3 py-2.5 font-medium">{{ a.titleEn }}</td>
                <td class="px-3 py-2.5">
                  <span class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold" :class="a.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : a.status === 'DRAFT' ? 'bg-gray-500/10 text-gray-400' : 'bg-red-500/10 text-red-400'">{{ a.status }}</span>
                </td>
                <td class="px-3 py-2.5 text-white/30 whitespace-nowrap">{{ formatDate(a.createdAt) }}</td>
              </tr>
              <tr v-if="recentArticles.length === 0"><td colspan="3" class="px-3 py-8 text-center text-white/30">No articles yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { user } = useUserSession()
interface Stats { counts: { news: number; publishedNews: number; weapons: number; registrations: number }; platformStats: Array<{ platform: string; count: number }>; regionStats: Array<{ region: string; count: number }>; dailyRegistrations: Array<{ date: string; count: number }>; recentRegistrations: Array<{ id: string; email: string; platform: string; region: string; createdAt: string }>; recentNews: Array<{ id: number; titleEn: string; status: string; category: string; createdAt: string }> }
const { data: stats } = await useFetch<Stats>('/api/admin/stats', { default: () => ({ counts: { news: 0, publishedNews: 0, weapons: 0, registrations: 0 }, platformStats: [], regionStats: [], dailyRegistrations: [], recentRegistrations: [], recentNews: [] }) })
const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const statCards = computed(() => [
  { icon: '👥', label: 'Total Registrations', value: stats.value.counts.registrations.toLocaleString(), bg: 'rgba(59,130,246,0.12)' },
  { icon: '📰', label: 'News Articles', value: stats.value.counts.news.toString(), bg: 'rgba(16,185,129,0.12)' },
  { icon: '✅', label: 'Published', value: stats.value.counts.publishedNews.toString(), bg: 'rgba(245,158,11,0.12)' },
  { icon: '⚔️', label: 'Weapons', value: stats.value.counts.weapons.toString(), bg: 'rgba(139,92,246,0.12)' },
])
const chartData = computed(() => stats.value.dailyRegistrations || [])
const platformData = computed(() => stats.value.platformStats || [])
const regionData = computed(() => stats.value.regionStats || [])
const recentRegs = computed(() => stats.value.recentRegistrations || [])
const recentArticles = computed(() => stats.value.recentNews || [])
const maxChart = computed(() => Math.max(1, ...chartData.value.map((d) => d.count)))
const maxPlatform = computed(() => Math.max(1, ...platformData.value.map((p) => p.count)))
const maxRegion = computed(() => Math.max(1, ...regionData.value.map((r) => r.count)))
function barHeight(count: number) { return `${(count / maxChart.value) * 100}%` }
function platformPercent(count: number) { return `${(count / maxPlatform.value) * 100}%` }
function regionPercent(count: number) { return `${(count / maxRegion.value) * 100}%` }
function platformIcon(p: string) { return p === 'IOS' ? '🍎' : p === 'ANDROID' ? '🤖' : '🖥️' }
function regionIcon(r: string) { return r === 'TH' ? '🇹🇭' : r === 'SEA' ? '🌏' : '🌍' }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
</script>
