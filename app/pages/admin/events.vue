<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Events & Hot Time</h2>
        <p class="mt-1 text-sm text-white/50">Schedule game events, maintenance, and multiplier boosts</p>
      </div>
      <button class="gold-btn" @click="openEditor(null)">+ New Event</button>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex flex-wrap gap-3 rounded-2xl border border-white/6 bg-white/4 p-4">
      <USelect v-model="filterType" :items="typeFilterOptions" value-key="value" class="w-40" @update:model-value="loadEvents" />
      <USelect v-model="filterStatus" :items="statusFilterOptions" value-key="value" class="w-40" @update:model-value="loadEvents" />
    </div>

    <!-- Today's Timeline -->
    <div v-if="todayEvents.length > 0" class="mb-4 rounded-2xl border border-white/6 bg-white/4 p-4">
      <h3 class="mb-3 text-[0.6875rem] font-bold uppercase tracking-wider text-white/40">Today's Active Events</h3>
      <div class="flex flex-col gap-2">
        <div v-for="ev in todayEvents" :key="ev.id" class="flex items-center gap-3 rounded-lg p-2.5" :style="{ background: `${ev.color || '#d4a843'}10` }">
          <span class="text-lg">{{ typeIcon(ev.type) }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ ev.titleEn || ev.titleTh }}</p>
            <p class="text-xs text-white/30">{{ formatTime(ev.startsAt) }} — {{ formatTime(ev.endsAt) }}</p>
          </div>
          <span class="flex h-5 items-center rounded-full px-2 text-[0.5625rem] font-bold" :class="statusClass(ev.status)">{{ ev.status }}</span>
          <span v-if="ev.type === 'HOT_TIME' && ev.multiplier" class="text-xs font-bold text-[#d4a843]">{{ ev.multiplier }}x {{ ev.bonusType }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/6 bg-white/2">
              <th class="th-cell">Event</th>
              <th class="th-cell">Type</th>
              <th class="th-cell">Status</th>
              <th class="th-cell">Schedule</th>
              <th class="th-cell">Multiplier</th>
              <th class="th-cell w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in events" :key="ev.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <span class="text-lg">{{ typeIcon(ev.type) }}</span>
                  <div class="min-w-0">
                    <p class="font-medium truncate max-w-[200px]">{{ ev.titleEn || ev.titleTh }}</p>
                    <p class="text-[0.625rem] text-white/30 truncate">{{ ev.titleTh }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-bold" :style="{ background: typeColor(ev.type) + '15', color: typeColor(ev.type) }">
                  {{ ev.type.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-bold" :class="statusClass(ev.status)">
                  {{ statusDot(ev.status) }} {{ ev.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <p class="text-xs whitespace-nowrap">{{ formatDateTime(ev.startsAt) }}</p>
                <p class="text-[0.625rem] text-white/30">→ {{ formatDateTime(ev.endsAt) }}</p>
              </td>
              <td class="px-4 py-3">
                <span v-if="ev.type === 'HOT_TIME' && ev.multiplier" class="text-sm font-bold text-[#d4a843]">{{ ev.multiplier }}x</span>
                <span v-else class="text-white/15">—</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <button class="icon-btn" @click="openEditor(ev)">✏️</button>
                  <button class="icon-btn danger" @click="confirmDelete(ev)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="events.length === 0">
              <td colspan="6">
                <AdminEmptyState icon="📅" title="No events yet" message="Create events, hot times, and maintenance schedules." action-label="+ New Event" @action="openEditor(null)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 border-t border-white/6 p-4">
        <UButton variant="ghost" size="sm" :disabled="page <= 1" @click="page--; loadEvents()">← Prev</UButton>
        <span class="text-sm text-white/30">Page {{ page }} of {{ totalPages }}</span>
        <UButton variant="ghost" size="sm" :disabled="page >= totalPages" @click="page++; loadEvents()">Next →</UButton>
      </div>
    </div>

    <!-- ═══ EDITOR MODAL ═══ -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create Event' : 'Edit Event'" class="sm:max-w-3xl">
      <template #body>
        <div class="flex flex-col gap-5 p-1">
          <!-- Event Type -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="t in eventTypes"
              :key="t.value"
              type="button"
              class="type-select-btn"
              :class="{ active: form.type === t.value }"
              @click="form.type = t.value"
            >
              <span class="text-xl">{{ t.icon }}</span>
              <span class="text-[0.6875rem]">{{ t.label }}</span>
            </button>
          </div>

          <!-- Language Tabs -->
          <AdminContentLanguageTabs
            :th-filled="!!form.titleTh"
            :en-filled="!!form.titleEn"
            :th-errors="formErrors.titleTh ? ['Required'] : []"
            :en-errors="formErrors.titleEn ? ['Required'] : []"
            show-copy-button
            @copy="handleCopy"
          >
            <template #th>
              <UFormField label="Title (TH) *" class="mb-3">
                <UInput v-model="form.titleTh" placeholder="ชื่อกิจกรรม" :class="{ 'ring-1 ring-red-500/50': formErrors.titleTh }" @input="formErrors.titleTh = ''" />
                <p v-if="formErrors.titleTh" class="mt-1 text-xs text-red-400">{{ formErrors.titleTh }}</p>
              </UFormField>
              <UFormField label="Description (TH)">
                <UTextarea v-model="form.descriptionTh" :rows="2" placeholder="รายละเอียดกิจกรรม" />
              </UFormField>
            </template>
            <template #en>
              <UFormField label="Title (EN) *" class="mb-3">
                <UInput v-model="form.titleEn" placeholder="Event name" :class="{ 'ring-1 ring-red-500/50': formErrors.titleEn }" @input="formErrors.titleEn = ''" />
                <p v-if="formErrors.titleEn" class="mt-1 text-xs text-red-400">{{ formErrors.titleEn }}</p>
              </UFormField>
              <UFormField label="Description (EN)">
                <UTextarea v-model="form.descriptionEn" :rows="2" placeholder="Event description" />
              </UFormField>
            </template>
          </AdminContentLanguageTabs>

          <!-- Date Time Range Picker -->
          <div>
            <label class="mb-2 block text-sm font-medium text-white/60">Schedule *</label>
            <AdminDateTimeRangePicker
              :start="form.startsAt"
              :end="form.endsAt"
              :allow-past="editorMode === 'edit'"
              @update:start="v => { form.startsAt = v; formErrors.startsAt = '' }"
              @update:end="v => { form.endsAt = v; formErrors.endsAt = '' }"
            />
            <p v-if="formErrors.startsAt || formErrors.endsAt" class="mt-2 text-xs text-red-400">{{ formErrors.startsAt || formErrors.endsAt }}</p>
          </div>

          <!-- Status -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Status">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in statuses"
                  :key="s"
                  type="button"
                  class="status-select-btn"
                  :class="[statusClass(s), { active: form.status === s }]"
                  @click="form.status = s"
                >
                  {{ statusDot(s) }} {{ s }}
                </button>
              </div>
            </UFormField>
            <UFormField label="Visibility">
              <label class="flex items-center gap-3 mt-1">
                <input type="checkbox" v-model="form.visible" class="accent-[#d4a843] w-4 h-4" />
                <span class="text-sm" :class="form.visible ? 'text-emerald-400' : 'text-white/30'">
                  {{ form.visible ? 'Visible to players' : 'Hidden from players' }}
                </span>
              </label>
            </UFormField>
          </div>

          <!-- Hot Time Specific -->
          <Transition name="slide">
            <div v-if="form.type === 'HOT_TIME'" class="rounded-xl border border-[#d4a843]/15 bg-[#d4a843]/5 p-4">
              <h4 class="mb-3 text-sm font-bold text-[#d4a843]">🔥 Hot Time Multiplier</h4>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Multiplier *">
                  <UInput v-model.number="form.multiplier" type="number" :min="1" step="0.5" placeholder="2.0" />
                  <p v-if="formErrors.multiplier" class="mt-1 text-xs text-red-400">{{ formErrors.multiplier }}</p>
                </UFormField>
                <UFormField label="Bonus Type">
                  <USelect v-model="form.bonusType" :items="['EXP', 'GOLD', 'DROP_RATE', 'CRAFT_RATE', 'ALL']" />
                </UFormField>
              </div>
            </div>
          </Transition>

          <!-- Display Options -->
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Icon">
              <UInput v-model="form.icon" placeholder="🎉" />
            </UFormField>
            <UFormField label="Color">
              <input v-model="form.color" type="color" class="h-9 w-full rounded-lg border border-white/8 bg-white/4 p-1 cursor-pointer" />
            </UFormField>
            <AdminMediaPicker v-model="form.bannerImage" label="Banner" />
          </div>

          <p v-if="formGlobalError" class="text-center text-sm text-red-400">{{ formGlobalError }}</p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveEvent">
            {{ editorMode === 'create' ? 'Create Event' : 'Save Changes' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirm -->
    <AdminConfirmDialog v-model="deleteOpen" title="Delete Event?" :message="`Delete '${deleteTarget?.titleEn || deleteTarget?.titleTh}'? This cannot be undone.`" confirm-text="Delete" variant="danger" @confirm="doDelete" />

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface GameEventItem {
  id: string; titleEn: string; titleTh: string
  descriptionEn?: string | null; descriptionTh?: string | null
  type: string; status: string
  startsAt: string; endsAt: string; timezone: string
  multiplier?: number | null; bonusType?: string | null
  bannerImage?: string | null; icon?: string | null; color?: string | null
  visible: boolean; createdAt: string
}

const events = ref<GameEventItem[]>([])
const page = ref(1)
const totalPages = ref(1)
const filterType = ref('')
const filterStatus = ref('')
const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)
const saving = ref(false)
const formGlobalError = ref('')
const deleteOpen = ref(false)
const deleteTarget = ref<GameEventItem | null>(null)
const { toast, showToast } = useAdminToast()

const typeFilterOptions = [
  { label: 'All Types', value: '' }, { label: 'Event', value: 'EVENT' },
  { label: 'Hot Time', value: 'HOT_TIME' }, { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Campaign', value: 'CAMPAIGN' },
]
const statusFilterOptions = [
  { label: 'All Status', value: '' }, { label: 'Draft', value: 'DRAFT' },
  { label: 'Scheduled', value: 'SCHEDULED' }, { label: 'Active', value: 'ACTIVE' },
  { label: 'Ended', value: 'ENDED' }, { label: 'Cancelled', value: 'CANCELLED' },
]
const eventTypes = [
  { value: 'EVENT', label: 'Event', icon: '🎮' },
  { value: 'HOT_TIME', label: 'Hot Time', icon: '🔥' },
  { value: 'MAINTENANCE', label: 'Maintenance', icon: '🔧' },
  { value: 'CAMPAIGN', label: 'Campaign', icon: '📢' },
]
const statuses = ['DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED']

const form = reactive({
  titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '',
  type: 'EVENT', status: 'SCHEDULED', startsAt: '', endsAt: '',
  multiplier: 2, bonusType: 'EXP', bannerImage: '', icon: '🎮', color: '#d4a843',
  visible: true,
})
const formErrors = reactive<Record<string, string>>({
  titleEn: '', titleTh: '', startsAt: '', endsAt: '', multiplier: '',
})

const todayEvents = computed(() => {
  const now = new Date()
  return events.value.filter(ev => {
    const start = new Date(ev.startsAt)
    const end = new Date(ev.endsAt)
    return start <= now && end >= now && ev.status !== 'CANCELLED'
  })
})

async function loadEvents() {
  try {
    const res = await $fetch<{ data: GameEventItem[]; meta: { totalPages: number } }>('/api/admin/events', {
      query: { page: page.value, type: filterType.value, status: filterStatus.value },
    })
    events.value = res.data
    totalPages.value = res.meta.totalPages
  } catch { events.value = [] }
}

function openEditor(ev: GameEventItem | null) {
  formGlobalError.value = ''
  Object.keys(formErrors).forEach(k => formErrors[k] = '')

  if (ev) {
    editorMode.value = 'edit'; editingId.value = ev.id
    Object.assign(form, {
      titleEn: ev.titleEn, titleTh: ev.titleTh,
      descriptionEn: ev.descriptionEn || '', descriptionTh: ev.descriptionTh || '',
      type: ev.type, status: ev.status,
      startsAt: ev.startsAt, endsAt: ev.endsAt,
      multiplier: ev.multiplier ?? 2, bonusType: ev.bonusType || 'EXP',
      bannerImage: ev.bannerImage || '', icon: ev.icon || '🎮',
      color: ev.color || '#d4a843', visible: ev.visible,
    })
  } else {
    editorMode.value = 'create'; editingId.value = null
    Object.assign(form, {
      titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '',
      type: 'EVENT', status: 'SCHEDULED', startsAt: '', endsAt: '',
      multiplier: 2, bonusType: 'EXP', bannerImage: '', icon: '🎮',
      color: '#d4a843', visible: true,
    })
  }
  editorOpen.value = true
}

function handleCopy(from: 'th' | 'en') {
  if (from === 'th') { form.titleEn = form.titleTh; form.descriptionEn = form.descriptionTh }
  else { form.titleTh = form.titleEn; form.descriptionTh = form.descriptionEn }
  showToast(`Copied ${from.toUpperCase()} content`)
}

function validate(): boolean {
  let valid = true
  Object.keys(formErrors).forEach(k => formErrors[k] = '')

  if (!form.titleEn && !form.titleTh) {
    formErrors.titleEn = 'At least one title is required'
    formErrors.titleTh = 'At least one title is required'
    valid = false
  }
  if (!form.startsAt) { formErrors.startsAt = 'Start time is required'; valid = false }
  if (!form.endsAt) { formErrors.endsAt = 'End time is required'; valid = false }
  if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
    formErrors.endsAt = 'End time must be after start time'; valid = false
  }
  if (editorMode.value === 'create' && form.startsAt && new Date(form.startsAt) < new Date()) {
    formErrors.startsAt = 'Start time cannot be in the past for new events'; valid = false
  }
  if (form.type === 'HOT_TIME' && (!form.multiplier || form.multiplier <= 0)) {
    formErrors.multiplier = 'Multiplier must be greater than 0'; valid = false
  }

  return valid
}

async function saveEvent() {
  if (!validate()) { formGlobalError.value = 'Please fix the errors above.'; return }
  saving.value = true; formGlobalError.value = ''

  try {
    const payload = { ...form, bannerImage: form.bannerImage || null }
    if (editorMode.value === 'create') {
      await $fetch('/api/admin/events', { method: 'POST', body: payload })
    } else {
      await $fetch(`/api/admin/events/${editingId.value}`, { method: 'PUT', body: payload })
    }
    editorOpen.value = false
    showToast(editorMode.value === 'create' ? 'Event created!' : 'Event updated!')
    await loadEvents()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    formGlobalError.value = err?.data?.message || 'Save failed'
  } finally { saving.value = false }
}

function confirmDelete(ev: GameEventItem) { deleteTarget.value = ev; deleteOpen.value = true }
async function doDelete() {
  if (!deleteTarget.value) return
  try { await $fetch(`/api/admin/events/${deleteTarget.value.id}`, { method: 'DELETE' }); showToast('Event deleted'); await loadEvents() }
  catch { showToast('Delete failed', 'error') }
}

// Helpers
function typeIcon(type: string) {
  const m: Record<string, string> = { EVENT: '🎮', HOT_TIME: '🔥', MAINTENANCE: '🔧', CAMPAIGN: '📢' }
  return m[type] || '📅'
}
function typeColor(type: string) {
  const m: Record<string, string> = { EVENT: '#3b82f6', HOT_TIME: '#f59e0b', MAINTENANCE: '#ef4444', CAMPAIGN: '#8b5cf6' }
  return m[type] || '#d4a843'
}
function statusDot(status: string) {
  const m: Record<string, string> = { ACTIVE: '🟢', SCHEDULED: '🔵', DRAFT: '⚪', CANCELLED: '🔴', ENDED: '⚫' }
  return m[status] || ''
}
function statusClass(status: string) {
  const m: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400',
    SCHEDULED: 'bg-blue-500/10 text-blue-400',
    DRAFT: 'bg-white/5 text-white/40',
    CANCELLED: 'bg-red-500/10 text-red-400',
    ENDED: 'bg-white/5 text-white/25',
  }
  return m[status] || ''
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

await loadEvents()
</script>

<style scoped>
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.th-cell { padding: 12px 16px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); }
.icon-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
.icon-btn:hover { background: rgba(255,255,255,0.08); }
.icon-btn.danger:hover { background: rgba(239,68,68,0.15); }

.type-select-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 8px; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;
  background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4);
  cursor: pointer; transition: all 0.2s;
}
.type-select-btn:hover { border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
.type-select-btn.active { border-color: rgba(212,168,67,0.3); background: rgba(212,168,67,0.06); color: #d4a843; }

.status-select-btn {
  padding: 4px 10px; border-radius: 6px; border: 1px solid transparent;
  font-size: 0.6875rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
  opacity: 0.5;
}
.status-select-btn.active { opacity: 1; border-color: currentColor; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); max-height: 0; overflow: hidden; }
.slide-enter-to, .slide-leave-from { max-height: 200px; }
</style>
