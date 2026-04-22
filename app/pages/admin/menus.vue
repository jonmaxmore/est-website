<template>
  <div>
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold">Navigation Menu</h2>
        <p class="mt-1 text-sm text-white/50">Manage page-backed and custom links.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="saving"
        @click="save"
      >
        Save Navigation
      </button>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Main Navigation</h3>

        <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label class="sr-only" for="header-page">Header page</label>
          <select id="header-page" v-model="selectedHeaderPageKey" class="nav-select" aria-label="Header page">
            <option value="">Select a page</option>
            <option v-for="page in availablePages" :key="page.key" :value="page.key">
              {{ page.titleEn }} ({{ page.route }})
            </option>
          </select>
          <button type="button" class="secondary-action" @click="addPageNav('main')">Add Page to Header</button>
          <button type="button" class="secondary-action" @click="addCustomNav('main')">Add Custom Link</button>
        </div>

        <div class="flex flex-col gap-2">
          <article v-for="(item, index) in mainNav" :key="item.id" class="nav-row">
            <div class="flex items-center gap-1">
              <button type="button" class="icon-action" aria-label="Move up" @click="moveNav('main', index, -1)">^</button>
              <button type="button" class="icon-action" aria-label="Move down" @click="moveNav('main', index, 1)">v</button>
            </div>

            <div class="min-w-0 flex-1">
              <div v-if="item.type === 'page'" class="min-w-0">
                <p class="truncate text-sm font-semibold text-white">{{ navPageTitle(item) }}</p>
                <p class="truncate text-xs font-mono text-white/35">{{ navPageRoute(item) }}</p>
              </div>
              <div v-else class="grid gap-2 md:grid-cols-[1fr_1fr]">
                <input v-model="item.labelEn" class="nav-input" aria-label="Custom label EN" placeholder="Label EN" />
                <input v-model="item.href" class="nav-input font-mono" aria-label="Custom href" placeholder="/path or https://..." />
              </div>
            </div>

            <label class="flex items-center gap-2 text-xs text-white/50">
              <input v-model="item.visible" type="checkbox" class="h-4 w-4 accent-gold" />
              Visible
            </label>
            <button type="button" class="danger-action" aria-label="Remove item" @click="removeNav('main', index)">Remove</button>
          </article>
        </div>
      </section>

      <section class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Footer Links</h3>

        <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label class="sr-only" for="footer-page">Footer page</label>
          <select id="footer-page" v-model="selectedFooterPageKey" class="nav-select" aria-label="Footer page">
            <option value="">Select a page</option>
            <option v-for="page in availablePages" :key="page.key" :value="page.key">
              {{ page.titleEn }} ({{ page.route }})
            </option>
          </select>
          <button type="button" class="secondary-action" @click="addPageNav('footer')">Add Page to Footer</button>
          <button type="button" class="secondary-action" @click="addCustomNav('footer')">Add Custom Link</button>
        </div>

        <div class="flex flex-col gap-2">
          <article v-for="(item, index) in footerNav" :key="item.id" class="nav-row">
            <div class="flex items-center gap-1">
              <button type="button" class="icon-action" aria-label="Move up" @click="moveNav('footer', index, -1)">^</button>
              <button type="button" class="icon-action" aria-label="Move down" @click="moveNav('footer', index, 1)">v</button>
            </div>

            <div class="min-w-0 flex-1">
              <div v-if="item.type === 'page'" class="min-w-0">
                <p class="truncate text-sm font-semibold text-white">{{ navPageTitle(item) }}</p>
                <p class="truncate text-xs font-mono text-white/35">{{ navPageRoute(item) }}</p>
              </div>
              <div v-else class="grid gap-2 md:grid-cols-[1fr_1fr]">
                <input v-model="item.labelEn" class="nav-input" aria-label="Custom label EN" placeholder="Label EN" />
                <input v-model="item.href" class="nav-input font-mono" aria-label="Custom href" placeholder="/path or https://..." />
              </div>
            </div>

            <label class="flex items-center gap-2 text-xs text-white/50">
              <input v-model="item.visible" type="checkbox" class="h-4 w-4 accent-gold" />
              Visible
            </label>
            <button type="button" class="danger-action" aria-label="Remove item" @click="removeNav('footer', index)">Remove</button>
          </article>
        </div>
      </section>
    </div>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type NavTarget = 'main' | 'footer'

type NavigationItem = {
  id: string
  type: 'page' | 'custom'
  labelEn: string
  labelTh: string
  pageKey?: string
  href?: string
  target?: '_self' | '_blank'
  visible: boolean
}

type AdminPageItem = {
  key: string
  titleEn: string
  titleTh: string
  route: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

const defaultMainNav: NavigationItem[] = [
  { id: 'default-home', type: 'custom', labelEn: 'Home', labelTh: 'Home', href: '/', target: '_self', visible: true },
  { id: 'default-weapons', type: 'custom', labelEn: 'Weapons', labelTh: 'Weapons', href: '/weapons', target: '_self', visible: true },
  { id: 'default-news', type: 'custom', labelEn: 'News', labelTh: 'News', href: '/news', target: '_self', visible: true },
  { id: 'default-guide', type: 'page', labelEn: 'Game Guide', labelTh: 'Game Guide', pageKey: 'game-guide', target: '_self', visible: true },
  { id: 'default-support', type: 'page', labelEn: 'Support', labelTh: 'Support', pageKey: 'support', target: '_self', visible: true },
]

const defaultFooterNav: NavigationItem[] = [
  { id: 'default-footer-guide', type: 'page', labelEn: 'Game Guide', labelTh: 'Game Guide', pageKey: 'game-guide', target: '_self', visible: true },
  { id: 'default-footer-faq', type: 'page', labelEn: 'FAQ', labelTh: 'FAQ', pageKey: 'faq', target: '_self', visible: true },
  { id: 'default-footer-terms', type: 'page', labelEn: 'Terms', labelTh: 'Terms', pageKey: 'terms', target: '_self', visible: true },
  { id: 'default-footer-privacy', type: 'page', labelEn: 'Privacy', labelTh: 'Privacy', pageKey: 'privacy', target: '_self', visible: true },
]

const pages = ref<AdminPageItem[]>([])
const mainNav = ref<NavigationItem[]>([])
const footerNav = ref<NavigationItem[]>([])
const selectedHeaderPageKey = ref('')
const selectedFooterPageKey = ref('')
const saving = ref(false)
const { toast, showToast } = useAdminToast()

const availablePages = computed(() => pages.value.filter((page) => page.status === 'PUBLISHED'))
const pageByKey = computed(() => new Map(pages.value.map((page) => [page.key, page])))

function normalizeItems(value: unknown, fallback: NavigationItem[]): NavigationItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map((item) => ({ ...item }))
  }

  return value.map((item, index) => {
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    const type = candidate.type === 'page' ? 'page' : 'custom'
    const labelEn = String(candidate.labelEn || candidate.label || '')
    const labelTh = String(candidate.labelTh || candidate.label || labelEn)

    return {
      id: String(candidate.id || `nav-${index}`),
      type,
      labelEn,
      labelTh,
      pageKey: typeof candidate.pageKey === 'string' ? candidate.pageKey : undefined,
      href: type === 'custom' ? String(candidate.href || '/') : undefined,
      target: candidate.target === '_blank' ? '_blank' : '_self',
      visible: candidate.visible !== false,
    }
  })
}

function navList(target: NavTarget) {
  return target === 'main' ? mainNav.value : footerNav.value
}

function selectedPageKey(target: NavTarget) {
  return target === 'main' ? selectedHeaderPageKey.value : selectedFooterPageKey.value
}

function clearSelectedPage(target: NavTarget) {
  if (target === 'main') {
    selectedHeaderPageKey.value = ''
  } else {
    selectedFooterPageKey.value = ''
  }
}

function addPageNav(target: NavTarget) {
  const key = selectedPageKey(target)
  const page = pages.value.find((candidate) => candidate.key === key)
  if (!page) {
    showToast('Select a page first', 'error')
    return
  }

  const list = navList(target)
  if (list.some((item) => item.type === 'page' && item.pageKey === page.key)) {
    showToast('Page already exists in this menu', 'info')
    return
  }

  list.push({
    id: `nav-${target}-${page.key}-${Date.now()}`,
    type: 'page',
    labelEn: page.titleEn,
    labelTh: page.titleTh || page.titleEn,
    pageKey: page.key,
    target: '_self',
    visible: true,
  })
  clearSelectedPage(target)
}

function addCustomNav(target: NavTarget) {
  navList(target).push({
    id: `nav-${target}-custom-${Date.now()}`,
    type: 'custom',
    labelEn: 'New Link',
    labelTh: 'New Link',
    href: '/',
    target: '_self',
    visible: true,
  })
}

function removeNav(target: NavTarget, index: number) {
  navList(target).splice(index, 1)
}

function moveNav(target: NavTarget, index: number, direction: -1 | 1) {
  const list = navList(target)
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= list.length) {
    return
  }

  ;[list[index], list[nextIndex]] = [list[nextIndex], list[index]]
}

function navPageTitle(item: NavigationItem) {
  const page = item.pageKey ? pageByKey.value.get(item.pageKey) : null
  return page?.titleEn || item.labelEn || 'Missing page'
}

function navPageRoute(item: NavigationItem) {
  const page = item.pageKey ? pageByKey.value.get(item.pageKey) : null
  return page?.route || `Missing: ${item.pageKey || 'page'}`
}

async function loadMenus() {
  try {
    const [pageData, navData] = await Promise.all([
      $fetch<AdminPageItem[]>('/api/admin/pages'),
      $fetch<{ main?: unknown[]; footer?: unknown[] }>('/api/admin/config?key=navigation'),
    ])

    pages.value = pageData
    mainNav.value = normalizeItems(navData?.main, defaultMainNav)
    footerNav.value = normalizeItems(navData?.footer, defaultFooterNav)
  } catch (error: any) {
    showToast(error?.data?.message || error?.message || 'Failed to load navigation', 'error')
    mainNav.value = defaultMainNav.map((item) => ({ ...item }))
    footerNav.value = defaultFooterNav.map((item) => ({ ...item }))
  }
}

async function save() {
  saving.value = true

  try {
    await $fetch('/api/admin/config', {
      method: 'PUT',
      body: {
        key: 'navigation',
        value: {
          main: mainNav.value,
          footer: footerNav.value,
        },
      },
    })
    showToast('Navigation saved')
  } catch (error: any) {
    showToast(error?.data?.message || error?.message || 'Failed to save navigation', 'error')
  } finally {
    saving.value = false
  }
}

await loadMenus()
</script>

<style scoped>
.nav-select,
.nav-input {
  min-height: 40px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: white;
  padding: 0 12px;
  font-size: 0.875rem;
  outline: none;
}

.secondary-action,
.danger-action,
.icon-action {
  border: 0;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
}

.secondary-action {
  min-height: 40px;
  white-space: nowrap;
  border: 1px solid rgba(212, 168, 67, 0.28);
  border-radius: 10px;
  background: rgba(212, 168, 67, 0.08);
  padding: 0 14px;
  color: #d4a843;
  font-size: 0.8125rem;
  font-weight: 700;
}

.secondary-action:hover {
  border-color: rgba(212, 168, 67, 0.5);
  background: rgba(212, 168, 67, 0.14);
}

.nav-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.75rem;
}

.icon-action {
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.75rem;
}

.icon-action:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.danger-action {
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.08);
  padding: 0.45rem 0.65rem;
  color: rgba(248, 113, 113, 0.86);
  font-size: 0.75rem;
  font-weight: 700;
}

.danger-action:hover {
  background: rgba(239, 68, 68, 0.16);
  color: rgb(248, 113, 113);
}
</style>
