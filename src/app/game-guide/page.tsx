'use client';

import React from 'react';
import Image from 'next/image';
import { Swords, Map, Castle, Shield, Sparkles, Users } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';

/* ═══════════════════════════════════════════════
   GAME GUIDE PAGE — แนะนำเกม
   Showcases game features, systems, and mechanics
   ═══════════════════════════════════════════════ */

const GAME_FEATURES = [
  {
    icon: <Swords size={28} />,
    titleTh: 'ระบบ Mercenary Companion',
    titleEn: 'Mercenary Companion System',
    descTh: 'ต่อสู้เคียงข้างสหายร่วมรบผู้ทรงพลัง 4 คลาส — ไม่ใช่แค่สัตว์เลี้ยง แต่เป็นสหายที่มี AI ร่วมรบจริงๆ',
    descEn: 'Fight alongside 4 powerful companion classes — not just pets, but real AI battle companions',
  },
  {
    icon: <Map size={28} />,
    titleTh: 'สำรวจโลก Arcatéa',
    titleEn: 'Explore Arcatéa',
    descTh: 'ผจญภัยในดินแดน Arcatéa อันกว้างใหญ่ไพศาล สำรวจแท่นลอยฟ้าที่เชื่อมกันเป็นชั้นๆ',
    descEn: 'Explore the vast lands of Arcatéa — discover floating platforms connected in layers',
  },
  {
    icon: <Castle size={28} />,
    titleTh: 'หอคอยนิรันดร์',
    titleEn: 'The Boundless Spire',
    descTh: 'ปีนหอคอยนิรันดร์ The Boundless Spire — ท้าทายดันเจี้ยนสุดโหดในแต่ละชั้น',
    descEn: 'Climb The Boundless Spire — conquer deadly dungeons on each floor',
  },
  {
    icon: <Shield size={28} />,
    titleTh: 'PvP Arena',
    titleEn: 'PvP Arena',
    descTh: 'ต่อสู้กับผู้เล่นคนอื่นในสนามประลองแบบเรียลไทม์ พิสูจน์ความแกร่ง',
    descEn: 'Challenge other players in real-time arena battles — prove your strength',
  },
  {
    icon: <Sparkles size={28} />,
    titleTh: 'อัพเกรดตัวละคร',
    titleEn: 'Character Upgrades',
    descTh: 'พัฒนาทักษะ อุปกรณ์ และรูปลักษณ์ให้แข็งแกร่ง เปลี่ยนอาวุธเปลี่ยนเกม',
    descEn: 'Develop skills, gear, and appearances — switch weapons, shift the battlefield',
  },
  {
    icon: <Users size={28} />,
    titleTh: 'กิลด์ & เพื่อน',
    titleEn: 'Guilds & Friends',
    descTh: 'สร้างกิลด์ ร่วมมือกับเพื่อนเพื่อพิชิตบอสสุดโหดในดันเจี้ยนพิเศษ',
    descEn: 'Build guilds and team up with friends to conquer deadly bosses in special dungeons',
  },
];

export default function GameGuidePage() {
  const { t } = useLang();

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        {/* Hero Banner */}
        <section className="page-hero">
          <div className="page-hero-bg">
            <div className="page-hero-overlay" />
          </div>
          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">GAME GUIDE</span>
                <h1 className="page-hero-title">{t('แนะนำเกม', 'Game Guide')}</h1>
                <p className="page-hero-subtitle">
                  {t(
                    'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga — อาวุธเปลี่ยน เกมเปลี่ยน',
                    'Experience the new era of Eternal Tower Saga — Switch your weapon, shift the battlefield',
                  )}
                </p>
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
              {GAME_FEATURES.map((feat, i) => (
                <RevealSection key={i} delay={i * 0.08}>
                  <div className="highlight-card highlight-card-lg">
                    <div className="highlight-icon">{feat.icon}</div>
                    <h3 className="highlight-title">{t(feat.titleTh, feat.titleEn)}</h3>
                    <p className="highlight-desc">{t(feat.descTh, feat.descEn)}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer
        socialLinks={{}}
        footer={{
          copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
          termsUrl: '/terms',
          privacyUrl: '/privacy',
          supportUrl: '#',
        }}
      />
    </div>
  );
}
