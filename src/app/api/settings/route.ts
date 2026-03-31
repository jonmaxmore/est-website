import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  DEFAULT_GAME_GUIDE_FEATURES,
  DEFAULT_GAME_GUIDE_PAGE_COPY,
  GAME_GUIDE_PILLARS,
} from '@/lib/game-guide-content'
import { DEFAULT_NEWS_PAGE_COPY } from '@/lib/news-page-content'
import {
  DEFAULT_FOOTER,
  DEFAULT_NAVIGATION_LINKS,
  DEFAULT_REGISTRATION_URL,
} from '@/lib/site-settings-defaults'
import { normalizeFeatureLinkFields } from '@/lib/feature-links'

export const dynamic = 'force-dynamic'

type UploadValue = { url?: string; alt?: string; mimeType?: string } | null | undefined
type CmsRecord = Record<string, unknown>
type StoreButtonDoc = CmsRecord & {
  id?: number | string;
  platform?: string;
  label?: string;
  sublabel?: string;
  url?: string;
  icon?: unknown;
}

type SettingsResources = {
  siteSettings: CmsRecord;
  eventConfig: CmsRecord;
  homepage: CmsRecord;
  storyPage: CmsRecord;
  gameGuidePage: CmsRecord;
  newsPage: CmsRecord;
  faqPage: CmsRecord;
  galleryPage: CmsRecord;
  supportPage: CmsRecord;
  downloadPage: CmsRecord;
  storeButtons: { docs: StoreButtonDoc[] };
}

function asRecord(value: unknown) {
  return typeof value === 'object' && value ? (value as CmsRecord) : {}
}

function asUpload(value: unknown) {
  if (typeof value === 'object' && value && 'url' in (value as Record<string, unknown>)) {
    const upload = value as UploadValue
    return upload?.url
      ? {
          url: upload.url,
          alt: upload.alt,
          mimeType: upload.mimeType,
        }
      : null
  }

  return null
}

function asUrlOnly(value: unknown) {
  const upload = asUpload(value)
  return upload?.url ? { url: upload.url } : null
}

function asArray<T extends Record<string, unknown>>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : []
}

function mapNavigationLinks(siteSettings: CmsRecord) {
  const items = asArray<CmsRecord>(siteSettings.navigationLinks)
    .filter((item) => item.visible !== false && typeof item.href === 'string')
    .map((item, index) => ({
      id: String(item.sectionId || index),
      labelEn: (item.labelEn as string) || (item.labelTh as string) || 'Link',
      labelTh: (item.labelTh as string) || (item.labelEn as string) || 'ลิงก์',
      href: (item.href as string) || '/',
      sectionId: (item.sectionId as string) || null,
      openInNewTab: Boolean(item.openInNewTab),
      visible: item.visible !== false,
    }))

  return items.length ? items : DEFAULT_NAVIGATION_LINKS
}

function mapFooter(siteSettings: CmsRecord) {
  const footer = asRecord(siteSettings.footer)
  const groups = asArray<CmsRecord>(footer.groups)
    .map((group) => ({
      titleEn: (group.titleEn as string) || (group.titleTh as string) || 'Group',
      titleTh: (group.titleTh as string) || (group.titleEn as string) || 'กลุ่มลิงก์',
      descriptionEn: (group.descriptionEn as string) || null,
      descriptionTh: (group.descriptionTh as string) || null,
      links: asArray<CmsRecord>(group.links)
        .filter((link) => typeof link.href === 'string')
        .map((link) => ({
          labelEn: (link.labelEn as string) || (link.labelTh as string) || 'Link',
          labelTh: (link.labelTh as string) || (link.labelEn as string) || 'ลิงก์',
          href: (link.href as string) || '/',
          openInNewTab: Boolean(link.openInNewTab),
        })),
    }))
    .filter((group) => group.links.length > 0)

  return {
    copyrightText: (footer.copyrightText as string) || DEFAULT_FOOTER.copyrightText,
    termsUrl: (footer.termsUrl as string) || DEFAULT_FOOTER.termsUrl,
    privacyUrl: (footer.privacyUrl as string) || DEFAULT_FOOTER.privacyUrl,
    supportUrl: (footer.supportUrl as string) || DEFAULT_FOOTER.supportUrl,
    brandCopyEn: (footer.brandCopyEn as string) || DEFAULT_FOOTER.brandCopyEn,
    brandCopyTh: (footer.brandCopyTh as string) || DEFAULT_FOOTER.brandCopyTh,
    platformsLabelEn: (footer.platformsLabelEn as string) || DEFAULT_FOOTER.platformsLabelEn,
    platformsLabelTh: (footer.platformsLabelTh as string) || DEFAULT_FOOTER.platformsLabelTh,
    groups: groups.length ? groups : DEFAULT_FOOTER.groups,
  }
}

function mapHomepageFeatures(homepage: CmsRecord) {
  return asArray<CmsRecord>(homepage.features).map((feature) => ({
    ...normalizeFeatureLinkFields({
      href: feature.href,
      ctaLabelEn: feature.ctaLabelEn,
      ctaLabelTh: feature.ctaLabelTh,
    }),
    icon: (feature.icon as string) || '',
    iconImage: asUrlOnly(feature.iconImage),
    previewImage: asUrlOnly(feature.previewImage),
    titleEn: (feature.titleEn as string) || '',
    titleTh: (feature.titleTh as string) || '',
    descriptionEn: (feature.descriptionEn as string) || '',
    descriptionTh: (feature.descriptionTh as string) || '',
  }))
}

function mapGameGuideFeatures(gameGuidePage: CmsRecord) {
  const source = asArray<CmsRecord>(gameGuidePage.features)
  const features = source.length
    ? source
    : (DEFAULT_GAME_GUIDE_FEATURES as unknown as CmsRecord[])

  return features.map((feature) => ({
    ...normalizeFeatureLinkFields({
      href: feature.href,
      ctaLabelEn: feature.ctaLabelEn,
      ctaLabelTh: feature.ctaLabelTh,
    }),
    icon: (feature.icon as string) || '',
    iconImage: asUrlOnly(feature.iconImage),
    previewImage: asUrlOnly(feature.previewImage),
    titleEn: (feature.titleEn as string) || '',
    titleTh: (feature.titleTh as string) || '',
    descriptionEn: (feature.descriptionEn as string) || '',
    descriptionTh: (feature.descriptionTh as string) || '',
  }))
}

function mapPillars(value: unknown) {
  return asArray<CmsRecord>(value)
    .map((item) => item.label)
    .filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function mapContentSections(eventConfig: CmsRecord) {
  return asArray<CmsRecord>(eventConfig.contentSections).map((section) => ({
    contentType: section.contentType,
    textEn: section.textEn,
    textTh: section.textTh,
    image: asUrlOnly(section.image),
  }))
}

function mapStorySections(storyPage: CmsRecord) {
  return asArray<CmsRecord>(storyPage.sections).map((section) => ({
    titleEn: section.titleEn,
    titleTh: section.titleTh,
    contentEn: section.contentEn,
    contentTh: section.contentTh,
  }))
}

function mapFaqItems(faqPage: CmsRecord) {
  return asArray<CmsRecord>(faqPage.faqItems).map((item) => ({
    questionEn: item.questionEn,
    questionTh: item.questionTh,
    answerEn: item.answerEn,
    answerTh: item.answerTh,
  }))
}

function mapStoreButtons(buttons: StoreButtonDoc[]) {
  return buttons.map((button) => ({
    id: button.id,
    platform: button.platform,
    label: button.label,
    sublabel: button.sublabel,
    url: button.url,
    icon: asUrlOnly(button.icon),
  }))
}

function buildSiteResponse(siteSettings: CmsRecord) {
  return {
    name: siteSettings.siteName,
    description: siteSettings.siteDescription,
    logo: asUpload(siteSettings.logo),
    registrationUrl: siteSettings.registrationUrl || DEFAULT_REGISTRATION_URL,
    navigationLinks: mapNavigationLinks(siteSettings),
    socialLinks: siteSettings.socialLinks,
    analytics: siteSettings.analytics,
    seo: {
      keywords: asRecord(siteSettings.seo).keywords,
      ogImage: asUrlOnly(asRecord(siteSettings.seo).ogImage),
    },
    footer: mapFooter(siteSettings),
  }
}

function buildEventResponse(eventConfig: CmsRecord) {
  return {
    enabled: eventConfig.enabled,
    titleEn: eventConfig.titleEn,
    titleTh: eventConfig.titleTh,
    descriptionEn: eventConfig.descriptionEn,
    descriptionTh: eventConfig.descriptionTh,
    countdownTarget: eventConfig.countdownTarget,
    registrationOpen: eventConfig.registrationOpen,
    badgeTextEn: eventConfig.badgeTextEn,
    badgeTextTh: eventConfig.badgeTextTh,
    milestoneBadgeEn: eventConfig.milestoneBadgeEn,
    milestoneBadgeTh: eventConfig.milestoneBadgeTh,
    milestoneTitleEn: eventConfig.milestoneTitleEn,
    milestoneTitleTh: eventConfig.milestoneTitleTh,
    footerText: eventConfig.footerText,
    ctaButtonEn: eventConfig.ctaButtonEn,
    ctaButtonTh: eventConfig.ctaButtonTh,
    modalTitleEn: eventConfig.modalTitleEn,
    modalTitleTh: eventConfig.modalTitleTh,
    emailPlaceholderEn: eventConfig.emailPlaceholderEn,
    emailPlaceholderTh: eventConfig.emailPlaceholderTh,
    storeLabelEn: eventConfig.storeLabelEn,
    storeLabelTh: eventConfig.storeLabelTh,
    submitButtonEn: eventConfig.submitButtonEn,
    submitButtonTh: eventConfig.submitButtonTh,
    successTitleEn: eventConfig.successTitleEn,
    successTitleTh: eventConfig.successTitleTh,
    heroImage: asUrlOnly(eventConfig.heroImage),
    backgroundVideo: asUpload(eventConfig.backgroundVideo),
    backgroundImage: asUrlOnly(eventConfig.backgroundImage),
    descriptionImageEn: asUrlOnly(eventConfig.descriptionImageEn),
    descriptionImageTh: asUrlOnly(eventConfig.descriptionImageTh),
    formBackgroundImage: asUrlOnly(eventConfig.formBackgroundImage),
    milestonesBackgroundImage: asUrlOnly(eventConfig.milestonesBackgroundImage),
    leaderboardBackgroundImage: asUrlOnly(eventConfig.leaderboardBackgroundImage),
    contentSections: mapContentSections(eventConfig),
    pointsLevel1: (eventConfig.pointsLevel1 as number) ?? 1,
    pointsLevel2: (eventConfig.pointsLevel2 as number) ?? 0.5,
    storeUrls: {
      ios: (eventConfig.iosStoreUrl as string) || 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
      android: (eventConfig.androidStoreUrl as string) || 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
      pc: (eventConfig.pcStoreUrl as string) || '#',
    },
  }
}

function buildHomepageResponse(homepage: CmsRecord) {
  return {
    hero: {
      taglineEn: homepage.taglineEn,
      taglineTh: homepage.taglineTh,
      taglineImageEn: asUrlOnly(homepage.taglineImageEn),
      taglineImageTh: asUrlOnly(homepage.taglineImageTh),
      ctaTextEn: homepage.ctaTextEn,
      ctaTextTh: homepage.ctaTextTh,
      ctaLink: homepage.ctaLink,
      backgroundVideo: asUrlOnly(homepage.backgroundVideo),
      backgroundImage: asUrlOnly(homepage.backgroundImage),
      features: mapHomepageFeatures(homepage),
    },
    weapons: {
      bgImage: asUrlOnly(homepage.weaponsBgImage),
      badgeEn: homepage.weaponsBadgeEn || 'CHOOSE YOUR WEAPON',
      badgeTh: homepage.weaponsBadgeTh || 'เลือกอาวุธของคุณ',
      titleEn: homepage.weaponsTitleEn || 'Weapons of Arcatea',
      titleTh: homepage.weaponsTitleTh || 'อาวุธแห่ง Arcatea',
      introEn: homepage.weaponsIntroEn || null,
      introTh: homepage.weaponsIntroTh || null,
    },
    highlights: {
      badgeEn: homepage.highlightsBadgeEn || 'GAME FEATURES',
      badgeTh: homepage.highlightsBadgeTh || 'ฟีเจอร์เกม',
      titleEn: homepage.highlightsTitleEn || 'Game Highlights',
      titleTh: homepage.highlightsTitleTh || 'ไฮไลท์เกม',
      bgImage: asUrlOnly(homepage.highlightsBgImage),
      introEn: homepage.highlightsIntroEn || null,
      introTh: homepage.highlightsIntroTh || null,
    },
    news: {
      badgeEn: homepage.newsBadgeEn || 'LATEST NEWS',
      badgeTh: homepage.newsBadgeTh || 'ข่าวล่าสุด',
      titleEn: homepage.newsTitleEn || 'News & Updates',
      titleTh: homepage.newsTitleTh || 'ข่าวสารและอัปเดต',
      bgImage: asUrlOnly(homepage.newsBgImage),
      introEn: homepage.newsIntroEn || null,
      introTh: homepage.newsIntroTh || null,
    },
  }
}

function buildStoryPageResponse(storyPage: CmsRecord) {
  return {
    heroImage: asUrlOnly(storyPage.heroImage),
    badgeEn: storyPage.badgeEn || 'LORE',
    badgeTh: storyPage.badgeTh || 'เนื้อเรื่อง',
    titleEn: storyPage.titleEn || 'Story',
    titleTh: storyPage.titleTh || 'เนื้อเรื่อง',
    subtitleEn: storyPage.subtitleEn || 'The tale of Arcatea and The Boundless Spire',
    subtitleTh: storyPage.subtitleTh || 'เรื่องราวแห่งดินแดน Arcatea และหอคอยไร้ขอบเขต',
    sections: mapStorySections(storyPage),
  }
}

function buildGameGuidePageResponse(gameGuidePage: CmsRecord) {
  const pillarsEn = mapPillars(gameGuidePage.pillarsEn)
  const pillarsTh = mapPillars(gameGuidePage.pillarsTh)

  return {
    heroImage: asUrlOnly(gameGuidePage.heroImage),
    systemsBackgroundImage: asUrlOnly(gameGuidePage.systemsBackgroundImage),
    badgeEn: (gameGuidePage.badgeEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.badgeEn,
    badgeTh: gameGuidePage.badgeTh || 'แนะนำเกม',
    titleEn: (gameGuidePage.titleEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.titleEn,
    titleTh: gameGuidePage.titleTh || 'แนะนำเกม',
    subtitleEn: (gameGuidePage.subtitleEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.subtitleEn,
    subtitleTh: gameGuidePage.subtitleTh || 'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga',
    heroPanelLabelEn: (gameGuidePage.heroPanelLabelEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelLabelEn,
    heroPanelLabelTh: (gameGuidePage.heroPanelLabelTh as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelLabelTh,
    heroPanelCopyEn: (gameGuidePage.heroPanelCopyEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelCopyEn,
    heroPanelCopyTh: (gameGuidePage.heroPanelCopyTh as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.heroPanelCopyTh,
    systemsBadgeEn: (gameGuidePage.systemsBadgeEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.systemsBadgeEn,
    systemsBadgeTh: (gameGuidePage.systemsBadgeTh as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.systemsBadgeTh,
    systemsTitleEn: (gameGuidePage.systemsTitleEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.systemsTitleEn,
    systemsTitleTh: (gameGuidePage.systemsTitleTh as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.systemsTitleTh,
    systemsCopyEn: (gameGuidePage.systemsCopyEn as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.systemsCopyEn,
    systemsCopyTh: (gameGuidePage.systemsCopyTh as string) || DEFAULT_GAME_GUIDE_PAGE_COPY.systemsCopyTh,
    pillarsEn: pillarsEn.length ? pillarsEn : [...GAME_GUIDE_PILLARS.en],
    pillarsTh: pillarsTh.length ? pillarsTh : [...GAME_GUIDE_PILLARS.th],
    features: mapGameGuideFeatures(gameGuidePage),
  }
}

function buildNewsPageResponse(newsPage: CmsRecord) {
  return {
    backgroundImage: asUrlOnly(newsPage.backgroundImage),
    badgeEn: (newsPage.badgeEn as string) || DEFAULT_NEWS_PAGE_COPY.badgeEn,
    badgeTh: (newsPage.badgeTh as string) || 'อัปเดตล่าสุด',
    titleEn: (newsPage.titleEn as string) || DEFAULT_NEWS_PAGE_COPY.titleEn,
    titleTh: (newsPage.titleTh as string) || 'ข่าวสารและประกาศ',
    subtitleEn: (newsPage.subtitleEn as string) || DEFAULT_NEWS_PAGE_COPY.subtitleEn,
    subtitleTh: (newsPage.subtitleTh as string) || DEFAULT_NEWS_PAGE_COPY.subtitleTh,
    archiveKickerEn: (newsPage.archiveKickerEn as string) || null,
    archiveKickerTh: (newsPage.archiveKickerTh as string) || null,
    archiveTitleEn: (newsPage.archiveTitleEn as string) || null,
    archiveTitleTh: (newsPage.archiveTitleTh as string) || null,
    archiveIntroEn: (newsPage.archiveIntroEn as string) || null,
    archiveIntroTh: (newsPage.archiveIntroTh as string) || null,
  }
}

function buildFaqPageResponse(faqPage: CmsRecord) {
  return {
    titleEn: faqPage.titleEn || 'Frequently Asked Questions',
    titleTh: faqPage.titleTh || 'คำถามที่พบบ่อย',
    faqItems: mapFaqItems(faqPage),
  }
}

function buildGalleryPageResponse(galleryPage: CmsRecord) {
  return {
    badgeEn: (galleryPage.badgeEn as string) || 'GALLERY',
    badgeTh: (galleryPage.badgeTh as string) || 'แกลเลอรี่',
    titleEn: (galleryPage.titleEn as string) || 'Gallery',
    titleTh: (galleryPage.titleTh as string) || 'แกลเลอรี่',
    subtitleEn: (galleryPage.subtitleEn as string) || 'Images and wallpapers from the world of Arcatea',
    subtitleTh: (galleryPage.subtitleTh as string) || 'ภาพและวอลเปเปอร์จากโลกของ Arcatea',
    emptyMessageEn: (galleryPage.emptyMessageEn as string) || 'More images coming soon. Stay tuned.',
    emptyMessageTh: (galleryPage.emptyMessageTh as string) || 'ภาพเพิ่มเติมจะอัปเดตเร็ว ๆ นี้ ติดตามข่าวสารไว้ได้เลย',
  }
}

function buildSupportPageResponse(supportPage: CmsRecord) {
  return {
    badgeEn: (supportPage.badgeEn as string) || 'SUPPORT',
    badgeTh: (supportPage.badgeTh as string) || 'ช่วยเหลือ',
    titleEn: (supportPage.titleEn as string) || 'Support Center',
    titleTh: (supportPage.titleTh as string) || 'ศูนย์ช่วยเหลือ',
    subtitleEn: (supportPage.subtitleEn as string) || 'Need help? Our team is here for you.',
    subtitleTh: (supportPage.subtitleTh as string) || 'มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานพร้อมดูแลคุณ',
    supportEmail: (supportPage.supportEmail as string) || 'support@eternaltowersaga.com',
    contactBadgeEn: (supportPage.contactBadgeEn as string) || 'DIRECT CONTACT',
    contactBadgeTh: (supportPage.contactBadgeTh as string) || 'ติดต่อโดยตรง',
    contactLabelEn: (supportPage.contactLabelEn as string) || 'Support team email',
    contactLabelTh: (supportPage.contactLabelTh as string) || 'อีเมลทีมซัพพอร์ต',
    channels: asArray<CmsRecord>(supportPage.channels).map((ch) => ({
      icon: ch.icon,
      titleEn: ch.titleEn,
      titleTh: ch.titleTh,
      descEn: ch.descEn,
      descTh: ch.descTh,
      actionLabelEn: ch.actionLabelEn,
      actionLabelTh: ch.actionLabelTh,
      actionHref: ch.actionHref,
      external: Boolean(ch.external),
    })),
    infoItems: asArray<CmsRecord>(supportPage.infoItems).map((item) => ({
      icon: item.icon,
      titleEn: item.titleEn,
      titleTh: item.titleTh,
      descEn: item.descEn,
      descTh: item.descTh,
    })),
  }
}

function buildDownloadPageResponse(downloadPage: CmsRecord) {
  return {
    badgeEn: (downloadPage.badgeEn as string) || 'DOWNLOAD',
    badgeTh: (downloadPage.badgeTh as string) || 'ดาวน์โหลด',
    titleEn: (downloadPage.titleEn as string) || 'Download',
    titleTh: (downloadPage.titleTh as string) || 'ดาวน์โหลด',
    subtitleEn: (downloadPage.subtitleEn as string) || 'Choose your platform and start your adventure',
    subtitleTh: (downloadPage.subtitleTh as string) || 'เลือกแพลตฟอร์มของคุณ แล้วเริ่มผจญภัยได้เลย',
    ctaCopyEn: (downloadPage.ctaCopyEn as string) || 'Game not out yet? Pre-register first to lock in your launch rewards.',
    ctaCopyTh: (downloadPage.ctaCopyTh as string) || 'เกมยังไม่เปิดให้ดาวน์โหลด? ลงทะเบียนล่วงหน้าเพื่อรับรางวัลพิเศษ!',
    ctaButtonEn: (downloadPage.ctaButtonEn as string) || 'Pre-register now',
    ctaButtonTh: (downloadPage.ctaButtonTh as string) || 'ลงทะเบียนล่วงหน้า',
  }
}

function buildSettingsResponse(resources: SettingsResources) {
  return {
    site: buildSiteResponse(resources.siteSettings),
    event: buildEventResponse(resources.eventConfig),
    ...buildHomepageResponse(resources.homepage),
    storyPage: buildStoryPageResponse(resources.storyPage),
    gameGuidePage: buildGameGuidePageResponse(resources.gameGuidePage),
    newsPage: buildNewsPageResponse(resources.newsPage),
    faqPage: buildFaqPageResponse(resources.faqPage),
    galleryPage: buildGalleryPageResponse(resources.galleryPage),
    supportPage: buildSupportPageResponse(resources.supportPage),
    downloadPage: buildDownloadPageResponse(resources.downloadPage),
    storeButtons: mapStoreButtons(resources.storeButtons.docs),
  }
}

async function safeGlobal(payload: Awaited<ReturnType<typeof getPayloadClient>>, slug: string) {
  try {
    return asRecord(await payload.findGlobal({ slug, depth: 2 }))
  } catch {
    return {}
  }
}

async function fetchSettingsResources(): Promise<SettingsResources> {
  const payload = await getPayloadClient()
  const [siteSettings, eventConfig, homepage, storyPage, gameGuidePage, newsPage, faqPage, galleryPage, supportPage, downloadPage] = await Promise.all([
    safeGlobal(payload, 'site-settings'),
    safeGlobal(payload, 'event-config'),
    safeGlobal(payload, 'homepage'),
    safeGlobal(payload, 'story-page'),
    safeGlobal(payload, 'game-guide-page'),
    safeGlobal(payload, 'news-page'),
    safeGlobal(payload, 'faq-page'),
    safeGlobal(payload, 'gallery-page'),
    safeGlobal(payload, 'support-page'),
    safeGlobal(payload, 'download-page'),
  ])

  const storeButtons = await payload.find({
    collection: 'store-buttons',
    where: { visible: { equals: true } },
    sort: 'sortOrder',
    depth: 1,
  }) as { docs: StoreButtonDoc[] }

  return {
    siteSettings,
    eventConfig,
    homepage,
    storyPage,
    gameGuidePage,
    newsPage,
    faqPage,
    galleryPage,
    supportPage,
    downloadPage,
    storeButtons,
  }
}

export async function GET() {
  try {
    const resources = await fetchSettingsResources()

    return NextResponse.json(buildSettingsResponse(resources), {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
