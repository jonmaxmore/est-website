<template>
  <div
    data-testid="admin-layout"
    :data-ready="hydrated ? 'true' : 'false'"
    class="admin-root"
    :class="{ 'sidebar-collapsed': sidebarCollapsed, 'sidebar-mobile-open': mobileMenuOpen }"
  >
    <!-- Mobile Overlay -->
    <Transition name="fade">
      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false" />
    </Transition>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Brand -->
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

      <!-- Nav Groups -->
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
            <span v-if="(item as any).badge && !sidebarCollapsed" class="nav-badge">{{ (item as any).badge }}</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- Sidebar Footer -->
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

    <!-- Main Content -->
    <div class="main-wrapper">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
            <UIcon name="i-lucide-menu" />
          </button>
          <AdminBreadcrumb />
        </div>
        <div class="topbar-right">
          <!-- Search Trigger -->
          <button class="topbar-search-btn" @click="commandPalette?.open()" title="Search (Ctrl+K)">
            <UIcon name="i-lucide-search" class="search-icon-svg" />
            <span class="search-label">Search...</span>
            <kbd class="search-kbd">⌘K</kbd>
          </button>

          <!-- Admin Language Toggle -->
          <div class="admin-lang-toggle">
            <button
              v-for="l in ['TH', 'EN']"
              :key="l"
              class="admin-lang-btn"
              :class="{ active: adminLang === l }"
              @click="adminLang = l as 'TH' | 'EN'"
            >
              {{ l }}
            </button>
          </div>

          <!-- User Info -->
          <div class="topbar-user">
            <div class="user-avatar">{{ ((user as any)?.displayName || 'A').charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <span class="user-name">{{ (user as any)?.displayName || 'Admin' }}</span>
              <span class="user-role-badge">{{ (user as any)?.role || 'ADMIN' }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Title -->
      <div class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="env-badge">
          <span class="env-dot" />
          PRODUCTION
        </div>
      </div>

      <!-- Page Content -->
      <div class="page-content">
        <slot />
      </div>
    </div>

    <!-- Command Palette -->
    <AdminCommandPalette ref="commandPalette" />
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const route = useRoute()

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const adminLang = ref<'TH' | 'EN'>('EN')
const commandPalette = ref<{ open: () => void } | null>(null)
const hydrated = ref(false)

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', icon: 'i-lucide-layout-dashboard', label: 'Dashboard' },
      { to: '/admin/analytics', icon: 'i-lucide-bar-chart-3', label: 'Analytics' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/homepage', icon: 'i-lucide-home', label: 'Homepage' },
      { to: '/admin/news', icon: 'i-lucide-newspaper', label: 'Webzine Articles' },
      { to: '/admin/topics', icon: 'i-lucide-tags', label: 'Topics' },
      { to: '/admin/banners', icon: 'i-lucide-flag', label: 'Banner Control' },
      { to: '/admin/weapons', icon: 'i-lucide-swords', label: 'Weapons' },
      { to: '/admin/features', icon: 'i-lucide-sparkles', label: 'Features' },
      { to: '/admin/highlights', icon: 'i-lucide-star', label: 'Highlights' },
      { to: '/admin/events', icon: 'i-lucide-calendar', label: 'Events & Hot Time' },
      { to: '/admin/milestones', icon: 'i-lucide-trophy', label: 'Milestones' },
      { to: '/admin/download', icon: 'i-lucide-download', label: 'Download Page' },
      { to: '/admin/faq', icon: 'i-lucide-help-circle', label: 'FAQ' },
      { to: '/admin/pages', icon: 'i-lucide-file-text', label: 'Pages' },
      { to: '/admin/media', icon: 'i-lucide-image', label: 'Media' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { to: '/admin/registrations', icon: 'i-lucide-users', label: 'Registrations' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { to: '/admin/menus', icon: 'i-lucide-menu', label: 'Navigation' },
      { to: '/admin/appearance', icon: 'i-lucide-palette', label: 'Theme' },
      { to: '/admin/seo', icon: 'i-lucide-search', label: 'SEO' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/users', icon: 'i-lucide-user', label: 'Users' },
      { to: '/admin/integrations', icon: 'i-lucide-plug', label: 'Integrations' },
      { to: '/admin/activity', icon: 'i-lucide-clipboard-list', label: 'Activity Log' },
      { to: '/admin/backup', icon: 'i-lucide-hard-drive', label: 'Backup' },
      { to: '/admin/settings', icon: 'i-lucide-settings', label: 'Settings' },
    ],
  },
]

const allNavItems = navGroups.flatMap((g) => g.items)

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const pageTitle = computed(() => {
  const match = allNavItems.find((item) => isActive(item.to))
  return match?.label || 'Admin'
})

async function handleLogout() {
  await clear()
  navigateTo('/admin/login')
}

// Close mobile menu on route change
watch(() => route.path, () => { mobileMenuOpen.value = false })

// Close mobile menu on resize to desktop
onMounted(() => {
  hydrated.value = true
  const handler = () => { if (window.innerWidth > 1024) mobileMenuOpen.value = false }
  window.addEventListener('resize', handler)
  onBeforeUnmount(() => window.removeEventListener('resize', handler))
})
</script>

<style scoped>
/* ═══════════════════════════════════ */
/* VARIABLES                         */
/* ═══════════════════════════════════ */
.admin-root {
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 68px;
  --topbar-height: 56px;
  --gold: #d4a843;
  --gold-light: #e8c468;
  display: flex;
  min-height: 100vh;
  background: var(--color-surface-primary, #0a0a0f);
}

/* ═══════════════════════════════════ */
/* SIDEBAR                            */
/* ═══════════════════════════════════ */
.sidebar {
  position: fixed;
  inset-y: 0;
  left: 0;
  z-index: 40;
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #0e0e15 0%, #09090d 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  min-height: 60px;
}
.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  overflow: hidden;
}
.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}
.brand-name {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: white;
  white-space: nowrap;
}
.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.5rem;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
}

/* Nav */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
}
.nav-group-title {
  margin: 16px 0 4px;
  padding: 0 10px;
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.15);
  white-space: nowrap;
}
.nav-group-title:first-child { margin-top: 4px; }
.nav-group-dot {
  margin: 12px auto 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8125rem;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: 1px;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
}
.nav-item.active {
  background: rgba(212, 168, 67, 0.08);
  color: var(--gold);
  border: 1px solid rgba(212, 168, 67, 0.12);
}
.nav-icon {
  width: 22px;
  text-align: center;
  font-size: 0.9375rem;
  flex-shrink: 0;
}
.nav-icon-svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.7;
}
.nav-item.active .nav-icon-svg {
  opacity: 1;
  color: var(--gold);
}
.sidebar-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.search-icon-svg {
  width: 14px;
  height: 14px;
  opacity: 0.5;
}
.nav-label { font-weight: 500; }
.nav-badge {
  margin-left: auto;
  padding: 1px 7px;
  border-radius: 10px;
  background: rgba(212, 168, 67, 0.15);
  color: var(--gold);
  font-size: 0.5625rem;
  font-weight: 700;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}
.sidebar-footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.8125rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 4px;
}
.view-site-btn:hover {
  border-color: rgba(212, 168, 67, 0.2);
  color: var(--gold);
}
.logout-btn:hover {
  border-color: rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
}

/* ═══════════════════════════════════ */
/* MAIN WRAPPER                       */
/* ═══════════════════════════════════ */
.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar-collapsed .main-wrapper {
  margin-left: var(--sidebar-collapsed-width);
}

/* ═══════════════════════════════════ */
/* TOPBAR                             */
/* ═══════════════════════════════════ */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 20px;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.125rem;
  cursor: pointer;
}

/* Search Button */
.topbar-search-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
}
.topbar-search-btn:hover {
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.4);
}
.search-icon { font-size: 0.75rem; }
.search-label { flex: 1; text-align: left; }
.search-kbd {
  padding: 1px 5px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.5625rem;
  font-family: inherit;
}

/* Admin Language Toggle */
.admin-lang-toggle {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
}
.admin-lang-btn {
  padding: 5px 10px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.admin-lang-btn.active {
  background: rgba(212, 168, 67, 0.1);
  color: var(--gold);
}
.admin-lang-btn:hover:not(.active) {
  color: rgba(255, 255, 255, 0.6);
}

/* User */
.topbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 10px;
  transition: background 0.15s;
}
.topbar-user:hover {
  background: rgba(255, 255, 255, 0.03);
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(212, 168, 67, 0.2), rgba(212, 168, 67, 0.08));
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.user-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}
.user-role-badge {
  font-size: 0.5625rem;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 0.05em;
}

/* ═══════════════════════════════════ */
/* PAGE HEADER                        */
/* ═══════════════════════════════════ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}
.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0;
}
.env-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.06);
  color: rgba(16, 185, 129, 0.6);
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.env-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s infinite;
}

/* ═══════════════════════════════════ */
/* PAGE CONTENT                       */
/* ═══════════════════════════════════ */
.page-content {
  flex: 1;
  padding: 20px 24px 32px;
}

/* ═══════════════════════════════════ */
/* MOBILE OVERLAY                     */
/* ═══════════════════════════════════ */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(0, 0, 0, 0.6);
}

/* ═══════════════════════════════════ */
/* TRANSITIONS                        */
/* ═══════════════════════════════════ */
.brand-text-enter-active, .brand-text-leave-active { transition: opacity 0.2s, transform 0.2s; }
.brand-text-enter-from, .brand-text-leave-to { opacity: 0; transform: translateX(-8px); }
.nav-label-enter-active, .nav-label-leave-active { transition: opacity 0.15s; }
.nav-label-enter-from, .nav-label-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ═══════════════════════════════════ */
/* RESPONSIVE                         */
/* ═══════════════════════════════════ */
@media (max-width: 1024px) {
  .admin-root {
    --sidebar-width: 250px;
  }
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar-mobile-open .sidebar {
    transform: translateX(0);
    box-shadow: 8px 0 30px rgba(0, 0, 0, 0.5);
  }
  .sidebar-mobile-open .mobile-overlay {
    display: block;
  }
  .main-wrapper {
    margin-left: 0 !important;
  }
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .collapse-btn { display: none; }
  .desktop-only { display: none; }
  .topbar-search-btn { min-width: auto; }
  .search-label, .search-kbd { display: none; }
  .user-info { display: none; }
}

@media (max-width: 640px) {
  .page-content { padding: 16px; }
  .page-header { padding: 16px 16px 0; }
  .topbar { padding: 0 12px; }
  .admin-lang-toggle { display: none; }
  .env-badge { display: none; }
}
</style>
