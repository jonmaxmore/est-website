'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import { hexToRgba } from '@/lib/color-utils';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { WEAPON_ICONS, CLASS_COLORS } from '@/components/ui/StoreIcons';

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

interface SectionConfig {
  bgImage: { url: string } | null;
  badgeEn: string; badgeTh: string;
  titleEn: string; titleTh: string;
  voiceButtonEn: string; voiceButtonTh: string;
}

/** Slugify a name for use in image paths */
function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function CharacterShowcase({ characters, sectionConfig }: { characters: CMSCharacter[]; sectionConfig?: SectionConfig }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { t } = useLang();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotation: cycle every 5 seconds, pause on hover
  const nextCharacter = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % characters.length);
  }, [characters.length]);

  useEffect(() => {
    if (hovered || characters.length <= 1) return;

    timerRef.current = setInterval(nextCharacter, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hovered, nextCharacter, characters.length]);

  if (!characters.length) return null;

  const active = characters[activeIdx];
  const color = active.accentColor || CLASS_COLORS[active.weaponClass] || '#FFD700';
  const accent = hexToRgba(color, 0.3);
  const portraitSlug = slugify(active.nameEn);

  return (
    <section
      className="section-characters"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={sectionConfig?.bgImage ? {
        backgroundImage: `linear-gradient(180deg, rgba(10,14,33,0.85) 0%, rgba(10,14,33,0.7) 50%, rgba(10,14,33,0.9) 100%), url(${sectionConfig.bgImage.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      <FloatingParticles count={8} />

      {/* Section Header */}
      {sectionConfig && (
        <div className="section-header" style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <span className="section-badge">{t(sectionConfig.badgeTh, sectionConfig.badgeEn)}</span>
          <h2 className="section-title-gold">{t(sectionConfig.titleTh, sectionConfig.titleEn)}</h2>
        </div>
      )}

      <div className="char-layout">
        {/* Left: Portrait */}
        <div className="char-portrait-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="char-portrait-wrapper"
              initial={{ opacity: 0, x: -60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="char-glow"
                style={{ background: `radial-gradient(ellipse at center, ${accent}, transparent 70%)` }}
              />
              <Image
                src={active.portrait || `/images/characters/${portraitSlug}.webp`}
                alt={active.nameEn}
                width={500}
                height={600}
                className="char-portrait-img"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Info */}
        <div className="char-info-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="char-info-content"
            >
              <div className="char-class-badge" style={{ borderColor: `${color}44` }}>
                <span className="char-class-badge-icon">{WEAPON_ICONS[active.weaponClass] || '⚔️'}</span>
                <span>{active.classEn}</span>
              </div>
              <h2 className="char-name-display" style={{ color }}>
                {active.nameEn}
              </h2>
              <h3 className="char-name-th">
                {active.nameTh} — {active.classTh}
              </h3>
              <div className="char-weapon-divider">
                <span className="divider-diamond" style={{ background: color }} />
                <span className="divider-line" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <span className="divider-diamond" style={{ background: color }} />
              </div>
              <p className="char-desc">{t(active.descriptionTh, active.descriptionEn) || active.descriptionEn}</p>

              {/* Voice line placeholder */}
              <div className="char-voice-line">
                <button className="char-voice-btn" style={{ borderColor: `${color}66` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                  <span style={{ color }}>{t(sectionConfig?.voiceButtonTh || 'ฟังเสียงตัวละคร', sectionConfig?.voiceButtonEn || 'Listen to Voice Line')}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Character selector */}
          <div className="char-selector">
            {characters.map((char, i) => {
              const c = char.accentColor || CLASS_COLORS[char.weaponClass] || '#FFD700';
              const thumbSlug = slugify(char.nameEn);
              return (
                <motion.button
                  key={char.id}
                  className={`char-selector-btn ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  style={i === activeIdx ? { borderColor: c, boxShadow: `0 0 25px ${c}44` } : {}}
                >
                  <Image
                    src={char.portrait || `/images/characters/${thumbSlug}.webp`}
                    alt={char.nameEn}
                    width={60}
                    height={60}
                    className="char-selector-icon"
                  />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
