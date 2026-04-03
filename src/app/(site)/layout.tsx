import type { Metadata } from 'next';
import { Cinzel, IBM_Plex_Sans, IBM_Plex_Sans_Thai } from 'next/font/google';
import AppShell from '@/components/layout/AppShell';
import '../globals.css';

/* Modular CSS - Homepage Components */
import '../styles/navigation.css';
import '../styles/hero.css';
import '../styles/sections.css';
import '../styles/weapon-showcase.css';
import '../styles/features.css';
import '../styles/news-section.css';
import '../styles/footer.css';
import '../styles/highlights.css';

/* Modular CSS - Shared */
import '../styles/page-hero.css';
import '../styles/responsive.css';
import '../styles/faq.css';

/* Modular CSS - Page-Specific */
import '../styles/pages/event-page.css';
import '../styles/pages/news-page.css';
import '../styles/pages/news-download-responsive.css';
import '../styles/pages/download.css';
import '../styles/pages/story.css';
import '../styles/pages/game-guide.css';
import '../styles/pages/legal.css';
import '../styles/pages/gallery.css';
import '../styles/pages/weapons.css';
import '../styles/home-redesign.css';

/* Modular CSS - Utility */
import '../styles/accessibility.css';
import '../styles/skeleton.css';
import '../styles/animations.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm',
  display: 'swap',
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-thai',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

type MetadataSettingsResponse = {
  site?: {
    name?: string | null;
    description?: string | null;
    logo?: { url?: string | null } | null;
    seo?: { ogImage?: { url?: string | null } | null } | null;
  } | null;
  hero?: {
    backgroundImage?: { url?: string | null } | null;
  } | null;
};

async function getSiteMetadataConfig(siteUrl: string) {
  const defaultConfig = {
    siteName: 'Eternal Tower Saga',
    description: 'Official website for Eternal Tower Saga. Check game updates, news, guides, and event information in one place.',
    logoUrl: null as string | null,
    previewImage: null as string | null,
  };

  try {
    const response = await fetch(`${siteUrl}/api/settings`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return defaultConfig;
    }

    const data = await response.json() as MetadataSettingsResponse;

    return {
      siteName: data.site?.name || defaultConfig.siteName,
      description: data.site?.description || defaultConfig.description,
      logoUrl: data.site?.logo?.url || null,
      previewImage: data.site?.seo?.ogImage?.url || data.hero?.backgroundImage?.url || data.site?.logo?.url || null,
    };
  } catch {
    return defaultConfig;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const metadataBase = new URL(siteUrl);
  const { siteName, description, logoUrl, previewImage } = await getSiteMetadataConfig(siteUrl);
  const openGraphImages = previewImage
    ? [{ url: previewImage, alt: `${siteName} preview` }]
    : undefined;

  return {
    title: {
      default: `${siteName} | Mobile RPG`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      'Eternal Tower Saga',
      'ETS',
      'mobile RPG',
      'action RPG',
      'MMORPG',
      'pre-register',
      'game Thailand',
    ],
    metadataBase,
    openGraph: {
      title: `${siteName} | Official Website`,
      description: 'Check the latest Eternal Tower Saga news, guides, and event information.',
      type: 'website',
      locale: 'th_TH',
      alternateLocale: 'en_US',
      siteName,
      images: openGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: 'Official website for Eternal Tower Saga with news, guides, and event updates.',
      images: previewImage ? [previewImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    icons: {
      icon: '/favicon.ico',
      apple: logoUrl || undefined,
    },
    other: {
      'theme-color': '#040E21',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  };
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${ibmPlexSans.variable} ${ibmPlexSansThai.variable} ${cinzel.variable}`}
    >
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
