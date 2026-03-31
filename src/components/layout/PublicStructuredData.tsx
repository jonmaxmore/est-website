'use client';

import { useMemo } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function toAbsoluteUrl(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url}`;
}

export default function PublicStructuredData() {
  const { settings, logoUrl, socialLinks } = useSiteSettings();

  const structuredData = useMemo(() => {
    const siteName = settings?.site?.name || 'Eternal Tower Saga';
    const siteDescription = settings?.site?.description
      || 'Mobile RPG — explore, fight, and climb the tower with friends.';
    const socialUrls = Object.values(socialLinks).filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0 && value !== '#',
    );
    const screenshotUrl = toAbsoluteUrl(settings?.hero?.backgroundImage?.url);
    const previewImageUrl = toAbsoluteUrl(settings?.site?.seo?.ogImage?.url)
      || screenshotUrl
      || toAbsoluteUrl(logoUrl);
    const organizationLogoUrl = toAbsoluteUrl(logoUrl);

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'VideoGame',
          '@id': `${siteUrl}/#game`,
          name: siteName,
          description: siteDescription,
          genre: ['RPG', 'Action RPG', 'MMORPG', 'Adventure'],
          gamePlatform: ['iOS', 'Android', 'PC'],
          applicationCategory: 'GameApplication',
          operatingSystem: ['iOS 14+', 'Android 8+', 'Windows 10+'],
          inLanguage: ['th', 'en'],
          url: siteUrl,
          image: previewImageUrl || undefined,
          screenshot: screenshotUrl || undefined,
          publisher: { '@id': `${siteUrl}/#publisher` },
          author: { '@id': `${siteUrl}/#publisher` },
        },
        {
          '@type': 'Organization',
          '@id': `${siteUrl}/#publisher`,
          name: 'Ultimate Game Co., Ltd.',
          url: siteUrl,
          logo: organizationLogoUrl || undefined,
          sameAs: socialUrls,
        },
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          name: siteName,
          url: siteUrl,
          publisher: { '@id': `${siteUrl}/#publisher` },
          inLanguage: ['th', 'en'],
        },
      ],
    };
  }, [logoUrl, settings, socialLinks]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
