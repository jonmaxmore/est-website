'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import RevealSection from '@/components/ui/RevealSection';
import type { CMSCharacter, CMSCharacterSectionConfig } from '@/types/cms';

/* ═══════════════════════════════════════════════
   CHARACTER SECTION — Homepage variant
   Based on /character page style (weapon selector + detail card)
   Shows CMS data when available, falls back to static WEAPON_INFO
   ═══════════════════════════════════════════════ */

/* Weapon type descriptions — same as /character page */
const WEAPON_INFO = [
  {
    nameTh: 'Arthur — Iron Knight',
    nameEn: 'Arthur — Iron Knight',
    descTh: 'เป็นอาวุธที่เชียวชาญในการโจมตีกายภาพ ซึ่งสามารถปฏิบัติหน้าที่ในการโจมตีระยะประชิดและการป้องกันได้อย่างสมดุล',
    descEn: 'A weapon specialized in physical attacks, capable of balanced melee offense and defense.',
  },
  {
    nameTh: 'Elena — Forest Ranger',
    nameEn: 'Elena — Forest Ranger',
    descTh: 'เป็นอาวุธที่สามารถสนับสนุนพันธมิตรจากระยะไกลด้วยวิธีการต่างๆ หรือก่อกวนศัตรูด้วยสถานะผิดปกติต่างๆ',
    descEn: 'A weapon that supports allies from range through various methods or disrupts enemies with status effects.',
  },
  {
    nameTh: 'Kaelen — Shadow Mage',
    nameEn: 'Kaelen — Shadow Mage',
    descTh: 'เป็นอาวุธที่เชียวชาญในการโจมตีเวทมนตร์ สามารถสร้างความเสียหายอย่างรุนแรงแก่ศัตรูในคราวเดียวหรือมอบดีบัฟที่สร้างความเสียหายอย่างต่อเนื่อง',
    descEn: 'A weapon specialized in magic attacks, dealing devastating burst damage or applying continuous damage debuffs.',
  },
  {
    nameTh: 'Lyra — Holy Priestess',
    nameEn: 'Lyra — Holy Priestess',
    descTh: 'เป็นอาวุธที่เน้นการสนับสนุนพันธมิตรผ่านการฟื้นฟูและบัฟจากระยะไกล และยังสามารถสนับสนุนการต่อสู้ของพันธมิตรผ่านสถานะผิดปกติต่างๆ ได้อีกด้วย',
    descEn: 'A weapon focused on supporting allies through ranged healing and buffs, while also disrupting enemies with various status effects.',
  },
];

interface CharacterSectionProps {
  characters: CMSCharacter[];
  sectionConfig?: CMSCharacterSectionConfig;
}

export default function CharacterSection({ characters, sectionConfig }: CharacterSectionProps) {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const hasCmsData = characters.length > 0;

  const itemCount = hasCmsData ? characters.length : WEAPON_INFO.length;
  const activeChar = hasCmsData ? characters[activeIdx] : null;
  const activeWeapon = WEAPON_INFO[activeIdx] || WEAPON_INFO[0];

  const badgeText = sectionConfig
    ? t(sectionConfig.badgeTh || 'เลือกฮีโร่ของคุณ', sectionConfig.badgeEn || 'CHOOSE YOUR HERO')
    : t('เลือกฮีโร่ของคุณ', 'CHOOSE YOUR HERO');

  const titleText = sectionConfig
    ? t(sectionConfig.titleTh || 'ฮีโร่แห่ง Arcatea', sectionConfig.titleEn || 'Heroes of Arcatea')
    : t('ฮีโร่แห่ง Arcatea', 'Heroes of Arcatea');

  const getCharName = (i: number) =>
    hasCmsData ? characters[i]?.name || '' : t(WEAPON_INFO[i]?.nameTh || '', WEAPON_INFO[i]?.nameEn || '');

  // Keyboard navigation for character selector
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1) % itemCount);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((prev) => (prev - 1 + itemCount) % itemCount);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIdx(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIdx(itemCount - 1);
      }
    },
    [itemCount],
  );

  return (
    <section id="characters" className="section-character-detail" aria-label={titleText}>
      <div className="container-custom">
        {/* Section Header */}
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">{badgeText}</span>
            <h2 className="section-title-gold">{titleText}</h2>
            <div className="title-ornament" aria-hidden="true"><span /><span /><span /></div>
          </div>
        </RevealSection>

        {/* Character Selector Icons — tablist pattern */}
        <RevealSection delay={0.1}>
          <div
            className="character-page-selector"
            role="tablist"
            aria-label={t('เลือกตัวละคร', 'Select character')}
            onKeyDown={handleKeyDown}
          >
            {Array.from({ length: itemCount }).map((_, i) => (
              <motion.button
                key={i}
                role="tab"
                aria-selected={i === activeIdx}
                aria-controls="character-detail-panel"
                aria-label={getCharName(i)}
                tabIndex={i === activeIdx ? 0 : -1}
                className={`char-page-icon-btn ${i === activeIdx ? 'active' : ''}`}
                onClick={() => setActiveIdx(i)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {hasCmsData && characters[i]?.icon ? (
                  <Image
                    src={characters[i].icon!}
                    alt=""
                    width={64}
                    height={64}
                    className="char-page-icon-img"
                  />
                ) : (
                  <span className="char-page-icon-placeholder" aria-hidden="true">
                    {(hasCmsData ? characters[i]?.name || '?' : WEAPON_INFO[i]?.nameEn || '?').charAt(0)}
                  </span>
                )}
                <span className="char-page-icon-label">
                  {getCharName(i)}
                </span>
              </motion.button>
            ))}
          </div>
        </RevealSection>

        {/* Character Detail Card — tabpanel */}
        <RevealSection delay={0.2}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              id="character-detail-panel"
              role="tabpanel"
              aria-label={activeChar?.name || t(activeWeapon.nameTh, activeWeapon.nameEn)}
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
                    alt={`${activeChar.name} portrait`}
                    width={600}
                    height={800}
                    className="character-detail-portrait-img"
                  />
                ) : (
                  <div className="character-detail-portrait-placeholder" aria-hidden="true" />
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
                      alt={t('ข้อมูลอาวุธ', 'Weapon info')}
                      width={400}
                      height={200}
                      className="character-detail-weapon-img-inner"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </RevealSection>
      </div>
    </section>
  );
}
