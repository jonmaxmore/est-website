import { normalizeNavigationConfig, resolveNavigationHref } from '../../../app/shared/cms/navigation'
import { normalizeWebzineTopics } from '../../../app/shared/cms/webzine'
import { normalizeIntegrationsConfig } from '../../utils/admin-config'

/** Enhanced public site config â€” returns navigation, social, appearance, FAQ in one call */
export default defineEventHandler(async () => {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
          in: ['navigation', 'social', 'appearance', 'seo', 'faq', 'maintenance', 'integrations', 'webzine_topics'],
      },
    },
  })

  const configMap = new Map<string, unknown>()
  for (const config of configs) {
    configMap.set(config.key, config.value)
  }

  const navigation = normalizeNavigationConfig(configMap.get('navigation'))
  const integrations = normalizeIntegrationsConfig(configMap.get('integrations'))
  const webzineTopicConfig = configMap.get('webzine_topics')
  let mainNav = navigation.main
  const footerNav = navigation.footer

  if (mainNav.length === 0) {
    mainNav = [
      { id: 'default-home', type: 'custom', labelEn: 'Home', labelTh: 'à¸«à¸™à¹‰à¸²à¹à¸£à¸', href: '/', visible: true, target: '_self' },
      { id: 'default-weapons', type: 'custom', labelEn: 'Weapons', labelTh: 'à¸­à¸²à¸§à¸¸à¸˜', href: '/weapons', visible: true, target: '_self' },
      { id: 'default-news', type: 'custom', labelEn: 'News', labelTh: 'à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£', href: '/news', visible: true, target: '_self' },
      { id: 'default-guide', type: 'custom', labelEn: 'Game Guide', labelTh: 'à¸„à¸¹à¹ˆà¸¡à¸·à¸­à¹€à¸à¸¡', href: '/game-guide', visible: true, target: '_self' },
      { id: 'default-support', type: 'custom', labelEn: 'Support', labelTh: 'à¸Šà¹ˆà¸§à¸¢à¹€à¸«à¸¥à¸·à¸­', href: '/support', visible: true, target: '_self' },
    ]
  }

  const pageKeys = [...mainNav, ...footerNav]
    .filter((item) => item.type === 'page' && item.pageKey)
    .map((item) => item.pageKey as string)

  const pageRecords = pageKeys.length > 0
    ? await prisma.pageContent.findMany({
        where: {
          key: { in: [...new Set(pageKeys)] },
          status: 'PUBLISHED',
        },
        select: { key: true, slug: true, isSystemPage: true },
      })
    : []

  const pageMap = new Map(pageRecords.map((page) => [page.key, page]))
  const resolveVisibleItems = (items: typeof mainNav) =>
    items
      .filter((item) => item.visible !== false)
      .map((item) => {
        const href = resolveNavigationHref(item, item.pageKey ? pageMap.get(item.pageKey) : undefined)
        return href ? { ...item, href } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    navigation: {
      main: resolveVisibleItems(mainNav),
      footer: resolveVisibleItems(footerNav),
    },
    webzineTopics: normalizeWebzineTopics(Array.isArray(webzineTopicConfig) ? webzineTopicConfig : []),
    social: (configMap.get('social') || {}) as Record<string, string>,
    appearance: (configMap.get('appearance') || {}) as Record<string, string>,
    seo: (configMap.get('seo') || {}) as Record<string, string>,
    tracking: {
      enabled: integrations.analytics.enabled,
      googleAnalyticsId: integrations.analytics.googleAnalyticsId,
      googleTagManagerId: integrations.analytics.googleTagManagerId,
      metaPixelId: integrations.analytics.metaPixelId,
      debug: integrations.analytics.debug,
    },
    faq: (configMap.get('faq') || []) as Array<{
      labelEn: string
      labelTh: string
      contentEn: string
      contentTh: string
      visible: boolean
    }>,
    maintenance: (configMap.get('maintenance') || { enabled: false }) as {
      enabled: boolean
      messageEn?: string
      messageTh?: string
    },
  }
})
