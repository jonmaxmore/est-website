'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swords, Map, Castle, Shield, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';

/* ═══════════════════════════════════════════════
   GAME GUIDE PAGE — แนะนำเกม (API-First)
   All content fetched from CMS via /api/settings
   ═══════════════════════════════════════════════ */

/* Map icon name strings from CMS → Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  swords: Swords,
  map: Map,
  castle: Castle,
  shield: Shield,
  sparkles: Sparkles,
  users: Users,
};

interface GameGuideFeature {
  icon: string;
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
}

interface GameGuidePageConfig {
  heroImage: { url: string } | null;
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  subtitleEn: string;
  subtitleTh: string;
  features: GameGuideFeature[];
}

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function GameGuidePage() {
  const { t } = useLang();
  const [config, setConfig] = useState<GameGuidePageConfig | null>(null);
  const [loaded, setLoaded] = useState(false);
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
        if (data?.gameGuidePage) setConfig(data.gameGuidePage);
        if (data?.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data?.site?.footer) setFooter(data.site.footer);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const badge = config ? t(config.badgeTh, config.badgeEn) : t('แนะนำเกม', 'GAME GUIDE');
  const title = config ? t(config.titleTh, config.titleEn) : t('แนะนำเกม', 'Game Guide');
  const subtitle = config
    ? t(config.subtitleTh, config.subtitleEn)
    : t('สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga', 'Experience the new era of Eternal Tower Saga');
  const features = config?.features || [];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        {/* Hero Banner */}
        <section className="page-hero">
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

        {/* Game Features Grid */}
        <section className="section-highlights">
          <div className="container-custom">
            <RevealSection>
              <div className="section-header">
                <span className="section-badge">FEATURES</span>
                <h2 className="section-title-gold">{t('ระบบเกม', 'Game Systems')}</h2>
                <div className="title-ornament"><span /><span /><span /></div>
              </div>
            </RevealSection>

            <div className="highlights-grid">
              {features.map((feat, i) => {
                const IconComponent = ICON_MAP[feat.icon?.toLowerCase()] || Sparkles;
                return (
                  <RevealSection key={i} delay={i * 0.08}>
                    <div className="highlight-card highlight-card-lg">
                      <div className="highlight-icon">
                        <IconComponent size={28} />
                      </div>
                      <h3 className="highlight-title">{t(feat.titleTh, feat.titleEn)}</h3>
                      <p className="highlight-desc">{t(feat.descriptionTh, feat.descriptionEn)}</p>
                    </div>
                  </RevealSection>
                );
              })}
              {features.length === 0 && (
                <div className="highlights-empty-state">
                <p>{loaded
                  ? t('กำลังจะมาเร็ว ๆ นี้...', 'Coming soon...')
                  : t('กำลังโหลด...', 'Loading...')
                }</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
