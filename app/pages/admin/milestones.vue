<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.milestones.title') }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.milestones.subtitle') }}</p>
      </div>
      <button class="gold-btn" @click="openEditor(null)">+ New Milestone</button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6 bg-white/2">
            <th class="th-cell">Tier</th>
            <th class="th-cell">Target</th>
            <th class="th-cell">Reward</th>
            <th class="th-cell">Status</th>
            <th class="th-cell w-[100px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="milestone in milestones" :key="milestone.id" class="border-b border-white/3 hover:bg-white/2">
            <td class="px-4 py-3 font-mono text-white/60">#{{ milestone.tier }}</td>
            <td class="px-4 py-3 font-bold text-gold">{{ milestone.targetCount.toLocaleString('en-US') }}</td>
            <td class="px-4 py-3">
              <p class="font-medium">{{ milestone.rewardEn }}</p>
              <p class="text-xs text-white/35">{{ milestone.rewardTh }}</p>
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-[0.625rem] font-bold" :class="milestone.reached ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/35'">
                {{ milestone.reached ? 'Unlocked' : 'Locked' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button class="icon-btn" @click="openEditor(milestone)"><UIcon name="i-lucide-pencil" class="h-4 w-4" /></button>
                <button class="icon-btn danger" @click="deleteMilestone(milestone)"><UIcon name="i-lucide-trash-2" class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="milestones.length === 0">
            <td colspan="5">
              <AdminEmptyState icon="i-lucide-trophy" title="No milestones yet" message="Create reward tiers for pre-registration campaigns." action-label="+ New Milestone" @action="openEditor(null)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="editorOpen" :title="editingId ? 'Edit Milestone' : 'Create Milestone'">
      <template #body>
        <div class="grid gap-4 p-1 sm:grid-cols-2">
          <UFormField label="Tier"><UInput v-model.number="form.tier" type="number" min="1" /></UFormField>
          <UFormField label="Target registrations"><UInput v-model.number="form.targetCount" type="number" min="1" /></UFormField>
          <UFormField label="Reward (TH)"><UInput v-model="form.rewardTh" /></UFormField>
          <UFormField label="Reward (EN)"><UInput v-model="form.rewardEn" /></UFormField>
          <UFormField label="Sort order"><UInput v-model.number="form.sortOrder" type="number" min="0" /></UFormField>
          <label class="mt-6 flex items-center gap-2 text-sm">
            <input v-model="form.reached" type="checkbox" class="accent-gold" />
            Mark as unlocked
          </label>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveMilestone">Save</UButton>
        </div>
      </template>
    </UModal>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()

interface Milestone {
  id: number
  tier: number
  targetCount: number
  rewardEn: string
  rewardTh: string
  icon?: string | null
  reached: boolean
  sortOrder: number
}

const milestones = ref<Milestone[]>([])
const editorOpen = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const { toast, showToast } = useAdminToast()
const form = reactive({
  tier: 1,
  targetCount: 10000,
  rewardEn: '',
  rewardTh: '',
  icon: '',
  reached: false,
  sortOrder: 0,
})

async function loadMilestones() {
  try {
    milestones.value = await $fetch<Milestone[]>('/api/admin/milestones')
  } catch {
    showToast('Failed to load milestones', 'error')
  }
}

function openEditor(milestone: Milestone | null) {
  if (milestone) {
    editingId.value = milestone.id
    Object.assign(form, { ...milestone, icon: '' })
  } else {
    editingId.value = null
    Object.assign(form, {
      tier: milestones.value.length + 1,
      targetCount: 10000,
      rewardEn: '',
      rewardTh: '',
      icon: '',
      reached: false,
      sortOrder: milestones.value.length,
    })
  }
  editorOpen.value = true
}

async function saveMilestone() {
  saving.value = true
  try {
    const payload = { ...form, icon: '' }
    if (editingId.value) {
      await $fetch(`/api/admin/milestones/${editingId.value}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/admin/milestones', { method: 'POST', body: payload })
    }
    editorOpen.value = false
    showToast('Milestone saved')
    await loadMilestones()
  } catch (error: any) {
    showToast(error?.data?.message || 'Failed to save milestone', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteMilestone(milestone: Milestone) {
  if (!confirm(`Delete milestone ${milestone.targetCount.toLocaleString('en-US')}?`)) return
  try {
    await $fetch(`/api/admin/milestones/${milestone.id}`, { method: 'DELETE' })
    showToast('Milestone deleted')
    await loadMilestones()
  } catch {
    showToast('Failed to delete milestone', 'error')
  }
}

// SSR-safe: admin auth is client-cookie based, so fetch on client only
onMounted(loadMilestones)
</script>

<style scoped>
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.th-cell { padding: 12px 16px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); }
.icon-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
.icon-btn:hover { background: rgba(255,255,255,0.08); }
.icon-btn.danger:hover { background: rgba(239,68,68,0.15); }
</style>
