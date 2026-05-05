/**
 * Sidebar navigation structure for the admin layout.
 * Single source of truth — referenced by both AdminCommandPalette and admin.vue
 * so the two can't drift apart silently.
 */
export type AdminNavItem = {
  to: string
  icon: string
  label: string
  badge?: string
}

export type AdminNavGroup = {
  title: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
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
      { to: '/admin/milestones', icon: 'i-lucide-trophy', label: 'Milestones' },
      { to: '/admin/download', icon: 'i-lucide-download', label: 'Download Page' },
      { to: '/admin/faq', icon: 'i-lucide-help-circle', label: 'FAQ' },
      { to: '/admin/pages', icon: 'i-lucide-file-text', label: 'Pages' },
      { to: '/admin/media', icon: 'i-lucide-image', label: 'Media' },
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

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items)
