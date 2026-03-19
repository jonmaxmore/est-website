/* ═══════════════════════════════════════════════
   Event Page Types — Used by event page components
   ═══════════════════════════════════════════════ */

export interface Milestone {
  threshold: number;
  label: string;
  rewards: string[];
  rewardImage?: string | null;
}

export interface StoreButton {
  platform: string;
  label: string;
  sublabel: string;
  url: string;
}

export interface EventSettings {
  badgeTextEn?: string;
  badgeTextTh?: string;
  milestoneBadgeEn?: string;
  milestoneBadgeTh?: string;
  milestoneTitleEn?: string;
  milestoneTitleTh?: string;
  footerText?: string;
  countdownTarget?: string;
  heroImage?: { url: string } | null;
  backgroundImage?: { url: string } | null;
  contentSections?: Array<{
    contentType: string;
    textEn?: string;
    textTh?: string;
    image?: { url: string } | null;
  }>;
  ctaButtonEn?: string;
  ctaButtonTh?: string;
  modalTitleEn?: string;
  modalTitleTh?: string;
  emailPlaceholderEn?: string;
  emailPlaceholderTh?: string;
  storeLabelEn?: string;
  storeLabelTh?: string;
  submitButtonEn?: string;
  submitButtonTh?: string;
  successTitleEn?: string;
  successTitleTh?: string;
}

export interface CountryOption {
  value: string;
  labelTh: string;
  labelEn: string;
}

export const COUNTRIES: CountryOption[] = [
  { value: 'th', labelTh: 'ไทย', labelEn: 'Thailand' },
  { value: 'my', labelTh: 'มาเลเซีย', labelEn: 'Malaysia' },
  { value: 'id', labelTh: 'อินโดนีเซีย', labelEn: 'Indonesia' },
  { value: 'ph', labelTh: 'ฟิลิปปินส์', labelEn: 'Philippines' },
  { value: 'sg', labelTh: 'สิงคโปร์', labelEn: 'Singapore' },
];

export const DEFAULT_MILESTONES: Milestone[] = [
  { threshold: 10000, label: '10,000', rewards: ['Gold ×200,000', 'Fatigue Scroll ×10'] },
  { threshold: 25000, label: '25,000', rewards: ['Weapon Stone ×100', 'Armor Stone ×100'] },
  { threshold: 50000, label: '50,000', rewards: ['Mana ×12,000', 'Accessory Stone ×100'] },
  { threshold: 100000, label: '100,000', rewards: ['Clothing Ticket ×10'] },
  { threshold: 150000, label: '150,000', rewards: ['Summon Ticket ×10'] },
  { threshold: 200000, label: '200,000', rewards: ['Fortune House ×1', 'Reset Potions ×4'] },
];

export const DEFAULT_COUNTDOWN_TARGET = new Date('2026-04-02T23:59:59+07:00').getTime();

export const REAL_STORE_URLS: Record<string, string> = {
  ios: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
  android: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
  pc: '#',
};
