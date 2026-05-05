<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Features</h2>
        <p class="mt-1 text-sm text-white/50">Manage homepage feature cards</p>
      </div>
      <button class="gold-btn" @click="openEditor(null)">+ New Feature</button>
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
          <button class="sort-btn" :disabled="index === 0" @click="reorder(index, -1)">▲</button>
          <button class="sort-btn" :disabled="index === items.length - 1" @click="reorder(index, 1)">▼</button>
        </div>
        <!-- Icon & Image -->
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/4 text-2xl">{{ item.icon }}</div>
        <img v-if="item.image" :src="item.image" class="h-12 w-20 rounded-lg object-cover" />
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="font-semibold">{{ item.titleEn }}</p>
          <p class="text-xs text-white/40 truncate">{{ item.titleTh }} · {{ item.key }}</p>
        </div>
        <!-- Visibility -->
        <label class="flex items-center gap-2 text-xs text-white/40">
          <input type="checkbox" :checked="item.visible" @change="toggleVisibility(item)" class="accent-[#d4a843]" />
          <AdminStatusBadge :status="item.visible ? 'VISIBLE' : 'HIDDEN'" />
        </label>
        <!-- Actions -->
        <div class="flex gap-1">
          <button class="icon-btn" @click="openEditor(item)"><UIcon name="i-lucide-pencil" class="w-4 h-4" /></button>
          <button class="icon-btn danger" @click="confirmDeleteItem(item)"><UIcon name="i-lucide-trash-2" class="w-4 h-4" /></button>
        </div>
      </div>
      <AdminEmptyState v-if="items.length === 0" icon="i-lucide-sparkles" title="No features yet" message="Create feature cards to showcase on your homepage." action-label="+ New Feature" @action="openEditor(null)" />
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create Feature' : 'Edit Feature'" class="sm:max-w-3xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Key *">
              <UInput v-model="form.key" placeholder="openWorld" :class="{ 'ring-1 ring-red-500/50': fieldErrors.key }" @input="fieldErrors.key = ''" />
              <p v-if="fieldErrors.key" class="mt-1 text-xs text-red-400">{{ fieldErrors.key }}</p>
            </UFormField>
            <UFormField label="Icon"><UInput v-model="form.icon" placeholder="🌍" /></UFormField>
          </div>

          <!-- Language Tabs with error badges -->
          <AdminContentLanguageTabs
            ref="langTabsRef"
            :th-filled="!!form.titleTh"
            :en-filled="!!form.titleEn"
            :th-errors="tabErrors.th"
            :en-errors="tabErrors.en"
            show-copy-button
            @copy="handleCopy"
          >
            <template #th>
              <UFormField label="Title (TH) *" class="mb-3">
                <UInput v-model="form.titleTh" placeholder="โลกเปิดกว้าง" :class="{ 'ring-1 ring-red-500/50': fieldErrors.titleTh }" @input="fieldErrors.titleTh = ''" />
                <p v-if="fieldErrors.titleTh" class="mt-1 text-xs text-red-400">{{ fieldErrors.titleTh }}</p>
              </UFormField>
              <UFormField label="Description (TH)" class="mb-3"><UTextarea v-model="form.descriptionTh" :rows="2" /></UFormField>
              <div class="mb-2 text-sm font-medium text-white/60">Detail (TH)</div>
              <LazyAdminRichTextEditor v-model="form.detailTh" placeholder="รายละเอียดเพิ่มเติม..." />
            </template>
            <template #en>
              <UFormField label="Title (EN) *" class="mb-3">
                <UInput v-model="form.titleEn" placeholder="Open World" :class="{ 'ring-1 ring-red-500/50': fieldErrors.titleEn }" @input="fieldErrors.titleEn = ''" />
                <p v-if="fieldErrors.titleEn" class="mt-1 text-xs text-red-400">{{ fieldErrors.titleEn }}</p>
              </UFormField>
              <UFormField label="Description (EN)" class="mb-3"><UTextarea v-model="form.descriptionEn" :rows="2" /></UFormField>
              <div class="mb-2 text-sm font-medium text-white/60">Detail (EN)</div>
              <LazyAdminRichTextEditor v-model="form.detailEn" placeholder="Additional details..." />
            </template>
          </AdminContentLanguageTabs>

          <!-- Image -->
          <AdminMediaPicker v-model="form.image" label="Feature Image" />

          <p v-if="formError" class="text-center text-sm text-red-400">{{ formError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveItem">
            {{ editorMode === 'create' ? 'Create' : 'Save' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Confirm Delete -->
    <AdminConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete Feature?"
      :message="`Delete '${deletingItem?.titleEn}'? This cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="doDelete"
    />

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
const deleteDialogOpen = ref(false)
const deletingItem = ref<FeatureItem | null>(null)
const validationTriggered = ref(false)
const langTabsRef = ref<{ focusFirstError: () => void } | null>(null)
const { toast, showToast } = useAdminToast()

const form = reactive({
  key: '', titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '',
  detailEn: '', detailTh: '', icon: '⭐', image: '',
})

const fieldErrors = reactive<Record<string, string>>({ key: '', titleEn: '', titleTh: '' })

const tabErrors = computed(() => {
  const th: string[] = []
  const en: string[] = []
  if (!validationTriggered.value) return { th, en }
  if (!form.titleTh && !form.titleEn) { th.push('Title required'); en.push('Title required') }
  return { th, en }
})

async function loadItems() {
  try { items.value = await $fetch<FeatureItem[]>('/api/admin/features') }
  catch (err: any) { showToast(err?.data?.message || 'Failed to load features', 'error'); items.value = [] }
}

function openEditor(item: FeatureItem | null) {
  formError.value = ''
  validationTriggered.value = false
  Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')
  if (item) {
    editorMode.value = 'edit'; editingId.value = item.id
    Object.assign(form, { key: item.key, titleEn: item.titleEn, titleTh: item.titleTh, descriptionEn: item.descriptionEn || '', descriptionTh: item.descriptionTh || '', detailEn: item.detailEn || '', detailTh: item.detailTh || '', icon: item.icon, image: item.image || '' })
  } else {
    editorMode.value = 'create'; editingId.value = null
    Object.assign(form, { key: '', titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '', detailEn: '', detailTh: '', icon: '⭐', image: '' })
  }
  editorOpen.value = true
}

function handleCopy(from: 'th' | 'en') {
  if (from === 'th') { form.titleEn = form.titleTh; form.descriptionEn = form.descriptionTh; form.detailEn = form.detailTh }
  else { form.titleTh = form.titleEn; form.descriptionTh = form.descriptionEn; form.detailTh = form.detailEn }
  showToast(`Copied ${from.toUpperCase()} content`)
}

function validate(): boolean {
  validationTriggered.value = true
  let valid = true
  Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')
  if (!form.key) { fieldErrors.key = 'Key is required'; valid = false }
  if (!form.titleEn && !form.titleTh) {
    fieldErrors.titleEn = 'At least one title required'
    fieldErrors.titleTh = 'At least one title required'
    valid = false
  }
  if (!valid) nextTick(() => langTabsRef.value?.focusFirstError())
  return valid
}

async function saveItem() {
  if (!validate()) { formError.value = 'Please fix the errors above.'; return }
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
  const a = arr[index]; const b = arr[newIndex]
  if (a && b) { arr[index] = b; arr[newIndex] = a }
  for (let i = 0; i < arr.length; i++) {
    await $fetch(`/api/admin/features/${arr[i]!.id}`, { method: 'PUT', body: { sortOrder: i } })
  }
  await loadItems()
}

function confirmDeleteItem(item: FeatureItem) {
  deletingItem.value = item
  deleteDialogOpen.value = true
}

async function doDelete() {
  if (!deletingItem.value) return
  try { await $fetch(`/api/admin/features/${deletingItem.value.id}`, { method: 'DELETE' }); showToast('Feature deleted'); await loadItems() }
  catch { showToast('Delete failed', 'error') }
}

// SSR-safe: admin auth is client-cookie based, so fetch on client only
onMounted(loadItems)
</script>

<style scoped>
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.sort-btn { border: none; background: transparent; color: rgba(255,255,255,0.3); font-size: 0.625rem; cursor: pointer; padding: 2px; }
.sort-btn:hover { color: white; }
.sort-btn:disabled { opacity: 0.2; cursor: default; }
.icon-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
.icon-btn:hover { background: rgba(255,255,255,0.08); }
.icon-btn.danger:hover { background: rgba(239,68,68,0.15); }
</style>
