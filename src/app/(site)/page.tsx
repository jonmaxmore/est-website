import { getPayloadClient } from '@/lib/payload';
import {
  buildNewsImage,
  isExternalNewsLink,
  resolveNewsHref,
  sortNewsForEditorial,
  summarizeNewsField,
} from '@/lib/news-content';
import {
  DEFAULT_FOOTER,
  DEFAULT_NAVIGATION_LINKS,
  DEFAULT_REGISTRATION_URL,
} from '@/lib/site-settings-defaults';
import HomeContent from './HomeContent';
import {
  extractMedia,
  extractMediaUrl,
  type CMSNewsArticle,
  type CMSSettings,
  type CMSWeapon,
} from '@/types/cms';
import { normalizeFeatureLinkFields } from '@/lib/feature-links';

export const revalidate = 60;

type CmsRecord = Record<string, unknown>;
type CmsDocsResponse = { docs: CmsRecord[] };
type NewsImageSource = {
  url?: string | null;
  alt?: string | null;
  sizes?: {
    thumbnail?: { url?: string | null };
    card?: { url?: string | null };
    hero?: { url?: string | null };
  };
} | null;

type LandingResources = {
  siteSettings: unknown | null;
  eventConfig: unknown | null;
  homepage: unknown | null;
  storeButtonsRes: CmsDocsResponse;
  weaponsRes: CmsDocsResponse;
  newsRes: CmsDocsResponse;
};

function asRecord(value: unknown): CmsRecord | null {
  return typeof value === 'object' && value ? (value as CmsRecord) : null;
}

function mapFooterGroups(footerValue: CmsRecord) {
  const groups = Array.isArray(footerValue.groups)
    ? (footerValue.groups as CmsRecord[])
    : [];

  return groups
    .map((group) => {
      const links = Array.isArray(group.links)
        ? (group.links as CmsRecord[])
          .filter((link) => typeof link.href === 'string')
          .map((link) => ({
            labelEn: (link.labelEn as string) || (link.labelTh as string) || 'Link',
            labelTh: (link.labelTh as string) || (link.labelEn as string) || 'ลิงก์',
            href: (link.href as string) || '/',
            openInNewTab: Boolean(link.openInNewTab),
          }))
        : [];

      return {
        titleEn: (group.titleEn as string) || (group.titleTh as string) || 'Group',
        titleTh: (group.titleTh as string) || (group.titleEn as string) || 'กลุ่มลิงก์',
        descriptionEn: (group.descriptionEn as string) || null,
        descriptionTh: (group.descriptionTh as string) || null,
        links,
      };
    })
    .filter((group) => group.links.length > 0);
}

function buildNavigationLinks(siteSettings: CmsRecord) {
  const links = Array.isArray(siteSettings.navigationLinks)
    ? (siteSettings.navigationLinks as CmsRecord[])
      .filter((link) => link.visible !== false && typeof link.href === 'string')
      .map((link, index) => ({
        id: String(link.sectionId || index),
        labelEn: (link.labelEn as string) || (link.labelTh as string) || 'Link',
        labelTh: (link.labelTh as string) || (link.labelEn as string) || 'ลิงก์',
        href: (link.href as string) || '/',
        sectionId: (link.sectionId as string) || null,
        openInNewTab: Boolean(link.openInNewTab),
        visible: link.visible !== false,
      }))
    : [];

  return links.length ? links : DEFAULT_NAVIGATION_LINKS;
}

function mapHeroFeatures(homepage: CmsRecord) {
  const features = Array.isArray(homepage.features)
    ? (homepage.features as CmsRecord[])
    : [];

  return features.map((feature) => ({
    ...normalizeFeatureLinkFields({
      href: feature.href,
      ctaLabelEn: feature.ctaLabelEn,
      ctaLabelTh: feature.ctaLabelTh,
    }),
    icon: (feature.icon as string) || '',
    iconImage: extractMedia(feature.iconImage),
    previewImage: extractMedia(feature.previewImage),
    titleEn: (feature.titleEn as string) || '',
    titleTh: (feature.titleTh as string) || '',
    descriptionEn: (feature.descriptionEn as string) || '',
    descriptionTh: (feature.descriptionTh as string) || '',
  }));
}

function mapStoreButtons(buttons: CmsRecord[]) {
  return buttons.map((button) => ({
    platform: button.platform as string,
    label: button.label as string,
    sublabel: (button.sublabel as string) || '',
    url: button.url as string,
    icon: extractMedia(button.icon),
  }));
}

function buildSiteConfig(siteSettings: CmsRecord) {
  const footerValue = asRecord(siteSettings.footer) || {};
  const footerGroups = mapFooterGroups(footerValue);

  return {
    name: (siteSettings.siteName as string) || '',
    description: (siteSettings.siteDescription as string) || '',
    logo: extractMediaUrl(siteSettings.logo),
    registrationUrl: (siteSettings.registrationUrl as string) || DEFAULT_REGISTRATION_URL,
    navigationLinks: buildNavigationLinks(siteSettings),
    socialLinks: (siteSettings.socialLinks as Record<string, string | null>) || {},
    footer: {
      ...DEFAULT_FOOTER,
      ...footerValue,
      groups: footerGroups.length ? footerGroups : DEFAULT_FOOTER.groups,
    },
  };
}

function buildHeroConfig(homepage: CmsRecord) {
  return {
    taglineEn: (homepage.taglineEn as string) || '',
    taglineTh: (homepage.taglineTh as string) || '',
    taglineImageEn: extractMedia(homepage.taglineImageEn),
    taglineImageTh: extractMedia(homepage.taglineImageTh),
    ctaTextEn: (homepage.ctaTextEn as string) || '',
    ctaTextTh: (homepage.ctaTextTh as string) || '',
    ctaLink: (homepage.ctaLink as string) || '/event',
    backgroundImage: extractMedia(homepage.backgroundImage),
    backgroundVideo: extractMedia(homepage.backgroundVideo),
    features: mapHeroFeatures(homepage),
  };
}

function buildEventConfig(eventConfig: CmsRecord | null) {
  if (!eventConfig) {
    return { enabled: false, titleEn: '', titleTh: '' };
  }

  return {
    enabled: Boolean(eventConfig.enabled),
    titleEn: (eventConfig.titleEn as string) || '',
    titleTh: (eventConfig.titleTh as string) || '',
  };
}

function buildWeaponSectionConfig(homepage: CmsRecord) {
  return {
    bgImage: extractMedia(homepage.weaponsBgImage),
    badgeEn: (homepage.weaponsBadgeEn as string) || '',
    badgeTh: (homepage.weaponsBadgeTh as string) || '',
    titleEn: (homepage.weaponsTitleEn as string) || '',
    titleTh: (homepage.weaponsTitleTh as string) || '',
    introEn: (homepage.weaponsIntroEn as string) || '',
    introTh: (homepage.weaponsIntroTh as string) || '',
  };
}

function buildHighlightsConfig(homepage: CmsRecord) {
  return {
    badgeEn: (homepage.highlightsBadgeEn as string) || '',
    badgeTh: (homepage.highlightsBadgeTh as string) || '',
    titleEn: (homepage.highlightsTitleEn as string) || '',
    titleTh: (homepage.highlightsTitleTh as string) || '',
    bgImage: extractMedia(homepage.highlightsBgImage),
    introEn: (homepage.highlightsIntroEn as string) || '',
    introTh: (homepage.highlightsIntroTh as string) || '',
  };
}

function buildNewsConfig(homepage: CmsRecord) {
  return {
    badgeEn: (homepage.newsBadgeEn as string) || '',
    badgeTh: (homepage.newsBadgeTh as string) || '',
    titleEn: (homepage.newsTitleEn as string) || '',
    titleTh: (homepage.newsTitleTh as string) || '',
    bgImage: extractMedia(homepage.newsBgImage),
    introEn: (homepage.newsIntroEn as string) || '',
    introTh: (homepage.newsIntroTh as string) || '',
  };
}

function buildGuideConfig(homepage: CmsRecord) {
  const cards = Array.isArray(homepage.guideCards)
    ? (homepage.guideCards as CmsRecord[]).map((card) => ({
        icon: (card.icon as string) || 'BookOpen',
        image: extractMediaUrl(card.image),
        titleEn: (card.titleEn as string) || '',
        titleTh: (card.titleTh as string) || '',
        descriptionEn: (card.descriptionEn as string) || '',
        descriptionTh: (card.descriptionTh as string) || '',
        href: (card.href as string) || '#',
      }))
    : [];

  return {
    badgeEn: (homepage.guideBadgeEn as string) || '',
    badgeTh: (homepage.guideBadgeTh as string) || '',
    titleEn: (homepage.guideTitleEn as string) || '',
    titleTh: (homepage.guideTitleTh as string) || '',
    introEn: (homepage.guideIntroEn as string) || '',
    introTh: (homepage.guideIntroTh as string) || '',
    cards,
  };
}

function buildLandingSettings(
  siteSettingsValue: unknown,
  eventConfigValue: unknown,
  homepageValue: unknown,
  storeButtonsRes: CmsDocsResponse,
): CMSSettings | null {
  const siteSettings = asRecord(siteSettingsValue);
  const eventConfig = asRecord(eventConfigValue);
  const homepage = asRecord(homepageValue);

  if (!siteSettings || !homepage) {
    return null;
  }

  return {
    site: buildSiteConfig(siteSettings),
    hero: buildHeroConfig(homepage),
    event: buildEventConfig(eventConfig),
    weapons: buildWeaponSectionConfig(homepage),
    highlights: buildHighlightsConfig(homepage),
    news: buildNewsConfig(homepage),
    guide: buildGuideConfig(homepage),
    storeButtons: mapStoreButtons(storeButtonsRes.docs),
  };
}

function mapWeaponRecord(weapon: CmsRecord): CMSWeapon {
  return {
    id: weapon.id as number,
    name: (weapon.name as string) || '',
    descriptionEn: (weapon.descriptionEn as string) || null,
    descriptionTh: (weapon.descriptionTh as string) || null,
    portrait: extractMediaUrl(weapon.portrait),
    infoImage: extractMediaUrl(weapon.infoImage),
    backgroundImage: extractMediaUrl(weapon.backgroundImage),
    icon: extractMediaUrl(weapon.icon),
    videoType: (weapon.videoType as 'none' | 'youtube' | 'upload') || 'none',
    videoUrl: (weapon.videoUrl as string) || null,
    videoUpload: extractMediaUrl(weapon.videoUpload),
  };
}

function mapNewsRecord(article: CmsRecord): CMSNewsArticle {
  const externalUrl = (article.externalUrl as string) || null;
  const slug = (article.slug as string) || '';

  return {
    id: article.id as number,
    titleEn: (article.titleEn as string) || '',
    titleTh: (article.titleTh as string) || '',
    slug,
    category: (article.category as string) || '',
    publishedAt: (article.publishedAt as string) || '',
    summaryEn: summarizeNewsField(article.excerptEn, article.contentEn),
    summaryTh: summarizeNewsField(article.excerptTh, article.contentTh),
    externalUrl,
    openInNewTab: Boolean(article.openInNewTab),
    featureOnHome: Boolean(article.featureOnHome),
    homePriority: typeof article.homePriority === 'number' ? article.homePriority : 0,
    href: resolveNewsHref({ externalUrl, slug }),
    isExternal: isExternalNewsLink({ externalUrl }),
    featuredImage: buildNewsImage(article.featuredImage as NewsImageSource),
  };
}

async function fetchLandingResources(): Promise<LandingResources> {
  const payload = await getPayloadClient();

  const [siteSettings, eventConfig, homepage, storeButtonsRes, weaponsRes, newsRes] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 2 }).catch(() => null),
    payload.findGlobal({ slug: 'event-config', depth: 2 }).catch(() => null),
    payload.findGlobal({ slug: 'homepage', depth: 2 }).catch(() => null),
    payload.find({
      collection: 'store-buttons',
      where: { visible: { equals: true } },
      sort: 'sortOrder',
      depth: 1,
    }).catch(() => ({ docs: [] })),
    payload.find({
      collection: 'weapons',
      where: { visible: { equals: true } },
      sort: 'sortOrder',
      limit: 20,
      depth: 2,
    }).catch(() => ({ docs: [] })),
    payload.find({
      collection: 'news',
      where: { status: { equals: 'published' }, publishedAt: { exists: true } },
      sort: '-publishedAt',
      limit: 24,
      depth: 2,
    }).catch(() => ({ docs: [] })),
  ]);

  return {
    siteSettings,
    eventConfig,
    homepage,
    storeButtonsRes: storeButtonsRes as CmsDocsResponse,
    weaponsRes: weaponsRes as CmsDocsResponse,
    newsRes: newsRes as CmsDocsResponse,
  };
}

export default async function LandingPage() {
  let settings: CMSSettings | null = null;
  let weapons: CMSWeapon[] = [];
  let news: CMSNewsArticle[] = [];

  try {
    const resources = await fetchLandingResources();
    settings = buildLandingSettings(
      resources.siteSettings,
      resources.eventConfig,
      resources.homepage,
      resources.storeButtonsRes,
    );
    weapons = resources.weaponsRes.docs.map(mapWeaponRecord);
    news = sortNewsForEditorial(resources.newsRes.docs.map(mapNewsRecord));
  } catch (error) {
    console.error('SSR data fetch error:', error);
  }

  return <HomeContent settings={settings} weapons={weapons} news={news} />;
}
