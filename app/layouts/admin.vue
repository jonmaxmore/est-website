<template>
  <div class="flex min-h-screen bg-surface-primary">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/6 bg-surface-secondary">
      <!-- Brand -->
      <div class="border-b border-white/6 p-5">
        <NuxtLink to="/admin" class="flex items-center gap-3 text-white no-underline">
          <img src="/images/logo.webp" alt="ETS" class="h-8 w-8 object-contain" />
          <span class="text-sm font-bold uppercase tracking-wider">ETS Admin</span>
        </NuxtLink>
      </div>

      <!-- Nav -->
      <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        <template v-for="group in navGroups" :key="group.title">
          <p class="mb-1 mt-4 px-3 text-[0.625rem] font-semibold uppercase tracking-widest text-white/25 first:mt-0">{{ group.title }}</p>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-white/50 transition-all duration-300 hover:bg-white/4 hover:text-white"
            :class="isActive(item.to) ? 'border border-gold/20 bg-gold/10 !text-gold' : ''"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="ml-auto rounded-full bg-gold/20 px-1.5 py-0.5 text-[0.5625rem] font-bold text-gold">{{ item.badge }}</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- Quick Actions -->
      <div class="border-t border-white/6 p-3">
        <NuxtLink
          to="/"
          target="_blank"
          class="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/6 bg-transparent px-2 py-2 text-sm text-white/50 no-underline transition-all duration-300 hover:border-gold/30 hover:text-gold"
        >
          🌐 View Site
        </NuxtLink>
        <button
          class="w-full cursor-pointer rounded-lg border border-white/6 bg-transparent px-2 py-2 text-sm text-white/50 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          @click="handleLogout"
        >
          🚪 Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="ml-60 flex flex-1 flex-col">
      <!-- Topbar -->
      <header class="sticky top-0 z-30 flex items-center justify-between border-b border-white/6 bg-white/4 px-6 py-4 backdrop-blur-xl">
        <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-white/50">{{ user?.displayName || 'Admin' }}</span>
          <span class="rounded-full bg-gold/10 px-2 py-0.5 text-[0.625rem] font-bold text-gold">{{ user?.role || 'ADMIN' }}</span>
        </div>
      </header>

      <div class="flex-1 p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const route = useRoute()

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', icon: '📊', label: 'Dashboard' },
      { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/homepage', icon: '🏠', label: 'Homepage' },
      { to: '/admin/news', icon: '📰', label: 'News' },
      { to: '/admin/weapons', icon: '⚔️', label: 'Weapons' },
      { to: '/admin/features', icon: '🌟', label: 'Features' },
      { to: '/admin/highlights', icon: '✨', label: 'Highlights' },
      { to: '/admin/faq', icon: '❓', label: 'FAQ' },
      { to: '/admin/pages', icon: '📄', label: 'Pages' },
      { to: '/admin/media', icon: '🖼️', label: 'Media' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { to: '/admin/registrations', icon: '👥', label: 'Registrations' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { to: '/admin/menus', icon: '🧭', label: 'Navigation' },
      { to: '/admin/appearance', icon: '🎨', label: 'Theme' },
      { to: '/admin/seo', icon: '🔍', label: 'SEO' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/users', icon: '👤', label: 'Users' },
      { to: '/admin/integrations', icon: '🔗', label: 'Integrations' },
      { to: '/admin/activity', icon: '📋', label: 'Activity Log' },
      { to: '/admin/backup', icon: '💾', label: 'Backup' },
      { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
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
</script>
