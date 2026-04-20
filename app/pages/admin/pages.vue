<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Pages</h2>
      <p class="mt-1 text-sm text-white/50">Manage static pages content (FAQ, Terms, Privacy, etc.)</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="page in pages" :key="page.key"
        class="group cursor-pointer rounded-2xl border border-white/6 bg-white/4 p-6 transition-all duration-300 hover:border-gold/20 hover:bg-white/6"
        @click="editPage(page)">
        <div class="mb-3 text-3xl">{{ page.icon }}</div>
        <h3 class="mb-1 text-lg font-bold">{{ page.title }}</h3>
        <p class="text-sm text-white/50">{{ page.description }}</p>
        <div class="mt-4 flex items-center justify-between">
          <span class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
            :class="page.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'">
            {{ page.status }}
          </span>
          <span class="text-xs text-white/30">{{ page.route }}</span>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="`Edit: ${editing?.title || ''}`" class="sm:max-w-4xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="SEO Title (EN)"><UInput v-model="editForm.seoTitle" /></UFormField>
            <UFormField label="SEO Title (TH)"><UInput v-model="editForm.seoTitleTh" /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="SEO Description (EN)"><UTextarea v-model="editForm.seoDesc" :rows="2" /></UFormField>
            <UFormField label="SEO Description (TH)"><UTextarea v-model="editForm.seoDescTh" :rows="2" /></UFormField>
          </div>
          <UFormField label="Content (EN) — HTML supported">
            <textarea v-model="editForm.content" rows="10" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white font-mono outline-none focus:border-gold/50" />
          </UFormField>
          <UFormField label="Content (TH) — HTML supported">
            <textarea v-model="editForm.contentTh" rows="10" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white font-mono outline-none focus:border-gold/50" />
          </UFormField>
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

const pages = ref([
  { key: 'faq', title: 'FAQ', icon: '❓', description: 'Frequently asked questions', route: '/faq', status: 'published' },
  { key: 'terms', title: 'Terms of Service', icon: '📜', description: 'Terms and conditions', route: '/terms', status: 'published' },
  { key: 'privacy', title: 'Privacy Policy', icon: '🔒', description: 'Privacy and data policy', route: '/privacy', status: 'published' },
  { key: 'support', title: 'Support', icon: '🎧', description: 'Customer support page', route: '/support', status: 'published' },
  { key: 'story', title: 'Story', icon: '📖', description: 'Game story and lore', route: '/story', status: 'published' },
  { key: 'game-guide', title: 'Game Guide', icon: '🗺️', description: 'Game guide and tutorials', route: '/game-guide', status: 'published' },
  { key: 'gallery', title: 'Gallery', icon: '🖼️', description: 'Screenshots and artwork', route: '/gallery', status: 'published' },
  { key: 'download', title: 'Download', icon: '📥', description: 'Download links', route: '/download', status: 'published' },
])

const editing = ref<typeof pages.value[0] | null>(null)
const editorOpen = ref(false)
const saving = ref(false)
const editForm = reactive({ seoTitle: '', seoTitleTh: '', seoDesc: '', seoDescTh: '', content: '', contentTh: '' })
const { toast, showToast } = useAdminToast()

async function editPage(page: typeof pages.value[0]) {
  editing.value = page
  try {
    const data = await $fetch<Record<string, string>>(`/api/admin/pages/${page.key}`)
    Object.assign(editForm, {
      seoTitle: data.seoTitle || page.title, seoTitleTh: data.seoTitleTh || '',
      seoDesc: data.seoDesc || '', seoDescTh: data.seoDescTh || '',
      content: data.content || '', contentTh: data.contentTh || '',
    })
  } catch {
    Object.assign(editForm, { seoTitle: page.title, seoTitleTh: '', seoDesc: '', seoDescTh: '', content: '', contentTh: '' })
  }
  editorOpen.value = true
}

async function savePage() {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/pages/${editing.value.key}`, { method: 'PUT', body: editForm })
    editorOpen.value = false; showToast('Page saved!')
  } catch { showToast('Failed to save page', 'error') }
  finally { saving.value = false }
}
</script>
