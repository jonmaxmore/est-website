'use client';

import type { CMSNewsArticle, CMSSettings, CMSWeapon } from '@/types/cms';
import ScrollProgress from '@/components/ui/ScrollProgress';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

// Sections (Dynamic Blocks)
import HeroSection from '@/components/sections/HeroSection';
import WeaponSection from '@/components/sections/WeaponSection';
import GameFeaturesSection from '@/components/sections/GameFeaturesSection';
import NewsSection from '@/components/sections/NewsSection';

interface HomeContentProps {
  homepageData: any; // ข้อมูลที่มาจาก Page Builder (Blocks)
  settings: CMSSettings | null;
  weapons: CMSWeapon[];
  news: CMSNewsArticle[];
}

export default function HomeContent({ homepageData, settings, weapons, news }: HomeContentProps) {
  // Fallback data in case CMS is empty
  const blocks = homepageData?.layout || [];

  const footerSettings = settings?.site?.footer || {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  };

  // Block Renderer
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
      default:
        return null;
    }
  };

  return (
    <div className="home-page-shell bg-black min-h-screen text-white">
      <ScrollProgress />
      <Navigation
        links={settings?.site?.navigationLinks}
        registrationUrl={settings?.site?.registrationUrl}
        logoUrl={settings?.site?.logo}
      />
      
      {/* 
        Dynamic Page Builder Rendering 
        แทนที่จะ Hardcode ว่าอะไรขึ้นก่อน-หลัง ตอนนี้ให้ Map ตามก้อน JSON ที่ได้จาก CMS
      */}
      <main className="relative w-full z-10 pt-[88px]">
        {blocks.length > 0 ? (
          blocks.map((block: any, index: number) => renderBlock(block, index))
        ) : (
          <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
            [No Content Blocks Configured in CMS]
          </div>
        )}
      </main>

      <Footer settings={footerSettings} />
    </div>
  );
}
