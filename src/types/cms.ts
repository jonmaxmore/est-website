/**
 * CMS types matching actual Payload CMS schema shapes.
 * Used for SSR data passing from page.tsx → client components.
 */

/** Payload media upload — resolved to object with url */
export interface PayloadMedia {
  id: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  filename?: string;
}

export interface CMSMediaRef {
  url: string;
  alt?: string | null;
}

/** Extract URL from a Payload media field (may be object or string) */
export function extractMediaUrl(field: unknown): string | null {
  if (typeof field === 'object' && field && 'url' in (field as Record<string, unknown>)) {
    return (field as PayloadMedia).url || null;
  }
  if (typeof field === 'string') return field;
  return null;
}

/** Extract media object from a Payload upload field */
export function extractMedia(field: unknown): CMSMediaRef | null {
  if (typeof field === 'object' && field && 'url' in (field as Record<string, unknown>)) {
    return {
      url: (field as PayloadMedia).url,
      alt: (field as PayloadMedia).alt || null,
    };
  }
  return null;
}

// ──── Characters ────

export interface CMSWeapon {
  id: number;
  name: string;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  portrait: string | null;
  infoImage: string | null;
  backgroundImage: string | null;
  icon: string | null;
  videoType?: 'none' | 'youtube' | 'upload';
  videoUrl?: string | null;
  videoUpload?: string | null;
}

// ──── News ────

export interface CMSNewsArticle {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  publishedAt: string;
  summaryEn?: string | null;
  summaryTh?: string | null;
  externalUrl?: string | null;
  openInNewTab?: boolean;
  featureOnHome?: boolean;
  homePriority?: number | null;
  href?: string;
  isExternal?: boolean;
  featuredImage: CMSNewsImage | null;
}

export interface CMSNewsImage {
  url: string | null;
  alt?: string | null;
  thumbnailUrl?: string | null;
  cardUrl?: string | null;
  heroUrl?: string | null;
}

// ──── Store Buttons ────

export interface CMSStoreButton {
  platform: string;
  label: string;
  sublabel: string;
  url: string;
  icon?: CMSMediaRef | null;
}

// ──── Section Configs (from Homepage global) ────

export interface CMSHeroConfig {
  taglineEn: string;
  taglineTh: string;
  taglineImageEn: { url: string } | null;
  taglineImageTh: { url: string } | null;
  ctaTextEn: string;
  ctaTextTh: string;
  ctaLink: string;
  backgroundImage: { url: string } | null;
  backgroundVideo: { url: string } | null;
  features: CMSFeature[];
}

export interface CMSFeature {
  icon: string;
  iconImage?: { url: string } | null;
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  previewImage?: { url: string } | null;
  href?: string | null;
  ctaLabelEn?: string | null;
  ctaLabelTh?: string | null;
}

export interface CMSWeaponSectionConfig {
  bgImage: { url: string } | null;
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  introEn?: string;
  introTh?: string;
}

export interface CMSHighlightsConfig {
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  bgImage: { url: string } | null;
  introEn?: string;
  introTh?: string;
}

export interface CMSNewsSectionConfig {
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  bgImage?: { url: string } | null;
  introEn?: string;
  introTh?: string;
}

export interface CMSGameGuidePageConfig {
  heroImage: CMSMediaRef | null;
  systemsBackgroundImage?: CMSMediaRef | null;
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  subtitleEn: string;
  subtitleTh: string;
  heroPanelLabelEn?: string | null;
  heroPanelLabelTh?: string | null;
  heroPanelCopyEn?: string | null;
  heroPanelCopyTh?: string | null;
  systemsBadgeEn?: string | null;
  systemsBadgeTh?: string | null;
  systemsTitleEn?: string | null;
  systemsTitleTh?: string | null;
  systemsCopyEn?: string | null;
  systemsCopyTh?: string | null;
  pillarsEn?: string[];
  pillarsTh?: string[];
  features: CMSFeature[];
}

export interface CMSNewsPageConfig {
  backgroundImage?: CMSMediaRef | null;
  badgeEn?: string | null;
  badgeTh?: string | null;
  titleEn?: string | null;
  titleTh?: string | null;
  subtitleEn?: string | null;
  subtitleTh?: string | null;
  archiveKickerEn?: string | null;
  archiveKickerTh?: string | null;
  archiveTitleEn?: string | null;
  archiveTitleTh?: string | null;
  archiveIntroEn?: string | null;
  archiveIntroTh?: string | null;
}

export interface CMSNavLink {
  id?: string;
  labelEn: string;
  labelTh: string;
  href: string;
  sectionId?: string | null;
  openInNewTab?: boolean;
  visible?: boolean;
}

export interface CMSFooterLink {
  labelEn: string;
  labelTh: string;
  href: string;
  openInNewTab?: boolean;
}

export interface CMSFooterGroup {
  titleEn: string;
  titleTh: string;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  links: CMSFooterLink[];
}

export interface CMSFooterSettings {
  copyrightText: string;
  termsUrl: string;
  privacyUrl: string;
  supportUrl: string;
  brandCopyEn?: string;
  brandCopyTh?: string;
  platformsLabelEn?: string;
  platformsLabelTh?: string;
  groups?: CMSFooterGroup[];
}

export interface CMSSiteConfig {
  name: string;
  description: string;
  logo: string | null;
  registrationUrl?: string;
  navigationLinks: CMSNavLink[];
  socialLinks: Record<string, string | null>;
  footer: CMSFooterSettings;
}

export interface CMSEventConfig {
  enabled: boolean;
  titleEn: string;
  titleTh: string;
}

// ──── Combined Settings (passed from SSR to client) ────

export interface CMSSettings {
  site: CMSSiteConfig;
  hero: CMSHeroConfig;
  event: CMSEventConfig;
  weapons: CMSWeaponSectionConfig;
  highlights: CMSHighlightsConfig;
  news: CMSNewsSectionConfig;
  storeButtons: CMSStoreButton[];
}
