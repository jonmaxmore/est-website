<template>
  <div
    data-testid="admin-layout"
    :data-ready="hydrated ? 'true' : 'false'"
    class="admin-root"
    :class="{ 'sidebar-collapsed': sidebarCollapsed, 'sidebar-mobile-open': mobileMenuOpen }"
  >
    <Transition name="fade">
      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false" />
    </Transition>

    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-brand">
        <NuxtLink to="/admin" class="brand-link">
          <img src="/images/logo.webp" alt="ETS" class="brand-logo" />
          <Transition name="brand-text">
            <span v-if="!sidebarCollapsed" class="brand-name">ETS Admin</span>
          </Transition>
        </NuxtLink>
        <button class="collapse-btn desktop-only" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? 'Expand' : 'Collapse'">
          <UIcon :name="sidebarCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <template v-for="group in navGroups" :key="group.title">
          <p v-if="!sidebarCollapsed" class="nav-group-title">{{ group.title }}</p>
          <div v-else class="nav-group-dot" />
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ active: isActive(item.to) }"
            :title="sidebarCollapsed ? item.label : ''"
            @click="mobileMenuOpen = false"
          >
            <UIcon :name="item.icon" class="nav-icon-svg" />
            <Transition name="nav-label">
              <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
            </Transition>
            <span v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink
          to="/"
          target="_blank"
          class="sidebar-footer-btn view-site-btn"
          :title="sidebarCollapsed ? 'View Site' : ''"
        >
          <UIcon name="i-lucide-external-link" class="sidebar-icon" />
          <span v-if="!sidebarCollapsed">View Site</span>
        </NuxtLink>
        <button
          class="sidebar-footer-btn logout-btn"
          :title="sidebarCollapsed ? 'Logout' : ''"
          @click="handleLogout"
        >
          <UIcon name="i-lucide-log-out" class="sidebar-icon" />
          <span v-if="!sidebarCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-left">
          <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
            <UIcon name="i-lucide-menu" />
          </button>
          <AdminBreadcrumb />
        </div>
        <div class="topbar-right">
          <button class="topbar-search-btn" @click="commandPalette?.open()" title="Search (Ctrl+K)">
            <UIcon name="i-lucide-search" class="search-icon-svg" />
            <span class="search-label">Search...</span>
            <kbd class="search-kbd">⌘K</kbd>
          </button>

          <div class="admin-lang-toggle">
            <button
              v-for="l in (['TH', 'EN'] as const)"
              :key="l"
              class="admin-lang-btn"
              :class="{ active: adminLang === l }"
              @click="adminLang = l"
            >
              {{ l }}
            </button>
          </div>

          <ClientOnly>
            <div class="topbar-user">
              <div class="user-avatar">{{ userInitial }}</div>
              <div class="user-info">
                <span class="user-name">{{ userName }}</span>
                <span class="user-role-badge">{{ userRole }}</span>
              </div>
            </div>
            <template #fallback>
              <div class="topbar-user">
                <div class="user-avatar">A</div>
                <div class="user-info">
                  <span class="user-name">Admin</span>
                  <span class="user-role-badge">…</span>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </header>

      <div class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="env-badge">
          <span class="env-dot" />
          PRODUCTION
        </div>
      </div>

      <div class="page-content">
        <slot />
      </div>
    </div>

    <AdminCommandPalette ref="commandPalette" />
  </div>
</template>

<script setup lang="ts">
import { ADMIN_NAV_GROUPS, ADMIN_NAV_ITEMS } from '../shared/constants/admin-nav'

interface AdminUser { id?: string; displayName?: string; role?: string }

const { user, clear } = useUserSession()
const route = useRoute()

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const adminLang = ref<'TH' | 'EN'>('EN')
const commandPalette = ref<{ open: () => void } | null>(null)
const hydrated = ref(false)

const navGroups = ADMIN_NAV_GROUPS

const userTyped = computed(() => user.value as AdminUser | null | undefined)
const userName = computed(() => userTyped.value?.displayName || 'Admin')
const userInitial = computed(() => (userTyped.value?.displayName || 'A').charAt(0).toUpperCase())
const userRole = computed(() => userTyped.value?.role || 'ADMIN')

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const pageTitle = computed(() => {
  const match = ADMIN_NAV_ITEMS.find((item) => isActive(item.to))
  return match?.label || 'Admin'
})

async function handleLogout() {
  // POST /api/auth/logout for server-side session clear + audit log,
  // then drop the client-side session cookie via useUserSession().clear()
  // before redirecting.
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch {
    // Best-effort — even if the server call fails, still clear locally and
    // redirect so the user isn't trapped.
  }
  await clear()
  navigateTo('/admin/login')
}

watch(() => route.path, () => { mobileMenuOpen.value = false })

onMounted(() => {
  hydrated.value = true
  const handler = () => { if (window.innerWidth > 1024) mobileMenuOpen.value = false }
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => window.removeEventListener('resize', handler))
})
</script>
