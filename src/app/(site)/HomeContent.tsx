'use client';

import type { CMSNewsArticle, CMSSettings, CMSWeapon } from '@/types/cms';
import ScrollProgress from '@/components/ui/ScrollProgress';
import HeroSection from '@/components/sections/HeroSection';
import WeaponSection from '@/components/sections/WeaponSection';
import GameFeaturesSection from '@/components/sections/GameFeaturesSection';
import HighlightsSection from '@/components/sections/HighlightsSection';
import GameGuideSection from '@/components/sections/GameGuideSection';
import NewsSection from '@/components/sections/NewsSection';
import Navigation from '@/components/layout/Navigation';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';

interface HomeContentProps {
  settings: CMSSettings | null;
  weapons: CMSWeapon[];
  news: CMSNewsArticle[];
}

export default function HomeContent({ settings, weapons, news }: HomeContentProps) {
  const socialLinks = settings?.site?.socialLinks || {};
  const footer = settings?.site?.footer || {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  };

  const features = settings?.hero?.features || [];

  return (
    <div className="home-page-shell">
      <ScrollProgress />
      <Navigation
        links={settings?.site?.navigationLinks}
        registrationUrl={settings?.site?.registrationUrl}
        logoUrl={settings?.site?.logo}
      />

      <main className="home-main">
        <HeroSection settings={settings} />
        <div className="home-sectionDivider" aria-hidden="true" />
        <WeaponSection weapons={weapons} sectionConfig={settings?.weapons} />
        <div className="home-sectionDivider" aria-hidden="true" />
        <GameFeaturesSection features={features} />
        <div className="home-sectionDivider" aria-hidden="true" />
        <HighlightsSection features={features} sectionConfig={settings?.highlights} />
        <div className="home-sectionDivider" aria-hidden="true" />
        <GameGuideSection guideConfig={settings?.guide} />
        <div className="home-sectionDivider" aria-hidden="true" />
        <NewsSection news={news} sectionConfig={settings?.news} />
      </main>

      <Footer socialLinks={socialLinks} footer={footer} logoUrl={settings?.site?.logo} />
      <MobileBottomNav registrationUrl={settings?.site?.registrationUrl} />
    </div>
  );
}


