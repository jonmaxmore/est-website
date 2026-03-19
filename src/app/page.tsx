import { getPayloadClient } from '@/lib/payload';
import HomeContent from './HomeContent';

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE — Server Component (SSR)
   Fetches CMS data at request time, passes to client
   ═══════════════════════════════════════════════ */

// Data extraction helper
function extractUrl(field: unknown): string | null {
  if (typeof field === 'object' && field && 'url' in (field as Record<string, unknown>)) {
    return (field as { url: string }).url || null;
  }
  if (typeof field === 'string') return field;
  return null;
}

export default async function LandingPage() {
  let settings = null;
  let characters: Array<{
    id: number;
    name: string;
    portrait: string | null;
    infoImage: string | null;
    backgroundImage: string | null;
    icon: string | null;
  }> = [];
  let news: Array<{
    id: number;
    titleEn: string;
    titleTh: string;
    slug: string;
    category: string;
    publishedAt: string;
    featuredImage: string | null;
  }> = [];

  try {
    const payload = await getPayloadClient();

    // Fetch all data in parallel — direct DB access, no API round-trip
    const [siteSettings, eventConfig, heroSection, storeButtonsRes, charsRes, newsRes] =
      await Promise.all([
        payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
        payload.findGlobal({ slug: 'event-config' }).catch(() => null),
        payload.findGlobal({ slug: 'hero-section' }).catch(() => null),
        payload.find({ collection: 'store-buttons', where: { visible: { equals: true } }, sort: 'sortOrder' }).catch(() => ({ docs: [] })),
        payload.find({ collection: 'characters', where: { visible: { equals: true } }, sort: 'sortOrder', limit: 20 }).catch(() => ({ docs: [] })),
        payload.find({ collection: 'news', where: { status: { equals: 'published' } }, sort: '-publishedAt', limit: 3 }).catch(() => ({ docs: [] })),
      ]);

    // Build settings object matching the CMSSettings interface
    if (siteSettings && heroSection) {
      const hs = heroSection as Record<string, unknown>;
      settings = {
        site: {
          name: (siteSettings as Record<string, unknown>).siteName as string || 'Eternal Tower Saga',
          description: (siteSettings as Record<string, unknown>).siteDescription as string || '',
          logo: extractUrl((siteSettings as Record<string, unknown>).logo),
          socialLinks: (siteSettings as Record<string, unknown>).socialLinks as Record<string, string | null> || {},
          footer: (siteSettings as Record<string, unknown>).footer as { copyrightText: string; termsUrl: string; privacyUrl: string; supportUrl: string } || {
            copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
            termsUrl: '/terms',
            privacyUrl: '/privacy',
            supportUrl: '#',
          },
        },
        hero: {
          taglineEn: hs.taglineEn as string || 'Rise Together, Conquer the Tower',
          taglineTh: hs.taglineTh as string || 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
          taglineImageEn: typeof hs.taglineImageEn === 'object' && hs.taglineImageEn ? { url: (hs.taglineImageEn as { url: string }).url } : null,
          taglineImageTh: typeof hs.taglineImageTh === 'object' && hs.taglineImageTh ? { url: (hs.taglineImageTh as { url: string }).url } : null,
          ctaTextEn: hs.ctaTextEn as string || 'Pre-Register Now',
          ctaTextTh: hs.ctaTextTh as string || 'ลงทะเบียนล่วงหน้าเลย',
          ctaLink: hs.ctaLink as string || '/event',
          backgroundImage: typeof hs.backgroundImage === 'object' && hs.backgroundImage ? { url: (hs.backgroundImage as { url: string }).url } : null,
          backgroundVideo: typeof hs.backgroundVideo === 'object' && hs.backgroundVideo ? { url: (hs.backgroundVideo as { url: string }).url } : null,
          features: (hs.features as Array<{ icon: string; titleEn: string; titleTh: string; descriptionEn: string; descriptionTh: string }>) || [],
        },
        event: eventConfig ? {
          enabled: (eventConfig as Record<string, unknown>).enabled as boolean || false,
          titleEn: (eventConfig as Record<string, unknown>).titleEn as string || '',
          titleTh: (eventConfig as Record<string, unknown>).titleTh as string || '',
        } : { enabled: false, titleEn: '', titleTh: '' },
        characters: {
          bgImage: typeof hs.charactersBgImage === 'object' && hs.charactersBgImage ? { url: (hs.charactersBgImage as { url: string }).url } : null,
          badgeEn: hs.charactersBadgeEn as string || 'CHOOSE YOUR HERO',
          badgeTh: hs.charactersBadgeTh as string || 'เลือกฮีโร่ของคุณ',
          titleEn: hs.charactersTitleEn as string || 'Heroes of Arcatea',
          titleTh: hs.charactersTitleTh as string || 'ฮีโร่แห่ง Arcatea',
          voiceButtonEn: hs.voiceButtonEn as string || 'Listen to Voice Line',
          voiceButtonTh: hs.voiceButtonTh as string || 'ฟังเสียงตัวละคร',
        },
        highlights: {
          badgeEn: hs.highlightsBadgeEn as string || 'GAME FEATURES',
          badgeTh: hs.highlightsBadgeTh as string || 'ฟีเจอร์เกม',
          titleEn: hs.highlightsTitleEn as string || 'Game Highlights',
          titleTh: hs.highlightsTitleTh as string || 'ไฮไลท์เกม',
          bgImage: typeof hs.highlightsBgImage === 'object' && hs.highlightsBgImage ? { url: (hs.highlightsBgImage as { url: string }).url } : null,
        },
        news: {
          badgeEn: hs.newsBadgeEn as string || 'LATEST NEWS',
          badgeTh: hs.newsBadgeTh as string || 'ข่าวล่าสุด',
          titleEn: hs.newsTitleEn as string || 'News & Updates',
          titleTh: hs.newsTitleTh as string || 'ข่าวสารและอัพเดท',
        },
        storeButtons: storeButtonsRes.docs.map((btn: Record<string, unknown>) => ({
          platform: btn.platform as string,
          label: btn.label as string,
          sublabel: btn.sublabel as string,
          url: btn.url as string,
        })),
      };
    }

    // Build characters array
    characters = charsRes.docs.map((c: Record<string, unknown>) => ({
      id: c.id as number,
      name: (c.name || c.name_en || '') as string,
      portrait: extractUrl(c.portrait),
      infoImage: extractUrl(c.infoImage),
      backgroundImage: extractUrl(c.backgroundImage),
      icon: extractUrl(c.icon),
    }));

    // Build news array
    news = newsRes.docs.map((article: Record<string, unknown>) => ({
      id: article.id as number,
      titleEn: article.titleEn as string || '',
      titleTh: article.titleTh as string || '',
      slug: article.slug as string || '',
      category: article.category as string || '',
      publishedAt: article.publishedAt as string || '',
      featuredImage: typeof article.featuredImage === 'object' && article.featuredImage
        ? (article.featuredImage as { url: string }).url
        : null,
    }));
  } catch (error) {
    console.error('SSR data fetch error:', error);
    // Fall through with null/empty defaults — client will render fallbacks
  }

  return <HomeContent settings={settings} characters={characters} news={news} />;
}
