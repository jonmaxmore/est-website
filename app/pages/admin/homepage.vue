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
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 flex-shrink-0">
            <UIcon :name="sectionIcon(section.type)" class="w-5 h-5 text-[#d4a843]" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold">{{ sectionLabel(section.type) }}</h3>
            <p class="text-xs text-white/40">ID: {{ section.id }} • Order: {{ section.order }}</p>
          </div>

          <!-- Background Preview -->
          <div v-if="section.background" class="h-10 w-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
            <img :src="section.background" alt="Section background preview" class="h-full w-full object-cover" />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button @click="editSection(section)" class="cursor-pointer rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs text-white/50 hover:text-gold hover:border-gold/30 transition-colors"><UIcon name="i-lucide-settings" class="w-3 h-3 inline" /> Edit</button>
            <button @click="section.visible = !section.visible" class="cursor-pointer border-none bg-none" :title="section.visible ? 'Hide' : 'Show'"><UIcon :name="section.visible ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="w-4 h-4" /></button>
            <button v-if="!defaultTypes.includes(section.type)" @click="removeSection(index)" class="cursor-pointer border-none bg-none text-xs text-red-400/50 hover:text-red-400">✕</button>
          </div>
        </div>
      </div>
    </div>

    <button @click="saveSections" class="mt-6 rounded-lg bg-gold px-8 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">Save Layout</button>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editingSection" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="editingSection = null">
        <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface-secondary p-6">
          <h3 class="mb-6 text-xl font-bold">Edit: {{ sectionLabel(editingSection.type) }}</h3>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Section Type</label>
            <select v-model="editingSection.type" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50">
              <option v-for="option in sectionTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Background Image URL (poster)</label>
            <AdminMediaPicker v-model="editingSection.background" label="" accept="image" />
            <!-- Preview -->
            <div v-if="editingSection.background" class="mt-2 h-24 overflow-hidden rounded-lg border border-white/10">
              <img :src="editingSection.background" alt="Background image preview" class="h-full w-full object-cover" />
            </div>
          </div>

          <div v-if="editingSection.type === 'hero'" class="mb-4 rounded-xl border border-white/6 bg-white/3 p-4">
            <h4 class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Hero Content</h4>
            <div class="mb-3">
              <label class="mb-1 block text-sm font-medium text-white/60">Logo URL</label>
              <input v-model="editingSection.config.logo" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="/images/logo.webp" />
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-white/60">Subtitle (TH)</label>
                <textarea v-model="editingSection.config.subtitleTh" rows="2" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-white/60">Subtitle (EN)</label>
                <textarea v-model="editingSection.config.subtitleEn" rows="2" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
              </div>
            </div>
            <label class="mt-3 flex items-center gap-3 text-sm">
              <input v-model="editingSection.config.showSocialLinks" type="checkbox" class="accent-gold" />
              Show social icons from Site Settings
            </label>

            <div class="mt-4 rounded-lg border border-white/6 bg-black/20 p-3">
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Video Background</h4>
              <div class="mb-3">
                <label class="mb-1 block text-sm font-medium text-white/60">Background Mode</label>
                <select v-model="editingSection.config.backgroundMode" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50">
                  <option value="image">Image</option>
                  <option value="video">Video (MP4)</option>
                </select>
              </div>
              <div v-if="editingSection.config.backgroundMode === 'video'" class="mb-2">
                <AdminMediaPicker v-model="editingSection.config.backgroundVideo" label="Video File" accept="video" />
                <p class="mt-1 text-xs text-white/30">Upload MP4 (max 100 MB). Background Image above becomes the poster.</p>
              </div>
            </div>

            <div class="mt-5 flex items-center justify-between">
              <h4 class="text-xs font-semibold uppercase tracking-widest text-white/40">Hero Buttons</h4>
              <button class="rounded-lg border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold" @click="addHeroButton">+ Add Button</button>
            </div>
            <div class="mt-3 flex flex-col gap-3">
              <div v-for="(button, buttonIndex) in heroButtons" :key="button.id" class="rounded-lg border border-white/6 bg-black/20 p-3">
                <div class="grid gap-3 sm:grid-cols-2">
                  <input v-model="button.labelTh" class="rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-gold/50" placeholder="Label TH" />
                  <input v-model="button.labelEn" class="rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-gold/50" placeholder="Label EN" />
                  <input v-model="button.href" class="rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="/download" />
                  <select v-model="button.variant" class="rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-gold/50">
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
                <div class="mt-3 flex flex-wrap items-center gap-3">
                  <label class="flex items-center gap-2 text-xs text-white/50">
                    <input v-model="button.visible" type="checkbox" class="accent-gold" />
                    Visible
                  </label>
                  <label class="flex items-center gap-2 text-xs text-white/50">
                    Target
                    <select v-model="button.target" class="rounded border border-white/10 bg-white/4 px-2 py-1 text-xs text-white">
                      <option value="_self">Same tab</option>
                      <option value="_blank">New tab</option>
                    </select>
                  </label>
                  <button class="ml-auto text-xs text-red-400/70 hover:text-red-400" @click="removeHeroButton(buttonIndex)">Remove</button>
                </div>
              </div>
            </div>

            <!-- ── Platform Download Cards (App Store / Google Play / PC / Mac) ── -->
            <div class="mt-5 rounded-lg border border-white/6 bg-black/20 p-3">
              <h4 class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Platform Download Cards</h4>
              <p class="mb-3 text-xs text-white/40">URL ของหน้า store แต่ละ platform — ปล่อยว่างเพื่อซ่อน</p>
              <div class="flex flex-col gap-2">
                <div
                  v-for="platform in heroPlatforms"
                  :key="platform.id"
                  class="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 p-3"
                >
                  <span class="font-mono text-xs uppercase tracking-widest text-gold w-16 flex-shrink-0">{{ platform.id }}</span>
                  <input
                    v-model="platform.url"
                    placeholder="https://apps.apple.com/..."
                    class="flex-1 rounded-md border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-white outline-none focus:border-gold/50 font-mono"
                  />
                  <label class="flex items-center gap-1.5 text-xs text-white/50 flex-shrink-0">
                    <input v-model="platform.visible" type="checkbox" class="accent-gold" />
                    Show
                  </label>
                </div>
              </div>
            </div>
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

    <AdminToast :toast="toast" />
  </div>
</template>

<!--
  ═══ Admin Homepage Builder ═══
  จัดเรียง section หน้าแรกของเว็บไซต์

  Sections ที่รองรับ:
  - hero: แบนเนอร์หลัก (วีดีโอ/รูปภาพ background, subtitle, CTA buttons, social links)
  - weapons: อาวุธ/คลาส
  - features: ฟีเจอร์เกม
  - highlights: ไฮไลท์
  - news: ข่าวล่าสุด
  - cta: Call-to-Action

  ฟีเจอร์:
  - Reorder: เลื่อน section ขึ้น/ลง
  - Visibility: ซ่อน/แสดงแต่ละ section
  - Hero Config: logo, subtitle TH/EN, background mode (image/video/youtube)
  - Hero CTA Buttons: หลายปุ่ม, เรียงลำดับได้
  - Save: บันทึกทั้ง array ไป siteConfig key='homepage'

  ⚠️ ดู homepage.ts สำหรับ type และ constants
-->
<script setup lang="ts">
import { SUPPORTED_HOMEPAGE_SECTION_TYPES } from '../../shared/cms/homepage'

definePageMeta({ layout: 'admin' })

interface SectionConfig { id: string; type: string; visible: boolean; order: number; background: string; config: Record<string, any> }
interface HeroButtonConfig {
  id: string
  labelEn: string
  labelTh: string
  href: string
  variant: 'primary' | 'secondary' | 'ghost'
  visible: boolean
  order: number
  target: '_self' | '_blank'
}

const defaultTypes: string[] = [...SUPPORTED_HOMEPAGE_SECTION_TYPES]
const defaultSections: SectionConfig[] = [
  { id: 'hero', type: 'hero', visible: true, order: 0, background: '/images/hero-bg.webp', config: defaultHeroConfig() },
  { id: 'weapons', type: 'weapons', visible: true, order: 1, background: '', config: {} },
  { id: 'features', type: 'features', visible: true, order: 2, background: '', config: {} },
  { id: 'highlights', type: 'highlights', visible: true, order: 3, background: '', config: {} },
  { id: 'news', type: 'news', visible: true, order: 4, background: '', config: {} },
  { id: 'cta', type: 'cta', visible: true, order: 5, background: '', config: {} },
]

const sections = ref<SectionConfig[]>([...defaultSections])
const editingSection = ref<SectionConfig | null>(null)
const sectionTypeOptions = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'weapons', label: 'Weapons / Class Selector' },
  { value: 'features', label: 'Game Features' },
  { value: 'highlights', label: 'Highlights' },
  { value: 'news', label: 'News' },
  { value: 'cta', label: 'Call to Action' },
]

function sectionIcon(type: string) {
  const icons: Record<string, string> = { hero: 'i-lucide-home', weapons: 'i-lucide-swords', features: 'i-lucide-sparkles', highlights: 'i-lucide-flame', news: 'i-lucide-newspaper', cta: 'i-lucide-target' }
  return icons[type] || 'i-lucide-box'
}
function sectionLabel(type: string) {
  const labels: Record<string, string> = { hero: 'Hero Banner', weapons: 'Weapons / Classes', features: 'Game Features', highlights: 'Highlights', news: 'Latest News', cta: 'Call to Action' }
  return labels[type] || type
}

const heroButtons = computed<HeroButtonConfig[]>(() => {
  const buttons = editingSection.value?.config?.buttons
  return Array.isArray(buttons) ? buttons : []
})

function defaultHeroConfig() {
  return {
    logo: '/images/logo.webp',
    subtitleEn: '',
    subtitleTh: '',
    showSocialLinks: true,
    backgroundMode: 'image' as const,
    backgroundVideo: '',
    buttons: [
      { id: 'download', labelEn: 'Download', labelTh: 'Download', href: '/download', variant: 'primary', visible: true, order: 0, target: '_self' },
      { id: 'trailer', labelEn: 'Watch Trailer', labelTh: 'Watch Trailer', href: '#trailer', variant: 'ghost', visible: true, order: 1, target: '_self' },
    ],
    platforms: [
      { id: 'ios', url: '/download', visible: true },
      { id: 'android', url: '/download', visible: true },
      { id: 'pc', url: '/download', visible: true },
      { id: 'mac', url: '', visible: false },
    ],
  }
}

function ensureHeroConfig(section: SectionConfig) {
  if (section.type !== 'hero') return
  const existing = section.config || {}
  section.config = {
    ...defaultHeroConfig(),
    ...existing,
    buttons: Array.isArray(existing.buttons) && existing.buttons.length
      ? existing.buttons
      : defaultHeroConfig().buttons,
    platforms: Array.isArray(existing.platforms) && existing.platforms.length
      ? existing.platforms
      : defaultHeroConfig().platforms,
  }
}

interface HeroPlatformConfig { id: string; url: string; visible: boolean }
const heroPlatforms = computed<HeroPlatformConfig[]>(() => {
  const platforms = editingSection.value?.config?.platforms
  return Array.isArray(platforms) ? platforms : []
})

function moveUp(index: number) {
  if (index === 0) return
  const items = [...sections.value]
  const a = items[index]; const b = items[index - 1]
  if (a && b) { items[index - 1] = a; items[index] = b }
  items.forEach((s, i) => s.order = i)
  sections.value = items
}
function moveDown(index: number) {
  if (index >= sections.value.length - 1) return
  const items = [...sections.value]
  const a = items[index]; const b = items[index + 1]
  if (a && b) { items[index] = b; items[index + 1] = a }
  items.forEach((s, i) => s.order = i)
  sections.value = items
}
function editSection(section: SectionConfig) {
  ensureHeroConfig(section)
  editingSection.value = section
}
function removeSection(index: number) { sections.value.splice(index, 1); sections.value.forEach((s, i) => s.order = i) }
function addSection() {
  sections.value.push({ id: `section_${Date.now()}`, type: 'cta', visible: true, order: sections.value.length, background: '', config: {} })
}

function addHeroButton() {
  if (!editingSection.value) return
  ensureHeroConfig(editingSection.value)
  const buttons = editingSection.value.config.buttons as HeroButtonConfig[]
  buttons.push({
    id: `hero-button-${Date.now()}`,
    labelEn: 'New Button',
    labelTh: 'New Button',
    href: '/',
    variant: buttons.length === 0 ? 'primary' : 'secondary',
    visible: true,
    order: buttons.length,
    target: '_self',
  })
}

function removeHeroButton(index: number) {
  if (!editingSection.value || !Array.isArray(editingSection.value.config.buttons)) return
  editingSection.value.config.buttons.splice(index, 1)
  editingSection.value.config.buttons.forEach((button: HeroButtonConfig, buttonIndex: number) => { button.order = buttonIndex })
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
    const data = await $fetch<{ sections: SectionConfig[] }>('/api/admin/config?key=homepage_sections')
    if (data && typeof data === 'object' && Array.isArray(data.sections) && data.sections.length) {
      sections.value = data.sections
    }
  } catch {
    // Try public API as fallback
    try {
      const fallback = await $fetch<{ sections: SectionConfig[] }>('/api/public/sections')
      if (fallback?.sections?.length) sections.value = fallback.sections
    } catch { /* use defaults */ }
  }
})
</script>

