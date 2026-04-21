<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div><h2 class="text-2xl font-bold">Pre-Registrations</h2><p class="mt-1 text-sm text-white/50">{{ total }} total registrations</p></div>
      <UButton tag="a" href="/api/admin/registrations/export" download class="bg-gradient-to-br from-gold to-gold-light font-bold text-black"><UIcon name="i-lucide-download" class="w-4 h-4" /> Export CSV</UButton>
    </div>
    <div class="mb-4 flex flex-wrap gap-3 rounded-2xl border border-white/6 bg-white/4 p-4">
      <UInput v-model="search" placeholder="Search by email..." class="min-w-[200px] flex-1" @input="debounceLoad" />
      <USelect v-model="filterPlatform" :items="[{ label: 'All Platforms', value: 'all' }, { label: 'iOS', value: 'IOS' }, { label: 'Android', value: 'ANDROID' }, { label: 'PC', value: 'PC' }]" value-key="value" class="w-36" @update:model-value="loadData" />
      <USelect v-model="filterRegion" :items="[{ label: 'All Regions', value: 'all' }, { label: 'Thailand', value: 'TH' }, { label: 'SEA', value: 'SEA' }, { label: 'Global', value: 'GLOBAL' }]" value-key="value" class="w-36" @update:model-value="loadData" />
    </div>
    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-white/6 bg-white/2"><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Email</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Platform</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Region</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Referral</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">UTM</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Date</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
              <td class="px-4 py-3 font-medium">{{ r.email }}</td>
              <td class="px-4 py-3"><span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[0.625rem] font-semibold text-blue-400">{{ r.platform }}</span></td>
              <td class="px-4 py-3"><span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.625rem] font-semibold text-emerald-400">{{ r.region }}</span></td>
              <td class="px-4 py-3"><code class="rounded bg-gold/8 px-2 py-0.5 font-mono text-xs text-gold">{{ r.referralCode || '—' }}</code></td>
              <td class="px-4 py-3 text-white/30">{{ r.utmSource || '—' }}</td>
              <td class="px-4 py-3 text-white/30 whitespace-nowrap">{{ formatDate(r.createdAt) }}</td>
            </tr>
            <tr v-if="rows.length === 0"><td colspan="6" class="px-4 py-12 text-center text-white/30">No registrations found</td></tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 border-t border-white/6 p-4">
        <UButton variant="ghost" size="sm" :disabled="page <= 1" @click="page--; loadData()">← Prev</UButton>
        <span class="text-sm text-white/30">Page {{ page }} of {{ totalPages }}</span>
        <UButton variant="ghost" size="sm" :disabled="page >= totalPages" @click="page++; loadData()">Next →</UButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface Registration { id: string; email: string; platform: string; region: string; referralCode?: string | null; referredBy?: string | null; ipAddress?: string | null; utmSource?: string | null; createdAt: string }
const rows = ref<Registration[]>([]); const total = ref(0); const totalPages = ref(1); const page = ref(1); const search = ref(''); const filterPlatform = ref('all'); const filterRegion = ref('all')
let debounceTimer: ReturnType<typeof setTimeout>
async function loadData() { try { const res = await $fetch<{ data: Registration[]; meta: { total: number; totalPages: number } }>('/api/admin/registrations', { query: { page: page.value, search: search.value, platform: filterPlatform.value === 'all' ? '' : filterPlatform.value, region: filterRegion.value === 'all' ? '' : filterRegion.value } }); rows.value = res.data; total.value = res.meta.total; totalPages.value = res.meta.totalPages } catch { rows.value = [] } }
function debounceLoad() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadData(), 300) }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
await loadData()
</script>
