<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Weapons</h2>
        <p class="mt-1 text-sm text-white/50">Manage game weapon data and stats</p>
      </div>
      <button class="gold-btn" @click="openEditor(null)">+ New Weapon</button>
    </div>

    <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))">
      <div v-for="(weapon, index) in weapons" :key="weapon.id" class="flex gap-5 rounded-2xl border p-5 transition-colors border-white/6 bg-white/4 hover:border-white/15">
        <div class="flex flex-col items-center gap-1 pt-2">
          <button class="sort-btn" :disabled="index === 0" @click="reorder(index, -1)">▲</button>
          <button class="sort-btn" :disabled="index === weapons.length - 1" @click="reorder(index, 1)">▼</button>
        </div>
        <div class="relative w-[80px] flex-shrink-0">
          <img :src="weapon.portrait || '/images/logo.webp'" :alt="weapon.name" class="w-full rounded-lg" />
          <span v-if="!weapon.visible" class="absolute top-1 right-1"><AdminStatusBadge status="HIDDEN" /></span>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold">{{ weapon.nameEn || weapon.name }}</h3>
          <p class="mt-0.5 text-xs text-white/40">{{ weapon.name }}</p>
          <p class="mt-1.5 text-sm leading-relaxed text-white/50 line-clamp-2">{{ weapon.descriptionEn || '—' }}</p>
          <!-- Stats bar -->
          <div v-if="weapon.statSTR" class="mt-2 flex gap-1">
            <div v-for="stat in ['STR','INT','AGI','DEX','HP']" :key="stat" class="flex-1">
              <div class="text-[0.5rem] text-white/20 text-center">{{ stat }}</div>
              <div class="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-[#d4a843] to-[#e8c468] transition-all duration-500" :style="{width: `${weapon['stat'+stat] || 50}%`}" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <button class="icon-btn" @click="openEditor(weapon)"><UIcon name="i-lucide-pencil" class="w-4 h-4" /></button>
          <button class="icon-btn danger" @click="confirmDeleteItem(weapon)"><UIcon name="i-lucide-trash-2" class="w-4 h-4" /></button>
          <label class="flex items-center justify-center mt-1">
            <input type="checkbox" :checked="weapon.visible" @change="toggleVisibility(weapon)" class="accent-[#d4a843]" />
          </label>
        </div>
      </div>
      <div v-if="weapons.length === 0" class="col-span-full">
        <AdminEmptyState icon="i-lucide-swords" title="No weapons yet" message="Add weapon classes for your game." action-label="+ New Weapon" @action="openEditor(null)" />
      </div>
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create Weapon' : 'Edit Weapon'" class="sm:max-w-3xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <!-- Language Tabs -->
          <AdminContentLanguageTabs :th-filled="!!form.name" :en-filled="!!form.nameEn" show-copy-button @copy="handleCopy">
            <template #th>
              <UFormField label="Name (TH) *" class="mb-3"><UInput v-model="form.name" placeholder="ดาบ" /></UFormField>
              <UFormField label="Description (TH)"><UTextarea v-model="form.descriptionTh" :rows="3" /></UFormField>
            </template>
            <template #en>
              <UFormField label="Name (EN)" class="mb-3"><UInput v-model="form.nameEn" placeholder="Sword" /></UFormField>
              <UFormField label="Description (EN)"><UTextarea v-model="form.descriptionEn" :rows="3" /></UFormField>
            </template>
          </AdminContentLanguageTabs>

          <!-- Images -->
          <div class="grid grid-cols-3 gap-4">
            <AdminMediaPicker v-model="form.portrait" label="Portrait" />
            <AdminMediaPicker v-model="form.infoImage" label="Info Image" />
            <AdminMediaPicker v-model="form.backgroundImage" label="Background" />
          </div>

          <!-- Video -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Video Type">
              <USelect v-model="form.videoType" :items="[{label:'None',value:'NONE'},{label:'YouTube',value:'YOUTUBE'},{label:'Upload',value:'UPLOAD'}]" value-key="value" />
            </UFormField>
            <UFormField label="Video URL"><UInput v-model="form.videoUrl" placeholder="https://youtube.com/..." /></UFormField>
          </div>

          <!-- RPG Stats with Sliders -->
          <div class="rounded-xl border border-white/6 bg-white/2 p-4">
            <h4 class="mb-3 text-sm font-semibold text-white/60">RPG Stats</h4>
            <div class="flex flex-col gap-3">
              <div v-for="stat in statFields" :key="stat.key" class="flex items-center gap-3">
                <span class="w-10 text-xs font-bold text-white/40 text-right">{{ stat.label }}</span>
                <input type="range" :min="0" :max="100" v-model.number="form[stat.key]" class="flex-1 accent-[#d4a843] h-2" />
                <span class="w-8 text-xs text-white/30 text-right font-mono">{{ form[stat.key] }}</span>
              </div>
            </div>
          </div>

          <p v-if="formError" class="text-center text-sm text-red-400">{{ formError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveItem">{{ editorMode === 'create' ? 'Create' : 'Save' }}</UButton>
        </div>
      </template>
    </UModal>

    <AdminConfirmDialog v-model="deleteDialogOpen" title="Delete Weapon?" :message="`Delete '${deletingItem?.nameEn || deletingItem?.name}'?`" confirm-text="Delete" variant="danger" @confirm="doDelete" />
    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface Weapon {
  id: number; name: string; nameEn?: string | null; descriptionEn?: string | null; descriptionTh?: string | null
  portrait?: string | null; infoImage?: string | null; backgroundImage?: string | null; icon?: string | null
  videoType: string; videoUrl?: string | null; sortOrder: number; visible: boolean
  statSTR: number; statINT: number; statAGI: number; statDEX: number; statHP: number
  [key: string]: unknown
}

const weapons = ref<Weapon[]>([])
const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const deleteDialogOpen = ref(false)
const deletingItem = ref<Weapon | null>(null)
const { toast, showToast } = useAdminToast()

const statFields = [
  { key: 'statSTR', label: 'STR' }, { key: 'statINT', label: 'INT' },
  { key: 'statAGI', label: 'AGI' }, { key: 'statDEX', label: 'DEX' }, { key: 'statHP', label: 'HP' },
]

const form = reactive<Record<string, unknown>>({
  name: '', nameEn: '', descriptionEn: '', descriptionTh: '',
  portrait: '', infoImage: '', backgroundImage: '',
  videoType: 'NONE', videoUrl: '',
  statSTR: 50, statINT: 50, statAGI: 50, statDEX: 50, statHP: 50,
})

async function loadWeapons() {
  try { weapons.value = await $fetch<Weapon[]>('/api/admin/weapons') } catch { weapons.value = [] }
}

function openEditor(item: Weapon | null) {
  formError.value = ''
  if (item) {
    editorMode.value = 'edit'; editingId.value = item.id
    Object.assign(form, {
      name: item.name, nameEn: item.nameEn || '', descriptionEn: item.descriptionEn || '', descriptionTh: item.descriptionTh || '',
      portrait: item.portrait || '', infoImage: item.infoImage || '', backgroundImage: item.backgroundImage || '',
      videoType: item.videoType || 'NONE', videoUrl: item.videoUrl || '',
      statSTR: item.statSTR ?? 50, statINT: item.statINT ?? 50, statAGI: item.statAGI ?? 50, statDEX: item.statDEX ?? 50, statHP: item.statHP ?? 50,
    })
  } else {
    editorMode.value = 'create'; editingId.value = null
    Object.assign(form, { name: '', nameEn: '', descriptionEn: '', descriptionTh: '', portrait: '', infoImage: '', backgroundImage: '', videoType: 'NONE', videoUrl: '', statSTR: 50, statINT: 50, statAGI: 50, statDEX: 50, statHP: 50 })
  }
  editorOpen.value = true
}

function handleCopy(from: 'th' | 'en') {
  if (from === 'th') { form.nameEn = form.name; form.descriptionEn = form.descriptionTh }
  else { form.name = form.nameEn as string; form.descriptionTh = form.descriptionEn }
  showToast(`Copied ${from.toUpperCase()} content`)
}

async function saveItem() {
  if (!form.name) { formError.value = 'Name is required.'; return }
  saving.value = true; formError.value = ''
  try {
    const payload = { ...form, sortOrder: editingId.value ? undefined : weapons.value.length, visible: true }
    if (editorMode.value === 'create') { await $fetch('/api/admin/weapons', { method: 'POST', body: payload }) }
    else { await $fetch(`/api/admin/weapons/${editingId.value}`, { method: 'PUT', body: payload }) }
    editorOpen.value = false; showToast(editorMode.value === 'create' ? 'Weapon created!' : 'Weapon updated!')
    await loadWeapons()
  } catch (e: unknown) { formError.value = (e as { data?: { message?: string } })?.data?.message || 'Save failed' }
  finally { saving.value = false }
}

async function toggleVisibility(item: Weapon) {
  try { await $fetch(`/api/admin/weapons/${item.id}`, { method: 'PUT', body: { visible: !item.visible } }); await loadWeapons(); showToast(`Weapon ${!item.visible ? 'shown' : 'hidden'}`) }
  catch { showToast('Failed to update visibility', 'error') }
}

async function reorder(index: number, dir: -1 | 1) {
  const newIndex = index + dir; const arr = [...weapons.value]
  ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
  for (let i = 0; i < arr.length; i++) { await $fetch(`/api/admin/weapons/${arr[i].id}`, { method: 'PUT', body: { sortOrder: i } }) }
  await loadWeapons()
}

function confirmDeleteItem(item: Weapon) { deletingItem.value = item; deleteDialogOpen.value = true }
async function doDelete() {
  if (!deletingItem.value) return
  try { await $fetch(`/api/admin/weapons/${deletingItem.value.id}`, { method: 'DELETE' }); showToast('Weapon deleted'); await loadWeapons() }
  catch { showToast('Delete failed', 'error') }
}

await loadWeapons()
</script>

<style scoped>
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
.gold-btn:hover { filter: brightness(1.1); }
.sort-btn { border: none; background: transparent; color: rgba(255,255,255,0.3); font-size: 0.625rem; cursor: pointer; padding: 2px; }
.sort-btn:hover { color: white; }
.sort-btn:disabled { opacity: 0.2; }
.icon-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; }
.icon-btn:hover { background: rgba(255,255,255,0.08); }
.icon-btn.danger:hover { background: rgba(239,68,68,0.15); }
</style>
