<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Pages</h2>
      <p class="mt-1 text-sm text-white/50">Manage system and custom pages from the shared CMS page registry.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="page in pages" :key="page.key"
        class="group cursor-pointer rounded-2xl border border-white/6 bg-white/4 p-6 transition-all duration-300 hover:border-gold/20 hover:bg-white/6"
        @click="editPage(page)">
        <div class="mb-3"><UIcon :name="page.icon" class="w-8 h-8 text-[#d4a843]" /></div>
        <h3 class="mb-1 text-lg font-bold">{{ page.titleEn }}</h3>
        <p class="text-sm text-white/50">{{ page.description }}</p>
        <div class="mt-4 flex items-center justify-between">
          <AdminStatusBadge :status="page.status" />
          <span class="text-xs text-white/30 font-mono">{{ page.route }}</span>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="`Edit: ${editing?.titleEn || ''}`" class="sm:max-w-4xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <!-- SEO -->
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

          <!-- Content -->
          <AdminContentLanguageTabs
            :th-filled="!!editForm.contentTh"
            :en-filled="!!editForm.content"
            show-copy-button
            @copy="handleCopy"
          >
            <template #th>
              <div class="mb-2 text-sm font-medium text-white/60">Page Content (TH)</div>
              <AdminRichTextEditor v-model="editForm.contentTh" placeholder="เนื้อหาหน้าเพจภาษาไทย..." />
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
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="savePage">Save Changes</UButton>
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
}

const pages = ref<AdminPageItem[]>([])
const editing = ref<AdminPageItem | null>(null)
const editorOpen = ref(false)
const saving = ref(false)
const editForm = reactive({ seoTitle: '', seoTitleTh: '', seoDesc: '', seoDescTh: '', content: '', contentTh: '' })
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

async function editPage(page: AdminPageItem) {
  editing.value = page
  try {
    const data = await $fetch<Record<string, string>>(`/api/admin/pages/${page.key}`)
    Object.assign(editForm, {
      seoTitle: data.seoTitle || page.titleEn, seoTitleTh: data.seoTitleTh || '',
      seoDesc: data.seoDesc || '', seoDescTh: data.seoDescTh || '',
      content: data.content || '', contentTh: data.contentTh || '',
    })
  } catch {
    Object.assign(editForm, { seoTitle: page.titleEn, seoTitleTh: '', seoDesc: '', seoDescTh: '', content: '', contentTh: '' })
  }
  editorOpen.value = true
}

function handleCopy(from: 'th' | 'en') {
  if (from === 'th') { editForm.content = editForm.contentTh }
  else { editForm.contentTh = editForm.content }
  showToast(`Copied ${from.toUpperCase()} content`)
}

async function savePage() {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/pages/${editing.value.key}`, { method: 'PUT', body: editForm })
    await loadPages()
    editorOpen.value = false; showToast('Page saved!')
  } catch { showToast('Failed to save page', 'error') }
  finally { saving.value = false }
}

await loadPages()
</script>
