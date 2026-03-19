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

/** Extract URL from a Payload media field (may be object or string) */
export function extractMediaUrl(field: unknown): string | null {
  if (typeof field === 'object' && field && 'url' in (field as Record<string, unknown>)) {
    return (field as PayloadMedia).url || null;
  }
  if (typeof field === 'string') return field;
  return null;
}

/** Extract media object { url } from a Payload upload field */
export function extractMedia(field: unknown): { url: string } | null {
  if (typeof field === 'object' && field && 'url' in (field as Record<string, unknown>)) {
    return { url: (field as PayloadMedia).url };
  }
  return null;
}

// ──── Characters ────

export interface CMSCharacter {
  id: number;
  name: string;
  portrait: string | null;
  infoImage: string | null;
  backgroundImage: string | null;
  icon: string | null;
}

// ──── News ────

export interface CMSNewsArticle {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  publishedAt: string;
  featuredImage: string | null;
}

// ──── Store Buttons ────

export interface CMSStoreButton {
  platform: string;
  label: string;
  sublabel: string;
  url: string;
}

// ──── Section Configs (from HeroSection global) ────

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
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
}

export interface CMSCharacterSectionConfig {
  bgImage: { url: string } | null;
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  voiceButtonEn: string;
  voiceButtonTh: string;
}

export interface CMSHighlightsConfig {
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  bgImage: { url: string } | null;
}

export interface CMSNewsSectionConfig {
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
}

export interface CMSSiteConfig {
  name: string;
  description: string;
  logo: string | null;
  socialLinks: Record<string, string | null>;
  footer: {
    copyrightText: string;
    termsUrl: string;
    privacyUrl: string;
    supportUrl: string;
  };
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
  characters: CMSCharacterSectionConfig;
  highlights: CMSHighlightsConfig;
  news: CMSNewsSectionConfig;
  storeButtons: CMSStoreButton[];
}
