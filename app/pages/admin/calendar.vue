<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.calendar.title') }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.calendar.subtitle') }} — {{ monthLabel }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="icon-btn" @click="step(-1)"><UIcon name="i-lucide-chevron-left" class="h-4 w-4" /></button>
        <span class="px-3 text-sm">{{ monthLabel }}</span>
        <button class="icon-btn" @click="step(1)"><UIcon name="i-lucide-chevron-right" class="h-4 w-4" /></button>
        <button class="ml-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5" @click="goToday">Today</button>
      </div>
    </div>

    <div v-if="loading" class="rounded-2xl border border-white/8 bg-white/3 p-12 text-center text-white/45">Loading…</div>
    <div v-else class="grid gap-3 lg:grid-cols-3">
      <section class="rounded-2xl border border-white/8 bg-white/4 p-5">
        <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-white/45">Campaigns ({{ data?.campaigns.length || 0 }})</h3>
        <div v-if="!data?.campaigns.length" class="text-sm text-white/35">No active campaigns.</div>
        <ul v-else class="space-y-2">
          <li v-for="c in data.campaigns" :key="c.id" class="rounded-lg bg-white/5 p-3 text-sm">
            <p class="font-medium">{{ c.name }}</p>
            <p class="text-xs text-white/45">{{ c.slug }} · {{ c.status }} · {{ formatWindow(c.startsAt, c.endsAt) }}</p>
          </li>
        </ul>
      </section>

      <section class="rounded-2xl border border-white/8 bg-white/4 p-5">
        <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-white/45">Articles ({{ data?.articles.length || 0 }})</h3>
        <div v-if="!data?.articles.length" class="text-sm text-white/35">No articles in window.</div>
        <ul v-else class="space-y-2">
          <li v-for="a in data.articles" :key="a.id" class="rounded-lg bg-white/5 p-3 text-sm">
            <p class="font-medium">{{ a.titleEn }}</p>
            <p class="text-xs text-white/45">{{ a.contentType }} · {{ a.status }} · {{ a.publishedAt?.slice(0, 10) || 'unscheduled' }}</p>
          </li>
        </ul>
      </section>

      <section class="rounded-2xl border border-white/8 bg-white/4 p-5">
        <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-white/45">Banners ({{ data?.banners.length || 0 }})</h3>
        <div v-if="!data?.banners.length" class="text-sm text-white/35">No banners scheduled.</div>
        <ul v-else class="space-y-2">
          <li v-for="b in data.banners" :key="b.id" class="rounded-lg bg-white/5 p-3 text-sm">
            <p class="font-medium">{{ b.titleEn }}</p>
            <p class="text-xs text-white/45">{{ b.placement }} · {{ b.status }} · {{ formatWindow(b.startsAt, b.endsAt) }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()

interface Timeline {
  window: { from: string; to: string }
  banners: Array<{ id: string; titleEn: string; placement: string; status: string; startsAt: string | null; endsAt: string | null }>
  articles: Array<{ id: number; titleEn: string; status: string; publishedAt: string | null; contentType: string }>
  campaigns: Array<{ id: string; name: string; slug: string; status: string; startsAt: string | null; endsAt: string | null }>
}

const cursor = ref(new Date())
const data = ref<Timeline | null>(null)
const loading = ref(false)

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString(undefined, { year: 'numeric', month: 'long' }),
)

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) }

async function load() {
  loading.value = true
  try {
    const from = startOfMonth(cursor.value).toISOString()
    const to = endOfMonth(cursor.value).toISOString()
    data.value = await $fetch<Timeline>('/api/admin/calendar/timeline', { query: { from, to } })
  } finally {
    loading.value = false
  }
}

function step(delta: number) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1)
  load()
}

function goToday() {
  cursor.value = new Date()
  load()
}

function formatWindow(s: string | null, e: string | null) {
  const fmt = (v: string | null) => (v ? v.slice(0, 10) : '—')
  return `${fmt(s)} → ${fmt(e)}`
}

onMounted(load)
</script>

<style scoped>
.icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; color: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); }
.icon-btn:hover { background: rgba(255, 255, 255, 0.06); color: white; }
</style>
