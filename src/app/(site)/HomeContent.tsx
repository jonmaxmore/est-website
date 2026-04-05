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
  homepageData: any;
  settings: CMSSettings | null;
  weapons: CMSWeapon[];
  news: CMSNewsArticle[];
}

export default function HomeContent({ homepageData, settings, weapons, news }: HomeContentProps) {
  const blocks = homepageData?.layout || [];

  const footerSettings = settings?.site?.footer || {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
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
      default:
        return null;
    }
  };

  return (
    <div className="home-page-shell bg-black text-white w-full overflow-hidden">
      <ScrollProgress />

      {/* 
        Snap Container: 
        ให้ทุก Section เลื่อนทีละ 1 หน้าจอเป๊ะๆ (Full-screen Snap Scrolling)
      */}
      <main className="relative w-full h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth">
        {blocks.length > 0 ? (
          blocks.map((block: any, index: number) => renderBlock(block, index))
        ) : (
          <div className="h-screen flex items-center justify-center text-gray-500 snap-start">
            [No Content Blocks Configured in CMS]
          </div>
        )}
        
        {/* ให้ Footer เป็น Section สุดท้ายที่โดน Snap ด้วย */}
        <div className="snap-start shrink-0">
          <Footer settings={footerSettings} />
        </div>
      </main>
    </div>
  );
}
