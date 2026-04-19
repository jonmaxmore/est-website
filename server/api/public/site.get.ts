/** Enhanced public site config — returns navigation, social, appearance, FAQ in one call */
export default defineEventHandler(async () => {
  // Fetch all relevant configs in one query
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: ['navigation', 'social', 'appearance', 'seo', 'faq', 'maintenance'],
      },
    },
  })

  const configMap = new Map<string, unknown>()
  for (const c of configs) {
    configMap.set(c.key, c.value)
  }

  // Parse navigation — support both legacy (array) and new (object with main/footer) formats
  const navRaw = configMap.get('navigation')
  let mainNav: Array<{ labelEn: string; labelTh: string; href: string; visible?: boolean }> = []
  let footerNav: Array<{ labelEn: string; labelTh: string; href: string; visible?: boolean }> = []

  if (Array.isArray(navRaw)) {
    // Legacy format: flat array of nav items
    mainNav = navRaw as typeof mainNav
  } else if (navRaw && typeof navRaw === 'object') {
    const navObj = navRaw as { main?: typeof mainNav; footer?: typeof footerNav }
    mainNav = navObj.main || []
    footerNav = navObj.footer || []
  }

  // Defaults if empty
  if (mainNav.length === 0) {
    mainNav = [
      { labelEn: 'Home', labelTh: 'หน้าแรก', href: '/' },
      { labelEn: 'Weapons', labelTh: 'อาวุธ', href: '/weapons' },
      { labelEn: 'News', labelTh: 'ข่าวสาร', href: '/news' },
      { labelEn: 'Game Guide', labelTh: 'คู่มือเกม', href: '/game-guide' },
      { labelEn: 'Support', labelTh: 'ช่วยเหลือ', href: '/support' },
    ]
  }

  return {
    navigation: {
      main: mainNav.filter((n) => n.visible !== false),
      footer: footerNav.filter((n) => n.visible !== false),
    },
    social: (configMap.get('social') || {}) as Record<string, string>,
    appearance: (configMap.get('appearance') || {}) as Record<string, string>,
    seo: (configMap.get('seo') || {}) as Record<string, string>,
    faq: (configMap.get('faq') || []) as Array<{
      labelEn: string; labelTh: string; contentEn: string; contentTh: string; visible: boolean
    }>,
    maintenance: (configMap.get('maintenance') || { enabled: false }) as { enabled: boolean; messageEn?: string; messageTh?: string },
  }
})
