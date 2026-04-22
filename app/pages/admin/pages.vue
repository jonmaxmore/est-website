<template>
  <div>
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold">Pages</h2>
        <p class="mt-1 text-sm text-white/50">Create, edit, and publish system or custom pages from one CMS registry.</p>
      </div>
      <UButton class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="createOpen = true">
        <UIcon name="i-lucide-file-plus" class="mr-2 h-4 w-4" />
        New Page
      </UButton>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="page in pages"
        :key="page.key"
        type="button"
        class="group cursor-pointer rounded-2xl border border-white/6 bg-white/4 p-6 text-left transition-all duration-300 hover:border-gold/20 hover:bg-white/6"
        @click="editPage(page)"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-[#d4a843]">
              <UIcon :name="page.icon || 'i-lucide-file-text'" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-base font-bold">{{ page.titleEn }}</p>
              <p class="text-xs text-white/35">{{ page.titleTh }}</p>
            </div>
          </div>
          <span class="rounded-full border px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wider" :class="page.isSystemPage ? 'border-white/10 text-white/50' : 'border-gold/25 text-gold'">
            {{ page.isSystemPage ? 'System' : 'Custom' }}
          </span>
        </div>

        <p class="mb-4 min-h-[40px] text-sm text-white/50">{{ page.description || 'No description yet.' }}</p>

        <div class="flex items-center justify-between gap-3">
          <AdminStatusBadge :status="page.status" />
          <span class="text-xs font-mono text-white/30">{{ page.route }}</span>
        </div>
      </button>
    </div>

    <UModal v-model:open="createOpen" title="Create Page" class="sm:max-w-xl">
      <template #body>
        <div class="grid gap-4 p-1">
          <UFormField label="Title (EN)">
            <UInput v-model="createForm.titleEn" aria-label="Title (EN)" />
          </UFormField>
          <UFormField label="Title (TH)">
            <UInput v-model="createForm.titleTh" aria-label="Title (TH)" />
          </UFormField>
          <UFormField label="Slug">
            <UInput v-model="createForm.slug" aria-label="Slug" />
          </UFormField>
          <UFormField label="Status">
            <select v-model="createForm.status" class="page-select">
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="createOpen = false">Cancel</UButton>
          <UButton :loading="creating" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="createPage">
            Create Page
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="editorOpen" :title="`Edit: ${editing?.titleEn || ''}`" class="sm:max-w-5xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <div class="rounded-xl border border-white/6 bg-white/3 p-5">
            <h4 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Page Settings</h4>
            <div class="grid gap-4 md:grid-cols-2">
              <UFormField label="Title (EN)">
                <UInput v-model="editForm.titleEn" aria-label="Title (EN)" />
              </UFormField>
              <UFormField label="Title (TH)">
                <UInput v-model="editForm.titleTh" aria-label="Title (TH)" />
              </UFormField>
              <UFormField label="Slug">
                <UInput v-model="editForm.slug" aria-label="Slug" :disabled="editing?.isSystemPage" />
              </UFormField>
              <UFormField label="Status">
                <select v-model="editForm.status" class="page-select">
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </UFormField>
              <UFormField label="Description" class="md:col-span-2">
                <UTextarea v-model="editForm.description" :rows="2" />
              </UFormField>
            </div>
          </div>

          <div class="rounded-xl border border-white/6 bg-white/3 p-5">
            <h4 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">SEO Settings</h4>
            <AdminContentLanguageTabs :th-filled="!!editForm.seoTitleTh" :en-filled="!!editForm.seoTitle">
              <template #th>
                <UFormField label="SEO Title (TH)" class="mb-3"><UInput v-model="editForm.seoTitleTh" /></UFormField>
                <UFormField label="SEO Description (TH)"><UTextarea v-model="editForm.seoDescTh" :rows="2" /></UFormField>
              </template>
              <template #en>
                <UFormField label="SEO Title (EN)" class="mb-3"><UInput v-model="editForm.seoTitle" /></UFormField>
                <UFormField label="SEO Description (EN)"><UTextarea v-model="editForm.seoDesc" :rows="2" /></UFormField>
              </template>
            </AdminContentLanguageTabs>
          </div>

          <AdminContentLanguageTabs
            :th-filled="!!editForm.contentTh"
            :en-filled="!!editForm.content"
            show-copy-button
            @copy="handleCopy"
          >
            <template #th>
              <div class="mb-2 text-sm font-medium text-white/60">Page Content (TH)</div>
              <AdminRichTextEditor v-model="editForm.contentTh" placeholder="เนื้อหาภาษาไทย..." />
            </template>
            <template #en>
              <div class="mb-2 text-sm font-medium text-white/60">Page Content (EN)</div>
              <AdminRichTextEditor v-model="editForm.content" placeholder="English page content..." />
            </template>
          </AdminContentLanguageTabs>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="savePage">
            Save Changes
          </UButton>
        </div>
      </template>
    </UModal>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface AdminPageItem {
  key: string
  slug?: string | null
  titleEn: string
  titleTh: string
  description: string
  icon: string
  route: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isSystemPage: boolean
}

interface AdminPageDetail extends AdminPageItem {
  seoTitle: string
  seoTitleTh: string
  seoDesc: string
  seoDescTh: string
  content: string
  contentTh: string
}

const pages = ref<AdminPageItem[]>([])
const editing = ref<AdminPageItem | null>(null)
const editorOpen = ref(false)
const createOpen = ref(false)
const saving = ref(false)
const creating = ref(false)

const createForm = reactive({
  titleEn: '',
  titleTh: '',
  slug: '',
  status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
})

const editForm = reactive({
  titleEn: '',
  titleTh: '',
  slug: '',
  description: '',
  status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  seoTitle: '',
  seoTitleTh: '',
  seoDesc: '',
  seoDescTh: '',
  content: '',
  contentTh: '',
})

const { toast, showToast } = useAdminToast()

async function loadPages() {
  try {
    const data = await $fetch<AdminPageItem[]>('/api/admin/pages')
    pages.value = data.map((page) => ({
      ...page,
      description: page.description || '',
      icon: page.icon || 'i-lucide-file-text',
    }))
  } catch {
    pages.value = []
    showToast('Failed to load pages', 'error')
  }
}

async function createPage() {
  creating.value = true

  try {
    await $fetch('/api/admin/pages', {
      method: 'POST',
      body: createForm,
    })

    await loadPages()
    Object.assign(createForm, { titleEn: '', titleTh: '', slug: '', status: 'PUBLISHED' })
    createOpen.value = false
    showToast('Page created')
  } catch (error: any) {
    showToast(error?.data?.message || error?.message || 'Failed to create page', 'error')
  } finally {
    creating.value = false
  }
}

async function editPage(page: AdminPageItem) {
  editing.value = page

  try {
    const data = await $fetch<AdminPageDetail>(`/api/admin/pages/${page.key}`)
    Object.assign(editForm, {
      titleEn: data.titleEn || page.titleEn,
      titleTh: data.titleTh || page.titleTh,
      slug: data.slug || page.slug || page.key,
      description: data.description || page.description || '',
      status: data.status || page.status,
      seoTitle: data.seoTitle || page.titleEn,
      seoTitleTh: data.seoTitleTh || '',
      seoDesc: data.seoDesc || '',
      seoDescTh: data.seoDescTh || '',
      content: data.content || '',
      contentTh: data.contentTh || '',
    })
  } catch {
    Object.assign(editForm, {
      titleEn: page.titleEn,
      titleTh: page.titleTh,
      slug: page.slug || page.key,
      description: page.description || '',
      status: page.status,
      seoTitle: page.titleEn,
      seoTitleTh: '',
      seoDesc: '',
      seoDescTh: '',
      content: '',
      contentTh: '',
    })
  }

  editorOpen.value = true
}

function handleCopy(from: 'th' | 'en') {
  if (from === 'th') {
    editForm.content = editForm.contentTh
  } else {
    editForm.contentTh = editForm.content
  }

  showToast(`Copied ${from.toUpperCase()} content`)
}

async function savePage() {
  if (!editing.value) {
    return
  }

  saving.value = true

  try {
    await $fetch(`/api/admin/pages/${editing.value.key}`, {
      method: 'PUT',
      body: editForm,
    })
    await loadPages()
    editorOpen.value = false
    showToast('Page saved')
  } catch (error: any) {
    showToast(error?.data?.message || error?.message || 'Failed to save page', 'error')
  } finally {
    saving.value = false
  }
}

await loadPages()
</script>

<style scoped>
.page-select {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: white;
  min-height: 40px;
  padding: 0 12px;
  outline: none;
}
</style>
