import { Metadata } from 'next';
import { getPayloadClient } from '@/lib/payload';

type SEOData = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: { url: string } | string;
};

export async function resolveGlobalSEO(globalSlug: string, fallbackTitle: string): Promise<Metadata> {
  const payload = await getPayloadClient();
  const globalData = await payload.findGlobal({ slug: globalSlug as any, depth: 1 }).catch(() => null);
  
  const seo: SEOData = globalData?.seo || {};

  const title = seo.metaTitle || fallbackTitle;
  const description = seo.metaDescription || '';

  const ogImages = [];
  if (seo.ogImage) {
    const url = typeof seo.ogImage === 'string' ? seo.ogImage : seo.ogImage.url;
    if (url) ogImages.push({ url });
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.length > 0 ? [ogImages[0].url] : undefined,
    }
  };
}
