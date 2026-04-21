<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Media Library</h2>
        <p class="mt-1 text-sm text-white/50">{{ assets.length }} assets · {{ totalSize }}</p>
      </div>
      <div class="flex gap-2">
        <button v-if="selectedIds.size > 0" class="danger-btn" @click="bulkDeleteOpen = true">
          <UIcon name="i-lucide-trash-2" class="w-4 h-4" /> Delete {{ selectedIds.size }} selected
        </button>
        <label for="media-file-input" class="gold-btn" style="cursor:pointer"><UIcon name="i-lucide-upload" class="w-4 h-4 inline" /> Upload Files</label>
        <input id="media-file-input" type="file" multiple accept="image/*,video/*" class="hidden" @change="handleFileSelect" />
      </div>
    </div>

    <!-- Upload Zone -->
    <div
      class="mb-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer"
      :class="dragActive ? 'border-[#d4a843] bg-[#d4a843]/5' : 'border-white/10 hover:border-white/20'"
      @dragover.prevent="onDragOver"
      @dragleave="dragActive = false"
      @drop.prevent="handleDrop"
      @click="($refs.hiddenFileInput as HTMLInputElement)?.click()"
    >
      <input ref="hiddenFileInput" type="file" multiple accept="image/*,video/*" class="hidden" @change="handleFileSelect" />
      <UIcon :name="uploadQueue.length > 0 ? 'i-lucide-loader' : 'i-lucide-folder-open'" class="mb-3 block w-8 h-8 mx-auto opacity-40" />
      <p v-if="uploadQueue.length === 0" class="text-sm text-white/50">
        Drag & drop files here, or click to <span class="text-[#d4a843] font-medium">browse</span>
      </p>
      <p class="mt-1 text-xs text-white/25">PNG, JPG, WebP, AVIF, MP4 • Max 10MB each</p>
    </div>

    <!-- Upload Progress Cards -->
    <div v-if="uploadQueue.length > 0" class="mb-4 flex flex-col gap-2">
      <div v-for="item in uploadQueue" :key="item.id" class="flex items-center gap-3 rounded-xl border border-white/6 bg-white/4 px-4 py-3">
        <UIcon :name="item.status === 'done' ? 'i-lucide-check-circle' : item.status === 'error' ? 'i-lucide-x-circle' : 'i-lucide-file'" class="w-5 h-5 flex-shrink-0" :class="item.status === 'done' ? 'text-emerald-400' : item.status === 'error' ? 'text-red-400' : 'text-white/40'" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ item.name }}</p>
          <p class="text-[0.625rem] text-white/30">{{ formatBytes(item.size) }}</p>
          <!-- Progress Bar -->
          <div v-if="item.status === 'uploading'" class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div class="h-full rounded-full bg-gradient-to-r from-[#d4a843] to-[#e8c468] transition-all duration-200" :style="{ width: `${item.progress}%` }" />
          </div>
          <p v-if="item.status === 'error'" class="mt-1 text-xs text-red-400">{{ item.error }}</p>
        </div>
        <span v-if="item.status === 'uploading'" class="text-xs text-[#d4a843] font-mono tabular-nums flex-shrink-0">{{ item.progress }}%</span>
        <span v-else-if="item.status === 'done'" class="text-xs text-emerald-400 flex-shrink-0">Done</span>
      </div>
    </div>

    <!-- Search & View Controls -->
    <div class="mb-4 flex items-center gap-3 rounded-2xl border border-white/6 bg-white/4 p-3">
      <UInput v-model="searchQuery" placeholder="Search media..." class="flex-1" />
      <div class="flex border border-white/6 rounded-lg overflow-hidden">
        <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><UIcon name="i-lucide-grid-2x2" class="w-4 h-4" /></button>
        <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><UIcon name="i-lucide-list" class="w-4 h-4" /></button>
      </div>
      <label class="flex items-center gap-2 text-xs text-white/40">
        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="accent-[#d4a843]" />
        Select All
      </label>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))">
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="group relative cursor-pointer overflow-hidden rounded-2xl border bg-white/4 transition-all hover:-translate-y-0.5"
        :class="selectedIds.has(asset.id) ? 'border-[#d4a843] bg-[#d4a843]/5' : 'border-white/6 hover:border-white/15'"
      >
        <!-- Checkbox -->
        <div class="absolute top-2 left-2 z-10">
          <input type="checkbox" :checked="selectedIds.has(asset.id)" @change.stop="toggleSelect(asset.id)" @click.stop class="accent-[#d4a843] w-4 h-4" />
        </div>
        <div class="h-[140px] overflow-hidden bg-black/20" @click="selectAsset(asset)">
          <img v-if="asset.mimeType.startsWith('image/')" :src="asset.thumbnailUrl || asset.url" :alt="asset.altText || asset.originalName" class="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
          <div v-else class="flex h-full items-center justify-center text-3xl">🎬</div>
        </div>
        <div class="p-3" @click="selectAsset(asset)">
          <p class="truncate text-xs font-medium" :title="asset.originalName">{{ asset.originalName }}</p>
          <p class="mt-0.5 text-[0.625rem] text-white/30">{{ formatBytes(asset.sizeBytes) }}</p>
        </div>
        <!-- Hover Overlay Actions -->
        <div class="absolute inset-x-0 bottom-[40px] flex items-center justify-center gap-1 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
          <button class="hover-action-btn" title="Copy URL" @click.stop="copyUrl(asset.url)">📋</button>
          <button class="hover-action-btn" title="View Details" @click.stop="selectAsset(asset)">🔍</button>
          <button class="hover-action-btn danger" title="Delete" @click.stop="confirmDeleteSingle(asset)">✕</button>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead><tr class="border-b border-white/6 bg-white/2">
          <th class="w-10 px-3 py-2.5"><input type="checkbox" :checked="allSelected" @change="toggleSelectAll" /></th>
          <th class="w-12"></th>
          <th class="th-cell">Name</th>
          <th class="th-cell">Type</th>
          <th class="th-cell">Size</th>
          <th class="th-cell">Date</th>
          <th class="th-cell w-24">Actions</th>
        </tr></thead>
        <tbody>
          <tr v-for="asset in filteredAssets" :key="asset.id" class="border-b border-white/3 hover:bg-white/2 cursor-pointer" @click="selectAsset(asset)">
            <td class="px-3 py-2"><input type="checkbox" :checked="selectedIds.has(asset.id)" @change.stop="toggleSelect(asset.id)" @click.stop /></td>
            <td class="px-2 py-2"><img v-if="asset.mimeType.startsWith('image/')" :src="asset.thumbnailUrl || asset.url" class="h-8 w-8 rounded object-cover" /></td>
            <td class="px-3 py-2 max-w-[200px] truncate font-medium">{{ asset.originalName }}</td>
            <td class="px-3 py-2 text-white/40">{{ asset.mimeType.split('/')[1] }}</td>
            <td class="px-3 py-2 text-white/40">{{ formatBytes(asset.sizeBytes) }}</td>
            <td class="px-3 py-2 text-white/30">{{ formatDate(asset.createdAt) }}</td>
            <td class="px-3 py-2">
              <div class="flex gap-1">
                <button class="icon-btn" title="Copy URL" @click.stop="copyUrl(asset.url)">📋</button>
                <button class="icon-btn danger" @click.stop="confirmDeleteSingle(asset)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminEmptyState v-if="filteredAssets.length === 0 && !loading" icon="🖼️" title="No media assets" message="Upload images and videos for your content." />

    <!-- Detail / Edit Modal -->
    <UModal v-model:open="detailOpen" title="Asset Details" class="sm:max-w-lg">
      <template #body>
        <div v-if="selectedAsset" class="flex flex-col gap-4 p-4">
          <img v-if="selectedAsset.mimeType.startsWith('image/')" :src="selectedAsset.url" class="max-h-[250px] w-full rounded-lg bg-black/20 object-contain" />
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-[0.625rem] font-semibold uppercase text-white/25">Filename</span><p class="mt-0.5 truncate">{{ selectedAsset.originalName }}</p></div>
            <div><span class="text-[0.625rem] font-semibold uppercase text-white/25">Size</span><p class="mt-0.5">{{ formatBytes(selectedAsset.sizeBytes) }}</p></div>
            <div><span class="text-[0.625rem] font-semibold uppercase text-white/25">Type</span><p class="mt-0.5">{{ selectedAsset.mimeType }}</p></div>
            <div v-if="selectedAsset.width"><span class="text-[0.625rem] font-semibold uppercase text-white/25">Dimensions</span><p class="mt-0.5">{{ selectedAsset.width }}×{{ selectedAsset.height }}</p></div>
          </div>
          <UFormField label="Alt Text (for SEO & accessibility)">
            <UInput v-model="editAltText" placeholder="Describe this image..." />
          </UFormField>
          <div>
            <span class="text-[0.625rem] font-semibold uppercase text-white/25">URL</span>
            <div class="flex gap-2 mt-1">
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
            <UButton class="bg-gradient-to-br from-[#d4a843] to-[#b8922e] font-bold text-black" @click="saveAltText">Save</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirm -->
    <AdminConfirmDialog v-model="deleteDialogOpen" title="Delete Asset?" :message="deleteMessage" confirm-text="Delete" variant="danger" @confirm="doDelete" />
    <AdminConfirmDialog v-model="bulkDeleteOpen" title="Delete Selected Assets?" :message="`Delete ${selectedIds.size} selected assets? This cannot be undone.`" confirm-text="Delete All" variant="danger" @confirm="doBulkDelete" />

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.mp4']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface MediaAssetItem {
  id: string; filename: string; originalName: string; mimeType: string
  sizeBytes: number; width?: number | null; height?: number | null
  altText?: string | null; url: string; thumbnailUrl?: string | null; createdAt: string
}

interface UploadQueueItem {
  id: string; name: string; size: number
  progress: number; status: 'pending' | 'uploading' | 'done' | 'error'; error?: string
}

const assets = ref<MediaAssetItem[]>([])
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const dragActive = ref(false)
const selectedIds = ref(new Set<string>())
const selectedAsset = ref<MediaAssetItem | null>(null)
const detailOpen = ref(false)
const editAltText = ref('')
const loading = ref(false)
const deleteDialogOpen = ref(false)
const bulkDeleteOpen = ref(false)
const deleteTarget = ref<MediaAssetItem | null>(null)
const uploadQueue = ref<UploadQueueItem[]>([])
const { toast, showToast } = useAdminToast()

const totalSize = computed(() => {
  const bytes = assets.value.reduce((s, a) => s + a.sizeBytes, 0)
  return formatBytes(bytes)
})

const allSelected = computed(() => filteredAssets.value.length > 0 && filteredAssets.value.every(a => selectedIds.value.has(a.id)))
const deleteMessage = computed(() => deleteTarget.value ? `Delete "${deleteTarget.value.originalName}"? This cannot be undone.` : '')

const filteredAssets = computed(() => {
  if (!searchQuery.value) return assets.value
  const q = searchQuery.value.toLowerCase()
  return assets.value.filter(a => a.originalName.toLowerCase().includes(q))
})

async function loadAssets() {
  loading.value = true
  try { assets.value = await $fetch<MediaAssetItem[]>('/api/admin/media') }
  catch { assets.value = [] }
  finally { loading.value = false }
}

/** Client-side file validation before upload */
function validateFiles(files: File[]): { valid: File[]; rejected: string[] } {
  const valid: File[] = []
  const rejected: string[] = []

  for (const file of files) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      rejected.push(`❌ "${file.name}" — unsupported file type. Allowed: PNG, JPG, WebP, AVIF, GIF, MP4`)
      continue
    }
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      rejected.push(`❌ "${file.name}" — exceeds 10MB limit (${formatBytes(file.size)})`)
      continue
    }
    valid.push(file)
  }

  return { valid, rejected }
}

/** Upload a single file with XMLHttpRequest for real-time progress */
function uploadSingleFile(file: File, queueItem: UploadQueueItem): Promise<void> {
  return new Promise((resolve) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        queueItem.progress = Math.round((e.loaded / e.total) * 100)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        queueItem.status = 'done'
        queueItem.progress = 100
      } else {
        queueItem.status = 'error'
        try {
          const resp = JSON.parse(xhr.responseText)
          queueItem.error = resp?.message || `Upload failed (${xhr.status})`
        } catch {
          queueItem.error = `Upload failed (${xhr.status})`
        }
      }
      resolve()
    })

    xhr.addEventListener('error', () => {
      queueItem.status = 'error'
      queueItem.error = 'Network error during upload'
      resolve()
    })

    xhr.open('POST', '/api/admin/media/upload')
    queueItem.status = 'uploading'
    xhr.send(formData)
  })
}

/** Handle file upload with validation + progress */
async function uploadFiles(fileList: FileList | File[]) {
  const files = Array.from(fileList)
  if (!files.length) return

  // Client-side validation
  const { valid, rejected } = validateFiles(files)
  for (const msg of rejected) {
    showToast(msg, 'error', 5000)
  }

  if (!valid.length) return

  // Create queue items
  const newItems: UploadQueueItem[] = valid.map((f, i) => ({
    id: `upload-${Date.now()}-${i}`,
    name: f.name,
    size: f.size,
    progress: 0,
    status: 'pending' as const,
  }))
  uploadQueue.value.push(...newItems)

  // Upload files sequentially for progress tracking
  for (let i = 0; i < valid.length; i++) {
    await uploadSingleFile(valid[i], newItems[i])
  }

  const doneCount = newItems.filter(q => q.status === 'done').length
  if (doneCount > 0) {
    showToast(`✅ Uploaded ${doneCount} file(s)`)
    await loadAssets()
  }

  // Clear completed items after 3s
  setTimeout(() => {
    uploadQueue.value = uploadQueue.value.filter(q => q.status !== 'done')
  }, 3000)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragActive.value = true
  // Check dragged file types
  if (e.dataTransfer?.types.includes('Files')) {
    dragActive.value = true
  }
}

function handleDrop(e: DragEvent) {
  dragActive.value = false
  if (e.dataTransfer?.files) uploadFiles(e.dataTransfer.files)
}

function handleFileSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files
  if (f) uploadFiles(f)
  // Reset input so the same file can be re-selected
  ;(e.target as HTMLInputElement).value = ''
}

function selectAsset(asset: MediaAssetItem) {
  selectedAsset.value = asset; editAltText.value = asset.altText || ''; detailOpen.value = true
}

function toggleSelect(id: string) {
  selectedIds.value.has(id) ? selectedIds.value.delete(id) : selectedIds.value.add(id)
  selectedIds.value = new Set(selectedIds.value)
}

function toggleSelectAll() {
  if (allSelected.value) { selectedIds.value = new Set() }
  else { selectedIds.value = new Set(filteredAssets.value.map(a => a.id)) }
}

function confirmDeleteSingle(asset: MediaAssetItem) { deleteTarget.value = asset; deleteDialogOpen.value = true }

async function doDelete() {
  if (!deleteTarget.value) return
  try { await $fetch(`/api/admin/media/${deleteTarget.value.id}`, { method: 'DELETE' }); showToast('Asset deleted'); detailOpen.value = false; await loadAssets() }
  catch { showToast('Delete failed', 'error') }
}

async function doBulkDelete() {
  for (const id of selectedIds.value) { try { await $fetch(`/api/admin/media/${id}`, { method: 'DELETE' }) } catch {} }
  selectedIds.value = new Set(); showToast('Selected assets deleted'); await loadAssets()
}

async function saveAltText() {
  if (selectedAsset.value) { selectedAsset.value.altText = editAltText.value; showToast('Alt text saved') }
  detailOpen.value = false
}

function copyUrl(url: string) { navigator.clipboard.writeText(url); showToast('URL copied to clipboard') }
function formatBytes(bytes: number) { if (bytes < 1024) return bytes + ' B'; if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'; return (bytes / 1048576).toFixed(1) + ' MB' }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

await loadAssets()
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

/* Hover overlay action buttons */
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
