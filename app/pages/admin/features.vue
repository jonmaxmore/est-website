<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div><h2 class="text-2xl font-bold">Features</h2><p class="mt-1 text-sm text-white/50">Manage homepage feature cards</p></div>
      <UButton color="primary" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="openEditor(null)">+ New Feature</UButton>
    </div>

    <!-- Items List -->
    <div class="flex flex-col gap-3">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/4 p-4 transition-all hover:border-white/15"
      >
        <!-- Sort -->
        <div class="flex flex-col gap-1">
          <button class="text-xs text-white/30 hover:text-white disabled:opacity-20" :disabled="index === 0" @click="reorder(index, -1)">▲</button>
          <button class="text-xs text-white/30 hover:text-white disabled:opacity-20" :disabled="index === items.length - 1" @click="reorder(index, 1)">▼</button>
        </div>
        <!-- Icon & Image -->
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/4 text-2xl">{{ item.icon }}</div>
        <img v-if="item.image" :src="item.image" class="h-12 w-20 rounded-lg object-cover" />
        <!-- Info -->
        <div class="flex-1">
          <p class="font-semibold">{{ item.titleEn }}</p>
          <p class="text-xs text-white/40">{{ item.titleTh }} · {{ item.key }}</p>
        </div>
        <!-- Visibility -->
        <label class="flex items-center gap-2 text-xs text-white/40">
          <input type="checkbox" :checked="item.visible" @change="toggleVisibility(item)" class="accent-gold" />
          {{ item.visible ? 'Visible' : 'Hidden' }}
        </label>
        <!-- Actions -->
        <div class="flex gap-1">
          <button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/8" @click="openEditor(item)">✏️</button>
          <button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-red-500/15" @click="confirmDelete(item)">🗑️</button>
        </div>
      </div>
      <p v-if="items.length === 0" class="py-12 text-center text-white/30">No features yet. Create one to get started.</p>
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create Feature' : 'Edit Feature'" class="sm:max-w-2xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Key *"><UInput v-model="form.key" placeholder="openWorld" /></UFormField>
            <UFormField label="Icon"><UInput v-model="form.icon" placeholder="🌍" /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Title (EN) *"><UInput v-model="form.titleEn" placeholder="Open World" /></UFormField>
            <UFormField label="Title (TH) *"><UInput v-model="form.titleTh" placeholder="โลกเปิดกว้าง" /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Description (EN)"><UTextarea v-model="form.descriptionEn" :rows="2" /></UFormField>
            <UFormField label="Description (TH)"><UTextarea v-model="form.descriptionTh" :rows="2" /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Detail (EN)"><UTextarea v-model="form.detailEn" :rows="4" /></UFormField>
            <UFormField label="Detail (TH)"><UTextarea v-model="form.detailTh" :rows="4" /></UFormField>
          </div>
          <UFormField label="Image URL"><UInput v-model="form.image" placeholder="/images/features/..." /></UFormField>
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

interface FeatureItem {
  id: number; key: string; titleEn: string; titleTh: string
  descriptionEn?: string; descriptionTh?: string; detailEn?: string; detailTh?: string
  icon: string; image?: string; sortOrder: number; visible: boolean
}

const items = ref<FeatureItem[]>([])
const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const { toast, showToast } = useAdminToast()

const form = reactive({
  key: '', titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '',
  detailEn: '', detailTh: '', icon: '⭐', image: '',
})

async function loadItems() {
  try { items.value = await $fetch<FeatureItem[]>('/api/admin/features') } catch { items.value = [] }
}

function openEditor(item: FeatureItem | null) {
  formError.value = ''
  if (item) {
    editorMode.value = 'edit'; editingId.value = item.id
    Object.assign(form, { key: item.key, titleEn: item.titleEn, titleTh: item.titleTh, descriptionEn: item.descriptionEn || '', descriptionTh: item.descriptionTh || '', detailEn: item.detailEn || '', detailTh: item.detailTh || '', icon: item.icon, image: item.image || '' })
  } else {
    editorMode.value = 'create'; editingId.value = null
    Object.assign(form, { key: '', titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '', detailEn: '', detailTh: '', icon: '⭐', image: '' })
  }
  editorOpen.value = true
}

async function saveItem() {
  if (!form.key || !form.titleEn || !form.titleTh) { formError.value = 'Key, Title (EN), and Title (TH) are required.'; return }
  saving.value = true; formError.value = ''
  try {
    const payload = { ...form, sortOrder: editingId.value ? undefined : items.value.length, visible: true }
    if (editorMode.value === 'create') { await $fetch('/api/admin/features', { method: 'POST', body: payload }) }
    else { await $fetch(`/api/admin/features/${editingId.value}`, { method: 'PUT', body: payload }) }
    editorOpen.value = false; showToast(editorMode.value === 'create' ? 'Feature created!' : 'Feature updated!')
    await loadItems()
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; formError.value = err?.data?.message || 'Save failed' }
  finally { saving.value = false }
}

async function toggleVisibility(item: FeatureItem) {
  try {
    await $fetch(`/api/admin/features/${item.id}`, { method: 'PUT', body: { visible: !item.visible } })
    await loadItems(); showToast(`Feature ${!item.visible ? 'shown' : 'hidden'}`)
  } catch { showToast('Failed to update visibility', 'error') }
}

async function reorder(index: number, dir: -1 | 1) {
  const newIndex = index + dir
  const arr = [...items.value]
  ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
  for (let i = 0; i < arr.length; i++) {
    await $fetch(`/api/admin/features/${arr[i].id}`, { method: 'PUT', body: { sortOrder: i } })
  }
  await loadItems()
}

async function confirmDelete(item: FeatureItem) {
  if (!confirm(`Delete "${item.titleEn}"?`)) return
  try { await $fetch(`/api/admin/features/${item.id}`, { method: 'DELETE' }); showToast('Feature deleted'); await loadItems() }
  catch { showToast('Delete failed', 'error') }
}

await loadItems()
</script>
