<template>
  <nav class="ab-nav" aria-label="Breadcrumb">
    <NuxtLink to="/admin" class="ab-item ab-home" title="Dashboard"><UIcon name="i-lucide-layout-dashboard" class="w-4 h-4" /></NuxtLink>
    <template v-for="(crumb, i) in crumbs" :key="i">
      <span class="ab-sep">›</span>
      <NuxtLink v-if="i < crumbs.length - 1" :to="crumb.path" class="ab-item">{{ crumb.label }}</NuxtLink>
      <span v-else class="ab-item ab-current">{{ crumb.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const labelMap: Record<string, string> = {
  admin: 'Dashboard', news: 'News', weapons: 'Weapons', features: 'Features',
  highlights: 'Highlights', faq: 'FAQ', pages: 'Pages', media: 'Media',
  registrations: 'Registrations', menus: 'Navigation', appearance: 'Theme',
  seo: 'SEO', users: 'Users', integrations: 'Integrations', activity: 'Activity Log',
  backup: 'Backup', settings: 'Settings', analytics: 'Analytics', homepage: 'Homepage',
}

const crumbs = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  // Remove 'admin' prefix from crumbs (already shown as home icon)
  const adminIndex = segments.indexOf('admin')
  const remaining = segments.slice(adminIndex + 1)
  
  return remaining.map((seg, i) => ({
    label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    path: '/' + segments.slice(0, adminIndex + 1 + i + 1).join('/'),
  }))
})
</script>

<style scoped>
.ab-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
}
.ab-home {
  text-decoration: none;
  font-size: 0.875rem;
  opacity: 0.5;
  transition: opacity 0.15s;
}
.ab-home:hover { opacity: 1; }
.ab-sep { color: rgba(255, 255, 255, 0.15); font-size: 0.875rem; }
.ab-item {
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.15s;
}
.ab-item:hover { color: rgba(255, 255, 255, 0.8); }
.ab-current { color: rgba(255, 255, 255, 0.8); font-weight: 500; }
</style>
