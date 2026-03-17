'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-context';

/* ─── Shared UI Components ─── */
import ScrollProgress from '@/components/ui/ScrollProgress';
import OrnamentDivider from '@/components/ui/OrnamentDivider';
import FloatingParticles from '@/components/ui/FloatingParticles';
import RevealSection from '@/components/ui/RevealSection';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CustomCursor from '@/components/ui/CustomCursor';

/* ─── Section Components ─── */
import HeroSection from '@/components/sections/HeroSection';
import CharacterShowcase from '@/components/sections/CharacterShowcase';
import FeatureCard from '@/components/sections/FeatureCard';
import NewsSection from '@/components/sections/NewsSection';
import FAQSection from '@/components/sections/FAQSection';
import CommunitySection from '@/components/sections/CommunitySection';

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
    ctaTextEn: string;
    ctaTextTh: string;
    ctaLink: string;
    backgroundImage: string | null;
    videoUrl: string | null;
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

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE
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
        if (charsRes?.characters) setCharacters(charsRes.characters);
        if (newsRes?.articles) setNews(newsRes.articles);
      } catch {
        // CMS fetch failed — fall back to defaults
      }
    }
    fetchData();
  }, []);

  /* Derived data */
  const socialLinks = settings?.site?.socialLinks || {};
  const features = settings?.hero?.features || [
    { icon: '⚔️', titleTh: 'ระบบ Mercenary Companion', titleEn: 'Mercenary Companion', descriptionTh: 'ต่อสู้เคียงข้างสหายร่วมรบผู้ทรงพลัง ไม่ใช่แค่สัตว์เลี้ยง', descriptionEn: 'Fight alongside powerful battle companions — not just pets' },
    { icon: '🗺️', titleTh: 'สำรวจโลกกว้าง', titleEn: 'Explore the World', descriptionTh: 'ผจญภัยในดินแดน Arcatea อันกว้างใหญ่ไพศาล', descriptionEn: 'Adventure in the vast land of Arcatéa' },
    { icon: '🏰', titleTh: 'พิชิตหอคอย', titleEn: 'Conquer the Tower', descriptionTh: 'ปีนหอคอยนิรันดร์ The Boundless Spire ท้าทายดันเจี้ยนสุดโหด', descriptionEn: 'Climb The Boundless Spire and conquer deadly dungeons' },
    { icon: '✨', titleTh: 'อัพเกรดตัวละคร', titleEn: 'Upgrade Characters', descriptionTh: 'พัฒนาทักษะ อุปกรณ์ และรูปลักษณ์ให้แข็งแกร่ง', descriptionEn: 'Develop skills, equipment, and appearance' },
    { icon: '🏟️', titleTh: 'PvP Arena', titleEn: 'PvP Arena', descriptionTh: 'ต่อสู้กับผู้เล่นคนอื่นในสนามประลองแบบเรียลไทม์', descriptionEn: 'Battle other players in real-time arena' },
    { icon: '🤝', titleTh: 'กิลด์ & เพื่อน', titleEn: 'Guilds & Friends', descriptionTh: 'สร้างกิลด์ ร่วมมือกับเพื่อนรบพิชิตบอสสุดโหด', descriptionEn: 'Create guilds and defeat bosses together' },
  ];
  const mercSection = settings?.hero?.mercenarySection || {
    titleTh: 'ระบบเมอร์เซนารี คอมพาเนียน',
    subtitleTh: 'สหายร่วมรบ — ไม่ใช่แค่สัตว์เลี้ยง',
    titleEn: 'Mercenary Companion System',
    subtitleEn: 'Battle Companions — Not Just Pets',
  };
  const footer = settings?.site?.footer || {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  };

  const mercCards = [
    { weapon: 'SWORD', icon: '⚔️', title: t('นักดาบ', 'Swordsman'), desc: t('โจมตีระยะประชิดด้วยพลังทำลายล้างสูง ปกป้องสหายในแนวหน้า', 'Devastating melee attacks. Protect allies on the frontline.'), color: '#FFD700' },
    { weapon: 'BOW', icon: '🏹', title: t('นักธนู', 'Archer'), desc: t('สนับสนุนสหายจากระยะไกล ด้วยลูกศรอันแม่นยำ', 'Support allies from afar with precise arrows.'), color: '#4CAF50' },
    { weapon: 'CRYSTAL ORB', icon: '🔮', title: t('จอมเวท', 'Mage'), desc: t('ปลดปล่อยเวทมนตร์ทรงพลัง ทำลายศัตรูเป็นวงกว้าง', 'Unleash powerful magic to destroy enemies in a wide area.'), color: '#2196F3' },
    { weapon: 'WAND', icon: '🪄', title: t('นักบวช', 'Priest'), desc: t('เยียวยาและเสริมพลังให้สหาย ด้วยเวทย์แห่งแสงสว่าง', 'Heal and empower allies with light magic.'), color: '#E1BEE7' },
  ];

  return (
    <div className="landing-page">
      <LoadingScreen />
      <CustomCursor />
      <ScrollProgress />

      {/* ═══ NAVIGATION ═══ */}
      <Navigation socialLinks={socialLinks} />

      <main>
        {/* ═══ HERO ═══ */}
        <HeroSection settings={settings} />

        <OrnamentDivider />

        {/* ═══ MERCENARY COMPANION SYSTEM ═══ */}
        <section id="story" className="section-mercenary">
          <div className="section-bg-overlay" />
          <FloatingParticles count={20} />

          <div className="container-custom">
            <RevealSection>
              <div className="section-header">
                <span className="section-badge">MERCENARY COMPANION</span>
                <h2 className="section-title-gold">{t(mercSection.titleTh, mercSection.titleEn || mercSection.titleTh)}</h2>
                <p className="section-subtitle">{t(mercSection.subtitleTh, mercSection.subtitleEn || mercSection.subtitleTh)}</p>
                <div className="title-ornament"><span /><span /><span /></div>
              </div>
            </RevealSection>

            <div className="merc-grid">
              <RevealSection delay={0.1} className="merc-art-wrapper">
                <div className="merc-art-frame">
                  <Image
                    src="/images/mercenary-companions.png"
                    alt="Mercenary Companions"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="merc-art-border" />
                </div>
              </RevealSection>

              <div className="merc-cards">
                {mercCards.map((card, i) => (
                  <RevealSection key={card.weapon} delay={0.15 + i * 0.1}>
                    <motion.div
                      className="merc-card"
                      whileHover={{ x: 8, boxShadow: `0 0 30px ${card.color}33` }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="merc-card-icon">{card.icon}</span>
                      <div>
                        <h3 className="merc-card-title" style={{ color: card.color }}>{card.weapon} — {card.title}</h3>
                        <p className="merc-card-desc">{card.desc}</p>
                      </div>
                    </motion.div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        <OrnamentDivider />

        {/* ═══ CHARACTERS ═══ */}
        <section id="characters">
          <RevealSection>
            <CharacterShowcase characters={characters} />
          </RevealSection>
        </section>

        <OrnamentDivider />

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="section-features">
          <div className="section-bg-overlay" />
          <FloatingParticles count={15} />

          <div className="container-custom">
            <RevealSection>
              <div className="section-header">
                <span className="section-badge">GAME FEATURES</span>
                <h2 className="section-title-gold">{t('ฟีเจอร์ของเกม', 'Game Features')}</h2>
                <div className="title-ornament"><span /><span /><span /></div>
              </div>
            </RevealSection>

            <div className="features-grid">
              {features.map((feat, i) => (
                <FeatureCard
                  key={i}
                  icon={feat.icon}
                  title={t(feat.titleTh, feat.titleEn || feat.titleTh)}
                  desc={t(feat.descriptionTh, feat.descriptionEn || feat.descriptionTh)}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </div>
        </section>

        <OrnamentDivider />

        {/* ═══ NEWS ═══ */}
        <NewsSection news={news} />

        <OrnamentDivider />

        {/* ═══ COMMUNITY ═══ */}
        <CommunitySection />

        <OrnamentDivider />

        {/* ═══ FAQ ═══ */}
        <FAQSection />
      </main>

      {/* ═══ FOOTER ═══ */}
      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
