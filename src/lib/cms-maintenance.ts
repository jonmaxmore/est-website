/* eslint-disable max-lines -- Production content repair intentionally centralizes schema repair and CMS default seeding. */
import { timingSafeEqual } from 'node:crypto'
import { existsSync } from 'node:fs'
import type { Payload } from 'payload'
import {
  DEFAULT_HOMEPAGE_FEATURE_MEDIA,
  DEFAULT_STORE_BUTTON_MEDIA,
  SITE_LOGO_MEDIA,
  type CmsDefaultMediaSpec,
} from '@/lib/cms-default-media'
import { normalizeFeatureLinkFields } from '@/lib/feature-links'
import {
  buildFallbackNewsArticleParagraphs,
  buildFallbackNewsSummary,
  buildLexicalDocument,
  getPlaceholderTitlePreset,
  hasMeaningfulNewsBody,
  isLegacyFallbackNewsBody,
  isPlaceholderNewsTitle,
  isLegacyFallbackNewsSummary,
  sanitizeNewsSlug,
  summarizeNewsField,
} from '@/lib/news-content'
import {
  DEFAULT_FOOTER,
  DEFAULT_FOOTER_GROUPS,
  DEFAULT_NAVIGATION_LINKS,
  DEFAULT_REGISTRATION_URL,
} from '@/lib/site-settings-defaults'
import {
  DEFAULT_GAME_GUIDE_FEATURES,
  DEFAULT_GAME_GUIDE_PAGE_COPY,
  GAME_GUIDE_PILLARS,
} from '@/lib/game-guide-content'
import { DEFAULT_NEWS_PAGE_COPY } from '@/lib/news-page-content'
import {
  DROP_NEWS_EDITORIAL_COLUMNS_SQL,
  DROP_NEWS_EXCERPT_COLUMNS_SQL,
  ENSURE_GLOBAL_BASE_COLUMNS_SQL,
  ENSURE_GLOBAL_SUPPORT_TABLES_SQL,
  ENSURE_NEWS_EDITORIAL_COLUMNS_SQL,
  ENSURE_NEWS_EXCERPT_COLUMNS_SQL,
  GLOBAL_BASE_COLUMNS,
  GLOBAL_SUPPORT_TABLES,
  NEWS_EDITORIAL_COLUMNS,
  NEWS_EXCERPT_COLUMNS,
} from '@/lib/cms-maintenance-schema'

type ExecutableDb = {
  drizzle: unknown;
  execute: (args: { drizzle: unknown; raw: string }) => Promise<unknown>;
}

type RefreshableNewsArticle = {
  id: number | string;
  category?: string | null;
  slug?: string | null;
  titleEn?: string | null;
  titleTh?: string | null;
  excerptEn?: string | null;
  excerptTh?: string | null;
  contentEn?: unknown;
  contentTh?: unknown;
}

type GenericGlobal = Record<string, unknown> | null | undefined

export type CmsRefreshSummary = {
  ensuredColumns: string[];
  updatedArticles: number;
  updatedGlobals: string[];
  touchedArticles: Array<{
    id: number | string;
    titleEn: string;
    slug: string;
  }>;
}

const DEFAULT_HOMEPAGE_HIGHLIGHTS = DEFAULT_GAME_GUIDE_FEATURES.map((feature) => ({
  ...feature,
  href: '/game-guide',
  ctaLabelEn: 'Explore system',
  ctaLabelTh: 'ดูระบบนี้',
}))

const DEFAULT_GAME_GUIDE_GLOBAL = {
  titleEn: 'Game Guide',
  titleTh: 'แนะนำเกม',
  systemsTitleEn: 'Understand the game flow before you dive in',
  systemsTitleTh: 'เข้าใจ flow ของเกมก่อนออกเดินทาง',
  features: DEFAULT_GAME_GUIDE_FEATURES,
}

const DEFAULT_HOMEPAGE_NEWS = {
  newsBadgeEn: 'LATEST NEWS',
  newsBadgeTh: 'ข่าวล่าสุด',
  newsTitleEn: 'News & Updates',
  newsTitleTh: 'ข่าวสารและอัปเดต',
}

const DEFAULT_GAME_GUIDE_PAGE_CONTENT = {
  ...DEFAULT_GAME_GUIDE_GLOBAL,
  titleEn: DEFAULT_GAME_GUIDE_PAGE_COPY.titleEn,
  titleTh: DEFAULT_GAME_GUIDE_PAGE_COPY.titleTh,
  subtitleEn: DEFAULT_GAME_GUIDE_PAGE_COPY.subtitleEn,
  subtitleTh: DEFAULT_GAME_GUIDE_PAGE_COPY.subtitleTh,
  heroPanelLabelEn: DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelLabelEn,
  heroPanelLabelTh: DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelLabelTh,
  heroPanelCopyEn: DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelCopyEn,
  heroPanelCopyTh: DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelCopyTh,
  systemsBadgeEn: DEFAULT_GAME_GUIDE_PAGE_COPY.systemsBadgeEn,
  systemsBadgeTh: DEFAULT_GAME_GUIDE_PAGE_COPY.systemsBadgeTh,
  systemsTitleEn: DEFAULT_GAME_GUIDE_PAGE_COPY.systemsTitleEn,
  systemsTitleTh: DEFAULT_GAME_GUIDE_PAGE_COPY.systemsTitleTh,
  systemsCopyEn: DEFAULT_GAME_GUIDE_PAGE_COPY.systemsCopyEn,
  systemsCopyTh: DEFAULT_GAME_GUIDE_PAGE_COPY.systemsCopyTh,
  pillarsEn: GAME_GUIDE_PILLARS.en.map((label) => ({ label })),
  pillarsTh: GAME_GUIDE_PILLARS.th.map((label) => ({ label })),
  features: DEFAULT_GAME_GUIDE_FEATURES,
}

const DEFAULT_NEWS_PAGE_GLOBAL = {
  badgeEn: DEFAULT_NEWS_PAGE_COPY.badgeEn,
  badgeTh: DEFAULT_NEWS_PAGE_COPY.badgeTh,
  titleEn: DEFAULT_NEWS_PAGE_COPY.titleEn,
  titleTh: DEFAULT_NEWS_PAGE_COPY.titleTh,
  subtitleEn: DEFAULT_NEWS_PAGE_COPY.subtitleEn,
  subtitleTh: DEFAULT_NEWS_PAGE_COPY.subtitleTh,
}

const DEFAULT_FEATURE_CTA = {
  en: 'Learn more',
  th: 'à¸”à¸¹à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”',
}

const DEFAULT_EVENT_CONFIG_CONTENT = {
  titleEn: 'Join the pre-registration',
  titleTh: 'ลงทะเบียนล่วงหน้า',
  descriptionEn: 'Register early to receive launch rewards and follow event milestones in one place.',
  descriptionTh: 'ลงทะเบียนล่วงหน้าเพื่อติดตาม milestone และรางวัลช่วงเปิดตัวได้ในที่เดียว',
  ctaButtonEn: 'Join the pre-registration',
  ctaButtonTh: 'ลงทะเบียนล่วงหน้าเลย',
  modalTitleEn: 'Registration form',
  modalTitleTh: 'แบบฟอร์มลงทะเบียน',
  emailPlaceholderEn: 'Enter your email address',
  storeLabelEn: 'Choose your platform',
  submitButtonEn: 'Register and continue',
  successTitleEn: 'Registration complete',
}

const LEGACY_SITE_DESCRIPTION_VALUES = [
  'Eternal Tower Saga — เกมมือถือ RPG ผจญภัยพร้อมสหายร่วมรบ',
  'Rise Together. Conquer the Tower.',
]

const LEGACY_FOOTER_BRAND_EN_VALUES = [
  'Eternal Tower Saga is a fantasy world built around party adventure, readable combat, and a mood that keeps players coming back.',
]

const LEGACY_FOOTER_BRAND_TH_VALUES = [
  'Eternal Tower Saga คือโลกแฟนตาซีที่เน้นการผจญภัยเป็นทีม การต่อสู้ที่อ่านง่าย และบรรยากาศที่ชวนอยากกลับมาเล่นทุกวัน.',
]

const LEGACY_COMMUNITY_EN_VALUES = [
  'Stay close to announcements, events, and the latest updates through Eternal Tower Saga\'s main community channels.',
]

const LEGACY_COMMUNITY_TH_VALUES = [
  'ติดตามประกาศ กิจกรรม และความเคลื่อนไหวล่าสุดของเกมผ่านช่องทาง community หลักของ Eternal Tower Saga.',
]

const LEGACY_HOMEPAGE_TAGLINE_EN_VALUES = [
  'Adventure together, conquer the tower',
  'Rise Together, Conquer the Tower',
]

const LEGACY_HOMEPAGE_CTA_EN_VALUES = [
  'Pre-Register Now',
  'Pre-register Now',
]

const LEGACY_GAME_GUIDE_SUBTITLE_EN_VALUES = [
  'Experience the new era of Eternal Tower Saga — Switch your weapon, shift the battlefield',
  'Experience the new era of Eternal Tower Saga - switch your weapon, shift the battlefield',
]

const LEGACY_NEWS_PAGE_SUBTITLE_EN_VALUES = [
  'Follow every major announcement, event, update, and maintenance notice in a cleaner editorial view built for desktop and mobile.',
]

const LEGACY_EVENT_TITLE_EN_VALUES = [
  'Pre-Register Now',
  'Pre-Registration',
]

const LEGACY_EVENT_DESCRIPTION_EN_VALUES = [
  'Register now to receive exclusive rewards!',
  'Register now to receive exclusive rewards at launch!',
]

const LEGACY_EVENT_CTA_EN_VALUES = [
  'Pre-Register Now',
  'Pre-register Now',
]

const LEGACY_EVENT_MODAL_TITLE_EN_VALUES = [
  'Pre-Register',
]

const LEGACY_EVENT_EMAIL_PLACEHOLDER_EN_VALUES = [
  'Enter your email',
]

const LEGACY_EVENT_STORE_LABEL_EN_VALUES = [
  'Choose your store',
]

const LEGACY_EVENT_SUBMIT_BUTTON_EN_VALUES = [
  'Register & Go to Store',
]

const LEGACY_EVENT_SUCCESS_TITLE_EN_VALUES = [
  'Registration Successful!',
]

const LEGACY_STORE_SUBLABELS: Partial<Record<'ios' | 'android' | 'pc' | 'steam', string[]>> = {
  android: ['PRE-REGISTER ON'],
}

const DEFAULT_STORE_SUBLABELS: Partial<Record<'ios' | 'android' | 'pc' | 'steam', string>> = {
  ios: 'Pre-order on the',
  android: 'Register on',
  pc: 'Coming soon',
}

function hasExecutableDb(db: unknown): db is ExecutableDb {
  return Boolean(
    db &&
    typeof db === 'object' &&
    'drizzle' in db &&
    typeof (db as { execute?: unknown }).execute === 'function',
  )
}

function hasValue(value: unknown) {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value)
}

function normalizeTextValue(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function matchesAnyLegacyText(value: unknown, legacyValues: string[]) {
  const normalized = normalizeTextValue(value)
  if (!normalized) return false
  return legacyValues.some((legacyValue) => normalizeTextValue(legacyValue) === normalized)
}

function shouldReplaceText(value: unknown, legacyValues: string[] = []) {
  return !hasValue(value) || matchesAnyLegacyText(value, legacyValues)
}

function hasLegacyUrlSlug(value: unknown) {
  if (typeof value !== 'string') return false

  const slug = value.trim().toLowerCase()
  return slug.includes('http') || slug.includes('www')
}

function asRecord(value: GenericGlobal) {
  return value && typeof value === 'object' ? value : {}
}

function hasVisibleNavigationLinks(value: unknown) {
  return Array.isArray(value) && value.some((item) => item && typeof item === 'object' && (item as { visible?: boolean }).visible !== false)
}

async function ensureSiteLogo(payload: Payload) {
  return ensureMediaAsset(payload, SITE_LOGO_MEDIA)
}

async function listMediaDocs(payload: Payload) {
  const mediaResult = await payload.find({
    collection: 'media',
    limit: 200,
    sort: '-updatedAt',
    depth: 0,
    overrideAccess: true,
  }).catch(() => ({ docs: [] }))

  return mediaResult.docs
}

function findExistingMediaId(
  mediaDocs: Array<Record<string, unknown>>,
  spec: CmsDefaultMediaSpec,
): number | string | null {
  const targetAlt = spec.alt.toLowerCase()
  const targetFilenameHint = spec.filenameHint.toLowerCase()

  const existingAsset = mediaDocs.find((asset) => {
    const alt = typeof asset.alt === 'string' ? asset.alt.toLowerCase() : ''
    const filename = typeof asset.filename === 'string' ? asset.filename.toLowerCase() : ''

    return alt === targetAlt || filename.includes(targetFilenameHint)
  })

  if (typeof existingAsset?.id === 'string' || typeof existingAsset?.id === 'number') {
    return existingAsset.id
  }

  return null
}

async function ensureMediaAsset(payload: Payload, spec: CmsDefaultMediaSpec): Promise<number | string | null> {
  const mediaDocs = await listMediaDocs(payload)
  const existingId = findExistingMediaId(mediaDocs, spec)

  if (existingId) {
    return existingId
  }

  if (!existsSync(spec.filePath)) {
    return null
  }

  const createdAsset = await payload.create({
    collection: 'media',
    data: {
      alt: spec.alt,
    },
    filePath: spec.filePath,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null)

  return createdAsset?.id ?? null
}

async function ensureDefaultFeatureMediaIds(payload: Payload): Promise<Array<number | string | null>> {
  const ids = await Promise.all(
    DEFAULT_HOMEPAGE_FEATURE_MEDIA.map((item) => ensureMediaAsset(payload, item.previewImage)),
  )

  return ids
}

async function ensureDefaultStoreButtonMediaIds(payload: Payload) {
  const entries = await Promise.all(
    Object.entries(DEFAULT_STORE_BUTTON_MEDIA).map(async ([platform, spec]) => ([
      platform,
      spec ? await ensureMediaAsset(payload, spec) : null,
    ] as const)),
  )

  return Object.fromEntries(entries) as Partial<Record<'ios' | 'android' | 'pc' | 'steam', number | string | null>>
}

function repairFeatureMediaAndLinks(
  featureValue: unknown,
  defaults: { previewImageId?: number | string | null } | undefined,
) {
  if (!featureValue || typeof featureValue !== 'object') {
    return { feature: featureValue, changed: false }
  }

  const feature = { ...(featureValue as Record<string, unknown>) }
  let changed = false
  const normalizedLinks = normalizeFeatureLinkFields({
    href: feature.href,
    ctaLabelEn: feature.ctaLabelEn,
    ctaLabelTh: feature.ctaLabelTh,
  })

  if (feature.href !== normalizedLinks.href) {
    feature.href = normalizedLinks.href
    changed = true
  }

  if (feature.ctaLabelEn !== normalizedLinks.ctaLabelEn) {
    feature.ctaLabelEn = normalizedLinks.ctaLabelEn
    changed = true
  }

  if (feature.ctaLabelTh !== normalizedLinks.ctaLabelTh) {
    feature.ctaLabelTh = normalizedLinks.ctaLabelTh
    changed = true
  }

  if (normalizedLinks.href) {
    if (!hasValue(feature.ctaLabelEn)) {
      feature.ctaLabelEn = DEFAULT_FEATURE_CTA.en
      changed = true
    }

    if (!hasValue(feature.ctaLabelTh)) {
      feature.ctaLabelTh = DEFAULT_FEATURE_CTA.th
      changed = true
    }
  }

  if (!hasValue(feature.previewImage) && defaults?.previewImageId) {
    feature.previewImage = defaults.previewImageId
    changed = true
  }

  return { feature, changed }
}

async function ensureStoreButtonDefaults(
  payload: Payload,
  updatedGlobals: string[],
  mediaIds: Partial<Record<'ios' | 'android' | 'pc' | 'steam', number | string | null>>,
) {
  const storeButtons = await payload.find({
    collection: 'store-buttons',
    sort: 'sortOrder',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  }).catch(() => ({ docs: [] }))

  let updatedButtons = 0

  for (const button of storeButtons.docs as Array<Record<string, unknown>>) {
    const platform = typeof button.platform === 'string' ? button.platform : ''
    const spec = DEFAULT_STORE_BUTTON_MEDIA[platform as keyof typeof DEFAULT_STORE_BUTTON_MEDIA]
    const legacySublabels = LEGACY_STORE_SUBLABELS[platform as keyof typeof LEGACY_STORE_SUBLABELS] || []
    const nextButtonData: Record<string, unknown> = {}

    if (!spec) {
      continue
    }

    if (shouldReplaceText(button.sublabel, legacySublabels)) {
      const nextSublabel = DEFAULT_STORE_SUBLABELS[platform as keyof typeof DEFAULT_STORE_SUBLABELS]

      if (nextSublabel) {
        nextButtonData.sublabel = nextSublabel
      }
    }

    if (!hasValue(button.icon)) {
      const iconId = mediaIds[platform as keyof typeof mediaIds] || null

      if (iconId) {
        nextButtonData.icon = iconId
      }
    }

    if (!Object.keys(nextButtonData).length || !button.id) {
      continue
    }

    await payload.update({
      collection: 'store-buttons',
      id: button.id as number | string,
      data: nextButtonData,
      overrideAccess: true,
      depth: 0,
    })

    updatedButtons += 1
  }

  if (updatedButtons > 0) {
    updatedGlobals.push('store-buttons')
  }
}

async function ensureSiteSettingsDefaults(payload: Payload, updatedGlobals: string[]) {
  const settings = asRecord(await payload.findGlobal({ slug: 'site-settings' }).catch(() => null))
  const footer = asRecord(settings.footer as GenericGlobal)
  const nextData: Record<string, unknown> = {}
  const nextFooter = { ...footer }
  let footerUpdated = false

  if (!hasValue(settings.registrationUrl)) {
    nextData.registrationUrl = DEFAULT_REGISTRATION_URL
  }

  if (shouldReplaceText(settings.siteDescription, LEGACY_SITE_DESCRIPTION_VALUES)) {
    nextData.siteDescription = 'Eternal Tower Saga — official website for news, game guides, and pre-registration information'
  }

  if (!hasVisibleNavigationLinks(settings.navigationLinks)) {
    nextData.navigationLinks = DEFAULT_NAVIGATION_LINKS
  }

  if (!Array.isArray(footer.groups) || footer.groups.length === 0) {
    nextFooter.groups = DEFAULT_FOOTER_GROUPS
    footerUpdated = true
  } else {
    let groupsUpdated = false
    const repairedGroups = footer.groups.map((group) => {
      const groupRecord = asRecord(group as GenericGlobal)
      const titleEn = typeof groupRecord.titleEn === 'string' ? groupRecord.titleEn : ''
      const titleTh = typeof groupRecord.titleTh === 'string' ? groupRecord.titleTh : ''
      const isCommunityGroup = titleEn === 'Community' || titleTh === 'ชุมชน'

      if (!isCommunityGroup) {
        return group
      }

      const nextGroup = { ...groupRecord }

      if (shouldReplaceText(groupRecord.descriptionEn, LEGACY_COMMUNITY_EN_VALUES)) {
        nextGroup.descriptionEn = DEFAULT_FOOTER_GROUPS[2]?.descriptionEn || null
        groupsUpdated = true
      }

      if (shouldReplaceText(groupRecord.descriptionTh, LEGACY_COMMUNITY_TH_VALUES)) {
        nextGroup.descriptionTh = DEFAULT_FOOTER_GROUPS[2]?.descriptionTh || null
        groupsUpdated = true
      }

      return nextGroup
    })

    if (groupsUpdated) {
      nextFooter.groups = repairedGroups
      footerUpdated = true
    }
  }

  if (shouldReplaceText(footer.brandCopyEn, LEGACY_FOOTER_BRAND_EN_VALUES)) {
    nextFooter.brandCopyEn = DEFAULT_FOOTER.brandCopyEn
    footerUpdated = true
  }

  if (shouldReplaceText(footer.brandCopyTh, LEGACY_FOOTER_BRAND_TH_VALUES)) {
    nextFooter.brandCopyTh = DEFAULT_FOOTER.brandCopyTh
    footerUpdated = true
  }

  if (!hasValue(footer.platformsLabelEn)) {
    nextFooter.platformsLabelEn = DEFAULT_FOOTER.platformsLabelEn
    footerUpdated = true
  }

  if (!hasValue(footer.platformsLabelTh)) {
    nextFooter.platformsLabelTh = DEFAULT_FOOTER.platformsLabelTh
    footerUpdated = true
  }

  if (!hasValue(footer.copyrightText)) {
    nextFooter.copyrightText = DEFAULT_FOOTER.copyrightText
    footerUpdated = true
  }

  if (!hasValue(footer.termsUrl)) {
    nextFooter.termsUrl = DEFAULT_FOOTER.termsUrl
    footerUpdated = true
  }

  if (!hasValue(footer.privacyUrl)) {
    nextFooter.privacyUrl = DEFAULT_FOOTER.privacyUrl
    footerUpdated = true
  }

  if (!hasValue(footer.supportUrl)) {
    nextFooter.supportUrl = DEFAULT_FOOTER.supportUrl
    footerUpdated = true
  }

  if (footerUpdated) {
    nextData.footer = nextFooter
  }

  if (!hasValue(settings.logo)) {
    const logoId = await ensureSiteLogo(payload)

    if (logoId) {
      nextData.logo = logoId
    }
  }

  if (!Object.keys(nextData).length) return

  await payload.updateGlobal({
    slug: 'site-settings',
    data: nextData,
  })

  updatedGlobals.push('site-settings')
}

async function ensureHomepageDefaults(
  payload: Payload,
  updatedGlobals: string[],
  featureMediaIds: Array<number | string | null>,
) {
  const homepage = asRecord(await payload.findGlobal({ slug: 'homepage' }).catch(() => null))
  const nextData: Record<string, unknown> = {}

  if (!hasValue(homepage.newsTitleEn) || !hasValue(homepage.newsTitleTh)) {
    Object.assign(nextData, {
      newsBadgeEn: hasValue(homepage.newsBadgeEn) ? homepage.newsBadgeEn : DEFAULT_HOMEPAGE_NEWS.newsBadgeEn,
      newsBadgeTh: hasValue(homepage.newsBadgeTh) ? homepage.newsBadgeTh : DEFAULT_HOMEPAGE_NEWS.newsBadgeTh,
      newsTitleEn: hasValue(homepage.newsTitleEn) ? homepage.newsTitleEn : DEFAULT_HOMEPAGE_NEWS.newsTitleEn,
      newsTitleTh: hasValue(homepage.newsTitleTh) ? homepage.newsTitleTh : DEFAULT_HOMEPAGE_NEWS.newsTitleTh,
    })
  }

  if (!Array.isArray(homepage.features) || homepage.features.length === 0) {
    nextData.features = DEFAULT_HOMEPAGE_HIGHLIGHTS
  } else {
    let hasFeatureUpdates = false
    const repairedFeatures = homepage.features.map((feature, index) => {
      const repaired = repairFeatureMediaAndLinks(feature, { previewImageId: featureMediaIds[index] })
      hasFeatureUpdates ||= repaired.changed
      return repaired.feature
    })

    if (hasFeatureUpdates) {
      nextData.features = repairedFeatures
    }
  }

  if (!Object.keys(nextData).length) return

  await payload.updateGlobal({
    slug: 'homepage',
    data: nextData,
  })

  updatedGlobals.push('homepage')
}

// eslint-disable-next-line max-lines-per-function -- Game Guide default seeding also repairs media-backed feature content.
async function ensureGameGuideDefaults(
  payload: Payload,
  updatedGlobals: string[],
  featureMediaIds: Array<number | string | null>,
) {
  const gameGuide = asRecord(await payload.findGlobal({ slug: 'game-guide-page' }).catch(() => null))
  const nextData: Record<string, unknown> = {}

  if (!hasValue(gameGuide.titleEn) || !hasValue(gameGuide.titleTh)) {
    nextData.titleEn = hasValue(gameGuide.titleEn) ? gameGuide.titleEn : DEFAULT_GAME_GUIDE_PAGE_CONTENT.titleEn
    nextData.titleTh = hasValue(gameGuide.titleTh) ? gameGuide.titleTh : DEFAULT_GAME_GUIDE_PAGE_CONTENT.titleTh
  }

  if (!hasValue(gameGuide.subtitleEn) || !hasValue(gameGuide.subtitleTh)) {
    nextData.subtitleEn = hasValue(gameGuide.subtitleEn)
      ? gameGuide.subtitleEn
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.subtitleEn
    nextData.subtitleTh = hasValue(gameGuide.subtitleTh)
      ? gameGuide.subtitleTh
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.subtitleTh
  }

  if (!hasValue(gameGuide.heroPanelLabelEn) || !hasValue(gameGuide.heroPanelLabelTh)) {
    nextData.heroPanelLabelEn = hasValue(gameGuide.heroPanelLabelEn)
      ? gameGuide.heroPanelLabelEn
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.heroPanelLabelEn
    nextData.heroPanelLabelTh = hasValue(gameGuide.heroPanelLabelTh)
      ? gameGuide.heroPanelLabelTh
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.heroPanelLabelTh
  }

  if (!hasValue(gameGuide.heroPanelCopyEn) || !hasValue(gameGuide.heroPanelCopyTh)) {
    nextData.heroPanelCopyEn = hasValue(gameGuide.heroPanelCopyEn)
      ? gameGuide.heroPanelCopyEn
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.heroPanelCopyEn
    nextData.heroPanelCopyTh = hasValue(gameGuide.heroPanelCopyTh)
      ? gameGuide.heroPanelCopyTh
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.heroPanelCopyTh
  }

  if (!hasValue(gameGuide.systemsBadgeEn) || !hasValue(gameGuide.systemsBadgeTh)) {
    nextData.systemsBadgeEn = hasValue(gameGuide.systemsBadgeEn)
      ? gameGuide.systemsBadgeEn
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.systemsBadgeEn
    nextData.systemsBadgeTh = hasValue(gameGuide.systemsBadgeTh)
      ? gameGuide.systemsBadgeTh
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.systemsBadgeTh
  }

  if (!hasValue(gameGuide.systemsTitleEn) || !hasValue(gameGuide.systemsTitleTh)) {
    nextData.systemsTitleEn = hasValue(gameGuide.systemsTitleEn)
      ? gameGuide.systemsTitleEn
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.systemsTitleEn
    nextData.systemsTitleTh = hasValue(gameGuide.systemsTitleTh)
      ? gameGuide.systemsTitleTh
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.systemsTitleTh
  }

  if (!hasValue(gameGuide.systemsCopyEn) || !hasValue(gameGuide.systemsCopyTh)) {
    nextData.systemsCopyEn = hasValue(gameGuide.systemsCopyEn)
      ? gameGuide.systemsCopyEn
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.systemsCopyEn
    nextData.systemsCopyTh = hasValue(gameGuide.systemsCopyTh)
      ? gameGuide.systemsCopyTh
      : DEFAULT_GAME_GUIDE_PAGE_CONTENT.systemsCopyTh
  }

  if (!Array.isArray(gameGuide.pillarsEn) || gameGuide.pillarsEn.length === 0) {
    nextData.pillarsEn = DEFAULT_GAME_GUIDE_PAGE_CONTENT.pillarsEn
  }

  if (!Array.isArray(gameGuide.pillarsTh) || gameGuide.pillarsTh.length === 0) {
    nextData.pillarsTh = DEFAULT_GAME_GUIDE_PAGE_CONTENT.pillarsTh
  }

  if (!Array.isArray(gameGuide.features) || gameGuide.features.length === 0) {
    nextData.features = DEFAULT_GAME_GUIDE_PAGE_CONTENT.features
  } else {
    let hasFeatureUpdates = false
    const repairedFeatures = gameGuide.features.map((feature, index) => {
      const repaired = repairFeatureMediaAndLinks(feature, { previewImageId: featureMediaIds[index] })
      hasFeatureUpdates ||= repaired.changed
      return repaired.feature
    })

    if (hasFeatureUpdates) {
      nextData.features = repairedFeatures
    }
  }

  if (!Object.keys(nextData).length) return

  await payload.updateGlobal({
    slug: 'game-guide-page',
    data: nextData,
  })

  updatedGlobals.push('game-guide-page')
}

async function ensureNewsPageDefaults(payload: Payload, updatedGlobals: string[]) {
  const newsPage = asRecord(await payload.findGlobal({ slug: 'news-page' }).catch(() => null))
  const nextData: Record<string, unknown> = {}

  if (!hasValue(newsPage.badgeEn) || !hasValue(newsPage.badgeTh)) {
    nextData.badgeEn = hasValue(newsPage.badgeEn) ? newsPage.badgeEn : DEFAULT_NEWS_PAGE_GLOBAL.badgeEn
    nextData.badgeTh = hasValue(newsPage.badgeTh) ? newsPage.badgeTh : DEFAULT_NEWS_PAGE_GLOBAL.badgeTh
  }

  if (!hasValue(newsPage.titleEn) || !hasValue(newsPage.titleTh)) {
    nextData.titleEn = hasValue(newsPage.titleEn) ? newsPage.titleEn : DEFAULT_NEWS_PAGE_GLOBAL.titleEn
    nextData.titleTh = hasValue(newsPage.titleTh) ? newsPage.titleTh : DEFAULT_NEWS_PAGE_GLOBAL.titleTh
  }

  if (!hasValue(newsPage.subtitleEn) || !hasValue(newsPage.subtitleTh)) {
    nextData.subtitleEn = hasValue(newsPage.subtitleEn)
      ? newsPage.subtitleEn
      : DEFAULT_NEWS_PAGE_GLOBAL.subtitleEn
    nextData.subtitleTh = hasValue(newsPage.subtitleTh)
      ? newsPage.subtitleTh
      : DEFAULT_NEWS_PAGE_GLOBAL.subtitleTh
  }

  if (!Object.keys(nextData).length) return

  await payload.updateGlobal({
    slug: 'news-page',
    data: nextData,
  })

  updatedGlobals.push('news-page')
}

async function executeRaw(payload: Payload, raw: string) {
  if (!hasExecutableDb(payload.db)) {
    throw new Error('Database adapter does not support raw SQL execution')
  }

  await payload.db.execute({
    drizzle: payload.db.drizzle,
    raw,
  })
}

export async function ensureNewsExcerptColumns(payload: Payload) {
  await executeRaw(payload, ENSURE_NEWS_EXCERPT_COLUMNS_SQL)
  return [...NEWS_EXCERPT_COLUMNS]
}

export async function ensureNewsEditorialColumns(payload: Payload) {
  await executeRaw(payload, ENSURE_NEWS_EDITORIAL_COLUMNS_SQL)
  return [...NEWS_EDITORIAL_COLUMNS]
}

export async function ensureGlobalBaseColumns(payload: Payload) {
  await executeRaw(payload, ENSURE_GLOBAL_BASE_COLUMNS_SQL)
  return [...GLOBAL_BASE_COLUMNS]
}

export async function ensureGlobalSupportTables(payload: Payload) {
  await executeRaw(payload, ENSURE_GLOBAL_SUPPORT_TABLES_SQL)
  return [...GLOBAL_SUPPORT_TABLES]
}

export async function dropNewsExcerptColumns(payload: Payload) {
  await executeRaw(payload, DROP_NEWS_EXCERPT_COLUMNS_SQL)
}

export async function dropNewsEditorialColumns(payload: Payload) {
  await executeRaw(payload, DROP_NEWS_EDITORIAL_COLUMNS_SQL)
}

// eslint-disable-next-line max-lines-per-function -- Production content repair keeps schema, globals, and legacy news cleanup together
export async function refreshCmsContent(payload: Payload): Promise<CmsRefreshSummary> {
  const ensuredColumns = [
    ...(await ensureNewsExcerptColumns(payload)),
    ...(await ensureGlobalBaseColumns(payload)),
    ...(await ensureGlobalSupportTables(payload)),
  ]
  const updatedGlobals: string[] = []
  const touchedArticles: CmsRefreshSummary['touchedArticles'] = []
  let updatedArticles = 0
  const [featureMediaIds, storeButtonMediaIds] = await Promise.all([
    ensureDefaultFeatureMediaIds(payload),
    ensureDefaultStoreButtonMediaIds(payload),
  ])

  await Promise.all([
    ensureSiteSettingsDefaults(payload, updatedGlobals),
    ensureHomepageDefaults(payload, updatedGlobals, featureMediaIds),
    ensureGameGuideDefaults(payload, updatedGlobals, featureMediaIds),
    ensureNewsPageDefaults(payload, updatedGlobals),
    ensureStoreButtonDefaults(payload, updatedGlobals, storeButtonMediaIds),
  ])

  const result = await payload.find({
    collection: 'news',
    where: {
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    limit: 50,
    depth: 0,
  })

  const placeholderCounters = new Map<string, number>()

  for (const rawArticle of result.docs as RefreshableNewsArticle[]) {
    const article = rawArticle
    const category = typeof article.category === 'string' ? article.category : 'announcement'
    const currentPlaceholderIndex = placeholderCounters.get(category) || 0
    const titleNeedsRefresh =
      isPlaceholderNewsTitle(article.titleEn) || isPlaceholderNewsTitle(article.titleTh)
    const placeholderPreset = titleNeedsRefresh
      ? getPlaceholderTitlePreset(category, currentPlaceholderIndex)
      : null

    if (titleNeedsRefresh && placeholderPreset) {
      placeholderCounters.set(category, currentPlaceholderIndex + 1)
    }

    const titleEn = placeholderPreset?.titleEn || article.titleEn || 'Service Notice'
    const titleTh = placeholderPreset?.titleTh || article.titleTh || 'ประกาศสำคัญ'

    const existingExcerptEn = typeof article.excerptEn === 'string' ? article.excerptEn.trim() : ''
    const existingExcerptTh = typeof article.excerptTh === 'string' ? article.excerptTh.trim() : ''
    const contentExcerptEn = summarizeNewsField(null, article.contentEn, 180)
    const contentExcerptTh = summarizeNewsField(null, article.contentTh, 180)
    const fallbackExcerptEn = buildFallbackNewsSummary('en', category, titleEn, 180)
    const fallbackExcerptTh = buildFallbackNewsSummary('th', category, titleTh, 180)

    const excerptNeedsRefreshEn =
      titleNeedsRefresh ||
      !existingExcerptEn ||
      existingExcerptEn.length < 24 ||
      isLegacyFallbackNewsSummary(existingExcerptEn) ||
      isPlaceholderNewsTitle(existingExcerptEn)
    const excerptNeedsRefreshTh =
      titleNeedsRefresh ||
      !existingExcerptTh ||
      existingExcerptTh.length < 24 ||
      isLegacyFallbackNewsSummary(existingExcerptTh) ||
      isPlaceholderNewsTitle(existingExcerptTh)

    const excerptEn =
      !excerptNeedsRefreshEn
        ? existingExcerptEn
        : (contentExcerptEn && !isPlaceholderNewsTitle(contentExcerptEn) ? contentExcerptEn : fallbackExcerptEn)
    const excerptTh =
      !excerptNeedsRefreshTh
        ? existingExcerptTh
        : (contentExcerptTh && !isPlaceholderNewsTitle(contentExcerptTh) ? contentExcerptTh : fallbackExcerptTh)

    const contentNeedsRefreshEn =
      titleNeedsRefresh ||
      excerptNeedsRefreshEn ||
      !hasMeaningfulNewsBody(article.contentEn) ||
      isLegacyFallbackNewsBody(article.contentEn) ||
      isPlaceholderNewsTitle(summarizeNewsField(null, article.contentEn, 160) || '')
    const contentNeedsRefreshTh =
      titleNeedsRefresh ||
      excerptNeedsRefreshTh ||
      !hasMeaningfulNewsBody(article.contentTh) ||
      isLegacyFallbackNewsBody(article.contentTh) ||
      isPlaceholderNewsTitle(summarizeNewsField(null, article.contentTh, 160) || '')

    const nextContentEn = contentNeedsRefreshEn
      ? buildLexicalDocument(buildFallbackNewsArticleParagraphs('en', category, titleEn, excerptEn))
      : article.contentEn
    const nextContentTh = contentNeedsRefreshTh
      ? buildLexicalDocument(buildFallbackNewsArticleParagraphs('th', category, titleTh, excerptTh))
      : article.contentTh

    const nextSlug =
      titleNeedsRefresh && placeholderPreset
        ? sanitizeNewsSlug(titleEn)
        : hasLegacyUrlSlug(article.slug)
          ? sanitizeNewsSlug(titleEn)
          : article.slug || sanitizeNewsSlug(titleEn)

    const shouldUpdate =
      titleEn !== article.titleEn ||
      titleTh !== article.titleTh ||
      excerptEn !== article.excerptEn ||
      excerptTh !== article.excerptTh ||
      nextSlug !== article.slug ||
      contentNeedsRefreshEn ||
      contentNeedsRefreshTh

    if (!shouldUpdate) continue

    await payload.update({
      collection: 'news',
      id: article.id,
      data: {
        titleEn,
        titleTh,
        slug: nextSlug,
        excerptEn,
        excerptTh,
        contentEn: nextContentEn,
        contentTh: nextContentTh,
      },
    })

    updatedArticles += 1
    touchedArticles.push({
      id: article.id,
      titleEn,
      slug: nextSlug,
    })
  }

  return {
    ensuredColumns,
    updatedArticles,
    updatedGlobals,
    touchedArticles,
  }
}

export function matchesInternalSecret(candidate: string | null | undefined, secret: string | undefined) {
  if (!candidate || !secret) return false

  const candidateBuffer = Buffer.from(candidate)
  const secretBuffer = Buffer.from(secret)

  if (candidateBuffer.length !== secretBuffer.length) {
    return false
  }

  return timingSafeEqual(candidateBuffer, secretBuffer)
}
