import { getPayloadClient } from '@/lib/payload';
import HomeContent from './HomeContent';
import {
  extractMediaUrl,
  extractMedia,
  type CMSSettings,
  type CMSCharacter,
  type CMSNewsArticle,
} from '@/types/cms';

// Force fresh CMS data on every request (not static prerender)
export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE — Server Component (SSR)
   Fetches CMS data at request time, passes to client
   ═══════════════════════════════════════════════ */

// eslint-disable-next-line max-lines-per-function -- SSR data fetch with parallel queries
export default async function LandingPage() {
  let settings: CMSSettings | null = null;
  let characters: CMSCharacter[] = [];
  let news: CMSNewsArticle[] = [];

  try {
    const payload = await getPayloadClient();

    // Fetch all data in parallel — direct DB access, no API round-trip
    const [siteSettings, eventConfig, homepage, storeButtonsRes, charsRes, newsRes] =
      await Promise.all([
        payload.findGlobal({ slug: 'site-settings' }).catch((e) => { console.error('Failed to fetch site-settings:', e); return null; }),
        payload.findGlobal({ slug: 'event-config' }).catch((e) => { console.error('Failed to fetch event-config:', e); return null; }),
        payload.findGlobal({ slug: 'homepage' }).catch((e) => { console.error('Failed to fetch homepage:', e); return null; }),
        payload.find({ collection: 'store-buttons', where: { visible: { equals: true } }, sort: 'sortOrder' }).catch(() => ({ docs: [] })),
        payload.find({ collection: 'characters', where: { visible: { equals: true } }, sort: 'sortOrder', limit: 20, depth: 2 }).catch(() => ({ docs: [] })),
        payload.find({ collection: 'news', where: { status: { equals: 'published' } }, sort: '-publishedAt', limit: 3 }).catch(() => ({ docs: [] })),
      ]);

    // Build settings object
    if (siteSettings && homepage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ss = siteSettings as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hs = homepage as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ec = eventConfig as any;

      settings = {
        site: {
          name: ss.siteName || 'Eternal Tower Saga',
          description: ss.siteDescription || '',
          logo: extractMediaUrl(ss.logo),
          socialLinks: ss.socialLinks || {},
          footer: ss.footer || {
            copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
            termsUrl: '/terms',
            privacyUrl: '/privacy',
            supportUrl: '#',
          },
        },
        hero: {
          taglineEn: hs.taglineEn || 'Rise Together, Conquer the Tower',
          taglineTh: hs.taglineTh || 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
          taglineImageEn: extractMedia(hs.taglineImageEn),
          taglineImageTh: extractMedia(hs.taglineImageTh),
          ctaTextEn: hs.ctaTextEn || 'Pre-Register Now',
          ctaTextTh: hs.ctaTextTh || 'ลงทะเบียนล่วงหน้าเลย',
          ctaLink: hs.ctaLink || '/event',
          backgroundImage: extractMedia(hs.backgroundImage),
          backgroundVideo: extractMedia(hs.backgroundVideo),
          features: (hs.features as Record<string, unknown>[])?.map(f => ({
            icon: (f.icon as string) || '',
            iconImage: extractMedia(f.iconImage),
            titleEn: (f.titleEn as string) || '',
            titleTh: (f.titleTh as string) || '',
            descriptionEn: (f.descriptionEn as string) || '',
            descriptionTh: (f.descriptionTh as string) || '',
          })) || [],
        },
        event: ec
          ? { enabled: ec.enabled || false, titleEn: ec.titleEn || '', titleTh: ec.titleTh || '' }
          : { enabled: false, titleEn: '', titleTh: '' },
        characters: {
          bgImage: extractMedia(hs.charactersBgImage),
          badgeEn: hs.charactersBadgeEn || 'CHOOSE YOUR WEAPON',
          badgeTh: hs.charactersBadgeTh || 'เลือกอาวุธของคุณ',
          titleEn: hs.charactersTitleEn || 'Weapons of Arcatea',
          titleTh: hs.charactersTitleTh || 'อาวุธแห่ง Arcatea',
        },
        highlights: {
          badgeEn: hs.highlightsBadgeEn || 'GAME FEATURES',
          badgeTh: hs.highlightsBadgeTh || 'ฟีเจอร์เกม',
          titleEn: hs.highlightsTitleEn || 'Game Highlights',
          titleTh: hs.highlightsTitleTh || 'ไฮไลท์เกม',
          bgImage: extractMedia(hs.highlightsBgImage),
        },
        news: {
          badgeEn: hs.newsBadgeEn || 'LATEST NEWS',
          badgeTh: hs.newsBadgeTh || 'ข่าวล่าสุด',
          titleEn: hs.newsTitleEn || 'News & Updates',
          titleTh: hs.newsTitleTh || 'ข่าวสารและอัพเดท',
          bgImage: extractMedia(hs.newsBgImage),
        },
        storeButtons: storeButtonsRes.docs.map((btn: Record<string, unknown>) => ({
          platform: btn.platform as string,
          label: btn.label as string,
          sublabel: (btn.sublabel as string) || '',
          url: btn.url as string,
        })),
      };
    }

    // Build characters array
    characters = charsRes.docs.map((c: Record<string, unknown>) => ({
      id: c.id as number,
      name: (c.name || '') as string,
      portrait: extractMediaUrl(c.portrait),
      infoImage: extractMediaUrl(c.infoImage),
      backgroundImage: extractMediaUrl(c.backgroundImage),
      icon: extractMediaUrl(c.icon),
    }));

    // Build news array
    news = newsRes.docs.map((article: Record<string, unknown>) => ({
      id: article.id as number,
      titleEn: (article.titleEn as string) || '',
      titleTh: (article.titleTh as string) || '',
      slug: (article.slug as string) || '',
      category: (article.category as string) || '',
      publishedAt: (article.publishedAt as string) || '',
      featuredImage: extractMediaUrl(article.featuredImage),
    }));
  } catch (error) {
    console.error('SSR data fetch error:', error);
  }

  return <HomeContent settings={settings} characters={characters} news={news} />;
}
