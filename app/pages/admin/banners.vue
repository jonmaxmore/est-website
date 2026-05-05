<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.banners.title') }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.banners.subtitle') }}</p>
      </div>
      <button class="gold-btn" @click="openNewBanner">+ New Banner</button>
    </div>

    <div class="mb-4 flex flex-wrap gap-3 rounded-2xl border border-white/6 bg-white/4 p-4">
      <select v-model="filters.placement" class="field-select w-48" @change="loadBanners">
        <option value="">All placements</option>
        <option v-for="placement in placements" :key="placement" :value="placement">{{ formatPlacement(placement) }}</option>
      </select>
      <select v-model="filters.status" class="field-select w-40" @change="loadBanners">
        <option value="">All status</option>
        <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
      </select>
      <select v-model="filters.scope" class="field-select w-48" @change="loadBanners">
        <option value="">All scopes</option>
        <option v-for="scope in scopes" :key="scope" :value="scope">{{ formatPlacement(scope) }}</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6 bg-white/2">
            <th class="th-cell">Banner</th>
            <th class="th-cell">Placement</th>
            <th class="th-cell">Scope</th>
            <th class="th-cell">Status</th>
            <th class="th-cell">Target</th>
            <th class="th-cell w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="banner in banners" :key="banner.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
            <td class="px-4 py-3">
              <p class="font-medium">{{ banner.titleEn }}</p>
              <p class="text-xs text-white/30">{{ banner.campaignCode || banner.badgeEn || 'No campaign code' }}</p>
            </td>
            <td class="px-4 py-3 text-white/55">{{ formatPlacement(banner.placement) }}</td>
            <td class="px-4 py-3 text-white/55">{{ formatPlacement(banner.scope) }}</td>
            <td class="px-4 py-3"><AdminStatusBadge :status="banner.status" /></td>
            <td class="px-4 py-3 text-xs text-white/35">{{ targetLabel(banner) }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button class="icon-btn" @click="openEditBanner(banner)"><UIcon name="i-lucide-pencil" class="h-4 w-4" /></button>
                <button class="icon-btn danger" @click="deleteBanner(banner)"><UIcon name="i-lucide-trash-2" class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="banners.length === 0">
            <td colspan="6">
              <AdminEmptyState icon="i-lucide-flag" title="No banners yet" message="Create the first centralized marketing banner." action-label="+ New Banner" @action="openNewBanner" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="editorOpen" :title="form.id ? 'Edit Banner' : 'New Banner'" class="sm:max-w-4xl">
      <template #body>
        <div class="grid gap-5">
          <div v-if="formError" class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ formError }}</div>

          <div class="grid gap-4 sm:grid-cols-4">
            <div>
              <label for="banner-placement" class="field-label">Placement</label>
              <select id="banner-placement" v-model="form.placement" class="field-select">
                <option v-for="placement in placements" :key="placement" :value="placement">{{ formatPlacement(placement) }}</option>
              </select>
            </div>
            <div>
              <label for="banner-scope" class="field-label">Scope</label>
              <select id="banner-scope" v-model="form.scope" class="field-select">
                <option v-for="scope in scopes" :key="scope" :value="scope">{{ formatPlacement(scope) }}</option>
              </select>
            </div>
            <div>
              <label for="banner-status" class="field-label">Status</label>
              <select id="banner-status" v-model="form.status" class="field-select">
                <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
            <div>
              <label for="banner-priority" class="field-label">Priority</label>
              <input id="banner-priority" v-model.number="form.priority" type="number" class="field-input" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="banner-title-en" class="field-label">Title (EN) *</label>
              <input id="banner-title-en" v-model="form.titleEn" class="field-input" />
            </div>
            <div>
              <label for="banner-title-th" class="field-label">Title (TH) *</label>
              <input id="banner-title-th" v-model="form.titleTh" class="field-input" />
            </div>
            <div>
              <label for="banner-badge-en" class="field-label">Badge (EN)</label>
              <input id="banner-badge-en" v-model="form.badgeEn" class="field-input" />
            </div>
            <div>
              <label for="banner-badge-th" class="field-label">Badge (TH)</label>
              <input id="banner-badge-th" v-model="form.badgeTh" class="field-input" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="banner-body-en" class="field-label">Body (EN)</label>
              <textarea id="banner-body-en" v-model="form.bodyEn" class="field-input min-h-24" />
            </div>
            <div>
              <label for="banner-body-th" class="field-label">Body (TH)</label>
              <textarea id="banner-body-th" v-model="form.bodyTh" class="field-input min-h-24" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="banner-target-type" class="field-label">Target Type</label>
              <select id="banner-target-type" v-model="form.targetType" class="field-select">
                <option value="article">Article</option>
                <option value="page">Page</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div v-if="form.targetType === 'article'">
              <label for="banner-target-article" class="field-label">Target Article</label>
              <select id="banner-target-article" v-model.number="form.targetArticleId" class="field-select">
                <option :value="null">Select article</option>
                <option v-for="article in articles" :key="article.id" :value="article.id">{{ article.titleEn }}</option>
              </select>
            </div>
            <div v-else-if="form.targetType === 'page'">
              <label for="banner-target-page" class="field-label">Target Page Key</label>
              <input id="banner-target-page" v-model="form.targetPageKey" class="field-input" placeholder="game-guide" />
            </div>
            <div v-else>
              <label for="banner-target-url" class="field-label">Target URL</label>
              <input id="banner-target-url" v-model="form.targetUrl" class="field-input" placeholder="https://..." />
            </div>
            <div v-if="form.scope === 'specific_topic'">
              <label for="banner-topic-key" class="field-label">Topic Key</label>
              <input id="banner-topic-key" v-model="form.targetTopicKey" class="field-input" placeholder="getting-started" />
            </div>
            <div>
              <label for="banner-campaign-code" class="field-label">Campaign Code</label>
              <input id="banner-campaign-code" v-model="form.campaignCode" class="field-input" placeholder="launch-week" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-4">
            <label class="flex items-center gap-3 text-sm text-white/60">
              <input v-model="form.isActive" type="checkbox" class="h-4 w-4 accent-[#d4a843]" />
              Active
            </label>
            <label class="flex items-center gap-3 text-sm text-white/60">
              <input v-model="form.dismissible" type="checkbox" class="h-4 w-4 accent-[#d4a843]" />
              Dismissible
            </label>
            <label class="flex items-center gap-3 text-sm text-white/60">
              <input v-model="form.targetNewTab" type="checkbox" class="h-4 w-4 accent-[#d4a843]" />
              Open in new tab
            </label>
          </div>

          <div class="flex justify-end gap-3">
            <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
            <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveBanner">Save Banner</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <AdminToast :toast="toast" />
  </div>
</template>

<!--
  ═══ Admin Banner Control ═══
  จัดการ marketing banners ทั้งระบบ

  ฟีเจอร์:
  - CRUD: สร้าง/แก้ไข/ลบ banner
  - Placement: announcement_bar, popup, sidebar, article_inline, footer_strip
  - Scope: global, specific_topic
  - Status: DRAFT → SCHEDULED → LIVE → EXPIRED
  - Targeting: เชื่อมบทความ, หน้า CMS, Event, URL
  - Scheduling: ผ่าน DateTimeRangePicker
  - Filter: กรองตาม placement, status, scope

  ⚠️ ดู banner-resolver.ts สำหรับ logic การเลือก banner
  ⚠️ ดู marketing-banners.ts สำหรับ Zod validation
-->
<script setup lang="ts">
const { t } = useI18n()
import { BANNER_PLACEMENTS, BANNER_SCOPES } from '../../shared/cms/marketing-banners'

definePageMeta({ layout: 'admin' })

type Banner = Record<string, any>
type ArticleOption = { id: number; titleEn: string; titleTh: string; slug: string }

const placements = BANNER_PLACEMENTS
const scopes = BANNER_SCOPES
const statuses = ['DRAFT', 'SCHEDULED', 'LIVE', 'EXPIRED']
const banners = ref<Banner[]>([])
const articles = ref<ArticleOption[]>([])
const editorOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const { toast, showToast } = useAdminToast()

const filters = reactive({ placement: '', status: '', scope: '' })
const form = reactive({
  id: '',
  placement: 'announcement_bar',
  scope: 'global',
  status: 'DRAFT',
  priority: 0,
  campaignCode: '',
  badgeEn: '',
  badgeTh: '',
  titleEn: '',
  titleTh: '',
  bodyEn: '',
  bodyTh: '',
  desktopImage: '',
  mobileImage: '',
  targetType: 'article',
  targetArticleId: null as number | null,
  targetPageKey: '',
  targetUrl: '',
  targetNewTab: false,
  dismissible: true,
  isActive: true,
  targetTopicKey: '',
})

function resetForm() {
  Object.assign(form, {
    id: '',
    placement: 'announcement_bar',
    scope: 'global',
    status: 'DRAFT',
    priority: 0,
    campaignCode: '',
    badgeEn: '',
    badgeTh: '',
    titleEn: '',
    titleTh: '',
    bodyEn: '',
    bodyTh: '',
    desktopImage: '',
    mobileImage: '',
    targetType: 'article',
    targetArticleId: null,
    targetPageKey: '',
      targetUrl: '',
    targetNewTab: false,
    dismissible: true,
    isActive: true,
    targetTopicKey: '',
  })
}

function formatPlacement(value: string) {
  return value.replaceAll('_', ' ')
}

function targetLabel(banner: Banner) {
  if (banner.targetType === 'article') return banner.article?.titleEn || `Article #${banner.targetArticleId || ''}`
  if (banner.targetType === 'page') return banner.page?.titleEn || banner.targetPageKey || 'Page'
  return banner.targetUrl || 'URL'
}

async function loadBanners() {
  try {
    banners.value = await $fetch<Banner[]>('/api/admin/banners', { query: filters })
  } catch {
    banners.value = []
  }
}

async function loadArticles() {
  try {
    const result = await $fetch<{ data: ArticleOption[] }>('/api/admin/news', { query: { limit: 100 } })
    articles.value = result.data
  } catch {
    articles.value = []
  }
}

function openNewBanner() {
  formError.value = ''
  resetForm()
  editorOpen.value = true
}

function openEditBanner(banner: Banner) {
  formError.value = ''
  Object.assign(form, {
    id: banner.id,
    placement: banner.placement,
    scope: banner.scope,
    status: banner.status,
    priority: banner.priority,
    campaignCode: banner.campaignCode || '',
    badgeEn: banner.badgeEn || '',
    badgeTh: banner.badgeTh || '',
    titleEn: banner.titleEn || '',
    titleTh: banner.titleTh || '',
    bodyEn: banner.bodyEn || '',
    bodyTh: banner.bodyTh || '',
    desktopImage: banner.desktopImage || '',
    mobileImage: banner.mobileImage || '',
    targetType: banner.targetType,
    targetArticleId: banner.targetArticleId || null,
    targetPageKey: banner.targetPageKey || '',
    targetUrl: banner.targetUrl || '',
    targetNewTab: banner.targetNewTab,
    dismissible: banner.dismissible,
    isActive: banner.isActive,
    targetTopicKey: banner.targetTopicKey || '',
  })
  editorOpen.value = true
}

/**
 * แปลง form → API payload
 * ⚠️ ต้อง null ค่าที่ไม่ใช้ตาม targetType/scope
 *    ไม่งั้น DB จะเก็บค่าเก่าค้าง
 */
function toPayload() {
  return {
    placement: form.placement,
    scope: form.scope,
    status: form.status,
    priority: Number(form.priority) || 0,
    campaignCode: form.campaignCode || null,
    badgeEn: form.badgeEn || null,
    badgeTh: form.badgeTh || null,
    titleEn: form.titleEn,
    titleTh: form.titleTh,
    bodyEn: form.bodyEn || null,
    bodyTh: form.bodyTh || null,
    desktopImage: form.desktopImage || null,
    mobileImage: form.mobileImage || null,
    targetType: form.targetType,
    targetArticleId: form.targetType === 'article' ? form.targetArticleId : null,
    targetPageKey: form.targetType === 'page' ? form.targetPageKey : null,
    targetTopicKey: form.scope === 'specific_topic' ? form.targetTopicKey : null,
    targetUrl: form.targetType === 'url' ? form.targetUrl : null,
    targetNewTab: form.targetNewTab,
    dismissible: form.dismissible,
    isActive: form.isActive,
    config: {},
  }
}

async function saveBanner() {
  if (!form.titleEn || !form.titleTh) {
    formError.value = 'Title (EN) and Title (TH) are required.'
    return
  }

  saving.value = true
  formError.value = ''
  try {
    const payload = toPayload()
    if (form.id) await $fetch(`/api/admin/banners/${form.id}`, { method: 'PUT', body: payload })
    else await $fetch('/api/admin/banners', { method: 'POST', body: payload })
    editorOpen.value = false
    showToast('Banner saved')
    await loadBanners()
  } catch (error: any) {
    formError.value = error?.data?.message || 'Failed to save banner'
  } finally {
    saving.value = false
  }
}

async function deleteBanner(banner: Banner) {
  await $fetch(`/api/admin/banners/${banner.id}`, { method: 'DELETE' })
  showToast('Banner deleted')
  await loadBanners()
}

onMounted(() => {
  void Promise.all([loadBanners(), loadArticles()])
})
</script>

<style scoped>
.th-cell { padding: 12px 16px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.3); }
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; color: rgba(255, 255, 255, 0.45); transition: background 0.15s, color 0.15s; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.08); color: white; }
.icon-btn.danger:hover { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.field-label { margin-bottom: 6px; display: block; font-size: 0.8125rem; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
.field-input, .field-select { width: 100%; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.04); padding: 9px 12px; font-size: 0.875rem; color: white; outline: none; }
.field-input:focus, .field-select:focus { border-color: rgba(212, 168, 67, 0.5); }
.field-select option { color: black; }
</style>
