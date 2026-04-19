<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Homepage Builder</h2>
        <p class="mt-1 text-sm text-white/50">Arrange, configure, and style homepage sections</p>
      </div>
      <button @click="addSection" class="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">+ Add Section</button>
    </div>

    <!-- Section List (Sortable) -->
    <div class="flex flex-col gap-4">
      <div
        v-for="(section, index) in sections"
        :key="section.id"
        class="rounded-2xl border transition-all duration-300"
        :class="section.visible ? 'border-white/10 bg-white/4' : 'border-white/4 bg-white/2 opacity-60'"
      >
        <div class="flex items-center gap-4 p-5">
          <!-- Reorder -->
          <div class="flex flex-col gap-0.5">
            <button @click="moveUp(index)" class="cursor-pointer border-none bg-none text-xs text-white/30 hover:text-gold" :disabled="index === 0">▲</button>
            <button @click="moveDown(index)" class="cursor-pointer border-none bg-none text-xs text-white/30 hover:text-gold" :disabled="index === sections.length - 1">▼</button>
          </div>

          <!-- Icon & Type -->
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-xl flex-shrink-0">
            {{ sectionIcon(section.type) }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold">{{ sectionLabel(section.type) }}</h3>
            <p class="text-xs text-white/40">ID: {{ section.id }} • Order: {{ section.order }}</p>
          </div>

          <!-- Background Preview -->
          <div v-if="section.background" class="h-10 w-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
            <img :src="section.background" class="h-full w-full object-cover" />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button @click="editSection(section)" class="cursor-pointer rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs text-white/50 hover:text-gold hover:border-gold/30 transition-colors">⚙️ Edit</button>
            <button @click="section.visible = !section.visible" class="cursor-pointer border-none bg-none text-lg" :title="section.visible ? 'Hide' : 'Show'">{{ section.visible ? '👁️' : '🚫' }}</button>
            <button v-if="!defaultTypes.includes(section.type)" @click="removeSection(index)" class="cursor-pointer border-none bg-none text-xs text-red-400/50 hover:text-red-400">✕</button>
          </div>
        </div>
      </div>
    </div>

    <button @click="saveSections" class="mt-6 rounded-lg bg-gold px-8 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">💾 Save Layout</button>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editingSection" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="editingSection = null">
        <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface-secondary p-6">
          <h3 class="mb-6 text-xl font-bold">Edit: {{ sectionLabel(editingSection.type) }}</h3>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Section Type</label>
            <select v-model="editingSection.type" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50">
              <option value="hero">Hero Banner</option>
              <option value="weapons">Weapons / Class Selector</option>
              <option value="features">Game Features</option>
              <option value="highlights">Highlights</option>
              <option value="news">News</option>
              <option value="cta">Call to Action</option>
              <option value="custom_html">Custom HTML</option>
              <option value="gallery">Gallery</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Background Image URL</label>
            <input v-model="editingSection.background" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="/images/section-bg.webp" />
            <!-- Preview -->
            <div v-if="editingSection.background" class="mt-2 h-24 overflow-hidden rounded-lg border border-white/10">
              <img :src="editingSection.background" class="h-full w-full object-cover" />
            </div>
          </div>

          <!-- Custom HTML Config -->
          <div v-if="editingSection.type === 'custom_html'" class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Custom HTML Content</label>
            <textarea v-model="editingSection.config.html" rows="8" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white font-mono outline-none focus:border-gold/50" />
          </div>

          <!-- Video Config -->
          <div v-if="editingSection.type === 'video'" class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">YouTube URL</label>
            <input v-model="editingSection.config.videoUrl" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="https://youtube.com/watch?v=..." />
          </div>

          <div class="mb-4 flex items-center gap-3">
            <input type="checkbox" v-model="editingSection.visible" class="accent-gold" />
            <label class="text-sm">Visible on Homepage</label>
          </div>

          <div class="flex gap-3">
            <button @click="editingSection = null" class="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">Done</button>
            <button @click="editingSection = null" class="rounded-lg border border-white/10 bg-transparent px-6 py-2.5 text-sm text-white/50 cursor-pointer hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface SectionConfig { id: string; type: string; visible: boolean; order: number; background: string; config: Record<string, any> }

const defaultTypes = ['hero', 'weapons', 'features', 'highlights', 'news', 'cta']
const defaultSections: SectionConfig[] = [
  { id: 'hero', type: 'hero', visible: true, order: 0, background: '/images/hero-bg.webp', config: {} },
  { id: 'weapons', type: 'weapons', visible: true, order: 1, background: '', config: {} },
  { id: 'features', type: 'features', visible: true, order: 2, background: '', config: {} },
  { id: 'highlights', type: 'highlights', visible: true, order: 3, background: '', config: {} },
  { id: 'news', type: 'news', visible: true, order: 4, background: '', config: {} },
  { id: 'cta', type: 'cta', visible: true, order: 5, background: '', config: {} },
]

const sections = ref<SectionConfig[]>([...defaultSections])
const editingSection = ref<SectionConfig | null>(null)

function sectionIcon(type: string) {
  const icons: Record<string, string> = { hero: '🏠', weapons: '⚔️', features: '⭐', highlights: '🔥', news: '📰', cta: '🎯', custom_html: '📝', gallery: '🖼️', video: '🎬' }
  return icons[type] || '📦'
}
function sectionLabel(type: string) {
  const labels: Record<string, string> = { hero: 'Hero Banner', weapons: 'Weapons / Classes', features: 'Game Features', highlights: 'Highlights', news: 'Latest News', cta: 'Call to Action', custom_html: 'Custom HTML', gallery: 'Gallery', video: 'Video' }
  return labels[type] || type
}

function moveUp(index: number) {
  if (index === 0) return
  const items = [...sections.value]
  ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
  items.forEach((s, i) => s.order = i)
  sections.value = items
}
function moveDown(index: number) {
  if (index >= sections.value.length - 1) return
  const items = [...sections.value]
  ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
  items.forEach((s, i) => s.order = i)
  sections.value = items
}
function editSection(section: SectionConfig) { editingSection.value = section }
function removeSection(index: number) { sections.value.splice(index, 1); sections.value.forEach((s, i) => s.order = i) }
function addSection() {
  sections.value.push({ id: `section_${Date.now()}`, type: 'custom_html', visible: true, order: sections.value.length, background: '', config: { html: '' } })
}

async function saveSections() {
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'homepage_sections', value: { sections: sections.value } } })
    showToast('Homepage layout saved!')
  } catch { showToast('Failed to save layout', 'error') }
}

const { toast, showToast } = useAdminToast()

onMounted(async () => {
  try {
    const data = await $fetch<{ sections: SectionConfig[] }>('/api/public/sections')
    if (data?.sections?.length) sections.value = data.sections
  } catch { /* use defaults */ }
})
</script>
