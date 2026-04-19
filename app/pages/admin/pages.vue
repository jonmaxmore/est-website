<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Pages</h2>
        <p class="mt-1 text-sm text-white/50">Manage static pages content (FAQ, Terms, Privacy, etc.)</p>
      </div>
    </div>

    <!-- Page List -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="page in pages"
        :key="page.key"
        class="group cursor-pointer rounded-2xl border border-white/6 bg-white/4 p-6 transition-all duration-300 hover:border-gold/20 hover:bg-white/6"
        @click="editPage(page)"
      >
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
    <Teleport to="body">
      <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="editing = null">
        <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface-secondary p-6">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-xl font-bold">Edit: {{ editing.title }}</h3>
            <button class="cursor-pointer border-none bg-none text-white/50 text-xl hover:text-white" @click="editing = null">✕</button>
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">SEO Title</label>
            <input v-model="editForm.seoTitle" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
          </div>
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">SEO Description</label>
            <input v-model="editForm.seoDesc" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
          </div>
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Content (HTML)</label>
            <textarea v-model="editForm.content" rows="15" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white font-mono outline-none focus:border-gold/50" />
          </div>
          <div class="flex gap-3">
            <button @click="savePage" class="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">Save Changes</button>
            <button @click="editing = null" class="rounded-lg border border-white/10 bg-transparent px-6 py-2.5 text-sm text-white/50 cursor-pointer hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>
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

interface EditForm { seoTitle: string; seoDesc: string; content: string }
const editing = ref<typeof pages.value[0] | null>(null)
const editForm = ref<EditForm>({ seoTitle: '', seoDesc: '', content: '' })

async function editPage(page: typeof pages.value[0]) {
  editing.value = page
  try {
    const data = await $fetch<{ seoTitle: string; seoDesc: string; content: string }>(`/api/admin/pages/${page.key}`)
    editForm.value = { seoTitle: data.seoTitle || page.title, seoDesc: data.seoDesc || '', content: data.content || '' }
  } catch {
    editForm.value = { seoTitle: page.title, seoDesc: '', content: '' }
  }
}

async function savePage() {
  if (!editing.value) return
  await $fetch(`/api/admin/pages/${editing.value.key}`, { method: 'PUT', body: editForm.value })
  editing.value = null
}
</script>
