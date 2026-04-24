import { z } from 'zod'

import { HERO_BACKGROUND_MODES, isSupportedHomepageSectionType, normalizeHeroBackgroundMode } from '../../app/shared/cms/homepage'
import { normalizeNavigationConfig } from '../../app/shared/cms/navigation'
import { normalizeWebzineTopics } from '../../app/shared/cms/webzine'

const homepageSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().refine(isSupportedHomepageSectionType, 'Unsupported homepage section type'),
  visible: z.boolean(),
  order: z.number().int().nonnegative(),
  background: z.string(),
  config: z.record(z.string(), z.unknown()),
})

const homepageSectionsSchema = z.object({
  sections: z.array(homepageSectionSchema),
})

const webzineTopicSchema = z.object({
  key: z.string().min(1),
  slug: z.string().optional().default(''),
  labelEn: z.string().min(1),
  labelTh: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  descriptionTh: z.string().optional().default(''),
  icon: z.string().optional().default(''),
  color: z.string().optional().default(''),
  visible: z.boolean().optional().default(true),
})

const webzineTopicsSchema = z.array(webzineTopicSchema)

const heroButtonVariantSchema = z.enum(['primary', 'secondary', 'ghost'])
const heroButtonTargetSchema = z.enum(['_self', '_blank'])
const heroButtonSchema = z.object({
  id: z.string().optional(),
  labelEn: z.string().optional().default(''),
  labelTh: z.string().optional().default(''),
  href: z.string().optional().default(''),
  variant: heroButtonVariantSchema.optional().default('primary'),
  visible: z.boolean().optional().default(true),
  order: z.number().int().nonnegative().optional().default(0),
  target: heroButtonTargetSchema.optional().default('_self'),
})

const heroSectionConfigSchema = z.object({
  logo: z.string().optional().default('/images/logo.webp'),
  subtitleEn: z.string().optional().default(''),
  subtitleTh: z.string().optional().default(''),
  showSocialLinks: z.boolean().optional().default(false),
  backgroundMode: z.enum(HERO_BACKGROUND_MODES).optional().default('image'),
  backgroundVideo: z.string().optional().default(''),
  buttons: z.array(heroButtonSchema).optional().default([]),
})

const eventRewardSchema = z.object({
  id: z.string().optional(),
  titleEn: z.string().optional().default(''),
  titleTh: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  descriptionTh: z.string().optional().default(''),
  image: z.string().optional().default(''),
  label: z.string().optional().default(''),
  visible: z.boolean().optional().default(true),
  order: z.number().int().nonnegative().optional().default(0),
})

const eventPageSchema = z.object({
  badgeEn: z.string().optional().default('Pre-registration'),
  badgeTh: z.string().optional().default('Pre-registration'),
  titleEn: z.string().optional().default('Pre-registration'),
  titleTh: z.string().optional().default('Pre-registration'),
  subtitleEn: z.string().optional().default('Join early and unlock launch rewards for everyone.'),
  subtitleTh: z.string().optional().default('Join early and unlock launch rewards for everyone.'),
  backgroundImage: z.string().optional().default('/images/hero-bg.webp'),
  targetDate: z.string().optional().default('2026-10-01T00:00:00+07:00'),
  countdownLabelEn: z.string().optional().default('Launch target'),
  countdownLabelTh: z.string().optional().default('Launch target'),
  registrationLabelEn: z.string().optional().default('Total Pre-Registrations'),
  registrationLabelTh: z.string().optional().default('Total Pre-Registrations'),
  registrationDisplayMode: z.enum(['actual', 'manual', 'actual_plus_manual']).optional().default('actual'),
  manualRegistrationCount: z.number().int().nonnegative().optional().default(0),
  formTitleEn: z.string().optional().default('Pre-register now'),
  formTitleTh: z.string().optional().default('Pre-register now'),
  formDescriptionEn: z.string().optional().default('Get exclusive rewards at launch.'),
  formDescriptionTh: z.string().optional().default('Get exclusive rewards at launch.'),
  legalCopyEn: z.string().optional().default('By registering, you agree to receive game updates.'),
  legalCopyTh: z.string().optional().default('By registering, you agree to receive game updates.'),
  rewardsTitleEn: z.string().optional().default('Pre-Registration Rewards'),
  rewardsTitleTh: z.string().optional().default('Pre-Registration Rewards'),
  rewardsSubtitleEn: z.string().optional().default('Everyone who pre-registers will receive these launch rewards.'),
  rewardsSubtitleTh: z.string().optional().default('Everyone who pre-registers will receive these launch rewards.'),
  baseRewards: z.array(eventRewardSchema).optional().default([]),
})

const downloadPlatformSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional().default(''),
  platform: z.enum(['ios', 'android', 'pc', 'windows', 'mac', 'steam', 'epic', 'apk']).optional().default('pc'),
  url: z.string().optional().default(''),
  helperTextEn: z.string().optional().default(''),
  helperTextTh: z.string().optional().default(''),
  visible: z.boolean().optional().default(true),
  order: z.number().int().nonnegative().optional().default(0),
})

const downloadPageSchema = z.object({
  heroTitleEn: z.string().optional().default('Download Eternal Tower Saga'),
  heroTitleTh: z.string().optional().default('Download Eternal Tower Saga'),
  heroSubtitleEn: z.string().optional().default('Choose your platform and start your climb.'),
  heroSubtitleTh: z.string().optional().default('Choose your platform and start your climb.'),
  backgroundImage: z.string().optional().default('/images/hero-bg.webp'),
  primaryNoteEn: z.string().optional().default('Use official links only. Progress syncs through your game account.'),
  primaryNoteTh: z.string().optional().default('Use official links only. Progress syncs through your game account.'),
  platforms: z.array(downloadPlatformSchema).optional().default([]),
})

const faqSchema = z.array(
  z
    .object({
      labelEn: z.string(),
      labelTh: z.string(),
      contentEn: z.string(),
      contentTh: z.string(),
      visible: z.boolean(),
    })
    .superRefine((value, ctx) => {
      if (!value.labelEn.trim() && !value.labelTh.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one FAQ question language is required',
        })
      }

      if (!value.contentEn.trim() && !value.contentTh.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one FAQ answer language is required',
        })
      }
    }),
)

const integrationsSchema = z.object({
  webhookSecret: z.string().optional().default(''),
  analytics: z
    .object({
      enabled: z.boolean().optional().default(false),
      googleAnalyticsId: z.string().optional().default(''),
      googleTagManagerId: z.string().optional().default(''),
      metaPixelId: z.string().optional().default(''),
      metaConversionsApiToken: z.string().optional().default(''),
      debug: z.boolean().optional().default(false),
    })
    .optional(),
  wordpress: z
    .object({
      enabled: z.boolean().optional().default(false),
      url: z.string().optional().default(''),
      apiKey: z.string().optional().default(''),
      syncDirection: z.enum(['pull', 'push', 'bidirectional']).optional().default('bidirectional'),
    })
    .optional(),
  wix: z
    .object({
      enabled: z.boolean().optional().default(false),
      accountId: z.string().optional().default(''),
      apiKey: z.string().optional().default(''),
      webhookSecret: z.string().optional().default(''),
    })
    .optional(),
})

const maintenanceSchema = z.object({
  enabled: z.boolean(),
  messageEn: z.string().optional().default(''),
  messageTh: z.string().optional().default(''),
})

const stringRecordSchema = z.record(z.string(), z.string())

function parseNavigationConfig(value: unknown) {
  const navigation = normalizeNavigationConfig(value)

  for (const item of [...navigation.main, ...navigation.footer]) {
    if (item.type === 'page' && !item.pageKey?.trim()) {
      throw new Error('Page navigation items require a page key')
    }

    if (item.type === 'custom' && !item.href?.trim()) {
      throw new Error('Custom navigation items require an href')
    }
  }

  return navigation
}

export const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: 'hero', type: 'hero', visible: true, order: 0, background: '/images/hero-bg.webp', config: {} },
  { id: 'weapons', type: 'weapons', visible: true, order: 1, background: '', config: {} },
  { id: 'features', type: 'features', visible: true, order: 2, background: '', config: {} },
  { id: 'highlights', type: 'highlights', visible: true, order: 3, background: '', config: {} },
  { id: 'news', type: 'news', visible: true, order: 4, background: '', config: {} },
  { id: 'cta', type: 'cta', visible: true, order: 5, background: '', config: {} },
] as const

export const DEFAULT_HERO_SECTION_CONFIG = {
  logo: '/images/logo.webp',
  subtitleEn: '',
  subtitleTh: '',
  showSocialLinks: true,
  backgroundMode: 'image' as const,
  backgroundVideo: '',
  buttons: [
    { id: 'pre-register', labelEn: 'Pre-register', labelTh: 'Pre-register', href: '/event', variant: 'primary' as const, visible: true, order: 0, target: '_self' as const },
    { id: 'download', labelEn: 'Download', labelTh: 'Download', href: '/download', variant: 'secondary' as const, visible: true, order: 1, target: '_self' as const },
  ],
}

export const DEFAULT_EVENT_PAGE_CONFIG = {
  badgeEn: 'Pre-registration',
  badgeTh: 'Pre-registration',
  titleEn: 'Pre-registration',
  titleTh: 'Pre-registration',
  subtitleEn: 'Join early and unlock launch rewards for everyone.',
  subtitleTh: 'Join early and unlock launch rewards for everyone.',
  backgroundImage: '/images/hero-bg.webp',
  targetDate: '2026-10-01T00:00:00+07:00',
  countdownLabelEn: 'Launch target',
  countdownLabelTh: 'Launch target',
  registrationLabelEn: 'Total Pre-Registrations',
  registrationLabelTh: 'Total Pre-Registrations',
  registrationDisplayMode: 'actual' as const,
  manualRegistrationCount: 0,
  formTitleEn: 'Pre-register now',
  formTitleTh: 'Pre-register now',
  formDescriptionEn: 'Get exclusive rewards at launch.',
  formDescriptionTh: 'Get exclusive rewards at launch.',
  legalCopyEn: 'By registering, you agree to receive game updates.',
  legalCopyTh: 'By registering, you agree to receive game updates.',
  rewardsTitleEn: 'Pre-Registration Rewards',
  rewardsTitleTh: 'Pre-Registration Rewards',
  rewardsSubtitleEn: 'Everyone who pre-registers will receive these launch rewards.',
  rewardsSubtitleTh: 'Everyone who pre-registers will receive these launch rewards.',
  baseRewards: [
    { id: 'gems', titleEn: 'Gems x1000', titleTh: 'Gems x1000', descriptionEn: 'Premium currency to start strong.', descriptionTh: 'Premium currency to start strong.', image: '', label: 'GEM', visible: true, order: 0 },
    { id: 'sr-box', titleEn: 'SR Weapon Box', titleTh: 'SR Weapon Box', descriptionEn: 'Choose any SR weapon at launch.', descriptionTh: 'Choose any SR weapon at launch.', image: '', label: 'SR', visible: true, order: 1 },
    { id: 'title', titleEn: 'Exclusive Title', titleTh: 'Exclusive Title', descriptionEn: 'Limited title for early supporters.', descriptionTh: 'Limited title for early supporters.', image: '', label: 'TTL', visible: true, order: 2 },
    { id: 'frame', titleEn: 'Avatar Frame', titleTh: 'Avatar Frame', descriptionEn: 'Limited edition profile frame.', descriptionTh: 'Limited edition profile frame.', image: '', label: 'AVT', visible: true, order: 3 },
  ],
}

export const DEFAULT_DOWNLOAD_PAGE_CONFIG = {
  heroTitleEn: 'Download Eternal Tower Saga',
  heroTitleTh: 'Download Eternal Tower Saga',
  heroSubtitleEn: 'Choose your platform and start your climb.',
  heroSubtitleTh: 'Choose your platform and start your climb.',
  backgroundImage: '/images/hero-bg.webp',
  primaryNoteEn: 'Use official links only. Progress syncs through your game account.',
  primaryNoteTh: 'Use official links only. Progress syncs through your game account.',
  platforms: [
    { id: 'ios', label: 'App Store', platform: 'ios' as const, url: '', helperTextEn: 'iPhone and iPad', helperTextTh: 'iPhone and iPad', visible: true, order: 0 },
    { id: 'android', label: 'Google Play', platform: 'android' as const, url: '', helperTextEn: 'Android phones and tablets', helperTextTh: 'Android phones and tablets', visible: true, order: 1 },
    { id: 'pc', label: 'Windows PC', platform: 'pc' as const, url: '', helperTextEn: 'Standalone PC launcher', helperTextTh: 'Standalone PC launcher', visible: true, order: 2 },
  ],
}

export const DEFAULT_INTEGRATIONS_CONFIG = {
  webhookSecret: '',
  analytics: {
    enabled: false,
    googleAnalyticsId: '',
    googleTagManagerId: '',
    metaPixelId: '',
    metaConversionsApiToken: '',
    debug: false,
  },
  wordpress: {
    enabled: false,
    url: '',
    apiKey: '',
    syncDirection: 'bidirectional' as const,
  },
  wix: {
    enabled: false,
    accountId: '',
    apiKey: '',
    webhookSecret: '',
  },
}

function normalizeOrderedItems<T extends { id?: string; order: number }>(
  items: T[],
  prefix: string,
): Array<T & { id: string }> {
  return items
    .map((item, index) => ({
      ...item,
      id: item.id?.trim() || `${prefix}-${index + 1}`,
      order: Number.isFinite(item.order) ? item.order : index,
    }))
    .sort((left, right) => left.order - right.order)
}

export function normalizeHeroSectionConfig(value: unknown) {
  const parsed = heroSectionConfigSchema.safeParse(value)
  const config = parsed.success ? parsed.data : DEFAULT_HERO_SECTION_CONFIG
  const fallback = parsed.success ? DEFAULT_HERO_SECTION_CONFIG : config
  const buttons = config.buttons.length > 0 ? config.buttons : fallback.buttons

  return {
    ...DEFAULT_HERO_SECTION_CONFIG,
    ...config,
    backgroundMode: normalizeHeroBackgroundMode(config.backgroundMode),
    backgroundVideo: String(config.backgroundVideo || '').trim(),
    buttons: normalizeOrderedItems(buttons, 'hero-button').map((button) => ({
      ...button,
      labelEn: button.labelEn || button.labelTh,
      labelTh: button.labelTh || button.labelEn,
    })).filter((button) => button.href.trim() && (button.labelEn.trim() || button.labelTh.trim())),
  }
}

function validateHomepageSectionsForWrite(
  sections: Array<z.infer<typeof homepageSectionSchema> & { config: ReturnType<typeof normalizeHeroSectionConfig> | Record<string, unknown> }>,
) {
  for (const section of sections) {
    if (section.type !== 'hero') {
      continue
    }

    const config = normalizeHeroSectionConfig(section.config)
    if (config.backgroundMode !== 'video') {
      continue
    }

    if (!section.background.trim()) {
      throw new Error('Hero video background requires a poster image')
    }

    if (!config.backgroundVideo.trim()) {
      throw new Error('Hero video background requires a video URL')
    }
  }
}

export function normalizeEventPageConfig(value: unknown) {
  const parsed = eventPageSchema.safeParse(value)
  const config = parsed.success ? parsed.data : DEFAULT_EVENT_PAGE_CONFIG
  const baseRewards = config.baseRewards.length > 0 ? config.baseRewards : DEFAULT_EVENT_PAGE_CONFIG.baseRewards

  return {
    ...DEFAULT_EVENT_PAGE_CONFIG,
    ...config,
    baseRewards: normalizeOrderedItems(baseRewards, 'reward').map((reward) => ({
      ...reward,
      titleEn: reward.titleEn || reward.titleTh,
      titleTh: reward.titleTh || reward.titleEn,
      descriptionEn: reward.descriptionEn || reward.descriptionTh,
      descriptionTh: reward.descriptionTh || reward.descriptionEn,
    })),
  }
}

export function normalizeDownloadPageConfig(value: unknown) {
  const parsed = downloadPageSchema.safeParse(value)
  const config = parsed.success ? parsed.data : DEFAULT_DOWNLOAD_PAGE_CONFIG
  const platforms = config.platforms.length > 0 ? config.platforms : DEFAULT_DOWNLOAD_PAGE_CONFIG.platforms

  return {
    ...DEFAULT_DOWNLOAD_PAGE_CONFIG,
    ...config,
    platforms: normalizeOrderedItems(platforms, 'platform').map((platform) => ({
      ...platform,
      label: platform.label || platform.platform.toUpperCase(),
    })),
  }
}

function normalizeHomepageSectionConfig(section: z.infer<typeof homepageSectionSchema>) {
  if (section.type === 'hero') {
    return { ...section, config: normalizeHeroSectionConfig(section.config) }
  }

  return section
}

export function normalizeHomepageSections(value: unknown) {
  const parsed = homepageSectionsSchema.safeParse(value)

  if (!parsed.success) {
    return [...DEFAULT_HOMEPAGE_SECTIONS]
  }

  return [...parsed.data.sections]
    .map(normalizeHomepageSectionConfig)
    .sort((left, right) => left.order - right.order)
}

export function normalizeIntegrationsConfig(value: unknown) {
  const parsed = integrationsSchema.safeParse(value)

  if (!parsed.success) {
    return {
      ...DEFAULT_INTEGRATIONS_CONFIG,
      wordpress: { ...DEFAULT_INTEGRATIONS_CONFIG.wordpress },
      wix: { ...DEFAULT_INTEGRATIONS_CONFIG.wix },
    }
  }

  return {
    ...DEFAULT_INTEGRATIONS_CONFIG,
    ...parsed.data,
    analytics: {
      ...DEFAULT_INTEGRATIONS_CONFIG.analytics,
      ...(parsed.data.analytics || {}),
    },
    wordpress: {
      ...DEFAULT_INTEGRATIONS_CONFIG.wordpress,
      ...(parsed.data.wordpress || {}),
    },
    wix: {
      ...DEFAULT_INTEGRATIONS_CONFIG.wix,
      ...(parsed.data.wix || {}),
    },
  }
}

const configParsers = {
  navigation: parseNavigationConfig,
  seo: (value: unknown) => stringRecordSchema.parse(value),
  social: (value: unknown) => stringRecordSchema.parse(value),
  appearance: (value: unknown) => stringRecordSchema.parse(value),
  maintenance: (value: unknown) => maintenanceSchema.parse(value),
  homepage_sections: (value: unknown) => {
    const parsed = homepageSectionsSchema.safeParse(value)
    if (!parsed.success) {
      throw parsed.error
    }

    const sections = [...parsed.data.sections]
      .map(normalizeHomepageSectionConfig)
      .sort((left, right) => left.order - right.order)

    validateHomepageSectionsForWrite(sections)

    return { sections }
  },
  integrations: (value: unknown) => normalizeIntegrationsConfig(value),
  event_page: (value: unknown) => normalizeEventPageConfig(value),
  download_page: (value: unknown) => normalizeDownloadPageConfig(value),
  webzine_topics: (value: unknown) => normalizeWebzineTopics(webzineTopicsSchema.parse(value)),
  faq: (value: unknown) => faqSchema.parse(value),
} satisfies Record<string, (value: unknown) => unknown>

export function parseAdminConfigWrite(input: { key: string; value: unknown }) {
  const parser = configParsers[input.key as keyof typeof configParsers]
  if (!parser) {
    throw new Error(`Unsupported config key: ${input.key}`)
  }

  return {
    key: input.key,
    value: parser(input.value),
  }
}

export function readAdminConfigValue(key: string, value: unknown) {
  if (key === 'homepage_sections') {
    return { sections: normalizeHomepageSections(value) }
  }

  if (key === 'navigation') {
    return normalizeNavigationConfig(value)
  }

  if (key === 'integrations') {
    return normalizeIntegrationsConfig(value)
  }

  if (key === 'event_page') {
    return normalizeEventPageConfig(value)
  }

  if (key === 'download_page') {
    return normalizeDownloadPageConfig(value)
  }

  if (key === 'webzine_topics') {
    const parsed = webzineTopicsSchema.safeParse(Array.isArray(value) ? value : [])
    return parsed.success ? normalizeWebzineTopics(parsed.data) : []
  }

  return value
}
