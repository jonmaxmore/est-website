'use client';

import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/lang-context';
import { Swords, Map, Castle, Sparkles, Shield, Users } from 'lucide-react';

/* ─── Shared UI Components ─── */
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';
import LoadingScreen from '@/components/ui/LoadingScreen';

/* ─── Section Components ─── */
import HeroSection from '@/components/sections/HeroSection';
import CharacterShowcase from '@/components/sections/CharacterShowcase';
import NewsSection from '@/components/sections/NewsSection';

/* ─── Layout Components ─── */
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

/* ═══════════════════════════════════════════════
   CMS Types
   ═══════════════════════════════════════════════ */
interface CMSSettings {
  site: {
    name: string;
    description: string;
    logo: string | null;
    socialLinks: Record<string, string | null>;
    footer: { copyrightText: string; termsUrl: string; privacyUrl: string; supportUrl: string };
  };
  hero: {
    taglineEn: string;
    taglineTh: string;
    taglineImageEn?: { url: string } | null;
    taglineImageTh?: { url: string } | null;
    ctaTextEn: string;
    ctaTextTh: string;
    ctaLink: string;
    backgroundImage: { url: string } | null;
    backgroundVideo?: { url: string } | null;
    mercenarySection: {
      titleEn: string;
      titleTh: string;
      subtitleEn: string;
      subtitleTh: string;
      artImage: string | null;
    };
    features: Array<{ icon: string; titleEn: string; titleTh: string; descriptionEn: string; descriptionTh: string }>;
  };
  event: { enabled: boolean; titleEn: string; titleTh: string };
  characters: {
    bgImage: { url: string } | null;
    badgeEn: string; badgeTh: string;
    titleEn: string; titleTh: string;
    voiceButtonEn: string; voiceButtonTh: string;
  };
  highlights: {
    badgeEn: string; badgeTh: string;
    titleEn: string; titleTh: string;
    bgImage: { url: string } | null;
  };
  news: {
    badgeEn: string; badgeTh: string;
    titleEn: string; titleTh: string;
  };
  storeButtons: Array<{ platform: string; label: string; sublabel: string; url: string }>;
}

interface CMSCharacter {
  id: number;
  nameEn: string;
  nameTh: string;
  classEn: string;
  classTh: string;
  weaponClass: string;
  descriptionEn: string;
  descriptionTh: string;
  accentColor: string;
  portrait: string | null;
}

interface CMSNews {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  publishDate: string;
  featuredImage: string | null;
}

/* ─── Feature highlight icons (Lucide) ─── */
const HIGHLIGHT_ICONS: Record<string, React.ReactNode> = {
  mercenary: <Swords size={28} />,
  explore: <Map size={28} />,
  tower: <Castle size={28} />,
  upgrade: <Sparkles size={28} />,
  pvp: <Shield size={28} />,
  guilds: <Users size={28} />,
};

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE — Compact & Professional
   5 sections: Hero → Characters → Highlights → News → Footer
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  const { t } = useLang();

  const [settings, setSettings] = useState<CMSSettings | null>(null);
  const [characters, setCharacters] = useState<CMSCharacter[]>([]);
  const [news, setNews] = useState<CMSNews[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, charsRes, newsRes] = await Promise.all([
          fetch('/api/settings').then((r) => r.json()).catch(() => null),
          fetch('/api/characters').then((r) => r.json()).catch(() => ({ characters: [] })),
          fetch('/api/news?limit=3').then((r) => r.json()).catch(() => ({ articles: [] })),
        ]);
        if (settingsRes) setSettings(settingsRes);
        if (charsRes?.characters) setCharacters(charsRes.characters.map((c: Record<string, unknown>) => ({
          ...c,
          portrait: typeof c.portrait === 'object' && c.portrait ? (c.portrait as { url: string }).url : (c.portrait as string | null),
        })));
        if (newsRes?.articles) setNews(newsRes.articles);
      } catch {
        // CMS fetch failed — fall back to defaults
      }
    }
    fetchData();
  }, []);

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
    icon: Object.values(HIGHLIGHT_ICONS)[i] || <Sparkles size={28} />,
    title: t(feat.titleTh, feat.titleEn || feat.titleTh),
    desc: t(feat.descriptionTh, feat.descriptionEn || feat.descriptionTh),
  })) || [
    { key: 0, icon: HIGHLIGHT_ICONS.mercenary, title: t('Mercenary Companion', 'Mercenary Companion'), desc: t('สหายร่วมรบผู้ทรงพลัง 4 คลาส', 'Fight alongside 4 powerful companion classes') },
    { key: 1, icon: HIGHLIGHT_ICONS.explore, title: t('สำรวจโลก Arcatea', 'Explore Arcatea'), desc: t('ดินแดนกว้างใหญ่ไพศาล', 'Vast open world to explore') },
    { key: 2, icon: HIGHLIGHT_ICONS.tower, title: t('หอคอยนิรันดร์', 'Eternal Tower'), desc: t('ท้าทายดันเจี้ยนสุดโหด', 'Conquer deadly dungeons') },
    { key: 3, icon: HIGHLIGHT_ICONS.pvp, title: t('PvP Arena', 'PvP Arena'), desc: t('ต่อสู้แบบเรียลไทม์', 'Real-time battle arena') },
    { key: 4, icon: HIGHLIGHT_ICONS.upgrade, title: t('อัพเกรดตัวละคร', 'Upgrade Characters'), desc: t('พัฒนาทักษะและอุปกรณ์', 'Enhance skills & equipment') },
    { key: 5, icon: HIGHLIGHT_ICONS.guilds, title: t('กิลด์ & ทีม', 'Guilds & Teams'), desc: t('ร่วมมือพิชิตบอส', 'Team up to defeat bosses') },
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

        {/* ═══ SECTION 2: CHARACTERS — Full-width cinematic ═══ */}
        <section id="characters" className="section-transition-top">
          <RevealSection>
            <CharacterShowcase characters={characters} sectionConfig={settings?.characters} />
          </RevealSection>
        </section>

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
                    <div className="highlight-icon">{item.icon}</div>
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
