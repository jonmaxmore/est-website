<template>
  <Teleport to="body">
    <Transition name="cp-fade">
      <div v-if="isOpen" class="cp-overlay" @click.self="close">
        <div class="cp-dialog">
          <div class="cp-search-wrap">
            <span class="cp-search-icon">🔍</span>
            <input
              ref="searchInput"
              v-model="query"
              class="cp-search"
              placeholder="Search pages, actions..."
              @keydown.escape="close"
              @keydown.down.prevent="moveDown"
              @keydown.up.prevent="moveUp"
              @keydown.enter.prevent="selectCurrent"
            />
            <kbd class="cp-kbd">ESC</kbd>
          </div>

          <div v-if="filteredItems.length" class="cp-results">
            <div
              v-for="(item, i) in filteredItems"
              :key="item.to"
              class="cp-item"
              :class="{ active: i === selectedIndex }"
              @click="navigate(item)"
              @mouseenter="selectedIndex = i"
            >
              <span class="cp-item-icon">{{ item.icon }}</span>
              <div class="cp-item-info">
                <span class="cp-item-label">{{ item.label }}</span>
                <span class="cp-item-group">{{ item.group }}</span>
              </div>
              <span class="cp-item-path">{{ item.to }}</span>
            </div>
          </div>

          <div v-else class="cp-empty">
            No results for "{{ query }}"
          </div>

          <div class="cp-footer">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Open</span>
            <span><kbd>esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const router = useRouter()
const isOpen = ref(false)
const query = ref('')
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement>()

interface PaletteItem {
  icon: string; label: string; group: string; to: string
}

const allItems: PaletteItem[] = [
  { icon: '📊', label: 'Dashboard', group: 'Overview', to: '/admin' },
  { icon: '📈', label: 'Analytics', group: 'Overview', to: '/admin/analytics' },
  { icon: '🏠', label: 'Homepage', group: 'Content', to: '/admin/homepage' },
  { icon: '📰', label: 'News', group: 'Content', to: '/admin/news' },
  { icon: '⚔️', label: 'Weapons', group: 'Content', to: '/admin/weapons' },
  { icon: '🌟', label: 'Features', group: 'Content', to: '/admin/features' },
  { icon: '✨', label: 'Highlights', group: 'Content', to: '/admin/highlights' },
  { icon: '❓', label: 'FAQ', group: 'Content', to: '/admin/faq' },
  { icon: '📄', label: 'Pages', group: 'Content', to: '/admin/pages' },
  { icon: '🖼️', label: 'Media', group: 'Content', to: '/admin/media' },
  { icon: '👥', label: 'Registrations', group: 'Marketing', to: '/admin/registrations' },
  { icon: '🧭', label: 'Navigation', group: 'Appearance', to: '/admin/menus' },
  { icon: '🎨', label: 'Theme', group: 'Appearance', to: '/admin/appearance' },
  { icon: '🔍', label: 'SEO', group: 'Appearance', to: '/admin/seo' },
  { icon: '👤', label: 'Users', group: 'System', to: '/admin/users' },
  { icon: '🔗', label: 'Integrations', group: 'System', to: '/admin/integrations' },
  { icon: '📋', label: 'Activity Log', group: 'System', to: '/admin/activity' },
  { icon: '💾', label: 'Backup', group: 'System', to: '/admin/backup' },
  { icon: '⚙️', label: 'Settings', group: 'System', to: '/admin/settings' },
  { icon: '🌐', label: 'View Frontend', group: 'Quick Action', to: '/' },
]

const filteredItems = computed(() => {
  if (!query.value) return allItems
  const q = query.value.toLowerCase()
  return allItems.filter(
    (item) => item.label.toLowerCase().includes(q)
      || item.group.toLowerCase().includes(q)
      || item.to.toLowerCase().includes(q),
  )
})

watch(query, () => { selectedIndex.value = 0 })

function open() {
  isOpen.value = true
  query.value = ''
  selectedIndex.value = 0
  nextTick(() => searchInput.value?.focus())
}
function close() { isOpen.value = false }
function moveDown() { selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value.length - 1) }
function moveUp() { selectedIndex.value = Math.max(selectedIndex.value - 1, 0) }
function selectCurrent() {
  const item = filteredItems.value[selectedIndex.value]
  if (item) navigate(item)
}
function navigate(item: PaletteItem) {
  close()
  if (item.to === '/') { window.open('/', '_blank') }
  else { router.push(item.to) }
}

// Global Ctrl+K shortcut
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      isOpen.value ? close() : open()
    }
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})

defineExpose({ open, close })
</script>

<style scoped>
.cp-overlay {
  position: fixed; inset: 0; z-index: 80;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 80px 24px 24px;
}
.cp-dialog {
  width: 100%; max-width: 560px;
  background: #111118; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}

.cp-search-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.cp-search-icon { font-size: 1rem; opacity: 0.3; }
.cp-search {
  flex: 1; border: none; background: transparent;
  color: white; font-size: 0.9375rem; outline: none;
}
.cp-search::placeholder { color: rgba(255,255,255,0.25); }
.cp-kbd {
  padding: 2px 6px; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px; background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.25); font-size: 0.625rem; font-family: inherit;
}

.cp-results {
  max-height: 360px; overflow-y: auto; padding: 6px;
}
.cp-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 10px; cursor: pointer;
  transition: background 0.1s;
}
.cp-item:hover, .cp-item.active { background: rgba(255,255,255,0.04); }
.cp-item.active { background: rgba(212,168,67,0.08); }
.cp-item-icon { font-size: 1rem; width: 24px; text-align: center; }
.cp-item-info { flex: 1; min-width: 0; }
.cp-item-label { font-size: 0.875rem; font-weight: 500; }
.cp-item-group {
  margin-left: 8px; font-size: 0.6875rem;
  color: rgba(255,255,255,0.2);
}
.cp-item-path {
  font-size: 0.6875rem; color: rgba(255,255,255,0.15); font-family: monospace;
}

.cp-empty {
  padding: 32px; text-align: center;
  color: rgba(255,255,255,0.25); font-size: 0.875rem;
}

.cp-footer {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 18px; border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 0.6875rem; color: rgba(255,255,255,0.2);
}
.cp-footer kbd {
  padding: 1px 5px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 3px; background: rgba(255,255,255,0.03);
  font-family: inherit; font-size: 0.625rem;
}

.cp-fade-enter-active, .cp-fade-leave-active { transition: opacity 0.15s; }
.cp-fade-enter-from, .cp-fade-leave-to { opacity: 0; }
</style>
