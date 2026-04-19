<template>
  <div>
    <div class="mb-6"><h2 class="text-2xl font-bold">Media Library</h2><p class="mt-1 text-sm text-white/50">Manage images and media assets</p></div>

    <!-- Upload Zone -->
    <div class="mb-4 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all" :class="dragActive ? 'border-gold bg-gold/5' : 'border-white/10'" @dragover.prevent="dragActive = true" @dragleave="dragActive = false" @drop.prevent="handleDrop">
      <div>
        <span class="mb-3 block text-5xl">📁</span>
        <p v-if="uploading">Uploading {{ uploadProgress }}...</p>
        <p v-else>Drag & drop files here, or <label for="media-file-input" class="cursor-pointer text-gold underline">browse</label></p>
        <p class="mt-2 text-xs text-white/30">PNG, JPG, WebP, AVIF, MP4 • Max 10MB</p>
        <input id="media-file-input" type="file" multiple accept="image/*,video/*" class="hidden" @change="handleFileSelect" />
      </div>
    </div>

    <!-- Search -->
    <div class="mb-4 rounded-2xl border border-white/6 bg-white/4 p-4">
      <UInput v-model="searchQuery" placeholder="Search media..." />
    </div>

    <!-- Grid -->
    <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))">
      <div v-for="asset in filteredAssets" :key="asset.id" class="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/6 bg-white/4 transition-all hover:-translate-y-0.5 hover:border-white/15" @click="selectAsset(asset)">
        <div class="h-[140px] overflow-hidden bg-surface-elevated">
          <img v-if="asset.mimeType.startsWith('image/')" :src="asset.url" :alt="asset.altText || asset.originalName" class="h-full w-full object-cover" loading="lazy" />
          <div v-else class="flex h-full items-center justify-center text-3xl">🎬</div>
        </div>
        <div class="p-3">
          <p class="truncate text-xs font-medium" :title="asset.originalName">{{ asset.originalName }}</p>
          <p class="mt-0.5 text-[0.625rem] text-white/30">{{ formatBytes(asset.sizeBytes) }}</p>
        </div>
        <div v-if="selectedId === asset.id" class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">✓</div>
        <!-- Delete button -->
        <button
          class="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
          @click.stop="confirmDelete(asset)"
        >✕</button>
      </div>
      <p v-if="filteredAssets.length === 0 && !loading" class="py-12 text-center text-white/30" style="grid-column:1/-1">No media assets yet. Upload files to get started.</p>
      <p v-if="loading" class="py-12 text-center text-white/30" style="grid-column:1/-1">Loading...</p>
    </div>

    <!-- Detail Modal -->
    <UModal v-model:open="detailOpen" title="Asset Details">
      <template #body>
        <div v-if="selectedAsset" class="p-6">
          <img v-if="selectedAsset.mimeType.startsWith('image/')" :src="selectedAsset.url" class="mb-6 max-h-[300px] w-full rounded-lg bg-surface-elevated object-contain" />
          <div class="flex flex-col gap-3 text-sm">
            <div><span class="text-xs font-medium uppercase text-white/30">Filename</span><p>{{ selectedAsset.originalName }}</p></div>
            <div><span class="text-xs font-medium uppercase text-white/30">URL</span><div class="flex gap-2"><UInput :model-value="selectedAsset.url" readonly class="flex-1 text-xs" /><UButton size="xs" variant="ghost" @click="copyUrl(selectedAsset.url)">📋</UButton></div></div>
            <div class="grid grid-cols-2 gap-3">
              <div><span class="text-xs font-medium uppercase text-white/30">Type</span><p>{{ selectedAsset.mimeType }}</p></div>
              <div><span class="text-xs font-medium uppercase text-white/30">Size</span><p>{{ formatBytes(selectedAsset.sizeBytes) }}</p></div>
              <div v-if="selectedAsset.width"><span class="text-xs font-medium uppercase text-white/30">Dimensions</span><p>{{ selectedAsset.width }}×{{ selectedAsset.height }}</p></div>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Notification -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="toast.show" class="fixed bottom-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-medium shadow-xl backdrop-blur-xl" :class="toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'">
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface MediaAssetItem {
  id: string; filename: string; originalName: string; mimeType: string
  sizeBytes: number; width?: number | null; height?: number | null
  altText?: string | null; url: string; thumbnailUrl?: string | null; createdAt: string
}

const assets = ref<MediaAssetItem[]>([])
const searchQuery = ref('')
const dragActive = ref(false)
const selectedId = ref<string | null>(null)
const selectedAsset = ref<MediaAssetItem | null>(null)
const detailOpen = ref(false)
const uploading = ref(false)
const uploadProgress = ref('')
const loading = ref(false)

// Toast notification
const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

const filteredAssets = computed(() => {
  if (!searchQuery.value) return assets.value
  const q = searchQuery.value.toLowerCase()
  return assets.value.filter((a) => a.originalName.toLowerCase().includes(q))
})

// Load assets from API
async function loadAssets() {
  loading.value = true
  try {
    assets.value = await $fetch<MediaAssetItem[]>('/api/admin/media')
  } catch { assets.value = [] }
  finally { loading.value = false }
}

// Real file upload
async function uploadFiles(files: FileList | File[]) {
  if (!files || files.length === 0) return
  uploading.value = true
  uploadProgress.value = `0/${files.length}`

  const formData = new FormData()
  for (let i = 0; i < files.length; i++) {
    formData.append('file', files[i])
    uploadProgress.value = `${i + 1}/${files.length}`
  }

  try {
    await $fetch('/api/admin/media/upload', { method: 'POST', body: formData })
    showToast(`Uploaded ${files.length} file(s) successfully`)
    await loadAssets()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    showToast(err?.data?.message || 'Upload failed', 'error')
  } finally {
    uploading.value = false
    uploadProgress.value = ''
  }
}

function handleDrop(e: DragEvent) {
  dragActive.value = false
  if (e.dataTransfer?.files) uploadFiles(e.dataTransfer.files)
}

function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) uploadFiles(files)
}

function selectAsset(asset: MediaAssetItem) {
  selectedId.value = asset.id; selectedAsset.value = asset; detailOpen.value = true
}

async function confirmDelete(asset: MediaAssetItem) {
  if (!confirm(`Delete "${asset.originalName}"?`)) return
  try {
    await $fetch(`/api/admin/media/${asset.id}`, { method: 'DELETE' })
    showToast('Asset deleted')
    await loadAssets()
  } catch {
    showToast('Delete failed', 'error')
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  showToast('URL copied to clipboard')
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

await loadAssets()
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
