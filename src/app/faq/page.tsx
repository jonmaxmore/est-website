'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';

/* ═══════════════════════════════════════════════════
   FAQ PAGE — /faq
   CMS-ready FAQ accordion with shared Navigation/Footer
   ═══════════════════════════════════════════════════ */

interface FAQItem {
  q: { th: string; en: string };
  a: { th: string; en: string };
}

const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    q: { th: 'Eternal Tower Saga เป็นเกมแนวอะไร?', en: 'What genre is Eternal Tower Saga?' },
    a: {
      th: 'เกมมือถือแนว Casual MMORPG ผสม Action RPG สำรวจหอคอยนิรันดร์ และร่วมผจญภัยกับผู้เล่นอื่นๆ ในโลกแฟนตาซี',
      en: 'A mobile Casual MMORPG & Action RPG. Explore the Eternal Tower and adventure with other players in a fantasy world.',
    },
  },
  {
    q: { th: 'เกมนี้รองรับมือถือสเปคไหนบ้าง?', en: 'What devices are supported?' },
    a: {
      th: 'รองรับ iOS 14+, Android 8.0+ และ PC (Windows 10+) สามารถเล่นข้ามแพลตฟอร์มได้ โดยใช้บัญชีเดียวกัน',
      en: 'Supports iOS 14+, Android 8.0+, and PC (Windows 10+). Cross-platform play is available using the same account.',
    },
  },
  {
    q: { th: 'มีระบบกิลด์หรือเล่นกับเพื่อนได้ไหม?', en: 'Is there a guild system?' },
    a: {
      th: 'มีครับ! รองรับกิลด์เต็มรูปแบบ ทั้ง Guild War, Guild Raid, ระบบ Chat และ Party ร่วมผจญภัยกับเพื่อนได้สูงสุด 4 คน',
      en: 'Yes! Full guild system with Guild War, Guild Raid, Chat, and Party features. Adventure with up to 4 friends.',
    },
  },
  {
    q: { th: 'ลงทะเบียนล่วงหน้าจะได้อะไร?', en: 'What do I get for pre-registering?' },
    a: {
      th: 'ได้รับรางวัลสะสมตาม Milestone เช่น Gold, Summoning Stones, Premium Tickets และไอเทมพิเศษ Exclusive Mount ที่หาไม่ได้จากทางอื่น ยิ่งลงทะเบียนเร็ว ยิ่งได้รับรางวัลมากขึ้น!',
      en: 'Milestone rewards including Gold, Summoning Stones, Premium Tickets, and an Exclusive Mount unavailable elsewhere. The earlier you register, the more rewards you receive!',
    },
  },
  {
    q: { th: 'เกมนี้ผลิตโดยบริษัทอะไร?', en: 'Who developed this game?' },
    a: {
      th: 'พัฒนาโดย บริษัท อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.) สตูดิโอเกมจากประเทศไทยที่มุ่งมั่นสร้างเกมคุณภาพระดับสากล',
      en: 'Developed by Ultimate Game Co., Ltd., a Thai game studio committed to creating world-class quality games.',
    },
  },
];

export default function FAQPage() {
  const { t } = useLang();
  const [faqItems, setFaqItems] = useState<FAQItem[]>(DEFAULT_FAQ_ITEMS);
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
        if (data?.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data?.site?.footer) setFooter(data.site.footer);
        // If CMS has FAQ items, use them
        if (data?.faqItems?.length) setFaqItems(data.faqItems);
      })
      .catch(() => {});
  }, []);

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
                <span className="section-badge">FAQ</span>
                <h1 className="page-hero-title">{t('คำถามที่พบบ่อย', 'Frequently Asked Questions')}</h1>
                <p className="page-hero-subtitle">
                  {t('รวมคำตอบสำหรับทุกข้อสงสัยเกี่ยวกับ Eternal Tower Saga', 'Everything you need to know about Eternal Tower Saga')}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="section-highlights">
          <div className="container-custom" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '4rem' }}>
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
                >
                  <details className="faq-detail-card">
                    <summary className="faq-summary">
                      <span style={{ flex: 1 }}>{t(item.q.th, item.q.en)}</span>
                      <svg
                        width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="faq-chevron"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="faq-answer">
                      {t(item.a.th, item.a.en)}
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />

      {/* Global styles for details/summary behavior */}
      <style jsx global>{`
        .faq-detail-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .faq-detail-card[open] {
          border-color: rgba(212, 168, 67, 0.25);
          box-shadow: 0 8px 32px rgba(212, 168, 67, 0.08);
        }
        .faq-summary {
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--white);
          font-family: var(--font-heading);
          user-select: none;
          transition: color 0.3s ease;
        }
        .faq-summary::-webkit-details-marker { display: none; }
        .faq-summary::marker { display: none; content: ''; }
        .faq-answer {
          padding: 0 1.5rem 1.25rem 1.5rem;
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.7;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1.25rem;
        }
        .faq-chevron {
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        details[open] .faq-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
