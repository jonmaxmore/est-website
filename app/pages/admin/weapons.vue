<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div><h2 class="text-2xl font-bold">Weapons</h2><p class="mt-1 text-sm text-white/50">Manage game weapon data and stats</p></div>
      <UButton class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="openEditor(null)">+ New Weapon</UButton>
    </div>

    <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))">
      <div v-for="(weapon, index) in weapons" :key="weapon.id"
        class="flex gap-5 rounded-2xl border p-5 transition-colors border-white/6 bg-white/4 hover:border-white/15">
        <!-- Sort -->
        <div class="flex flex-col items-center gap-1 pt-2">
          <button class="text-xs text-white/30 hover:text-white disabled:opacity-20" :disabled="index === 0" @click="reorder(index, -1)">▲</button>
          <button class="text-xs text-white/30 hover:text-white disabled:opacity-20" :disabled="index === weapons.length - 1" @click="reorder(index, 1)">▼</button>
        </div>
        <!-- Portrait -->
        <div class="relative w-[80px] flex-shrink-0">
          <img :src="weapon.portrait || '/images/logo.webp'" :alt="weapon.name" class="w-full rounded-lg" />
          <span v-if="!weapon.visible" class="absolute top-1 right-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[0.5rem] font-semibold text-red-400">Hidden</span>
        </div>
        <!-- Info -->
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold">{{ weapon.nameEn || weapon.name }}</h3>
          <p class="mt-0.5 text-xs text-white/40">{{ weapon.name }}</p>
          <p class="mt-1.5 text-sm leading-relaxed text-white/50 line-clamp-2">{{ weapon.descriptionEn || '—' }}</p>
          <!-- Stats bar -->
          <div v-if="weapon.statSTR" class="mt-2 flex gap-1">
            <div v-for="stat in ['STR','INT','AGI','DEX','HP']" :key="stat" class="flex-1">
              <div class="text-[0.5rem] text-white/20 text-center">{{ stat }}</div>
              <div class="h-1 rounded-full bg-white/5 overflow-hidden"><div class="h-full rounded-full bg-gold/60" :style="{width: `${weapon['stat'+stat] || 50}%`}"></div></div>
            </div>
          </div>
        </div>
        <!-- Actions -->
        <div class="flex flex-col gap-1">
          <button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/8" @click="openEditor(weapon)">✏️</button>
          <button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-red-500/15" @click="confirmDelete(weapon)">🗑️</button>
          <label class="flex items-center justify-center mt-1">
            <input type="checkbox" :checked="weapon.visible" @change="toggleVisibility(weapon)" class="accent-gold" />
          </label>
        </div>
      </div>
      <p v-if="weapons.length === 0" class="col-span-full py-12 text-center text-white/30">No weapons yet. Create one to get started.</p>
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create Weapon' : 'Edit Weapon'" class="sm:max-w-3xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Name (TH) *"><UInput v-model="form.name" placeholder="ดาบ" /></UFormField>
            <UFormField label="Name (EN)"><UInput v-model="form.nameEn" placeholder="Sword" /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Description (EN)"><UTextarea v-model="form.descriptionEn" :rows="2" /></UFormField>
            <UFormField label="Description (TH)"><UTextarea v-model="form.descriptionTh" :rows="2" /></UFormField>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Portrait URL"><UInput v-model="form.portrait" placeholder="/images/weapons/..." /></UFormField>
            <UFormField label="Info Image"><UInput v-model="form.infoImage" placeholder="/images/weapons/..." /></UFormField>
            <UFormField label="Background"><UInput v-model="form.backgroundImage" placeholder="/images/..." /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Video Type">
              <USelect v-model="form.videoType" :items="[{label:'None',value:'NONE'},{label:'YouTube',value:'YOUTUBE'},{label:'Upload',value:'UPLOAD'}]" value-key="value" />
            </UFormField>
            <UFormField label="Video URL"><UInput v-model="form.videoUrl" placeholder="https://youtube.com/..." /></UFormField>
          </div>
          <!-- RPG Stats -->
          <div class="rounded-xl border border-white/6 bg-white/2 p-4">
            <h4 class="mb-3 text-sm font-semibold text-white/60">⚔️ RPG Stats (0-100)</h4>
            <div class="grid grid-cols-5 gap-4">
              <UFormField v-for="stat in statFields" :key="stat.key" :label="stat.label">
                <UInput v-model.number="form[stat.key]" type="number" :min="0" :max="100" />
              </UFormField>
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
    Object.assign(form, {
      name: '', nameEn: '', descriptionEn: '', descriptionTh: '',
      portrait: '', infoImage: '', backgroundImage: '',
      videoType: 'NONE', videoUrl: '',
      statSTR: 50, statINT: 50, statAGI: 50, statDEX: 50, statHP: 50,
    })
  }
  editorOpen.value = true
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
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; formError.value = err?.data?.message || 'Save failed' }
  finally { saving.value = false }
}

async function toggleVisibility(item: Weapon) {
  try {
    await $fetch(`/api/admin/weapons/${item.id}`, { method: 'PUT', body: { visible: !item.visible } })
    await loadWeapons(); showToast(`Weapon ${!item.visible ? 'shown' : 'hidden'}`)
  } catch { showToast('Failed to update visibility', 'error') }
}

async function reorder(index: number, dir: -1 | 1) {
  const newIndex = index + dir
  const arr = [...weapons.value]
  ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
  for (let i = 0; i < arr.length; i++) {
    await $fetch(`/api/admin/weapons/${arr[i].id}`, { method: 'PUT', body: { sortOrder: i } })
  }
  await loadWeapons()
}

async function confirmDelete(item: Weapon) {
  if (!confirm(`Delete "${item.nameEn || item.name}"?`)) return
  try { await $fetch(`/api/admin/weapons/${item.id}`, { method: 'DELETE' }); showToast('Weapon deleted'); await loadWeapons() }
  catch { showToast('Delete failed', 'error') }
}

await loadWeapons()
</script>
