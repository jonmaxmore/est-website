'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';

/* ═══════════════════════════════════════════════
   CHARACTER PAGE — ตัวละคร (Dedicated Page)
   Shows weapon types with descriptions
   Content from reference site
   ═══════════════════════════════════════════════ */

interface CMSCharacter {
  id: number;
  name?: string;
  portrait?: string | null;
  infoImage?: string | null;
  backgroundImage?: string | null;
  icon?: string | null;
}

/* Weapon type descriptions from reference site */
const WEAPON_INFO = [
  {
    nameTh: 'ดาบ (Sword)',
    nameEn: 'Sword',
    descTh: 'เป็นอาวุธที่เชียวชาญในการโจมตีกายภาพ ซึ่งสามารถปฏิบัติหน้าที่ในการโจมตีระยะประชิดและการป้องกันได้อย่างสมดุล',
    descEn: 'A weapon specialized in physical attacks, capable of balanced melee offense and defense.',
  },
  {
    nameTh: 'ธนู (Bow)',
    nameEn: 'Bow',
    descTh: 'เป็นอาวุธที่สามารถสนับสนุนพันธมิตรจากระยะไกลด้วยวิธีการต่างๆ หรือก่อกวนศัตรูด้วยสถานะผิดปกติต่างๆ',
    descEn: 'A weapon that supports allies from range through various methods or disrupts enemies with status effects.',
  },
  {
    nameTh: 'ไม้เท้า (Staff)',
    nameEn: 'Staff',
    descTh: 'เป็นอาวุธที่เชียวชาญในการโจมตีเวทมนตร์ สามารถสร้างความเสียหายอย่างรุนแรงแก่ศัตรูในคราวเดียวหรือมอบดีบัฟที่สร้างความเสียหายอย่างต่อเนื่อง',
    descEn: 'A weapon specialized in magic attacks, dealing devastating burst damage or applying continuous damage debuffs.',
  },
  {
    nameTh: 'อ๊อบ (Orb)',
    nameEn: 'Orb',
    descTh: 'เป็นอาวุธที่เน้นการสนับสนุนพันธมิตรผ่านการฟื้นฟูและบัฟจากระยะไกล และยังสามารถสนับสนุนการต่อสู้ของพันธมิตรผ่านสถานะผิดปกติต่างๆ ได้อีกด้วย',
    descEn: 'A weapon focused on supporting allies through ranged healing and buffs, while also disrupting enemies with various status effects.',
  },
];

export default function CharacterPage() {
  const { t } = useLang();
  const [characters, setCharacters] = useState<CMSCharacter[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetch('/api/characters')
      .then(r => r.json())
      .then(data => {
        if (data?.characters) {
          setCharacters(data.characters.map((c: Record<string, unknown>) => {
            const extractUrl = (field: unknown): string | null => {
              if (typeof field === 'object' && field && 'url' in (field as Record<string, unknown>)) 
                return (field as { url: string }).url;
              if (typeof field === 'string') return field;
              return null;
            };
            return {
              id: c.id as number,
              name: c.name as string,
              portrait: extractUrl(c.portrait),
              infoImage: extractUrl(c.infoImage),
              backgroundImage: extractUrl(c.backgroundImage),
              icon: extractUrl(c.icon),
            };
          }));
        }
      })
      .catch(() => {});
  }, []);

  const activeChar = characters[activeIdx];
  const activeWeapon = WEAPON_INFO[activeIdx] || WEAPON_INFO[0];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        {/* Hero Banner */}
        <section className="page-hero page-hero-character">
          <div className="page-hero-bg">
            {activeChar?.backgroundImage && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`char-bg-${activeIdx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Image
                    src={activeChar.backgroundImage}
                    alt=""
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            )}
            <div className="page-hero-overlay" />
          </div>
          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">CHARACTERS</span>
                <h1 className="page-hero-title">{t('ตัวละคร', 'Characters')}</h1>
                <p className="page-hero-subtitle">
                  {t('เลือกอาวุธ เปลี่ยนเกม', 'Choose your weapon, shift the battlefield')}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* Character Showcase */}
        <section className="section-character-detail">
          <div className="container-custom">
            {/* Character Selector Icons */}
            <div className="character-page-selector">
              {(characters.length > 0 ? characters : WEAPON_INFO).map((item, i) => (
                <motion.button
                  key={i}
                  className={`char-page-icon-btn ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {characters[i]?.icon ? (
                    <Image
                      src={characters[i].icon!}
                      alt={characters[i].name || ''}
                      width={64}
                      height={64}
                      className="char-page-icon-img"
                    />
                  ) : (
                    <span className="char-page-icon-placeholder">
                      {('nameEn' in item ? (item as typeof WEAPON_INFO[0]).nameEn : (item as CMSCharacter).name || '?').charAt(0)}
                    </span>
                  )}
                  <span className="char-page-icon-label">
                    {characters[i]?.name || ('nameTh' in item ? t((item as typeof WEAPON_INFO[0]).nameTh, (item as typeof WEAPON_INFO[0]).nameEn) : '')}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Character Detail Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                className="character-detail-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="character-detail-portrait">
                  {activeChar?.portrait ? (
                    <Image
                      src={activeChar.portrait}
                      alt={activeChar.name || ''}
                      width={600}
                      height={800}
                      className="character-detail-portrait-img"
                    />
                  ) : (
                    <div className="character-detail-portrait-placeholder" />
                  )}
                </div>
                <div className="character-detail-info">
                  <h2 className="character-detail-name">
                    {activeChar?.name || t(activeWeapon.nameTh, activeWeapon.nameEn)}
                  </h2>
                  <p className="character-detail-desc">
                    {t(activeWeapon.descTh, activeWeapon.descEn)}
                  </p>
                  {activeChar?.infoImage && (
                    <div className="character-detail-weapon-img">
                      <Image
                        src={activeChar.infoImage}
                        alt="Weapon info"
                        width={400}
                        height={200}
                        className="character-detail-weapon-img-inner"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
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
