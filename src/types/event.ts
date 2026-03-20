/* ═══════════════════════════════════════════════
   Event Page Types — Used by event page components
   2 Independent Systems: Milestone (registration count) + Referral (MLM)
   ═══════════════════════════════════════════════ */

// ── Milestone System (driven by pre-registration count) ──

export interface Milestone {
  id: string | number;
  threshold: number;
  rewardEn: string;
  rewardTh: string;
  rewardDescriptionEn?: string | null;
  rewardDescriptionTh?: string | null;
  icon?: string;
  rewardImage?: { url: string } | null;
  lockedImage?: { url: string } | null;
  unlocked: boolean;
  sortOrder?: number;
}

// ── Referral System (MLM 2-level, separate leaderboard) ──

export interface ReferralStats {
  referralCode: string;
  level1Count: number;
  level2Count: number;
  totalPoints: number;
  level1Referrals: Array<{
    email: string; // masked
    createdAt: string;
  }>;
}

export interface ReferralLeaderboardEntry {
  rank: number;
  email: string; // masked
  level1Count: number;
  level2Count: number;
  totalPoints: number;
}

// ── Store & CMS ──

export interface StoreUrls {
  ios: string;
  android: string;
  pc: string;
}

export interface StoreButton {
  platform: string;
  label: string;
  sublabel: string;
  url: string;
  trackingUrl?: string;
  badgeImage?: { url: string } | null;
  visible?: boolean;
  sortOrder?: number;
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
  // CMS store URLs
  storeUrls?: StoreUrls;
  // CTA button image (CMS upload)
  ctaButtonImage?: { url: string } | null;
  // Referral point settings
  pointsLevel1?: number;
  pointsLevel2?: number;
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

export const DEFAULT_COUNTDOWN_TARGET = new Date('2026-04-02T23:59:59+07:00').getTime();
