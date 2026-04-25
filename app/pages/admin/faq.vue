<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">FAQ Management</h2>
        <p class="mt-1 text-sm text-white/50">Manage frequently asked questions (bilingual)</p>
      </div>
      <button class="gold-btn" @click="openEditor(null)">+ New FAQ</button>
    </div>

    <div class="flex flex-col gap-3">
      <div v-for="(item, index) in items" :key="index" class="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/4 p-4 transition-all hover:border-white/15">
        <div class="flex flex-col gap-1">
          <button class="sort-btn" :disabled="index === 0" @click="reorder(index, -1)">▲</button>
          <button class="sort-btn" :disabled="index === items.length - 1" @click="reorder(index, 1)">▼</button>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate">{{ item.labelEn }}</p>
          <p class="text-xs text-white/40 truncate">{{ item.labelTh }}</p>
        </div>
        <AdminStatusBadge :status="item.visible ? 'VISIBLE' : 'HIDDEN'" />
        <label class="flex items-center">
          <input type="checkbox" :checked="item.visible" @change="toggleVisibility(index)" class="accent-[#d4a843]" />
        </label>
        <div class="flex gap-1">
          <button class="icon-btn" @click="openEditor(item, index)"><UIcon name="i-lucide-pencil" class="w-4 h-4" /></button>
          <button class="icon-btn danger" @click="confirmDeleteItem(index)"><UIcon name="i-lucide-trash-2" class="w-4 h-4" /></button>
        </div>
      </div>
      <AdminEmptyState v-if="items.length === 0" icon="i-lucide-help-circle" title="No FAQ items yet" message="Create questions and answers for your FAQ page." action-label="+ New FAQ" @action="openEditor(null)" />
    </div>

    <UModal v-model:open="editorOpen" :title="editingIndex !== null ? 'Edit FAQ' : 'Create FAQ'" class="sm:max-w-3xl">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <AdminContentLanguageTabs :th-filled="!!form.labelTh && !!form.contentTh" :en-filled="!!form.labelEn && !!form.contentEn" show-copy-button @copy="handleCopy">
            <template #th>
              <UFormField label="Question (TH) *" class="mb-4"><UInput v-model="form.labelTh" placeholder="คำถามภาษาไทย?" /></UFormField>
              <div class="mb-2 text-sm font-medium text-white/60">Answer (TH) *</div>
              <AdminRichTextEditor v-model="form.contentTh" placeholder="คำตอบภาษาไทย..." />
            </template>
            <template #en>
              <UFormField label="Question (EN) *" class="mb-4"><UInput v-model="form.labelEn" placeholder="English question?" /></UFormField>
              <div class="mb-2 text-sm font-medium text-white/60">Answer (EN) *</div>
              <AdminRichTextEditor v-model="form.contentEn" placeholder="English answer..." />
            </template>
          </AdminContentLanguageTabs>
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

    <AdminConfirmDialog v-model="deleteDialogOpen" title="Delete FAQ?" :message="`Delete this FAQ item? This cannot be undone.`" confirm-text="Delete" variant="danger" @confirm="doDelete" />
    <AdminToast :toast="toast" />
  </div>
</template>

<!--
  ═══ Admin FAQ Manager ═══
  จัดการคำถามที่พบบ่อย (2 ภาษา)

  ⚠️ เก็บข้อมูลแบบ config-based (ไม่มี table แยก)
     ทุกการแก้ไขจะ PUT ทั้ง array ลง siteConfig key='faq'
     ต่างจาก highlights/weapons ที่เก็บทีละตัวใน DB

  ฟีเจอร์:
  - CRUD: สร้าง/แก้ไข/ลบ FAQ
  - Reorder: เลื่อนลำดับ
  - Visibility toggle
  - RichTextEditor สำหรับคำตอบ
-->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface FaqItem { labelEn: string; labelTh: string; contentEn: string; contentTh: string; visible: boolean }

const items = ref<FaqItem[]>([])
const editorOpen = ref(false)
const editingIndex = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const deleteDialogOpen = ref(false)
const deleteIndex = ref<number | null>(null)
const { toast, showToast } = useAdminToast()

const form = reactive({ labelEn: '', labelTh: '', contentEn: '', contentTh: '' })

async function loadItems() {
  try {
    const data = await $fetch<FaqItem[] | null>('/api/admin/config?key=faq')
    if (Array.isArray(data)) items.value = data
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

function handleCopy(from: 'th' | 'en') {
  if (from === 'th') { form.labelEn = form.labelTh; form.contentEn = form.contentTh }
  else { form.labelTh = form.labelEn; form.contentTh = form.contentEn }
  showToast(`Copied ${from.toUpperCase()} content`)
}

/**
 * บันทึก FAQ ทั้ง array ลง siteConfig key='faq' พร้อมกัน
 * (ไม่เหมือน CRUD แยกทีละตัว — ส่งทั้งหมดทุกครั้ง)
 */
async function saveAll() {
  await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'faq', value: items.value } })
}

async function saveItem() {
  if ((!form.labelEn && !form.labelTh) || (!form.contentEn && !form.contentTh)) {
    formError.value = 'At least one language of question and answer is required.'; return
  }
  saving.value = true; formError.value = ''
  try {
    if (editingIndex.value !== null) {
      items.value[editingIndex.value] = { ...form, visible: items.value[editingIndex.value]!.visible }
    } else {
      items.value.push({ ...form, visible: true })
    }
    await saveAll()
    editorOpen.value = false; showToast(editingIndex.value !== null ? 'FAQ updated!' : 'FAQ created!')
  } catch { showToast('Save failed', 'error') }
  finally { saving.value = false }
}

async function toggleVisibility(index: number) {
  items.value[index]!.visible = !items.value[index]!.visible
  await saveAll()
  showToast(`FAQ ${items.value[index]!.visible ? 'shown' : 'hidden'}`)
}

async function reorder(index: number, dir: -1 | 1) {
  const newIndex = index + dir
  const a = items.value[index]; const b = items.value[newIndex]
  if (a && b) { items.value[index] = b; items.value[newIndex] = a }
  await saveAll()
}

function confirmDeleteItem(index: number) { deleteIndex.value = index; deleteDialogOpen.value = true }

async function doDelete() {
  if (deleteIndex.value === null) return
  items.value.splice(deleteIndex.value, 1)
  await saveAll()
  showToast('FAQ deleted')
}

await loadItems()
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
