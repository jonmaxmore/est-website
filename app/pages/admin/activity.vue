<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Activity Log</h2>
      <p class="mt-1 text-sm text-white/50">Audit trail of all admin actions</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6">
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">When</th>
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">User</th>
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Action</th>
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Resource</th>
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-b border-white/3">
            <td class="px-5 py-3 text-white/30 whitespace-nowrap">{{ timeAgo(log.createdAt) }}</td>
            <td class="px-5 py-3 font-medium">{{ log.userName }}</td>
            <td class="px-5 py-3">
              <span class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
                :class="actionClass(log.action)">
                {{ log.action }}
              </span>
            </td>
            <td class="px-5 py-3 text-white/50">{{ log.resource }}</td>
            <td class="px-5 py-3 max-w-[200px] truncate text-white/30">{{ log.details }}</td>
          </tr>
          <tr v-if="logs.length === 0"><td colspan="5" class="px-5 py-12 text-center text-white/30">No activity recorded yet</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface ActivityLog { id: string; userName: string; action: string; resource: string; details: string; createdAt: string }
const { data: logsData } = await useFetch<ActivityLog[]>('/api/admin/activity', { default: () => [] })
const logs = computed(() => logsData.value || [])

function actionClass(action: string) {
  if (action === 'CREATE') return 'bg-emerald-500/10 text-emerald-400'
  if (action === 'UPDATE') return 'bg-blue-500/10 text-blue-400'
  if (action === 'DELETE') return 'bg-red-500/10 text-red-400'
  return 'bg-gray-500/10 text-gray-400'
}
function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
</script>
