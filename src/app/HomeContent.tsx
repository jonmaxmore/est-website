'use client';

import React from 'react';
import { useLang } from '@/lib/lang-context';
import {
  Swords, Map, Castle, Sparkles, Shield, Users,
  type LucideIcon,
} from 'lucide-react';
import type { CMSSettings, CMSCharacter, CMSNewsArticle } from '@/types/cms';

/* ─── Shared UI Components ─── */
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';
import LoadingScreen from '@/components/ui/LoadingScreen';

/* ─── Section Components ─── */
import HeroSection from '@/components/sections/HeroSection';
import CharacterSection from '@/components/sections/CharacterSection';
import NewsSection from '@/components/sections/NewsSection';

/* ─── Layout Components ─── */
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

/* ─── Lucide icon lookup — CMS stores icon name as text ─── */
const LUCIDE_ICONS: Record<string, LucideIcon> = {
  swords: Swords, map: Map, castle: Castle,
  sparkles: Sparkles, shield: Shield, users: Users,
};

/** Render a CMS icon field — supports Lucide icon names and emoji strings */
function FeatureIcon({ icon, index }: { icon: string; index: number }) {
  const name = icon.toLowerCase().trim();
  const LIcon = LUCIDE_ICONS[name];
  if (LIcon) return <LIcon size={28} />;
  // Fallback: if it looks like emoji or unknown text, render as-is
  if (icon) return <span className="highlight-emoji">{icon}</span>;
  // Last resort: default Lucide icon by position
  const defaults = [Swords, Map, Castle, Shield, Sparkles, Users];
  const Default = defaults[index % defaults.length];
  return <Default size={28} />;
}

/* ═══════════════════════════════════════════════
   HOME CONTENT — Client Component
   Receives SSR-fetched data as props
   Handles: lang context, animations, interactivity
   ═══════════════════════════════════════════════ */
interface HomeContentProps {
  settings: CMSSettings | null;
  characters: CMSCharacter[];
  news: CMSNewsArticle[];
}

export default function HomeContent({ settings, characters, news }: HomeContentProps) {
  const { t } = useLang();

  /* Derived data */
  const socialLinks = settings?.site?.socialLinks || {};
  const footer = settings?.site?.footer || {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  };

  /* Compact feature highlights — 6 items shown as horizontal strip */
  const highlights = settings?.hero?.features?.slice(0, 6).map((feat, i) => ({
    key: i,
    icon: feat.icon,
    title: t(feat.titleTh, feat.titleEn || feat.titleTh),
    desc: t(feat.descriptionTh, feat.descriptionEn || feat.descriptionTh),
  })) || [
    { key: 0, icon: 'swords', title: t('ระบบต่อสู้', 'Combat System'), desc: t('ลุยดันเจี้ยนสุดมัน 4 คลาส', 'Exciting 4-class dungeon combat') },
    { key: 1, icon: 'map', title: t('สำรวจโลก Arcatea', 'Explore Arcatea'), desc: t('ดินแดนกว้างใหญ่ไพศาล', 'Vast open world to explore') },
    { key: 2, icon: 'castle', title: t('หอคอยนิรันดร์', 'Eternal Tower'), desc: t('ท้าทายดันเจี้ยนสุดโหด', 'Conquer deadly dungeons') },
    { key: 3, icon: 'shield', title: t('PvP Arena', 'PvP Arena'), desc: t('ต่อสู้แบบเรียลไทม์', 'Real-time battle arena') },
    { key: 4, icon: 'sparkles', title: t('อัพเกรดตัวละคร', 'Upgrade Characters'), desc: t('พัฒนาทักษะและอุปกรณ์', 'Enhance skills & equipment') },
    { key: 5, icon: 'users', title: t('กิลด์ & ทีม', 'Guilds & Teams'), desc: t('ร่วมมือพิชิตบอส', 'Team up to defeat bosses') },
  ];

  return (
    <div className="landing-page">
      <LoadingScreen />
      <ScrollProgress />

      {/* ═══ NAVIGATION — Always visible, with logo ═══ */}
      <Navigation />

      <main>
        {/* ═══ SECTION 1: HERO ═══ */}
        <HeroSection settings={settings} />

        {/* ═══ SECTION 2: WEAPONS — Image-only weapon showcase ═══ */}
        <CharacterSection characters={characters} />

        {/* ═══ SECTION 3: HIGHLIGHTS STRIP — Compact feature showcase ═══ */}
        <section id="features" className="section-highlights">
          <div className="container-custom">
            <RevealSection>
              <div className="section-header">
                <span className="section-badge">{settings?.highlights ? t(settings.highlights.badgeTh, settings.highlights.badgeEn) : 'GAME FEATURES'}</span>
                <h2 className="section-title-gold">{settings?.highlights ? t(settings.highlights.titleTh, settings.highlights.titleEn) : t('ไฮไลท์เกม', 'Game Highlights')}</h2>
              </div>
            </RevealSection>

            <div className="highlights-grid">
              {highlights.map((item, i) => (
                <RevealSection key={item.key} delay={i * 0.06}>
                  <div className="highlight-card">
                    <div className="highlight-icon"><FeatureIcon icon={item.icon} index={item.key} /></div>
                    <h3 className="highlight-title">{item.title}</h3>
                    <p className="highlight-desc">{item.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4: NEWS — Compact 3-card grid ═══ */}
        <NewsSection news={news} sectionConfig={settings?.news} />
      </main>

      {/* ═══ FOOTER — Includes community links, FAQ link, newsletter ═══ */}
      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
