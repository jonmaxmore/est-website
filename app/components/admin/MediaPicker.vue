<template>
  <div class="media-picker-field">
    <label v-if="label" class="mp-label">{{ label }}</label>
    <div class="mp-preview-row">
      <div v-if="modelValue" class="mp-thumb" @click="openModal">
        <img :src="modelValue" :alt="label || 'Selected image'" />
        <button type="button" class="mp-clear" title="Remove" @click.stop="emit('update:modelValue', '')">✕</button>
      </div>
      <button type="button" class="mp-browse-btn" @click="openModal">
        {{ modelValue ? 'Change' : 'Browse Media' }}
      </button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="mp-fade">
        <div v-if="modalOpen" class="mp-overlay" @click.self="modalOpen = false">
          <div class="mp-modal">
            <div class="mp-modal-header">
              <h3>Select Media</h3>
              <button type="button" class="mp-close" @click="modalOpen = false">✕</button>
            </div>

            <!-- Upload Zone -->
            <div
              class="mp-upload-zone"
              :class="{ dragover: dragActive }"
              @dragover.prevent="dragActive = true"
              @dragleave="dragActive = false"
              @drop.prevent="handleDrop"
            >
              <span v-if="uploading">Uploading {{ uploadProgress }}...</span>
              <span v-else>
                Drop files here or
                <label for="mp-file-input" class="mp-upload-link">browse</label>
              </span>
              <input id="mp-file-input" type="file" accept="image/*" class="mp-hidden" @change="handleFileSelect" />
            </div>

            <!-- Search -->
            <div class="mp-search">
              <input v-model="searchQuery" placeholder="Search media..." class="mp-search-input" />
            </div>

            <!-- Grid -->
            <div class="mp-grid">
              <div
                v-for="asset in filteredAssets"
                :key="asset.id"
                class="mp-item"
                :class="{ selected: selectedUrl === asset.url }"
                @click="selectedUrl = asset.url"
              >
                <img :src="asset.thumbnailUrl || asset.url" :alt="asset.originalName" loading="lazy" />
                <div class="mp-item-name">{{ asset.originalName }}</div>
                <div v-if="selectedUrl === asset.url" class="mp-check">✓</div>
              </div>
              <div v-if="filteredAssets.length === 0 && !loading" class="mp-empty">
                No media found. Upload files above.
              </div>
            </div>

            <!-- Footer -->
            <div class="mp-modal-footer">
              <span class="mp-count">{{ filteredAssets.length }} items</span>
              <div class="mp-actions">
                <button type="button" class="mp-btn-ghost" @click="modalOpen = false">Cancel</button>
                <button
                  type="button"
                  class="mp-btn-primary"
                  :disabled="!selectedUrl"
                  @click="confirmSelection"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [url: string]
  close: []
}>()

interface MediaAssetItem {
  id: string; filename: string; originalName: string; mimeType: string
  sizeBytes: number; url: string; thumbnailUrl?: string | null; createdAt: string
}

const modalOpen = ref(false)
const assets = ref<MediaAssetItem[]>([])
const searchQuery = ref('')
const selectedUrl = ref('')
const dragActive = ref(false)
const uploading = ref(false)
const uploadProgress = ref('')
const loading = ref(false)

const filteredAssets = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const imgs = assets.value.filter((a) => a.mimeType.startsWith('image/'))
  if (!q) return imgs
  return imgs.filter((a) => a.originalName.toLowerCase().includes(q))
})

async function loadAssets() {
  loading.value = true
  try {
    assets.value = await $fetch<MediaAssetItem[]>('/api/admin/media')
  } catch (err: any) {
    console.error('[MediaPicker] Failed to load assets:', err?.data?.message || err?.message)
    assets.value = []
  }
  finally { loading.value = false }
}

function openModal() {
  selectedUrl.value = props.modelValue || ''
  modalOpen.value = true
  loadAssets()
}

function confirmSelection() {
  emit('update:modelValue', selectedUrl.value)
  emit('select', selectedUrl.value)
  modalOpen.value = false
}

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
    await loadAssets()
  } catch (err: any) {
    console.error('[MediaPicker] Upload failed:', err?.data?.message || err?.message)
  }
  finally { uploading.value = false; uploadProgress.value = '' }
}

function handleDrop(e: DragEvent) {
  dragActive.value = false
  if (e.dataTransfer?.files) uploadFiles(e.dataTransfer.files)
}

function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) uploadFiles(files)
}
</script>

<style scoped>
.mp-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}
.mp-preview-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mp-thumb {
  position: relative;
  width: 80px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  flex-shrink: 0;
}
.mp-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mp-clear {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  font-size: 0.625rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}
.mp-thumb:hover .mp-clear { opacity: 1; }
.mp-browse-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}
.mp-browse-btn:hover {
  border-color: rgba(212, 168, 67, 0.3);
  color: #d4a843;
  background: rgba(212, 168, 67, 0.05);
}

/* Modal */
.mp-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.mp-modal {
  width: 100%;
  max-width: 860px;
  max-height: 85vh;
  background: #111118;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.mp-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.mp-modal-header h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}
.mp-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.mp-close:hover { background: rgba(255, 255, 255, 0.06); color: white; }

/* Upload & Search */
.mp-upload-zone {
  margin: 12px 20px 0;
  padding: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  text-align: center;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s;
}
.mp-upload-zone.dragover {
  border-color: #d4a843;
  background: rgba(212, 168, 67, 0.05);
}
.mp-upload-link { color: #d4a843; cursor: pointer; text-decoration: underline; }
.mp-hidden { display: none; }
.mp-search { padding: 8px 20px; }
.mp-search-input {
  width: 100%;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: white;
  font-size: 0.8125rem;
  outline: none;
}
.mp-search-input:focus { border-color: rgba(212, 168, 67, 0.4); }

/* Grid */
.mp-grid {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.mp-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  background: rgba(255, 255, 255, 0.03);
}
.mp-item:hover { border-color: rgba(255, 255, 255, 0.15); }
.mp-item.selected { border-color: #d4a843; }
.mp-item img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  display: block;
}
.mp-item-name {
  padding: 4px 6px;
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mp-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #d4a843;
  color: black;
  font-size: 0.625rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mp-empty {
  grid-column: 1 / -1;
  padding: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.875rem;
}

/* Footer */
.mp-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.mp-count { font-size: 0.75rem; color: rgba(255, 255, 255, 0.3); }
.mp-actions { display: flex; gap: 8px; }
.mp-btn-ghost {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s;
}
.mp-btn-ghost:hover { color: white; border-color: rgba(255, 255, 255, 0.2); }
.mp-btn-primary {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #d4a843, #b8922e);
  color: black;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.mp-btn-primary:hover { filter: brightness(1.1); }
.mp-btn-primary:disabled { opacity: 0.4; cursor: default; filter: none; }

/* Transition */
.mp-fade-enter-active, .mp-fade-leave-active { transition: opacity 0.2s; }
.mp-fade-enter-from, .mp-fade-leave-to { opacity: 0; }
</style>
