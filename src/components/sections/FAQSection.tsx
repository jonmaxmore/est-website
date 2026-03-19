'use client';

import React from 'react';
import { useLang } from '@/lib/lang-context';
import RevealSection from '@/components/ui/RevealSection';

export default function FAQSection() {
  const { t } = useLang();

  const faqItems = [
    {
      q: t('Eternal Tower Saga เป็นเกมแนวอะไร?', 'What genre is Eternal Tower Saga?'),
      a: t(
        'Eternal Tower Saga เป็นเกมมือถือแนว Casual MMORPG ผสม Action RPG ผจญภัยในโลก Arcatéa ปีนหอคอยนิรันดร์ The Boundless Spire ต่อสู้ PvP แบบเรียลไทม์',
        'Eternal Tower Saga is a mobile Casual MMORPG & Action RPG. Explore the world of Arcatéa, climb The Boundless Spire, and battle in real-time PvP.',
      ),
    },
    {
      q: t('เกมนี้รองรับมือถือสเปคไหนบ้าง?', 'What devices are supported?'),
      a: t(
        'รองรับ iOS 14+, Android 8.0+ และ PC (Windows 10+) ดาวน์โหลดฟรีจาก App Store, Google Play และเว็บไซต์ทางการ',
        'Supports iOS 14+, Android 8.0+, and PC (Windows 10+). Free to download from App Store, Google Play, and the official website.',
      ),
    },
    {
      q: t('มีระบบกิลด์หรือเล่นกับเพื่อนได้ไหม?', 'Is there a guild system or multiplayer?'),
      a: t(
        'มีครับ! รองรับกิลด์เต็มรูปแบบ ตั้งกิลด์ ชวนเพื่อนร่วมทีม พิชิตบอสดันเจี้ยน และแข่ง PvP Arena แบบเรียลไทม์',
        'Yes! Full guild system — create guilds, recruit friends, conquer dungeon bosses together, and compete in real-time PvP Arena.',
      ),
    },
    {
      q: t('ลงทะเบียนล่วงหน้าจะได้อะไร?', 'What do I get for pre-registering?'),
      a: t(
        'ได้รับรางวัลสะสมตาม Milestone เช่น ทอง ×200,000, หินอาวุธ ×100, ตั๋วอัญเชิญ ×10, บ้านแห่งโชค ×1 และอีกมากมาย เมื่อยอดลงทะเบียนถึงเป้า',
        'Milestone rewards including Gold ×200,000, Weapon Stones ×100, Summon Tickets ×10, Fortune House ×1, and more as registration targets are met.',
      ),
    },
    {
      q: t('เกมนี้ผลิตโดยบริษัทอะไร?', 'Who developed this game?'),
      a: t(
        'พัฒนาและจัดจำหน่ายโดย บริษัท อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.) สตูดิโอเกมจากประเทศไทย',
        'Developed and published by Ultimate Game Co., Ltd. (อัลติเมตเกม จำกัด), a game studio from Thailand.',
      ),
    },
  ];

  return (
    <section id="faq" className="section-faq">
      <div className="container-custom">
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title-gold">{t('คำถามที่พบบ่อย', 'Frequently Asked Questions')}</h2>
            <div className="title-ornament"><span /><span /><span /></div>
          </div>
        </RevealSection>

        <div className="faq-list">
          {faqItems.map((item, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <details className="faq-item">
                <summary className="faq-question">
                  <span>{item.q}</span>
                  <span className="faq-icon">▾</span>
                </summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
