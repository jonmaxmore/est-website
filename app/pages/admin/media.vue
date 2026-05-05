<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.media.title') }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.media.subtitleCount', { count: assets.length, size: totalSize }) }}</p>
      </div>
      <div class="flex gap-2">
        <button v-if="selectedIds.size > 0" class="danger-btn" @click="bulkDeleteOpen = true">
          <UIcon name="i-lucide-trash-2" class="h-4 w-4" /> Delete {{ selectedIds.size }} selected
        </button>
        <label for="media-file-input" class="gold-btn cursor-pointer">
          <UIcon name="i-lucide-upload" class="inline h-4 w-4" /> Upload Files
        </label>
        <input id="media-file-input" type="file" multiple accept="image/*,video/*" class="hidden" @change="handleFileSelect" />
      </div>
    </div>

    <div
      class="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all"
      :class="dragActive ? 'border-[#d4a843] bg-[#d4a843]/5' : 'border-white/10 hover:border-white/20'"
      @dragover.prevent="onDragOver"
      @dragleave="dragActive = false"
      @drop.prevent="handleDrop"
      @click="hiddenFileInput?.click()"
    >
      <input ref="hiddenFileInput" type="file" multiple accept="image/*,video/*" class="hidden" @change="handleFileSelect" />
      <UIcon :name="uploadQueue.length > 0 ? 'i-lucide-loader' : 'i-lucide-folder-open'" class="mx-auto mb-3 block h-8 w-8 opacity-40" />
      <p v-if="uploadQueue.length === 0" class="text-sm text-white/50">
        Drag and drop files here, or click to <span class="font-medium text-[#d4a843]">browse</span>
      </p>
      <p class="mt-1 text-xs text-white/25">PNG, JPG, WebP, AVIF, GIF, MP4 | Max 100MB each</p>
    </div>

    <div v-if="uploadQueue.length > 0" class="mb-4 flex flex-col gap-2">
      <div v-for="item in uploadQueue" :key="item.id" class="flex items-center gap-3 rounded-xl border border-white/6 bg-white/4 px-4 py-3">
        <UIcon
          :name="item.status === 'done' ? 'i-lucide-check-circle' : item.status === 'error' ? 'i-lucide-x-circle' : 'i-lucide-file'"
          class="h-5 w-5 flex-shrink-0"
          :class="item.status === 'done' ? 'text-emerald-400' : item.status === 'error' ? 'text-red-400' : 'text-white/40'"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ item.name }}</p>
          <p class="text-[0.625rem] text-white/30">{{ formatBytes(item.size) }}</p>
          <div v-if="item.status === 'uploading'" class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div class="h-full rounded-full bg-gradient-to-r from-[#d4a843] to-[#e8c468] transition-all duration-200" :style="{ width: `${item.progress}%` }" />
          </div>
          <p v-if="item.status === 'error'" class="mt-1 text-xs text-red-400">{{ item.error }}</p>
        </div>
        <span v-if="item.status === 'uploading'" class="flex-shrink-0 font-mono text-xs tabular-nums text-[#d4a843]">{{ item.progress }}%</span>
        <span v-else-if="item.status === 'done'" class="flex-shrink-0 text-xs text-emerald-400">Done</span>
      </div>
    </div>

    <div class="mb-4 flex items-center gap-3 rounded-2xl border border-white/6 bg-white/4 p-3">
      <UInput v-model="searchQuery" placeholder="Search media..." class="flex-1" />
      <div class="flex overflow-hidden rounded-lg border border-white/6">
        <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><UIcon name="i-lucide-grid-2x2" class="h-4 w-4" /></button>
        <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><UIcon name="i-lucide-list" class="h-4 w-4" /></button>
      </div>
      <label class="flex items-center gap-2 text-xs text-white/40">
        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="accent-[#d4a843]" />
        Select All
      </label>
    </div>

    <div v-if="viewMode === 'grid'" class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))">
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="group relative cursor-pointer overflow-hidden rounded-2xl border bg-white/4 transition-all hover:-translate-y-0.5"
        :class="selectedIds.has(asset.id) ? 'border-[#d4a843] bg-[#d4a843]/5' : 'border-white/6 hover:border-white/15'"
      >
        <div class="absolute left-2 top-2 z-10">
          <input type="checkbox" :checked="selectedIds.has(asset.id)" class="h-4 w-4 accent-[#d4a843]" @change.stop="toggleSelect(asset.id)" @click.stop />
        </div>
        <div class="h-[140px] overflow-hidden bg-black/20" @click="selectAsset(asset)">
          <img
            v-if="asset.mimeType.startsWith('image/')"
            :src="asset.thumbnailUrl || asset.url"
            :alt="asset.altText || asset.originalName"
            class="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div v-else class="flex h-full items-center justify-center">
            <UIcon name="i-lucide-film" class="h-8 w-8 text-white/30" />
          </div>
        </div>
        <div class="p-3" @click="selectAsset(asset)">
          <p class="truncate text-xs font-medium" :title="asset.originalName">{{ asset.originalName }}</p>
          <p class="mt-0.5 text-[0.625rem] text-white/30">{{ formatBytes(asset.sizeBytes) }}</p>
        </div>
        <div class="absolute inset-x-0 bottom-[40px] flex items-center justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button class="hover-action-btn" title="Copy URL" @click.stop="copyUrl(asset.url)"><UIcon name="i-lucide-link" class="h-3.5 w-3.5" /></button>
          <button class="hover-action-btn" title="View Details" @click.stop="selectAsset(asset)"><UIcon name="i-lucide-eye" class="h-3.5 w-3.5" /></button>
          <button class="hover-action-btn danger" title="Delete" @click.stop="confirmDeleteSingle(asset)">x</button>
        </div>
      </div>
    </div>

    <div v-if="viewMode === 'list'" class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6 bg-white/2">
            <th class="w-10 px-3 py-2.5"><input type="checkbox" :checked="allSelected" @change="toggleSelectAll" /></th>
            <th class="w-12"></th>
            <th class="th-cell">Name</th>
            <th class="th-cell">Type</th>
            <th class="th-cell">Size</th>
            <th class="th-cell">Date</th>
            <th class="th-cell w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in filteredAssets" :key="asset.id" class="cursor-pointer border-b border-white/3 hover:bg-white/2" @click="selectAsset(asset)">
            <td class="px-3 py-2"><input type="checkbox" :checked="selectedIds.has(asset.id)" @change.stop="toggleSelect(asset.id)" @click.stop /></td>
            <td class="px-2 py-2">
              <img v-if="asset.mimeType.startsWith('image/')" :src="asset.thumbnailUrl || asset.url" class="h-8 w-8 rounded object-cover" />
            </td>
            <td class="max-w-[200px] truncate px-3 py-2 font-medium">{{ asset.originalName }}</td>
            <td class="px-3 py-2 text-white/40">{{ asset.mimeType.split('/')[1] }}</td>
            <td class="px-3 py-2 text-white/40">{{ formatBytes(asset.sizeBytes) }}</td>
            <td class="px-3 py-2 text-white/30">{{ formatDate(asset.createdAt) }}</td>
            <td class="px-3 py-2">
              <div class="flex gap-1">
                <button class="icon-btn" title="Copy URL" @click.stop="copyUrl(asset.url)"><UIcon name="i-lucide-link" class="h-3.5 w-3.5" /></button>
                <button class="icon-btn danger" @click.stop="confirmDeleteSingle(asset)"><UIcon name="i-lucide-trash-2" class="h-3.5 w-3.5" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminEmptyState v-if="!loading && assets.length === 0" icon="i-lucide-image" title="No media assets" message="Upload images and videos for your content." />

    <UModal v-model:open="detailOpen" title="Asset Details" class="sm:max-w-lg">
      <template #body>
        <div v-if="selectedAsset" class="flex flex-col gap-4 p-4">
          <img v-if="selectedAsset.mimeType.startsWith('image/')" :src="selectedAsset.url" class="max-h-[250px] w-full rounded-lg bg-black/20 object-contain" />
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-[0.625rem] font-semibold uppercase text-white/25">Filename</span>
              <p class="mt-0.5 truncate">{{ selectedAsset.originalName }}</p>
            </div>
            <div>
              <span class="text-[0.625rem] font-semibold uppercase text-white/25">Size</span>
              <p class="mt-0.5">{{ formatBytes(selectedAsset.sizeBytes) }}</p>
            </div>
            <div>
              <span class="text-[0.625rem] font-semibold uppercase text-white/25">Type</span>
              <p class="mt-0.5">{{ selectedAsset.mimeType }}</p>
            </div>
            <div v-if="selectedAsset.width">
              <span class="text-[0.625rem] font-semibold uppercase text-white/25">Dimensions</span>
              <p class="mt-0.5">{{ selectedAsset.width }}x{{ selectedAsset.height }}</p>
            </div>
          </div>
          <UFormField label="Alt Text (for SEO & accessibility)">
            <UInput v-model="editAltText" placeholder="Describe this image..." />
          </UFormField>
          <div>
            <span class="text-[0.625rem] font-semibold uppercase text-white/25">URL</span>
            <div class="mt-1 flex gap-2">
              <UInput :model-value="selectedAsset.url" readonly class="flex-1 text-xs font-mono" />
              <UButton size="sm" variant="ghost" @click="copyUrl(selectedAsset.url)">Copy</UButton>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between gap-3">
          <UButton color="error" variant="soft" @click="confirmDeleteSingle(selectedAsset!)">Delete</UButton>
          <div class="flex gap-2">
            <UButton variant="ghost" @click="detailOpen = false">Close</UButton>
            <UButton :loading="savingAltText" class="bg-gradient-to-br from-[#d4a843] to-[#b8922e] font-bold text-black" @click="saveAltText">Save</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <AdminConfirmDialog v-model="deleteDialogOpen" title="Delete Asset?" :message="deleteMessage" confirm-text="Delete" variant="danger" @confirm="doDelete" />
    <AdminConfirmDialog
      v-model="bulkDeleteOpen"
      title="Delete Selected Assets?"
      :message="`Delete ${selectedIds.size} selected assets? This cannot be undone.`"
      confirm-text="Delete All"
      variant="danger"
      @confirm="doBulkDelete"
    />

    <AdminToast :toast="toast" />
  </div>
</template>

<!--
  ═══ Admin Media Library ═══
  จัดการไฟล์รูปภาพและวีดีโอทั้งหมด

  ฟีเจอร์:
  - Upload: drag-drop หรือ file input (รองรับหลายไฟล์พร้อมกัน)
  - Upload Queue: แสดง progress bar ทีละไฟล์
  - View Mode: grid (thumbnail) / list (table)
  - Search: ค้นหาตามชื่อไฟล์
  - Select: เลือกหลายไฟล์เพื่อ bulk delete
  - Detail: ดูข้อมูล + แก้ alt text + copy URL
  - Bulk Delete: ลบหลายไฟล์พร้อมกัน

  ⚠️ ใช้ useAdminMediaUpload composable สำหรับ XHR upload
  ⚠️ ไฟล์สูงสุด 100MB (ดู media.ts)
-->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()
const { localizedDate } = useLocalizedField()

interface MediaAssetItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: number
  width?: number | null
  height?: number | null
  altText?: string | null
  url: string
  thumbnailUrl?: string | null
  createdAt: string
}

interface UploadQueueItem {
  id: string
  name: string
  size: number
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

const assets = ref<MediaAssetItem[]>([])
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const dragActive = ref(false)
const selectedIds = ref(new Set<string>())
const selectedAsset = ref<MediaAssetItem | null>(null)
const detailOpen = ref(false)
const editAltText = ref('')
const savingAltText = ref(false)
const loading = ref(false)
const deleteDialogOpen = ref(false)
const bulkDeleteOpen = ref(false)
const deleteTarget = ref<MediaAssetItem | null>(null)
const uploadQueue = ref<UploadQueueItem[]>([])
const hiddenFileInput = ref<HTMLInputElement | null>(null)

const { toast, showToast } = useAdminToast()
const { uploadFile, validateFile } = useAdminMediaUpload()

const totalSize = computed(() => {
  const bytes = assets.value.reduce((sum, asset) => sum + asset.sizeBytes, 0)
  return formatBytes(bytes)
})

const filteredAssets = computed(() => {
  if (!searchQuery.value) {
    return assets.value
  }

  const query = searchQuery.value.toLowerCase()
  return assets.value.filter((asset) => asset.originalName.toLowerCase().includes(query))
})

const allSelected = computed(() => filteredAssets.value.length > 0 && filteredAssets.value.every((asset) => selectedIds.value.has(asset.id)))
const deleteMessage = computed(() => (deleteTarget.value ? `Delete "${deleteTarget.value.originalName}"? This cannot be undone.` : ''))

async function loadAssets() {
  loading.value = true

  try {
    assets.value = await $fetch<MediaAssetItem[]>('/api/admin/media')
  } catch (error: any) {
    assets.value = []
    showToast(error?.data?.message || error?.message || 'Failed to load media library', 'error')
  } finally {
    loading.value = false
  }
}

function validateFiles(files: File[]) {
  const valid: File[] = []
  const rejected: string[] = []

  for (const file of files) {
    const validationError = validateFile(file)
    if (validationError) {
      rejected.push(validationError.message)
      continue
    }

    valid.push(file)
  }

  return { valid, rejected }
}

async function uploadFiles(fileList: FileList | File[]) {
  const files = Array.from(fileList)
  if (!files.length) {
    return
  }

  const { valid, rejected } = validateFiles(files)
  for (const message of rejected) {
    showToast(message, 'error', 5000)
  }

  if (!valid.length) {
    return
  }

  const newItems: UploadQueueItem[] = valid.map((file, index) => ({
    id: `upload-${Date.now()}-${index}`,
    name: file.name,
    size: file.size,
    progress: 0,
    status: 'pending',
  }))

  uploadQueue.value.push(...newItems)

  for (let index = 0; index < valid.length; index += 1) {
    const queueItem = newItems[index]
    const file = valid[index]

    if (!queueItem || !file) {
      continue
    }

    try {
      queueItem.status = 'uploading'
      await uploadFile(file, (percent) => {
        queueItem.progress = percent
      })
      queueItem.status = 'done'
      queueItem.progress = 100
    } catch (error: any) {
      queueItem.status = 'error'
      queueItem.error = error?.message || error?.data?.message || 'Upload failed'
    }
  }

  const doneCount = newItems.filter((item) => item.status === 'done').length
  if (doneCount > 0) {
    showToast(`Uploaded ${doneCount} file(s) successfully`)
    await loadAssets()
  }

  setTimeout(() => {
    uploadQueue.value = uploadQueue.value.filter((item) => item.status !== 'done')
  }, 3000)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer?.types.includes('Files')) {
    dragActive.value = true
  }
}

function handleDrop(event: DragEvent) {
  dragActive.value = false
  if (event.dataTransfer?.files) {
    uploadFiles(event.dataTransfer.files)
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    uploadFiles(input.files)
  }

  input.value = ''
}

function selectAsset(asset: MediaAssetItem) {
  selectedAsset.value = asset
  editAltText.value = asset.altText || ''
  detailOpen.value = true
}

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }

  selectedIds.value = new Set(selectedIds.value)
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
    return
  }

  selectedIds.value = new Set(filteredAssets.value.map((asset) => asset.id))
}

function confirmDeleteSingle(asset: MediaAssetItem) {
  deleteTarget.value = asset
  deleteDialogOpen.value = true
}

async function doDelete() {
  if (!deleteTarget.value) {
    return
  }

  try {
    await $fetch(`/api/admin/media/${deleteTarget.value.id}`, { method: 'DELETE' })
    selectedIds.value.delete(deleteTarget.value.id)
    selectedIds.value = new Set(selectedIds.value)
    showToast('Asset deleted')
    detailOpen.value = false
    await loadAssets()
  } catch {
    showToast('Delete failed', 'error')
  }
}

async function doBulkDelete() {
  for (const id of selectedIds.value) {
    try {
      await $fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    } catch {
      showToast('Some assets could not be deleted', 'error')
    }
  }

  selectedIds.value = new Set()
  showToast('Selected assets deleted')
  await loadAssets()
}

async function saveAltText() {
  if (!selectedAsset.value) {
    return
  }

  savingAltText.value = true

  try {
    const updatedAsset = await $fetch<MediaAssetItem>(`/api/admin/media/${selectedAsset.value.id}`, {
      method: 'PATCH',
      body: {
        altText: editAltText.value.trim() || null,
      },
    })

    selectedAsset.value = updatedAsset
    assets.value = assets.value.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset))
    showToast('Alt text saved')
    detailOpen.value = false
  } catch (error: any) {
    showToast(error?.data?.message || error?.message || 'Failed to save alt text', 'error')
  } finally {
    savingAltText.value = false
  }
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    showToast('URL copied to clipboard')
  } catch {
    showToast('Failed to copy URL', 'error')
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatDate(date: string) {
  return localizedDate(date, { month: 'short', day: 'numeric', year: 'numeric' })
}

// SSR-safe: admin auth is client-cookie based, so fetch on client only
onMounted(loadAssets)
</script>

<style scoped>
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
.gold-btn:hover { filter: brightness(1.1); }
.danger-btn { padding: 9px 16px; border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 0.8125rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.danger-btn:hover { background: rgba(239,68,68,0.15); }
.view-btn { padding: 6px 10px; border: none; background: transparent; color: rgba(255,255,255,0.3); font-size: 1rem; cursor: pointer; transition: all 0.15s; }
.view-btn.active { background: rgba(212,168,67,0.1); color: #d4a843; }
.view-btn:hover:not(.active) { color: white; }
.th-cell { padding: 8px 12px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); }
.icon-btn { display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
.icon-btn:hover { background: rgba(255,255,255,0.08); }
.icon-btn.danger:hover { background: rgba(239,68,68,0.15); }
.hover-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  border: none; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  color: white; font-size: 0.75rem; cursor: pointer;
  transition: all 0.15s;
}
.hover-action-btn:hover { background: rgba(212,168,67,0.4); }
.hover-action-btn.danger:hover { background: rgba(239,68,68,0.5); }
</style>
