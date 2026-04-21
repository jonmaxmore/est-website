<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Activity Log</h2>
        <p class="mt-1 text-sm text-white/50">{{ total }} total actions recorded</p>
      </div>
      <button @click="refresh" class="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm text-white/50 cursor-pointer hover:text-gold hover:border-gold/30 transition-colors">
        <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" /> Refresh
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex flex-wrap gap-3 rounded-2xl border border-white/6 bg-white/4 p-4">
      <USelect v-model="filterAction" :items="actionOptions" value-key="value" class="w-40" @update:model-value="loadLogs" />
      <USelect v-model="filterResource" :items="resourceOptions" value-key="value" class="w-40" @update:model-value="loadLogs" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <span class="text-sm text-white/30">Loading activity...</span>
      </div>

      <template v-else>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/6">
              <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">When</th>
              <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">User</th>
              <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Action</th>
              <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Resource</th>
              <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Details</th>
              <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
              <td class="px-5 py-3 text-white/30 whitespace-nowrap">{{ timeAgo(log.createdAt) }}</td>
              <td class="px-5 py-3 font-medium">{{ log.userName }}</td>
              <td class="px-5 py-3">
                <span class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
                  :class="actionClass(log.action)">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-5 py-3 text-white/50">{{ log.resource }}</td>
              <td class="px-5 py-3 max-w-[200px] truncate text-white/30" :title="log.details || ''">{{ log.details || '—' }}</td>
              <td class="px-5 py-3 text-white/20 font-mono text-xs">{{ log.ipAddress || '—' }}</td>
            </tr>
            <tr v-if="logs.length === 0"><td colspan="6" class="px-5 py-12 text-center text-white/30">No activity recorded yet</td></tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 border-t border-white/6 p-4">
          <UButton variant="ghost" size="sm" :disabled="page <= 1" @click="page--; loadLogs()">← Prev</UButton>
          <span class="text-sm text-white/30">Page {{ page }} of {{ totalPages }}</span>
          <UButton variant="ghost" size="sm" :disabled="page >= totalPages" @click="page++; loadLogs()">Next →</UButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface ActivityLog {
  id: string; userName: string; action: string; resource: string
  resourceId: string | null; details: string | null; ipAddress: string | null; createdAt: string
}

const logs = ref<ActivityLog[]>([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const loading = ref(false)
const filterAction = ref('')
const filterResource = ref('')

const actionOptions = [
  { label: 'All Actions', value: '' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
  { label: 'Export', value: 'EXPORT' },
  { label: 'Import', value: 'IMPORT' },
  { label: 'Login', value: 'LOGIN' },
]

const resourceOptions = [
  { label: 'All Resources', value: '' },
  { label: 'News', value: 'news' },
  { label: 'Weapons', value: 'weapons' },
  { label: 'Features', value: 'features' },
  { label: 'Highlights', value: 'highlights' },
  { label: 'Users', value: 'users' },
  { label: 'Config', value: 'config' },
  { label: 'Pages', value: 'pages' },
  { label: 'Backup', value: 'backup' },
  { label: 'Media', value: 'media' },
]

async function loadLogs() {
  loading.value = true
  try {
    const res = await $fetch<{
      data: ActivityLog[]
      meta: { total: number; totalPages: number }
    }>('/api/admin/activity', {
      query: { page: page.value, action: filterAction.value, resource: filterResource.value },
    })
    logs.value = res.data
    total.value = res.meta.total
    totalPages.value = res.meta.totalPages
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

function refresh() {
  page.value = 1
  loadLogs()
}

function actionClass(action: string) {
  if (action === 'CREATE') return 'bg-emerald-500/10 text-emerald-400'
  if (action === 'UPDATE') return 'bg-blue-500/10 text-blue-400'
  if (action === 'DELETE') return 'bg-red-500/10 text-red-400'
  if (action === 'EXPORT') return 'bg-purple-500/10 text-purple-400'
  if (action === 'IMPORT') return 'bg-amber-500/10 text-amber-400'
  if (action === 'LOGIN') return 'bg-cyan-500/10 text-cyan-400'
  return 'bg-gray-500/10 text-gray-400'
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

await loadLogs()
</script>
