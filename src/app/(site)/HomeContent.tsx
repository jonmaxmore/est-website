'use client';

import type { CMSNewsArticle, CMSSettings, CMSWeapon } from '@/types/cms';
import ScrollProgress from '@/components/ui/ScrollProgress';

// Sections (Dynamic Blocks)
import HeroSection from '@/components/sections/HeroSection';
import WeaponSection from '@/components/sections/WeaponSection';
import GameFeaturesSection from '@/components/sections/GameFeaturesSection';
import NewsSection from '@/components/sections/NewsSection';
import GameGuideSection from '@/components/sections/GameGuideSection';
import HighlightsSection from '@/components/sections/HighlightsSection';

interface HomeContentProps {
  homepageData: any;
  settings: CMSSettings | null;
  weapons: CMSWeapon[];
  news: CMSNewsArticle[];
}

export default function HomeContent({ homepageData, settings, weapons, news }: HomeContentProps) {
  const blocks = homepageData?.layout || [];

  const footerSettings = settings?.site?.footer || {
    copyrightText: 'Â© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  };

  const renderBlock = (block: any, index: number) => {
    switch (block.blockType) {
      case 'hero':
        return <HeroSection key={index} data={block} />;
      case 'weaponsShowcase':
        return <WeaponSection key={index} data={block} weapons={weapons} />;
      case 'gameFeatures':
        return <GameFeaturesSection key={index} data={block} />;
      case 'newsTicker':
        return <NewsSection key={index} data={block} news={news} />;
      case 'gameGuide':
        return <GameGuideSection key={index} data={block} />;
      case 'highlightsShowcase':
        return <HighlightsSection key={index} features={block.features || []} sectionConfig={block} />;
      default:
        // Handle unmapped highlights if old data persists
        if (block.blockType === 'highlights') {
          return <HighlightsSection key={index} features={block.features || []} sectionConfig={block} />;
        }
        return null;
    }
  };

  // If Highlights is globally set in settings but not in the blocks, we can append it:
  const hasHighlights = blocks.some((b: any) => b.blockType === 'highlights' || b.blockType === 'highlightsShowcase');

  return (
    <div className="home-page-shell bg-black text-white w-full overflow-hidden">
      <ScrollProgress />

      <main className="relative w-full overflow-x-hidden">
        {blocks.length > 0 ? (
          blocks.map((block: Record<string, unknown>, index: number) => renderBlock(block, index))
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
            [No Content Blocks Configured in CMS]
          </div>
        )}
        
        {!hasHighlights && settings?.highlights && (
          <HighlightsSection
            features={settings?.hero?.features || []}
            sectionConfig={settings.highlights}
          />
        )}
        
      </main>
    </div>
  );
}
