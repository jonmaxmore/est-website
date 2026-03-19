'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';

/* ═══════════════════════════════════════════════
   STORY PAGE — เนื้อเรื่อง (API-First)
   All content fetched from CMS via /api/settings
   ═══════════════════════════════════════════════ */

interface StorySection {
  titleEn: string;
  titleTh: string;
  contentEn: string;
  contentTh: string;
}

interface StoryPageConfig {
  heroImage: { url: string } | null;
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  subtitleEn: string;
  subtitleTh: string;
  sections: StorySection[];
}

export default function StoryPage() {
  const { t } = useLang();
  const [config, setConfig] = useState<StoryPageConfig | null>(null);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [footer, setFooter] = useState({
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.storyPage) setConfig(data.storyPage);
        if (data?.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data?.site?.footer) setFooter(data.site.footer);
      })
      .catch(() => {});
  }, []);

  const badge = config ? t(config.badgeTh, config.badgeEn) : 'LORE';
  const title = config ? t(config.titleTh, config.titleEn) : t('เนื้อเรื่อง', 'Story');
  const subtitle = config
    ? t(config.subtitleTh, config.subtitleEn)
    : t('เรื่องราวแห่งดินแดน Arcatéa และหอคอยไร้ขอบเขต', 'The tale of Arcatéa and The Boundless Spire');
  const sections = config?.sections || [];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        {/* Hero Banner */}
        <section className="page-hero page-hero-story">
          <div className="page-hero-bg">
            {config?.heroImage?.url && (
              <Image
                src={config.heroImage.url}
                alt=""
                fill
                className="object-cover"
                priority
              />
            )}
            <div className="page-hero-overlay" />
          </div>
          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">{badge}</span>
                <h1 className="page-hero-title">{title}</h1>
                <p className="page-hero-subtitle">{subtitle}</p>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* Story Content */}
        <section className="section-story-content">
          <div className="container-custom">
            {sections.map((section, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <div className="story-block">
                  <h2 className="story-block-title">{t(section.titleTh, section.titleEn)}</h2>
                  <p className="story-block-text">{t(section.contentTh, section.contentEn)}</p>
                </div>
              </RevealSection>
            ))}
            {sections.length === 0 && (
              <div className="story-block story-empty-state">
                <p>{t('กำลังโหลดเนื้อเรื่อง...', 'Loading story...')}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
