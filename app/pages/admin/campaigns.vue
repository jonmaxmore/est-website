<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.campaigns.title') }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.campaigns.subtitle') }}</p>
      </div>
      <button class="gold-btn" @click="openNewCampaign">+ New Campaign</button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6 bg-white/2">
            <th class="th-cell">Campaign</th>
            <th class="th-cell">Slug</th>
            <th class="th-cell">Status</th>
            <th class="th-cell">Window</th>
            <th class="th-cell w-[160px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="campaign in campaigns" :key="campaign.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
            <td class="px-4 py-3">
              <p class="font-medium">{{ campaign.name }}</p>
              <p class="text-xs text-white/30">{{ campaign.description || '—' }}</p>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-white/45">{{ campaign.slug }}</td>
            <td class="px-4 py-3"><AdminStatusBadge :status="campaign.status" /></td>
            <td class="px-4 py-3 text-xs text-white/35">
              {{ formatWindow(campaign.startsAt, campaign.endsAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button class="icon-btn" title="View performance" @click="openPerformance(campaign)"><UIcon name="i-lucide-bar-chart-3" class="h-4 w-4" /></button>
                <button class="icon-btn" @click="openEditCampaign(campaign)"><UIcon name="i-lucide-pencil" class="h-4 w-4" /></button>
                <button class="icon-btn danger" @click="deleteCampaign(campaign)"><UIcon name="i-lucide-trash-2" class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="campaigns.length === 0">
            <td colspan="5">
              <AdminEmptyState icon="i-lucide-megaphone" title="No campaigns yet" message="Create the first marketing campaign." action-label="+ New Campaign" @action="openNewCampaign" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="editorOpen" :title="form.id ? 'Edit Campaign' : 'New Campaign'" class="sm:max-w-2xl">
      <template #body>
        <div class="grid gap-4">
          <div v-if="formError" class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ formError }}</div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="campaign-name" class="field-label">Name *</label>
              <input id="campaign-name" v-model="form.name" class="field-input" />
            </div>
            <div>
              <label for="campaign-slug" class="field-label">Slug * (lowercase, dashes)</label>
              <input id="campaign-slug" v-model="form.slug" class="field-input font-mono" placeholder="summer-2026" />
            </div>
          </div>
          <div>
            <label for="campaign-desc" class="field-label">Description</label>
            <textarea id="campaign-desc" v-model="form.description" class="field-input min-h-20" />
          </div>
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="campaign-owner" class="field-label">Owner email</label>
              <input id="campaign-owner" v-model="form.ownerEmail" type="email" class="field-input" />
            </div>
            <div>
              <label for="campaign-starts" class="field-label">Starts</label>
              <input id="campaign-starts" v-model="form.startsAt" type="datetime-local" class="field-input" />
            </div>
            <div>
              <label for="campaign-ends" class="field-label">Ends</label>
              <input id="campaign-ends" v-model="form.endsAt" type="datetime-local" class="field-input" />
            </div>
          </div>
          <div>
            <label for="campaign-status" class="field-label">Status</label>
            <select id="campaign-status" v-model="form.status" class="field-select">
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
            <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveCampaign">Save Campaign</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="perfOpen" :title="`Performance: ${perfData?.campaign?.name || ''}`" class="sm:max-w-2xl">
      <template #body>
        <div v-if="perfData" class="grid gap-4">
          <p class="text-xs text-white/50">Window: {{ perfData.window.from.slice(0, 10) }} → {{ perfData.window.to.slice(0, 10) }}</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-xl border border-white/8 bg-white/4 p-4 text-center">
              <p class="text-2xl font-bold text-gold">{{ perfData.metrics.pageViews }}</p>
              <p class="text-xs text-white/50">Page Views</p>
            </div>
            <div class="rounded-xl border border-white/8 bg-white/4 p-4 text-center">
              <p class="text-2xl font-bold text-gold">{{ perfData.metrics.conversions }}</p>
              <p class="text-xs text-white/50">Conversions</p>
            </div>
            <div class="rounded-xl border border-white/8 bg-white/4 p-4 text-center">
              <p class="text-2xl font-bold text-gold">{{ perfData.metrics.attachedArticles }}</p>
              <p class="text-xs text-white/50">Articles</p>
            </div>
            <div class="rounded-xl border border-white/8 bg-white/4 p-4 text-center">
              <p class="text-2xl font-bold text-gold">{{ perfData.metrics.attachedBanners }}</p>
              <p class="text-xs text-white/50">Banners</p>
            </div>
          </div>
          <div v-if="perfData.metrics.eventBreakdown.length">
            <p class="mb-2 text-xs font-bold uppercase tracking-wider text-white/45">Event Breakdown</p>
            <div class="space-y-1 text-sm">
              <div v-for="row in perfData.metrics.eventBreakdown" :key="row.event" class="flex justify-between rounded bg-white/3 px-3 py-2">
                <span class="font-mono">{{ row.event }}</span>
                <span class="font-bold text-gold">{{ row.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <AdminConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete campaign?"
      :message="deleteTarget ? `Delete &quot;${deleteTarget.name}&quot;? Attached articles + banners will keep their data; campaignId will be set to null.` : 'Delete this campaign?'"
      confirm-text="Delete"
      variant="danger"
      @confirm="confirmDelete"
    />
    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()

type Campaign = {
  id: string
  name: string
  slug: string
  description: string | null
  ownerEmail: string | null
  startsAt: string | null
  endsAt: string | null
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
}

type PerfData = {
  campaign: Pick<Campaign, 'id' | 'name' | 'slug' | 'status' | 'startsAt' | 'endsAt'>
  window: { from: string; to: string }
  metrics: {
    pageViews: number
    conversions: number
    attachedArticles: number
    attachedBanners: number
    eventBreakdown: Array<{ event: string; count: number }>
  }
}

const campaigns = ref<Campaign[]>([])
const editorOpen = ref(false)
const perfOpen = ref(false)
const perfData = ref<PerfData | null>(null)
const saving = ref(false)
const formError = ref('')
const deleteDialogOpen = ref(false)
const deleteTarget = ref<Campaign | null>(null)
const { toast, showToast } = useAdminToast()

function createEmptyForm() {
  return {
    id: '',
    name: '',
    slug: '',
    description: '',
    ownerEmail: '',
    startsAt: '',
    endsAt: '',
    status: 'DRAFT' as Campaign['status'],
  }
}
const form = reactive(createEmptyForm())

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function formatWindow(s: string | null, e: string | null) {
  const fmt = (v: string | null) => (v ? v.slice(0, 10) : '—')
  return `${fmt(s)} → ${fmt(e)}`
}

async function loadCampaigns() {
  try {
    const res = await $fetch<{ data: Campaign[] }>('/api/admin/campaigns', { query: { limit: 100 } })
    campaigns.value = res.data
  } catch {
    campaigns.value = []
  }
}

function openNewCampaign() {
  formError.value = ''
  Object.assign(form, createEmptyForm())
  editorOpen.value = true
}

function openEditCampaign(c: Campaign) {
  formError.value = ''
  Object.assign(form, {
    ...createEmptyForm(),
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    ownerEmail: c.ownerEmail || '',
    startsAt: toDateTimeLocal(c.startsAt),
    endsAt: toDateTimeLocal(c.endsAt),
    status: c.status,
  })
  editorOpen.value = true
}

async function saveCampaign() {
  if (!form.name || !form.slug) {
    formError.value = 'Name and slug are required.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      ownerEmail: form.ownerEmail || null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      status: form.status,
    }
    if (form.id) {
      await $fetch(`/api/admin/campaigns/${form.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/admin/campaigns', { method: 'POST', body: payload })
    }
    editorOpen.value = false
    showToast('Campaign saved')
    await loadCampaigns()
  } catch (err: unknown) {
    formError.value = (err as { data?: { message?: string } })?.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function openPerformance(c: Campaign) {
  try {
    perfData.value = await $fetch<PerfData>(`/api/admin/campaigns/${c.id}/performance`)
    perfOpen.value = true
  } catch (err: unknown) {
    showToast((err as { data?: { message?: string } })?.data?.message || 'Failed to load metrics', 'error')
  }
}

function deleteCampaign(c: Campaign) {
  deleteTarget.value = c
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  const t = deleteTarget.value
  if (!t) return
  try {
    await $fetch(`/api/admin/campaigns/${t.id}`, { method: 'DELETE' })
    showToast('Campaign deleted')
    await loadCampaigns()
  } catch (err: unknown) {
    showToast((err as { data?: { message?: string } })?.data?.message || 'Failed to delete', 'error')
  } finally {
    deleteTarget.value = null
  }
}

onMounted(loadCampaigns)
</script>

<style scoped>
.th-cell { padding: 12px 16px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.3); }
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, var(--adm-gold), var(--adm-gold-deep)); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; color: rgba(255, 255, 255, 0.45); transition: background 0.15s, color 0.15s; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.08); color: white; }
.icon-btn.danger:hover { background: rgba(239, 68, 68, 0.15); color: var(--adm-danger); }
.field-label { margin-bottom: 6px; display: block; font-size: 0.8125rem; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
.field-input, .field-select { width: 100%; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.04); padding: 9px 12px; font-size: 0.875rem; color: white; outline: none; }
.field-input:focus, .field-select:focus { border-color: rgba(212, 168, 67, 0.5); }
.field-select option { color: black; }
</style>
