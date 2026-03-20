'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';

/* ═══════════════════════════════════════════════
   CHARACTER PAGE — ตัวละคร (Dedicated Page)
   Immersive full-viewport showcase (same as homepage)
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

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function CharacterPage() {
  const { t } = useLang();
  const [characters, setCharacters] = useState<CMSCharacter[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    fetch('/api/public/characters')
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

  const hasCmsData = characters.length > 0;
  const itemCount = hasCmsData ? characters.length : WEAPON_INFO.length;
  const activeChar = characters[activeIdx];
  const activeWeapon = WEAPON_INFO[activeIdx] || WEAPON_INFO[0];

  const getCharName = (i: number) =>
    hasCmsData ? characters[i]?.name || '' : t(WEAPON_INFO[i]?.nameTh || '', WEAPON_INFO[i]?.nameEn || '');

  /* Navigation helpers */
  const goTo = useCallback((idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  }, [activeIdx]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIdx((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIdx((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setDirection(-1);
        setActiveIdx(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setDirection(1);
        setActiveIdx(itemCount - 1);
      }
    },
    [itemCount, goNext, goPrev],
  );

  /* Animation variants */
  const bgVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const portraitVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  const infoVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        <section className="char-showcase" aria-label={t('ตัวละคร', 'Characters')}>
          {/* ── Layer 1: Background ── */}
          <div className="char-bg-layer">
            <AnimatePresence mode="wait">
              <motion.div
                key={`bg-${activeIdx}`}
                variants={bgVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.6 }}
                className="char-motion-absolute"
              >
                {activeChar?.backgroundImage ? (
                  <Image
                    src={activeChar.backgroundImage}
                    alt=""
                    fill
                    className="char-bg-img"
                    priority
                  />
                ) : (
                  <div
                    className="char-bg-img char-bg-fallback"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            <div className="char-gradient-top" />
            <div className="char-gradient-bottom" />
          </div>

          {/* ── Layer 2: Portrait ── */}
          <div className="char-portrait-layer">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`portrait-${activeIdx}`}
                custom={direction}
                variants={portraitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                {activeChar?.portrait ? (
                  <Image
                    src={activeChar.portrait}
                    alt={activeChar.name || ''}
                    fill
                    className="char-portrait-img"
                    priority
                  />
                ) : (
                  <div
                    className="char-portrait-placeholder"
                    aria-hidden="true"
                  >
                    {getCharName(activeIdx).charAt(0)}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Layer 3: Info Overlay ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${activeIdx}`}
              className="char-info-overlay"
              variants={infoVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="section-header">
                <span className="section-badge">CHARACTERS</span>
                <h1 className="section-title-gold">{t('ตัวละคร', 'Characters')}</h1>
                <div className="title-ornament" aria-hidden="true"><span /><span /><span /></div>
              </div>

              <h2 className="char-name">
                {activeChar?.name || t(activeWeapon.nameTh, activeWeapon.nameEn)}
              </h2>
              <p className="char-desc">
                {t(activeWeapon.descTh, activeWeapon.descEn)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ── Layer 4: Navigation Arrows ── */}
          <button
            className="char-nav-arrow prev"
            onClick={goPrev}
            aria-label={t('ตัวละครก่อนหน้า', 'Previous character')}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="char-nav-arrow next"
            onClick={goNext}
            aria-label={t('ตัวละครถัดไป', 'Next character')}
          >
            <ChevronRight size={24} />
          </button>

          {/* ── Layer 5: Icon Selector ── */}
          <div
            className="char-icon-selector"
            role="tablist"
            aria-label={t('เลือกตัวละคร', 'Select character')}
            onKeyDown={handleKeyDown}
          >
            {Array.from({ length: itemCount }).map((_, i) => (
              <motion.button
                key={i}
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={getCharName(i)}
                tabIndex={i === activeIdx ? 0 : -1}
                className={`char-icon-btn ${i === activeIdx ? 'active' : ''}`}
                onClick={() => goTo(i)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {characters[i]?.icon ? (
                  <Image
                    src={characters[i].icon!}
                    alt=""
                    width={80}
                    height={80}
                    className="char-icon-img"
                  />
                ) : (
                  <span className="char-icon-placeholder" aria-hidden="true">
                    {(hasCmsData ? characters[i]?.name || '?' : WEAPON_INFO[i]?.nameEn || '?').charAt(0)}
                  </span>
                )}
              </motion.button>
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
