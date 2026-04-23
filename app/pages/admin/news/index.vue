<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">News Articles</h2>
        <p class="mt-1 text-sm text-white/50">{{ total }} articles total</p>
      </div>
      <button class="gold-btn" @click="openEditor(null)">+ New Article</button>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex flex-wrap gap-3 rounded-2xl border border-white/6 bg-white/4 p-4">
      <UInput v-model="search" placeholder="Search articles..." class="min-w-[200px] flex-1" @input="debounceLoad" />
      <USelect v-model="filterStatus" :items="[{ label: 'All Status', value: '' }, { label: 'Draft', value: 'DRAFT' }, { label: 'Published', value: 'PUBLISHED' }, { label: 'Archived', value: 'ARCHIVED' }]" value-key="value" class="w-36" @update:model-value="loadArticles" />
      <USelect v-model="filterCategory" :items="[{ label: 'All Categories', value: '' }, { label: 'Announcement', value: 'ANNOUNCEMENT' }, { label: 'Event', value: 'EVENT' }, { label: 'Update', value: 'UPDATE' }, { label: 'Media', value: 'MEDIA' }]" value-key="value" class="w-40" @update:model-value="loadArticles" />
      <USelect v-model="filterContentType" :items="contentTypeFilterOptions" value-key="value" class="w-44" @update:model-value="loadArticles" />
      <USelect v-model="filterTopic" :items="topicFilterOptions" value-key="value" class="w-44" @update:model-value="loadArticles" />
      <UInput v-model="filterCampaignCode" placeholder="Campaign code" class="w-44" @input="debounceLoad" />
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/6 bg-white/2">
              <th class="w-10 px-4 py-3"><input type="checkbox" @change="toggleAllChecked" /></th>
              <th class="th-cell">Title</th>
              <th class="th-cell">Category</th>
              <th class="th-cell">Webzine</th>
              <th class="th-cell">Status</th>
              <th class="th-cell">Published</th>
              <th class="th-cell w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
              <td class="px-4 py-3"><input type="checkbox" :checked="selectedIds.has(article.id)" @change="toggleSelect(article.id)" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img v-if="article.featuredImage" :src="article.featuredImage" class="h-8 w-12 flex-shrink-0 rounded object-cover" />
                  <div>
                    <p class="max-w-[250px] truncate font-medium">{{ article.titleTh || article.titleEn }}</p>
                    <p class="text-[0.6875rem] text-white/30">{{ article.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3"><AdminStatusBadge :status="article.category" /></td>
              <td class="px-4 py-3">
                <p class="text-xs font-semibold text-white/60">{{ article.contentType?.replaceAll('_', ' ') || 'ANNOUNCEMENT' }}</p>
                <p class="text-[0.625rem] text-white/25">{{ article.primaryTopicKey || 'No topic' }}</p>
              </td>
              <td class="px-4 py-3"><AdminStatusBadge :status="article.status" /></td>
              <td class="px-4 py-3 text-white/30 whitespace-nowrap">{{ article.publishedAt ? formatDate(article.publishedAt) : '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <button class="icon-btn" @click="openEditor(article)"><UIcon name="i-lucide-pencil" class="w-4 h-4" /></button>
                  <button class="icon-btn danger" @click="confirmDelete(article)"><UIcon name="i-lucide-trash-2" class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="articles.length === 0">
              <td colspan="6">
                <AdminEmptyState icon="i-lucide-newspaper" title="No articles found" message="Create your first news article to get started." action-label="+ Create Article" @action="openEditor(null)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedIds.size > 0" class="flex items-center justify-between border-t border-blue-500/20 bg-blue-500/8 px-4 py-3 text-sm text-blue-400">
        <span>{{ selectedIds.size }} selected</span>
        <UButton size="xs" color="error" variant="soft" @click="bulkDelete">Delete Selected</UButton>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 border-t border-white/6 p-4">
        <UButton variant="ghost" size="sm" :disabled="page <= 1" @click="page--; loadArticles()">← Prev</UButton>
        <span class="text-sm text-white/30">Page {{ page }} of {{ totalPages }}</span>
        <UButton variant="ghost" size="sm" :disabled="page >= totalPages" @click="page++; loadArticles()">Next →</UButton>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════  -->
    <!-- EDITOR MODAL (with Preview Mode + Validation) -->
    <!-- ═══════════════════════════════════════════  -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create Article' : 'Edit Article'" class="sm:max-w-5xl">
      <template #body>
        <!-- Mode Toggle Bar -->
        <div class="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/3 border border-white/6">
          <button
            type="button"
            class="mode-toggle-btn"
            :class="{ active: !previewMode }"
            @click="previewMode = false"
          >
            <UIcon name="i-lucide-pencil" class="w-4 h-4 inline" /> Edit
          </button>
          <button
            type="button"
            class="mode-toggle-btn"
            :class="{ active: previewMode }"
            @click="previewMode = true"
          >
            <UIcon name="i-lucide-eye" class="w-4 h-4 inline" /> Preview
          </button>
          <div class="ml-auto flex items-center gap-2 text-xs text-white/30">
            <span v-if="autosaveStatus === 'saving'">Saving draft...</span>
            <span v-else-if="autosaveStatus === 'saved'" class="text-emerald-400/50">Draft saved</span>
          </div>
        </div>

        <!-- ═══ EDIT MODE ═══ -->
        <div v-show="!previewMode" class="editor-layout">
          <!-- Left: Content -->
          <div class="editor-main">
            <!-- Slug -->
            <div class="mb-4">
              <UFormField label="URL Slug *">
                <div class="flex gap-2 items-center">
                  <span class="text-xs text-white/25 font-mono">/news/</span>
                  <UInput v-model="form.slug" placeholder="article-url-slug" class="flex-1 font-mono" :class="{ 'ring-1 ring-red-500/50': fieldErrors.slug }" />
                  <button type="button" class="text-xs text-gold hover:text-gold-light" @click="autoSlug">Auto</button>
                </div>
                <p v-if="fieldErrors.slug" class="mt-1 text-xs text-red-400">{{ fieldErrors.slug }}</p>
              </UFormField>
            </div>

            <!-- Language Tabs for Title + Content -->
            <AdminContentLanguageTabs
              ref="langTabsRef"
              :th-filled="!!form.titleTh && !!form.contentTh"
              :en-filled="!!form.titleEn && !!form.contentEn"
              :th-errors="tabErrors.th"
              :en-errors="tabErrors.en"
              show-copy-button
              @copy="handleCopyContent"
            >
              <template #th>
                <UFormField label="Title (TH) *" class="mb-4">
                  <UInput v-model="form.titleTh" placeholder="หัวข้อข่าวภาษาไทย" class="text-lg" :class="{ 'ring-1 ring-red-500/50': fieldErrors.titleTh }" @input="clearFieldError('titleTh')" />
                  <p v-if="fieldErrors.titleTh" class="mt-1 text-xs text-red-400">{{ fieldErrors.titleTh }}</p>
                </UFormField>
                <UFormField label="Excerpt (TH)" class="mb-4">
                  <UTextarea v-model="form.excerptTh" :rows="2" placeholder="สรุปข่าวสั้นๆ" />
                </UFormField>
                <div class="mb-2 text-sm font-medium text-white/60">Content (TH)</div>
                <AdminRichTextEditor v-model="form.contentTh" placeholder="เนื้อหาข่าวภาษาไทย..." />
              </template>
              <template #en>
                <UFormField label="Title (EN) *" class="mb-4">
                  <UInput v-model="form.titleEn" placeholder="English article title" class="text-lg" :class="{ 'ring-1 ring-red-500/50': fieldErrors.titleEn }" @input="clearFieldError('titleEn')" />
                  <p v-if="fieldErrors.titleEn" class="mt-1 text-xs text-red-400">{{ fieldErrors.titleEn }}</p>
                </UFormField>
                <UFormField label="Excerpt (EN)" class="mb-4">
                  <UTextarea v-model="form.excerptEn" :rows="2" placeholder="Short summary" />
                </UFormField>
                <div class="mb-2 text-sm font-medium text-white/60">Content (EN)</div>
                <AdminRichTextEditor v-model="form.contentEn" placeholder="English article content..." />
              </template>
            </AdminContentLanguageTabs>
          </div>

          <!-- Right: Publishing Sidebar -->
          <div class="editor-sidebar">
            <!-- Publishing -->
            <div class="sidebar-card">
              <h4 class="sidebar-card-title">Publishing</h4>
              <UFormField label="Status">
                <USelect v-model="form.status" :items="['DRAFT', 'PUBLISHED', 'ARCHIVED']" />
              </UFormField>
              <UFormField label="Category" class="mt-3">
                <USelect v-model="form.category" :items="['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']" />
              </UFormField>
              <UFormField label="Publish Date" class="mt-3">
                <UInput v-model="form.publishedAt" type="datetime-local" />
              </UFormField>
              <label class="mt-3 flex items-center gap-3 text-sm text-white/60">
                <input v-model="form.pinned" type="checkbox" class="h-4 w-4 accent-[#d4a843]" />
                Pin in webzine
              </label>
            </div>

            <div class="sidebar-card">
              <h4 class="sidebar-card-title">Webzine</h4>
              <UFormField label="Content Type">
                <USelect v-model="form.contentType" :items="contentTypeOptions" />
              </UFormField>
              <UFormField label="Primary Topic" class="mt-3">
                <USelect v-model="form.primaryTopicKey" :items="topicOptions" value-key="value" />
              </UFormField>
              <UFormField label="Campaign Code" class="mt-3">
                <UInput v-model="form.campaignCode" placeholder="launch-week" />
              </UFormField>
              <label class="mt-3 flex items-center gap-3 text-sm text-white/60">
                <input v-model="form.isEvergreen" type="checkbox" class="h-4 w-4 accent-[#d4a843]" />
                Evergreen guide
              </label>
            </div>

            <!-- Featured Image -->
            <div class="sidebar-card">
              <h4 class="sidebar-card-title">Featured Image</h4>
              <AdminMediaPicker v-model="form.featuredImage" label="" />
              <label class="mt-3 flex items-center gap-2 text-sm text-white/50">
                <input v-model="form.featureOnHome" type="checkbox" class="accent-[#d4a843]" /> Show on homepage
              </label>
            </div>

            <!-- SEO -->
            <div class="sidebar-card">
              <h4 class="sidebar-card-title">SEO</h4>
              <UFormField label="SEO Title">
                <UInput v-model="form.seoTitle" placeholder="Override page title" />
              </UFormField>
              <UFormField label="SEO Description" class="mt-3">
                <UTextarea v-model="form.seoDesc" :rows="2" placeholder="Meta description" />
              </UFormField>
              <!-- SEO Preview -->
              <div class="mt-4 rounded-lg border border-white/6 bg-white/2 p-3">
                <p class="text-xs font-medium text-white/30 mb-2">Google Preview</p>
                <p class="text-sm text-blue-400 truncate">{{ form.seoTitle || form.titleEn || 'Article Title' }}</p>
                <p class="text-xs text-emerald-400 font-mono truncate">eternaltowersaga.com/news/{{ form.slug || '...' }}</p>
                <p class="mt-1 text-xs text-white/40 line-clamp-2">{{ form.seoDesc || form.excerptEn || 'Article description will appear here...' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ PREVIEW MODE ═══ -->
        <div v-show="previewMode" class="preview-container">
          <div class="preview-header">
            <div class="flex gap-2 mb-4">
              <button type="button" class="preview-lang-btn" :class="{ active: previewLang === 'th' }" @click="previewLang = 'th'">🇹🇭 ภาษาไทย</button>
              <button type="button" class="preview-lang-btn" :class="{ active: previewLang === 'en' }" @click="previewLang = 'en'">🇬🇧 English</button>
            </div>
          </div>

          <!-- Preview Content -->
          <article class="preview-article">
            <div class="flex items-center gap-2 mb-3">
              <AdminStatusBadge :status="form.category" />
              <AdminStatusBadge :status="form.status" />
              <span v-if="form.publishedAt" class="text-xs text-white/30">{{ formatDate(form.publishedAt) }}</span>
            </div>

            <img v-if="form.featuredImage" :src="form.featuredImage" class="w-full max-h-[300px] object-cover rounded-xl mb-6" />

            <h1 class="text-2xl font-bold mb-3 leading-tight">
              {{ previewLang === 'th' ? (form.titleTh || 'ยังไม่ได้ใส่ชื่อ') : (form.titleEn || 'No title set') }}
            </h1>

            <p v-if="previewExcerpt" class="text-sm text-white/50 mb-6 italic border-l-2 border-[#d4a843]/30 pl-4">
              {{ previewExcerpt }}
            </p>

            <div
              class="preview-body prose"
              v-html="previewContent || '<p class=\'text-white/25\'>No content yet...</p>'"
            />
          </article>
        </div>

        <p v-if="formError" class="mt-4 text-center text-sm text-red-400">{{ formError }}</p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveArticle">
            {{ editorMode === 'create' ? 'Create' : 'Save Changes' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirm Dialog -->
    <AdminConfirmDialog
      v-model="deleteModalOpen"
      title="Delete Article?"
      :message="`Are you sure you want to delete '${deleteTarget?.titleEn || deleteTarget?.titleTh}'? This cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="doDelete"
    />

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
import { sanitizeRichHtml } from '../../../shared/cms/sanitize-html'

definePageMeta({ layout: 'admin' })

interface Article {
  id: number; slug: string; titleEn: string; titleTh: string
  excerptEn?: string | null; excerptTh?: string | null
  contentEn?: string | null; contentTh?: string | null
  category: string; status: string; featuredImage?: string | null
  contentType?: string; primaryTopicKey?: string | null; campaignCode?: string | null
  linkedEventId?: string | null; pinned?: boolean; isEvergreen?: boolean
  readingTimeMinutes?: number | null
  publishedAt?: string | null; featureOnHome: boolean; homePriority: number
  externalUrl?: string | null; openInNewTab: boolean
  seoTitle?: string | null; seoDesc?: string | null; ogImage?: string | null; createdAt: string
}

interface TopicOption {
  key: string
  labelEn: string
  visible: boolean
}

const articles = ref<Article[]>([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const search = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const filterContentType = ref('')
const filterTopic = ref('')
const filterCampaignCode = ref('')
const selectedIds = ref(new Set<number>())
const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const deleteTarget = ref<Article | null>(null)
const deleteModalOpen = ref(false)
const autosaveStatus = ref<'idle' | 'saving' | 'saved'>('idle')
const previewMode = ref(false)
const topics = ref<TopicOption[]>([])
const previewLang = ref<'th' | 'en'>('th')
let debounceTimer: ReturnType<typeof setTimeout>
let autosaveTimer: ReturnType<typeof setTimeout>
const langTabsRef = ref<{ focusFirstError: () => void } | null>(null)

const form = reactive({
  titleEn: '', titleTh: '', slug: '', excerptEn: '', excerptTh: '',
  contentEn: '', contentTh: '', category: 'ANNOUNCEMENT',
  contentType: 'ANNOUNCEMENT',
  primaryTopicKey: '',
  campaignCode: '',
  linkedEventId: null as string | null,
  pinned: false,
  isEvergreen: false,
  status: 'DRAFT',
  featuredImage: '', publishedAt: '', featureOnHome: false, homePriority: 0,
  externalUrl: '', openInNewTab: false, seoTitle: '', seoDesc: '',
})

// Per-field errors for inline display
const fieldErrors = reactive<Record<string, string>>({
  titleEn: '', titleTh: '', slug: '',
})

// Per-tab error aggregation for ContentLanguageTabs badges
const tabErrors = computed(() => {
  const th: string[] = []
  const en: string[] = []

  // Only show errors after a save attempt
  if (!validationTriggered.value) return { th, en }

  if (!form.titleTh && !form.titleEn) th.push('Title is required')
  if (!form.titleEn && !form.titleTh) en.push('Title is required')

  return { th, en }
})

const validationTriggered = ref(false)

// Preview helpers
const previewContent = computed(() => sanitizeRichHtml(previewLang.value === 'th' ? form.contentTh : form.contentEn))
const previewExcerpt = computed(() => previewLang.value === 'th' ? form.excerptTh : form.excerptEn)

const { toast, showToast } = useAdminToast()

const contentTypeOptions = ['ANNOUNCEMENT', 'EVENT', 'PATCH_NOTES', 'GUIDE', 'LORE', 'DEV_BLOG']
const contentTypeFilterOptions = computed(() => [
  { label: 'All Types', value: '' },
  ...contentTypeOptions.map((value) => ({ label: value.replaceAll('_', ' '), value })),
])
const topicOptions = computed(() => [
  { label: 'No topic', value: '' },
  ...topics.value
    .filter((topic) => topic.visible !== false)
    .map((topic) => ({ label: topic.labelEn || topic.key, value: topic.key })),
])
const topicFilterOptions = computed(() => [
  { label: 'All Topics', value: '' },
  ...topicOptions.value.filter((topic) => topic.value),
])

async function loadTopics() {
  try {
    const data = await $fetch<TopicOption[]>('/api/admin/config?key=webzine_topics')
    topics.value = Array.isArray(data) ? data : []
  } catch {
    topics.value = []
  }
}

async function loadArticles() {
  try {
    const res = await $fetch<{ data: Article[]; meta: { total: number; totalPages: number } }>('/api/admin/news', {
      query: {
        page: page.value,
        search: search.value,
        status: filterStatus.value,
        category: filterCategory.value,
        contentType: filterContentType.value,
        primaryTopicKey: filterTopic.value,
        campaignCode: filterCampaignCode.value,
      },
    })
    articles.value = res.data
    total.value = res.meta.total
    totalPages.value = res.meta.totalPages
  } catch { articles.value = [] }
}

function debounceLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadArticles(), 300)
}

function autoSlug() {
  const title = form.titleEn || form.titleTh
  form.slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function clearFieldError(field: string) {
  fieldErrors[field] = ''
}

function openEditor(article: Article | null) {
  formError.value = ''
  previewMode.value = false
  validationTriggered.value = false
  Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')

  if (article) {
    editorMode.value = 'edit'
    editingId.value = article.id
    Object.assign(form, {
      titleEn: article.titleEn, titleTh: article.titleTh, slug: article.slug,
      excerptEn: article.excerptEn || '', excerptTh: article.excerptTh || '',
      contentEn: article.contentEn || '', contentTh: article.contentTh || '',
      category: article.category,
      contentType: article.contentType || 'ANNOUNCEMENT',
      primaryTopicKey: article.primaryTopicKey || '',
      campaignCode: article.campaignCode || '',
      linkedEventId: article.linkedEventId || null,
      pinned: article.pinned || false,
      isEvergreen: article.isEvergreen || false,
      status: article.status,
      featuredImage: article.featuredImage || '',
      publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : '',
      featureOnHome: article.featureOnHome, homePriority: article.homePriority,
      externalUrl: article.externalUrl || '', openInNewTab: article.openInNewTab,
      seoTitle: article.seoTitle || '', seoDesc: article.seoDesc || '',
    })
  } else {
    editorMode.value = 'create'
    editingId.value = null
    Object.assign(form, {
      titleEn: '', titleTh: '', slug: '', excerptEn: '', excerptTh: '',
      contentEn: '', contentTh: '', category: 'ANNOUNCEMENT',
      contentType: 'ANNOUNCEMENT',
      primaryTopicKey: '',
      campaignCode: '',
      linkedEventId: null,
      pinned: false,
      isEvergreen: false,
      status: 'DRAFT',
      featuredImage: '', publishedAt: '', featureOnHome: false, homePriority: 0,
      externalUrl: '', openInNewTab: false, seoTitle: '', seoDesc: '',
    })
  }
  editorOpen.value = true
  startAutosave()
}

function startAutosave() {
  clearInterval(autosaveTimer)
  autosaveTimer = setInterval(async () => {
    if (!editorOpen.value || !editingId.value) return
    autosaveStatus.value = 'saving'
    try {
      const payload = { ...form, publishedAt: form.publishedAt || null, featuredImage: form.featuredImage || null, seoTitle: form.seoTitle || null, seoDesc: form.seoDesc || null }
      await $fetch(`/api/admin/news/${editingId.value}`, { method: 'PUT', body: payload })
      autosaveStatus.value = 'saved'
    } catch {
      autosaveStatus.value = 'idle'
    }
  }, 30000)
}

function handleCopyContent(from: 'th' | 'en', to: 'th' | 'en') {
  if (from === 'th' && to === 'en') {
    form.titleEn = form.titleTh
    form.excerptEn = form.excerptTh
    form.contentEn = form.contentTh
  } else {
    form.titleTh = form.titleEn
    form.excerptTh = form.excerptEn
    form.contentTh = form.contentEn
  }
  showToast(`Content copied ${from.toUpperCase()} → ${to.toUpperCase()}`)
}

/** Validate form with per-field and per-tab error feedback */
function validateForm(): boolean {
  validationTriggered.value = true
  let isValid = true
  Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')

  // At least one title required
  if (!form.titleEn && !form.titleTh) {
    fieldErrors.titleEn = 'At least one title (EN or TH) is required'
    fieldErrors.titleTh = 'At least one title (EN or TH) is required'
    isValid = false
  }

  // Slug required
  if (!form.slug) {
    fieldErrors.slug = 'URL slug is required'
    isValid = false
  }

  // Focus the first tab with errors
  if (!isValid) {
    nextTick(() => langTabsRef.value?.focusFirstError())
  }

  return isValid
}

async function saveArticle() {
  if (!validateForm()) {
    formError.value = 'Please fix the errors above before saving.'
    return
  }

  saving.value = true
  formError.value = ''
  try {
    const payload = {
      ...form,
      publishedAt: form.publishedAt || null,
      primaryTopicKey: form.primaryTopicKey || null,
      campaignCode: form.campaignCode || null,
      linkedEventId: form.linkedEventId || null,
      featuredImage: form.featuredImage || null,
      externalUrl: form.externalUrl || null,
      seoTitle: form.seoTitle || null,
      seoDesc: form.seoDesc || null,
    }
    if (editorMode.value === 'create') {
      await $fetch('/api/admin/news', { method: 'POST', body: payload })
    } else {
      await $fetch(`/api/admin/news/${editingId.value}`, { method: 'PUT', body: payload })
    }
    editorOpen.value = false
    clearInterval(autosaveTimer)
    showToast(editorMode.value === 'create' ? 'Article created!' : 'Article updated!')
    await loadArticles()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    formError.value = err?.data?.message || 'Save failed'
  } finally { saving.value = false }
}

function confirmDelete(article: Article) {
  deleteTarget.value = article
  deleteModalOpen.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/admin/news/${deleteTarget.value.id}`, { method: 'DELETE' })
    deleteTarget.value = null
    showToast('Article deleted')
    await loadArticles()
  } catch { showToast('Delete failed', 'error') }
}

async function bulkDelete() {
  for (const id of selectedIds.value) {
    try { await $fetch(`/api/admin/news/${id}`, { method: 'DELETE' }) } catch {}
  }
  selectedIds.value = new Set()
  showToast('Selected articles deleted')
  await loadArticles()
}

function toggleSelect(id: number) {
  selectedIds.value.has(id) ? selectedIds.value.delete(id) : selectedIds.value.add(id)
  selectedIds.value = new Set(selectedIds.value)
}

function toggleAllChecked(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selectedIds.value = checked ? new Set(articles.value.map((a) => a.id)) : new Set()
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onBeforeUnmount(() => clearInterval(autosaveTimer))
await Promise.all([loadArticles(), loadTopics()])
</script>

<style scoped>
.th-cell { padding: 12px 16px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.3); }
.icon-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.08); }
.icon-btn.danger:hover { background: rgba(239, 68, 68, 0.15); }
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }

/* Editor Layout */
.editor-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
@media (max-width: 768px) { .editor-layout { grid-template-columns: 1fr; } }
.editor-main { display: flex; flex-direction: column; gap: 4px; }
.editor-sidebar { display: flex; flex-direction: column; gap: 16px; }
.sidebar-card { padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); background: rgba(255, 255, 255, 0.03); }
.sidebar-card-title { margin: 0 0 16px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255, 255, 255, 0.4); }

/* Mode Toggle */
.mode-toggle-btn {
  padding: 6px 14px; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
  background: transparent; color: rgba(255,255,255,0.4); font-size: 0.8125rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.mode-toggle-btn:hover { color: rgba(255,255,255,0.7); }
.mode-toggle-btn.active { background: rgba(212,168,67,0.1); color: #d4a843; border-color: rgba(212,168,67,0.2); }

/* Preview */
.preview-container { min-height: 400px; }
.preview-lang-btn {
  padding: 5px 12px; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px;
  background: transparent; color: rgba(255,255,255,0.4); font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
}
.preview-lang-btn.active { background: rgba(212,168,67,0.08); color: #d4a843; border-color: rgba(212,168,67,0.15); }
.preview-article {
  padding: 24px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
}
.preview-body { color: rgba(255,255,255,0.85); font-size: 0.9375rem; line-height: 1.8; }
.preview-body :deep(h1) { font-size: 1.5rem; font-weight: 700; margin: 1em 0 0.5em; }
.preview-body :deep(h2) { font-size: 1.25rem; font-weight: 600; margin: 0.8em 0 0.4em; }
.preview-body :deep(h3) { font-size: 1.1rem; font-weight: 600; margin: 0.6em 0 0.3em; }
.preview-body :deep(ul), .preview-body :deep(ol) { padding-left: 1.5em; }
.preview-body :deep(blockquote) { border-left: 3px solid rgba(212,168,67,0.4); padding-left: 1em; color: rgba(255,255,255,0.5); }
.preview-body :deep(img) { max-width: 100%; border-radius: 8px; margin: 1em 0; }
.preview-body :deep(a) { color: #d4a843; }
.preview-body :deep(table) { width: 100%; border-collapse: collapse; margin: 1em 0; }
.preview-body :deep(th), .preview-body :deep(td) { border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; }
</style>
