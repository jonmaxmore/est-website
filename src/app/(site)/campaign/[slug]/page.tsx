import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayloadClient } from '@/lib/payload';
import CampaignContent from './CampaignContent';
import { extractMediaUrl, type CMSNewsArticle, type CMSWeapon } from '@/types/cms';
import { buildNewsImage, isExternalNewsLink, resolveNewsHref, summarizeNewsField } from '@/lib/news-content';

type Props = {
  params: { slug: string };
};

type CmsRecord = Record<string, unknown>;

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
    featuredImage: buildNewsImage(article.featuredImage as any),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const payload = await getPayloadClient();
  const campaigns = await payload.find({
    collection: 'campaigns',
    where: { slug: { equals: params.slug }, status: { equals: 'published' } },
    depth: 1,
  }).catch(() => null);

  const campaign = campaigns?.docs?.[0] as any;

  if (!campaign) {
    return { title: 'Not Found' };
  }

  const title = campaign.seo?.metaTitle || campaign.title;
  const description = campaign.seo?.metaDescription || '';

  return {
    title: `${title} - Eternal Tower Saga`,
    description,
    openGraph: {
      title,
      description,
      images: campaign.seo?.ogImage ? [
        { url: typeof campaign.seo.ogImage === 'string' ? campaign.seo.ogImage : (campaign.seo.ogImage as any).url }
      ] : [],
    },
  };
}

export default async function CampaignPage({ params }: Props) {
  const payload = await getPayloadClient();
  
  // Find the exact campaign matching the slug
  const campaigns = await payload.find({
    collection: 'campaigns',
    where: { slug: { equals: params.slug }, status: { equals: 'published' } },
    depth: 2, 
  }).catch(() => null);

  const campaign = campaigns?.docs?.[0] as any;

  if (!campaign) {
    notFound();
  }

  // Pre-fetch global data to feed generic blocks
  const [newsRes, weaponsRes] = await Promise.all([
    payload.find({
      collection: 'news',
      where: { status: { equals: 'published' }, publishedAt: { exists: true } },
      sort: '-publishedAt',
      limit: 24,
      depth: 2,
    }).catch(() => ({ docs: [] })),
    payload.find({
      collection: 'weapons',
      where: { visible: { equals: true } },
      sort: 'sortOrder',
      limit: 20,
      depth: 2,
    }).catch(() => ({ docs: [] }))
  ]);

  const weapons = weaponsRes.docs.map(w => mapWeaponRecord(w as any));
  const news = newsRes.docs.map(n => mapNewsRecord(n as any));

  return (
    <main className="w-full flex-auto relative">
      <CampaignContent 
        campaign={campaign} 
        news={news} 
        weapons={weapons} 
      />
    </main>
  );
}
