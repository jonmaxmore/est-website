'use client';

import React from 'react';
import { useLang } from '@/lib/lang-context';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';

/* ═══════════════════════════════════════════════
   STORY PAGE — เนื้อเรื่อง
   Lore and background story of Eternal Tower Saga
   Content from reference site
   ═══════════════════════════════════════════════ */

const STORY_SECTIONS = [
  {
    titleTh: 'หอคอยไร้ขอบเขต',
    titleEn: 'The Boundless Spire',
    contentTh: 'ณ ดินแดนลอยฟ้าแห่งอาร์คาเทีย (Arcatea) กลางเวหามีหอคอยลึกลับลอยเด่นอยู่เหนือเมฆา ผู้คนเรียกมันว่า "หอคอยไร้ขอบเขต" (The Boundless Spire) หอคอยที่ไม่มีผนัง ไม่มีหลังคา ไม่มีขอบเขตจำกัด มีเพียง "แท่นลอยฟ้า" ที่ต่อเนื่องกันเป็นชั้น ๆ ไต่ขึ้นไปบนท้องฟ้าเหมือนไม่มีที่สิ้นสุด',
    contentEn: 'In the floating realm of Arcatea, a mysterious tower hovers above the clouds. People call it "The Boundless Spire" — a tower with no walls, no roof, no limits. Only floating platforms stacked in layers, climbing endlessly into the sky.',
  },
  {
    titleTh: 'โลกเล็กๆ บนหอคอย',
    titleEn: 'Small Worlds on the Tower',
    contentTh: 'แต่ละชั้นของหอคอยคือ "โลกเล็ก ๆ" ที่ลอยแยกกันอยู่เหนือหุบเหวเวหา เชื่อมกันด้วยสะพานเวทมนตร์, ประตูมิติ, หรือทางเดินที่ปรากฏเพียงชั่วขณะเดียว ผู้คนเคยพยายามบินขึ้นไปแต่ทุกคนหายไปโดยไร้ร่องรอย...',
    contentEn: 'Each floor of the tower is a "small world" floating above the void, connected by magical bridges, dimensional gates, or pathways that appear for only a moment. People have tried to fly up, but everyone disappeared without a trace...',
  },
  {
    titleTh: 'การตื่นขึ้น',
    titleEn: 'The Awakening',
    contentTh: 'คุณคือนักโทษผู้ตื่นขึ้นมาบนแท่นหินลอยฟ้าชั้นล่างสุดโดยไม่รู้ว่าถูกจับมาเมื่อไหร่ หรือทำไม เสื้อผ้าขาดวิ่น มีเพียงกิ่งไม้แห้งที่คุณหยิบขึ้นมาจากพื้นดิน',
    contentEn: 'You are a prisoner who awakens on the lowest floating platform, not knowing when or why you were captured. Clothes torn, with only a dry branch picked up from the ground.',
  },
  {
    titleTh: 'เสียงเรียก',
    titleEn: 'The Calling',
    contentTh: '...และเสียงลึกลับที่กระซิบในใจว่า "ผู้ถูกเลือกแห่งเส้นทางท้องฟ้า จงไต่ขึ้น!! หากเจ้าต้องการอิสรภาพหรือ... ความจริง"',
    contentEn: '...and a mysterious voice whispers in your mind: "Chosen one of the sky path, climb up!! If you seek freedom... or the truth."',
  },
];

export default function StoryPage() {
  const { t } = useLang();

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        {/* Hero Banner */}
        <section className="page-hero page-hero-story">
          <div className="page-hero-bg">
            <div className="page-hero-overlay" />
          </div>
          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">LORE</span>
                <h1 className="page-hero-title">{t('เนื้อเรื่อง', 'Story')}</h1>
                <p className="page-hero-subtitle">
                  {t(
                    'เรื่องราวแห่งดินแดน Arcatéa และหอคอยไร้ขอบเขต',
                    'The tale of Arcatéa and The Boundless Spire',
                  )}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* Story Content */}
        <section className="section-story-content">
          <div className="container-custom">
            {STORY_SECTIONS.map((section, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <div className="story-block">
                  <h2 className="story-block-title">{t(section.titleTh, section.titleEn)}</h2>
                  <p className="story-block-text">{t(section.contentTh, section.contentEn)}</p>
                </div>
              </RevealSection>
            ))}
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
