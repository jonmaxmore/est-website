'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import type { CMSCharacter, CMSCharacterSectionConfig } from '@/types/cms';

/* ═══════════════════════════════════════════════
   CHARACTER SECTION — Immersive Full-Viewport Showcase
   Layered absolute layout inspired by sena.netmarble.com/th
   ═══════════════════════════════════════════════ */

/* Static fallback data when CMS has no characters */
const FALLBACK_CHARACTERS: Array<{ name: string; descTh: string; descEn: string }> = [
  {
    name: 'Arthur — Iron Knight',
    descTh: 'เป็นอาวุธที่เชียวชาญในการโจมตีกายภาพ ซึ่งสามารถปฏิบัติหน้าที่ในการโจมตีระยะประชิดและการป้องกันได้อย่างสมดุล',
    descEn: 'A weapon specialized in physical attacks, capable of balanced melee offense and defense.',
  },
  {
    name: 'Elena — Forest Ranger',
    descTh: 'เป็นอาวุธที่สามารถสนับสนุนพันธมิตรจากระยะไกลด้วยวิธีการต่างๆ หรือก่อกวนศัตรูด้วยสถานะผิดปกติต่างๆ',
    descEn: 'A weapon that supports allies from range through various methods or disrupts enemies with status effects.',
  },
  {
    name: 'Kaelen — Shadow Mage',
    descTh: 'เป็นอาวุธที่เชียวชาญในการโจมตีเวทมนตร์ สามารถสร้างความเสียหายอย่างรุนแรงแก่ศัตรูในคราวเดียวหรือมอบดีบัฟที่สร้างความเสียหายอย่างต่อเนื่อง',
    descEn: 'A weapon specialized in magic attacks, dealing devastating burst damage or applying continuous damage debuffs.',
  },
  {
    name: 'Lyra — Holy Priestess',
    descTh: 'เป็นอาวุธที่เน้นการสนับสนุนพันธมิตรผ่านการฟื้นฟูและบัฟจากระยะไกล และยังสามารถสนับสนุนการต่อสู้ของพันธมิตรผ่านสถานะผิดปกติต่างๆ ได้อีกด้วย',
    descEn: 'A weapon focused on supporting allies through ranged healing and buffs, while also disrupting enemies with various status effects.',
  },
];

interface CharacterSectionProps {
  characters: CMSCharacter[];
  sectionConfig?: CMSCharacterSectionConfig;
}

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function CharacterSection({ characters, sectionConfig }: CharacterSectionProps) {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, 1 right

  const hasCmsData = characters.length > 0;
  const itemCount = hasCmsData ? characters.length : FALLBACK_CHARACTERS.length;
  const activeChar = hasCmsData ? characters[activeIdx] : null;
  const fallback = FALLBACK_CHARACTERS[activeIdx] || FALLBACK_CHARACTERS[0];

  const badgeText = sectionConfig
    ? t(sectionConfig.badgeTh || 'เลือกฮีโร่ของคุณ', sectionConfig.badgeEn || 'CHOOSE YOUR HERO')
    : t('เลือกฮีโร่ของคุณ', 'CHOOSE YOUR HERO');

  const titleText = sectionConfig
    ? t(sectionConfig.titleTh || 'ฮีโร่แห่ง Arcatea', sectionConfig.titleEn || 'Heroes of Arcatea')
    : t('ฮีโร่แห่ง Arcatea', 'Heroes of Arcatea');

  const getCharName = (i: number) =>
    hasCmsData ? characters[i]?.name || '' : FALLBACK_CHARACTERS[i]?.name || '';

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

  /* Keyboard navigation */
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
    <section id="characters" className="char-showcase" aria-label={titleText}>
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
            <span className="section-badge">{badgeText}</span>
            <h2 className="section-title-gold">{titleText}</h2>
            <div className="title-ornament" aria-hidden="true"><span /><span /><span /></div>
          </div>

          <h3 className="char-name">
            {activeChar?.name || fallback.name}
          </h3>
          {activeChar?.infoImage && (
            <div className="char-info-image">
              <Image src={activeChar.infoImage} alt="" width={200} height={48} className="char-weapon-label" />
            </div>
          )}
          <p className="char-desc">
            {activeChar
              ? t(activeChar.descriptionTh || fallback.descTh, activeChar.descriptionEn || fallback.descEn)
              : t(fallback.descTh, fallback.descEn)}
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
            aria-controls="char-info-panel"
            aria-label={getCharName(i)}
            tabIndex={i === activeIdx ? 0 : -1}
            className={`char-icon-btn ${i === activeIdx ? 'active' : ''}`}
            onClick={() => goTo(i)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            {hasCmsData && characters[i]?.icon ? (
              <Image
                src={characters[i].icon!}
                alt=""
                width={80}
                height={80}
                className="char-icon-img"
              />
            ) : (
              <span className="char-icon-placeholder" aria-hidden="true">
                {(hasCmsData ? characters[i]?.name || '?' : FALLBACK_CHARACTERS[i]?.name || '?').charAt(0)}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
