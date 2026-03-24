'use client';

import React from 'react';
import type { CMSSettings, CMSWeapon, CMSNewsArticle } from '@/types/cms';

/* ─── Shared UI Components ─── */
import ScrollProgress from '@/components/ui/ScrollProgress';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ParallaxSection from '@/components/ui/ParallaxSection';
import AnimatedSection from '@/components/ui/AnimatedSection';

/* ─── Section Components ─── */
import HeroSection from '@/components/sections/HeroSection';
import WeaponSection from '@/components/sections/WeaponSection';
import HighlightsSection from '@/components/sections/HighlightsSection';
import NewsSection from '@/components/sections/NewsSection';

/* ─── Layout Components ─── */
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';


/* ═══════════════════════════════════════════════
   HOME CONTENT — Client Component
   Receives SSR-fetched data as props
   Handles: lang context, animations, interactivity
   ═══════════════════════════════════════════════ */
interface HomeContentProps {
  settings: CMSSettings | null;
  weapons: CMSWeapon[];
  news: CMSNewsArticle[];
}

export default function HomeContent({ settings, weapons, news }: HomeContentProps) {
  /* Derived data */
  const socialLinks = settings?.site?.socialLinks || {};
  const footer = settings?.site?.footer || {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  };

  const features = settings?.hero?.features || [];

  return (
    <div className="landing-page">
      <LoadingScreen />
      <ScrollProgress />

      {/* ═══ NAVIGATION — Always visible, with logo ═══ */}
      <Navigation />

      <main>
        {/* ═══ SECTION 1: HERO ═══ */}
        <HeroSection settings={settings} />

        {/* ─── Transition divider ─── */}
        <div className="section-divider" aria-hidden="true">
          <AnimatedSection variant="scaleUp" duration={1}>
            <div className="section-divider-glow" />
          </AnimatedSection>
        </div>

        {/* ═══ SECTION 2: WEAPONS — Image-only weapon showcase ═══ */}
        <WeaponSection weapons={weapons} />

        {/* ─── Transition divider ─── */}
        <div className="section-divider" aria-hidden="true">
          <AnimatedSection variant="scaleUp" duration={1}>
            <div className="section-divider-glow" />
          </AnimatedSection>
        </div>

        {/* ═══ SECTION 3: HIGHLIGHTS — Feature showcase with shadcn Cards ═══ */}
        <ParallaxSection
          backgroundUrl={settings?.highlights?.bgImage?.url}
          speed={0.2}
          overlay="dark"
          className="section-highlights"
        >
          <HighlightsSection
            features={features}
            sectionConfig={settings?.highlights}
          />
        </ParallaxSection>

        {/* ─── Transition divider ─── */}
        <div className="section-divider" aria-hidden="true">
          <AnimatedSection variant="scaleUp" duration={1}>
            <div className="section-divider-glow" />
          </AnimatedSection>
        </div>

        {/* ═══ SECTION 4: NEWS — Compact 3-card grid ═══ */}
        <ParallaxSection
          backgroundUrl={settings?.news?.bgImage?.url}
          speed={0.15}
          overlay="darker"
        >
          <AnimatedSection variant="fadeIn" delay={0.05}>
            <NewsSection news={news} sectionConfig={settings?.news} />
          </AnimatedSection>
        </ParallaxSection>
      </main>

      {/* ═══ FOOTER — Includes community links, FAQ link, newsletter ═══ */}
      <AnimatedSection variant="fadeUp" delay={0.1} threshold={0.05}>
        <Footer socialLinks={socialLinks} footer={footer} />
      </AnimatedSection>
    </div>
  );
}
