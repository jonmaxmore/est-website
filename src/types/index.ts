// Localized text field
export interface LocalizedText {
  th: string;
  en: string;
}

// CMS Media
export interface MediaFile {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

// Section item (for grids, feature cards, etc.)
export interface SectionItem {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  image?: MediaFile;
  icon?: MediaFile;
  url?: string;
  sortOrder: number;
}

// CMS Section
export interface Section {
  id: string;
  page: string;
  sectionKey: string;
  sortOrder: number;
  isVisible: boolean;
  heading?: LocalizedText;
  subheading?: LocalizedText;
  bodyText?: LocalizedText;
  ctaLabel?: LocalizedText;
  ctaUrl?: string;
  ctaStyle?: 'primary' | 'secondary' | 'outline';
  backgroundImage?: MediaFile;
  backgroundVideo?: MediaFile;
  foregroundImage?: MediaFile;
  iconImage?: MediaFile;
  layout?: 'full-width' | 'centered' | 'split-left' | 'split-right' | 'grid';
  backgroundColor?: string;
  textColor?: string;
  items?: SectionItem[];
}

// Store Button
export interface StoreButton {
  id: string;
  platform: 'app_store' | 'google_play' | 'windows';
  label: LocalizedText;
  sublabel: LocalizedText;
  url: string;
  icon?: MediaFile;
  isVisible: boolean;
  sortOrder: number;
  style: 'dark' | 'light';
}

// Social Link
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: MediaFile;
  isVisible: boolean;
  sortOrder: number;
}

// Character
export interface GameCharacter {
  id: string;
  name: LocalizedText;
  class: LocalizedText;
  faction: string;
  rarity: string;
  description: LocalizedText;
  portrait?: MediaFile;
  icon?: MediaFile;
  weaponType: string;
  weaponIcon?: MediaFile;
  isVisible: boolean;
  sortOrder: number;
}

// Milestone Reward Item
export interface RewardItem {
  itemName: LocalizedText;
  quantity: number;
  icon?: MediaFile;
}

// Milestone
export interface Milestone {
  id: number;
  threshold: number;
  title: LocalizedText;
  rewards: RewardItem[];
  isUnlocked: boolean;
  sortOrder: number;
}

// News
export interface NewsArticle {
  id: string;
  title: LocalizedText;
  content: LocalizedText;
  category: string;
  thumbnail?: MediaFile;
  slug: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string;
}

// Event Config
export interface EventConfig {
  id: string;
  eventKey: string;
  title: LocalizedText;
  startDate: string;
  endDate: string;
  isActive: boolean;
  heroImage?: MediaFile;
  bannerBadgeImage?: MediaFile;
  registrationFormConfig: {
    emailPlaceholder: LocalizedText;
    platforms: string[];
    regions: Array<{ value: string; label: LocalizedText }>;
    ctaLabel: LocalizedText;
  };
  shareConfig: {
    ogTitle: LocalizedText;
    ogDescription: LocalizedText;
    ogImage?: MediaFile;
    shareText: LocalizedText;
  };
}

// Site Settings
export interface SiteSettings {
  siteName: LocalizedText;
  logo?: MediaFile;
  favicon?: MediaFile;
  defaultLocale: string;
  headerConfig: {
    navItems: Array<{
      label: LocalizedText;
      url: string;
      isExternal: boolean;
      sortOrder: number;
    }>;
    languageToggle: boolean;
  };
  footerConfig: {
    copyrightText: LocalizedText;
    logo?: MediaFile;
    legalLinks: Array<{ label: LocalizedText; url: string }>;
  };
  analytics: {
    ga4Id?: string;
    metaPixelId?: string;
    recaptchaSiteKey?: string;
  };
  seo: {
    defaultTitle: LocalizedText;
    defaultDescription: LocalizedText;
    defaultOgImage?: MediaFile;
  };
}

// Registration Stats
export interface RegistrationStats {
  totalRegistrations: number;
  milestones: Milestone[];
}

// Locale type
export type Locale = 'th' | 'en';

// Helper to get localized text
export function getLocalizedText(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return '';
  return text[locale] || text.th || text.en || '';
}
