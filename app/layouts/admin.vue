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
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-white/50 transition-all duration-300 hover:bg-white/4 hover:text-white"
          :class="route.path === item.to ? 'border border-gold/20 bg-gold/10 !text-gold' : ''"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="border-t border-white/6 p-3">
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
        <span class="text-sm text-white/50">{{ user?.displayName || 'Admin' }}</span>
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

const navItems = [
  { to: '/admin', icon: '📊', label: 'Dashboard' },
  { to: '/admin/news', icon: '📰', label: 'News' },
  { to: '/admin/weapons', icon: '⚔️', label: 'Weapons' },
  { to: '/admin/media', icon: '🖼️', label: 'Media' },
  { to: '/admin/registrations', icon: '👥', label: 'Registrations' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
]

const pageTitle = computed(() => {
  const match = navItems.find((item) => item.to === route.path)
  return match?.label || 'Admin'
})

async function handleLogout() {
  await clear()
  navigateTo('/admin/login')
}
</script>
