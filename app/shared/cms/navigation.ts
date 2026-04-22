export type NavigationItem = {
  id: string
  type: 'page' | 'custom'
  labelEn: string
  labelTh: string
  pageKey?: string
  href?: string
  target?: '_self' | '_blank'
  visible: boolean
}

function toNavigationItem(item: unknown, index: number): NavigationItem {
  const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}

  return {
    id: String(candidate.id || `legacy-main-${index}`),
    type: candidate.type === 'page' ? 'page' : 'custom',
    labelEn: String(candidate.labelEn || candidate.label || ''),
    labelTh: String(candidate.labelTh || candidate.label || ''),
    pageKey: typeof candidate.pageKey === 'string' ? candidate.pageKey : undefined,
    href: typeof candidate.href === 'string' ? candidate.href : '/',
    target: candidate.target === '_blank' ? '_blank' : '_self',
    visible: candidate.visible !== false,
  }
}

export function normalizeNavigationConfig(value: unknown): { main: NavigationItem[]; footer: NavigationItem[] } {
  if (Array.isArray(value)) {
    return {
      main: value.map((item, index) => toNavigationItem(item, index)),
      footer: [],
    }
  }

  const navigation = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const main = Array.isArray(navigation.main) ? navigation.main.map((item, index) => toNavigationItem(item, index)) : []
  const footer = Array.isArray(navigation.footer)
    ? navigation.footer.map((item, index) => toNavigationItem(item, index))
    : []

  return { main, footer }
}

export function resolveNavigationHref(
  item: NavigationItem,
  page?: { key: string; slug: string; isSystemPage: boolean },
) {
  if (item.type === 'page' && page) {
    return page.slug === '' ? '/' : `/${page.slug}`
  }

  return item.href || '/'
}
