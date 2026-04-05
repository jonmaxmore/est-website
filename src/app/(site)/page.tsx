import { getPayloadClient } from '@/lib/payload';
import {
  buildNewsImage,
  isExternalNewsLink,
  resolveNewsHref,
  sortNewsForEditorial,
  summarizeNewsField,
} from '@/lib/news-content';
import HomeContent from './HomeContent';
import {
  extractMediaUrl,
  type CMSNewsArticle,
  type CMSWeapon,
} from '@/types/cms';
import { resolveGlobalSEO } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return resolveGlobalSEO('homepage', 'Eternal Tower Saga');
}

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
  homepage: unknown | null;
  weaponsRes: CmsDocsResponse;
  newsRes: CmsDocsResponse;
  storeButtonsRes: CmsDocsResponse;
};

function asRecord(value: unknown): CmsRecord | null {
  return typeof value === 'object' && value ? (value as CmsRecord) : null;
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

  const [siteSettings, homepage, storeButtonsRes, weaponsRes, newsRes] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 2 }).catch(() => null),
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
    homepage,
    weaponsRes: weaponsRes as CmsDocsResponse,
    newsRes: newsRes as CmsDocsResponse,
    storeButtonsRes: storeButtonsRes as CmsDocsResponse,
  };
}

export default async function LandingPage() {
  let homepageData: CmsRecord | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let settings: any = null;
  let weapons: CMSWeapon[] = [];
  let news: CMSNewsArticle[] = [];

  try {
    const resources = await fetchLandingResources();
    homepageData = asRecord(resources.homepage);
    
    // Pass minimal site settings down to HomeContent for Footer/Nav rendering
    settings = {
        site: asRecord(resources.siteSettings)
    };
    
    weapons = resources.weaponsRes.docs.map(mapWeaponRecord);
    news = sortNewsForEditorial(resources.newsRes.docs.map(mapNewsRecord));
  } catch (error) {
    console.error('SSR data fetch error:', error);
  }

  return <HomeContent homepageData={homepageData} settings={settings} weapons={weapons} news={news} />;
}
