<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div><h2 class="text-2xl font-bold">FAQ Management</h2><p class="mt-1 text-sm text-white/50">Manage frequently asked questions (bilingual)</p></div>
      <UButton class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="openEditor(null)">+ New FAQ</UButton>
    </div>

    <div class="flex flex-col gap-3">
      <div v-for="(item, index) in items" :key="index"
        class="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/4 p-4 transition-all hover:border-white/15">
        <div class="flex flex-col gap-1">
          <button class="text-xs text-white/30 hover:text-white disabled:opacity-20" :disabled="index === 0" @click="reorder(index, -1)">▲</button>
          <button class="text-xs text-white/30 hover:text-white disabled:opacity-20" :disabled="index === items.length - 1" @click="reorder(index, 1)">▼</button>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate">{{ item.labelEn }}</p>
          <p class="text-xs text-white/40 truncate">{{ item.labelTh }}</p>
        </div>
        <label class="flex items-center gap-2 text-xs text-white/40">
          <input type="checkbox" :checked="item.visible" @change="toggleVisibility(index)" class="accent-gold" />
          {{ item.visible ? 'Visible' : 'Hidden' }}
        </label>
        <div class="flex gap-1">
          <button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/8" @click="openEditor(item, index)">✏️</button>
          <button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-red-500/15" @click="confirmDelete(index)">🗑️</button>
        </div>
      </div>
      <p v-if="items.length === 0" class="py-12 text-center text-white/30">No FAQ items yet. Create one to get started.</p>
    </div>

    <UModal v-model:open="editorOpen" :title="editingIndex !== null ? 'Edit FAQ' : 'Create FAQ'" class="sm:max-w-2xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Question (EN) *"><UInput v-model="form.labelEn" placeholder="What is...?" /></UFormField>
            <UFormField label="Question (TH) *"><UInput v-model="form.labelTh" placeholder="คืออะไร...?" /></UFormField>
          </div>
          <UFormField label="Answer (EN) *"><UTextarea v-model="form.contentEn" :rows="4" /></UFormField>
          <UFormField label="Answer (TH) *"><UTextarea v-model="form.contentTh" :rows="4" /></UFormField>
          <p v-if="formError" class="text-center text-sm text-red-400">{{ formError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveItem">{{ editingIndex !== null ? 'Save' : 'Create' }}</UButton>
        </div>
      </template>
    </UModal>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface FaqItem { labelEn: string; labelTh: string; contentEn: string; contentTh: string; visible: boolean }

const items = ref<FaqItem[]>([])
const editorOpen = ref(false)
const editingIndex = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const { toast, showToast } = useAdminToast()

const form = reactive({ labelEn: '', labelTh: '', contentEn: '', contentTh: '' })

async function loadItems() {
  try {
    const data = await $fetch<{ value: FaqItem[] }>('/api/admin/config?key=faq')
    if (data?.value && Array.isArray(data.value)) items.value = data.value
    else if (Array.isArray(data)) items.value = data as unknown as FaqItem[]
  } catch { items.value = [] }
}

function openEditor(item: FaqItem | null, index?: number) {
  formError.value = ''
  if (item && index !== undefined) {
    editingIndex.value = index
    Object.assign(form, { labelEn: item.labelEn, labelTh: item.labelTh, contentEn: item.contentEn, contentTh: item.contentTh })
  } else {
    editingIndex.value = null
    Object.assign(form, { labelEn: '', labelTh: '', contentEn: '', contentTh: '' })
  }
  editorOpen.value = true
}

async function saveAll() {
  await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'faq', value: items.value } })
}

async function saveItem() {
  if (!form.labelEn || !form.labelTh || !form.contentEn || !form.contentTh) { formError.value = 'All fields are required.'; return }
  saving.value = true; formError.value = ''
  try {
    if (editingIndex.value !== null) {
      items.value[editingIndex.value] = { ...form, visible: items.value[editingIndex.value].visible }
    } else {
      items.value.push({ ...form, visible: true })
    }
    await saveAll()
    editorOpen.value = false; showToast(editingIndex.value !== null ? 'FAQ updated!' : 'FAQ created!')
  } catch { showToast('Save failed', 'error') }
  finally { saving.value = false }
}

async function toggleVisibility(index: number) {
  items.value[index].visible = !items.value[index].visible
  await saveAll()
  showToast(`FAQ ${items.value[index].visible ? 'shown' : 'hidden'}`)
}

async function reorder(index: number, dir: -1 | 1) {
  const newIndex = index + dir
  ;[items.value[index], items.value[newIndex]] = [items.value[newIndex], items.value[index]]
  await saveAll()
}

async function confirmDelete(index: number) {
  if (!confirm(`Delete "${items.value[index].labelEn}"?`)) return
  items.value.splice(index, 1)
  await saveAll()
  showToast('FAQ deleted')
}

await loadItems()
</script>
