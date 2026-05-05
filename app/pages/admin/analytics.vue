<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">{{ t('admin.analytics.title') }}</h2>
      <p class="mt-1 text-sm text-white/50">{{ t('admin.analytics.subtitle') }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="stat in statCards" :key="stat.label" class="rounded-2xl border border-white/6 bg-white/4 p-5">
        <p class="text-xs font-medium uppercase tracking-widest text-white/40">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-extrabold">{{ stat.value }}</p>
        <p class="mt-1 text-xs text-emerald-400">{{ stat.change }}</p>
      </div>
    </div>

    <!-- Chart Area -->
    <div class="mb-6 rounded-2xl border border-white/6 bg-white/4 p-6">
      <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Page Views (Last 30 Days)</h3>
      <div class="flex h-[200px] items-end gap-1">
        <div v-for="day in chartData" :key="day.date" class="flex flex-1 flex-col items-center justify-end h-full" :title="`${day.date}: ${day.views}`">
          <div class="w-full max-w-6 min-h-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500" :style="{ height: `${(day.views / maxViews) * 100}%` }" />
          <span v-if="chartData.indexOf(day) % 5 === 0" class="mt-1.5 text-[0.5rem] text-white/30">{{ day.date.slice(-2) }}</span>
        </div>
      </div>
    </div>

    <!-- Two Column -->
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Top Pages -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Top Pages</h3>
        <div class="flex flex-col gap-3">
          <div v-for="page in topPages" :key="page.path" class="flex items-center gap-3">
            <span class="flex-1 truncate text-sm">{{ page.path }}</span>
            <div class="h-2 w-24 overflow-hidden rounded-full bg-white/4">
              <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${(page.views / (topPages[0]?.views || 1)) * 100}%` }" />
            </div>
            <span class="w-12 text-right text-xs text-white/40">{{ page.views }}</span>
          </div>
        </div>
      </div>

      <!-- Conversion Events -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Conversion Events</h3>
        <div class="flex flex-col gap-3">
          <div v-for="event in conversionEvents" :key="event.name" class="flex items-center justify-between rounded-lg bg-white/2 p-3">
            <span class="text-sm font-medium">{{ event.name }}</span>
            <span class="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">{{ event.count }}</span>
          </div>
          <p v-if="conversionEvents.length === 0" class="py-4 text-center text-sm text-white/30">No conversion events yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()
const { data } = await useFetch<{
  totalViews: number; todayViews: number; uniqueVisitors: number;
  downloadClicks: number; socialClicks: number; newsClicks: number;
  dailyViews: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
  conversions: { name: string; count: number }[];
}>('/api/admin/analytics', {
  default: () => ({ totalViews: 0, todayViews: 0, uniqueVisitors: 0, downloadClicks: 0, socialClicks: 0, newsClicks: 0, dailyViews: [], topPages: [], conversions: [] })
})
const weeklyChange = computed(() => {
  const days = data.value.dailyViews || []
  if (days.length < 14) return 'Insufficient data'
  const thisWeek = days.slice(-7).reduce((sum, d) => sum + d.views, 0)
  const lastWeek = days.slice(-14, -7).reduce((sum, d) => sum + d.views, 0)
  if (lastWeek === 0) return thisWeek > 0 ? '+100%' : '0%'
  const change = ((thisWeek - lastWeek) / lastWeek * 100).toFixed(0)
  return `${Number(change) >= 0 ? '+' : ''}${change}% vs last week`
})
const statCards = computed(() => [
  { label: 'Total Page Views', value: data.value.totalViews.toLocaleString('en-US'), change: weeklyChange.value },
  { label: 'Today', value: data.value.todayViews.toLocaleString('en-US'), change: 'Last 24 hours' },
  { label: 'Unique Visitors', value: data.value.uniqueVisitors.toLocaleString('en-US'), change: 'All time' },
  { label: 'Downloads', value: data.value.downloadClicks.toLocaleString('en-US'), change: 'Tracked clicks' },
  { label: 'Social Clicks', value: data.value.socialClicks.toLocaleString('en-US'), change: 'Community outbound' },
  { label: 'News Clicks', value: data.value.newsClicks.toLocaleString('en-US'), change: 'Webzine outbound' },
])
const chartData = computed(() => data.value.dailyViews || [])
const maxViews = computed(() => Math.max(1, ...chartData.value.map((d) => d.views)))
const topPages = computed(() => data.value.topPages || [])
const conversionEvents = computed(() => data.value.conversions || [])
</script>
