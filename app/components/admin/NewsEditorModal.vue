<template>
  <UModal v-model:open="openModel" :title="mode === 'create' ? 'Create Article' : 'Edit Article'" class="sm:max-w-5xl">
    <template #body>
      <div class="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/3 border border-white/6">
        <button type="button" class="mode-toggle-btn" :class="{ active: !previewMode }" @click="previewMode = false">
          <UIcon name="i-lucide-pencil" class="w-4 h-4 inline" /> Edit
        </button>
        <button type="button" class="mode-toggle-btn" :class="{ active: previewMode }" @click="previewMode = true">
          <UIcon name="i-lucide-eye" class="w-4 h-4 inline" /> Preview
        </button>
        <div class="ml-auto flex items-center gap-2 text-xs text-white/30">
          <span v-if="autosaveStatus === 'saving'">Saving draft...</span>
          <span v-else-if="autosaveStatus === 'saved'" class="text-emerald-400/50">Draft saved</span>
        </div>
      </div>

      <div v-show="!previewMode" class="editor-layout">
        <div class="editor-main">
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
              <LazyAdminRichTextEditor v-model="form.contentTh" placeholder="เนื้อหาข่าวภาษาไทย..." />
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
              <LazyAdminRichTextEditor v-model="form.contentEn" placeholder="English article content..." />
            </template>
          </AdminContentLanguageTabs>
        </div>

        <div class="editor-sidebar">
          <div class="sidebar-card">
            <h4 class="sidebar-card-title">Publishing</h4>
            <UFormField label="Status">
              <USelect v-model="form.status" :items="['DRAFT', 'PUBLISHED', 'ARCHIVED']" />
            </UFormField>
            <UFormField label="Category" class="mt-3">
              <USelect v-model="form.category" :items="['ANNOUNCEMENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']" />
            </UFormField>
            <UFormField label="Publish Date" class="mt-3">
              <UInput v-model="form.publishedAt" type="datetime-local" />
            </UFormField>
            <label class="mt-3 flex items-center gap-3 text-sm text-white/60">
              <input v-model="form.pinned" type="checkbox" class="h-4 w-4 accent-[var(--adm-gold)]" />
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
              <input v-model="form.isEvergreen" type="checkbox" class="h-4 w-4 accent-[var(--adm-gold)]" />
              Evergreen guide
            </label>
          </div>

          <div class="sidebar-card">
            <h4 class="sidebar-card-title">Featured Image</h4>
            <AdminMediaPicker v-model="form.featuredImage" label="" />
            <label class="mt-3 flex items-center gap-2 text-sm text-white/50">
              <input v-model="form.featureOnHome" type="checkbox" class="accent-[var(--adm-gold)]" /> Show on homepage
            </label>
          </div>

          <div class="sidebar-card">
            <h4 class="sidebar-card-title">SEO</h4>
            <UFormField label="SEO Title">
              <UInput v-model="form.seoTitle" placeholder="Override page title" />
            </UFormField>
            <UFormField label="SEO Description" class="mt-3">
              <UTextarea v-model="form.seoDesc" :rows="2" placeholder="Meta description" />
            </UFormField>
            <div class="mt-4 rounded-lg border border-white/6 bg-white/2 p-3">
              <p class="text-xs font-medium text-white/30 mb-2">Google Preview</p>
              <p class="text-sm text-blue-400 truncate">{{ form.seoTitle || form.titleEn || 'Article Title' }}</p>
              <p class="text-xs text-emerald-400 font-mono truncate">/news/{{ form.slug || '...' }}</p>
              <p class="mt-1 text-xs text-white/40 line-clamp-2">{{ form.seoDesc || form.excerptEn || 'Article description will appear here...' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-show="previewMode" class="preview-container">
        <div class="preview-header">
          <div class="flex gap-2 mb-4">
            <button type="button" class="preview-lang-btn" :class="{ active: previewLang === 'th' }" @click="previewLang = 'th'">🇹🇭 ภาษาไทย</button>
            <button type="button" class="preview-lang-btn" :class="{ active: previewLang === 'en' }" @click="previewLang = 'en'">🇬🇧 English</button>
          </div>
        </div>

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

          <p v-if="previewExcerpt" class="text-sm text-white/50 mb-6 italic border-l-2 border-[var(--adm-gold)]/30 pl-4">
            {{ previewExcerpt }}
          </p>

          <div class="preview-body prose" v-html="previewContent || '<p class=\'text-white/25\'>No content yet...</p>'" />
        </article>
      </div>

      <p v-if="formError" class="mt-4 text-center text-sm text-red-400">{{ formError }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="openModel = false">Cancel</UButton>
        <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveArticle">
          {{ mode === 'create' ? 'Create' : 'Save Changes' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { sanitizeRichHtml } from '../../shared/cms/sanitize-html'
import type { NewsArticle, TopicOption } from '../../composables/useNewsArticles'

const props = defineProps<{
  open: boolean
  article: NewsArticle | null
  topics: TopicOption[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const openModel = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const mode = computed<'create' | 'edit'>(() => (props.article ? 'edit' : 'create'))

const saving = ref(false)
const formError = ref('')
const previewMode = ref(false)
const previewLang = ref<'th' | 'en'>('th')
const autosaveStatus = ref<'idle' | 'saving' | 'saved'>('idle')
const validationTriggered = ref(false)
const langTabsRef = ref<{ focusFirstError: () => void } | null>(null)
let autosaveTimer: ReturnType<typeof setInterval>

const { showToast } = useAdminToast()

const form = reactive({
  titleEn: '', titleTh: '', slug: '', excerptEn: '', excerptTh: '',
  contentEn: '', contentTh: '', category: 'ANNOUNCEMENT',
  contentType: 'ANNOUNCEMENT', primaryTopicKey: '', campaignCode: '',
  pinned: false, isEvergreen: false,
  status: 'DRAFT',
  featuredImage: '', publishedAt: '', featureOnHome: false, homePriority: 0,
  externalUrl: '', openInNewTab: false, seoTitle: '', seoDesc: '',
})

const fieldErrors = reactive<Record<string, string>>({ titleEn: '', titleTh: '', slug: '' })

const contentTypeOptions = ['ANNOUNCEMENT', 'PATCH_NOTES', 'GUIDE', 'LORE', 'DEV_BLOG']

const topicOptions = computed(() => [
  { label: 'No topic', value: '' },
  ...props.topics
    .filter((topic) => topic.visible !== false)
    .map((topic) => ({ label: topic.labelEn || topic.key, value: topic.key })),
])

const tabErrors = computed(() => {
  const th: string[] = []
  const en: string[] = []
  if (!validationTriggered.value) return { th, en }
  if (!form.titleTh && !form.titleEn) th.push('Title is required')
  if (!form.titleEn && !form.titleTh) en.push('Title is required')
  return { th, en }
})

const previewContent = computed(() => sanitizeRichHtml(previewLang.value === 'th' ? form.contentTh : form.contentEn))
const previewExcerpt = computed(() => previewLang.value === 'th' ? form.excerptTh : form.excerptEn)

watch(() => props.open, (open) => {
  if (open) resetForm()
  else clearInterval(autosaveTimer)
})

function resetForm() {
  formError.value = ''
  previewMode.value = false
  validationTriggered.value = false
  Object.keys(fieldErrors).forEach((k) => (fieldErrors[k] = ''))

  if (props.article) {
    const a = props.article
    Object.assign(form, {
      titleEn: a.titleEn, titleTh: a.titleTh, slug: a.slug,
      excerptEn: a.excerptEn || '', excerptTh: a.excerptTh || '',
      contentEn: a.contentEn || '', contentTh: a.contentTh || '',
      category: a.category,
      contentType: a.contentType || 'ANNOUNCEMENT',
      primaryTopicKey: a.primaryTopicKey || '',
      campaignCode: a.campaignCode || '',
      pinned: a.pinned || false,
      isEvergreen: a.isEvergreen || false,
      status: a.status,
      featuredImage: a.featuredImage || '',
      publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString().slice(0, 16) : '',
      featureOnHome: a.featureOnHome, homePriority: a.homePriority,
      externalUrl: a.externalUrl || '', openInNewTab: a.openInNewTab,
      seoTitle: a.seoTitle || '', seoDesc: a.seoDesc || '',
    })
  } else {
    Object.assign(form, {
      titleEn: '', titleTh: '', slug: '', excerptEn: '', excerptTh: '',
      contentEn: '', contentTh: '', category: 'ANNOUNCEMENT',
      contentType: 'ANNOUNCEMENT', primaryTopicKey: '', campaignCode: '',
      pinned: false, isEvergreen: false,
      status: 'DRAFT',
      featuredImage: '', publishedAt: '', featureOnHome: false, homePriority: 0,
      externalUrl: '', openInNewTab: false, seoTitle: '', seoDesc: '',
    })
  }
  startAutosave()
}

function startAutosave() {
  clearInterval(autosaveTimer)
  autosaveTimer = setInterval(async () => {
    if (!props.open || !props.article) return
    autosaveStatus.value = 'saving'
    try {
      await $fetch(`/api/admin/news/${props.article.id}`, { method: 'PUT', body: buildPayload() })
      autosaveStatus.value = 'saved'
    } catch {
      autosaveStatus.value = 'idle'
    }
  }, 30000)
}

function buildPayload() {
  return {
    ...form,
    publishedAt: form.publishedAt || null,
    primaryTopicKey: form.primaryTopicKey || null,
    campaignCode: form.campaignCode || null,
    featuredImage: form.featuredImage || null,
    externalUrl: form.externalUrl || null,
    seoTitle: form.seoTitle || null,
    seoDesc: form.seoDesc || null,
  }
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

function validateForm(): boolean {
  validationTriggered.value = true
  let isValid = true
  Object.keys(fieldErrors).forEach((k) => (fieldErrors[k] = ''))

  if (!form.titleEn && !form.titleTh) {
    fieldErrors.titleEn = 'At least one title (EN or TH) is required'
    fieldErrors.titleTh = 'At least one title (EN or TH) is required'
    isValid = false
  }

  if (!form.slug) {
    fieldErrors.slug = 'URL slug is required'
    isValid = false
  }

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
    const payload = buildPayload()
    if (props.article) {
      await $fetch(`/api/admin/news/${props.article.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/admin/news', { method: 'POST', body: payload })
    }
    clearInterval(autosaveTimer)
    showToast(props.article ? 'Article updated!' : 'Article created!')
    emit('saved')
    openModel.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    formError.value = err?.data?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

const { localizedDate: localizedDateFmt } = useLocalizedField()
function formatDate(d: string) {
  return localizedDateFmt(d, { month: 'short', day: 'numeric', year: 'numeric' })
}

onBeforeUnmount(() => clearInterval(autosaveTimer))
</script>

<style scoped>
.editor-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
@media (max-width: 768px) { .editor-layout { grid-template-columns: 1fr; } }
.editor-main { display: flex; flex-direction: column; gap: 4px; }
.editor-sidebar { display: flex; flex-direction: column; gap: 16px; }
.sidebar-card { padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); background: rgba(255, 255, 255, 0.03); }
.sidebar-card-title { margin: 0 0 16px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255, 255, 255, 0.4); }

.mode-toggle-btn {
  padding: 6px 14px; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
  background: transparent; color: rgba(255,255,255,0.4); font-size: 0.8125rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.mode-toggle-btn:hover { color: rgba(255,255,255,0.7); }
.mode-toggle-btn.active { background: rgba(212,168,67,0.1); color: var(--adm-gold); border-color: rgba(212,168,67,0.2); }

.preview-container { min-height: 400px; }
.preview-lang-btn {
  padding: 5px 12px; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px;
  background: transparent; color: rgba(255,255,255,0.4); font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
}
.preview-lang-btn.active { background: rgba(212,168,67,0.08); color: var(--adm-gold); border-color: rgba(212,168,67,0.15); }
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
.preview-body :deep(a) { color: var(--adm-gold); }
.preview-body :deep(table) { width: 100%; border-collapse: collapse; margin: 1em 0; }
.preview-body :deep(th), .preview-body :deep(td) { border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; }
</style>
