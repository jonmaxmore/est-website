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
  backgroundImage?: string | null;
}

interface SectionConfig {
  bgImage: { url: string } | null;
  badgeEn: string; badgeTh: string;
  titleEn: string; titleTh: string;
  voiceButtonEn: string; voiceButtonTh: string;
}

export default function CharacterShowcase({ characters, sectionConfig }: { characters: CMSCharacter[]; sectionConfig?: SectionConfig }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { t } = useLang();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotation
  const nextCharacter = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % characters.length);
  }, [characters.length]);

  useEffect(() => {
    if (hovered || characters.length <= 1) return;
    timerRef.current = setInterval(nextCharacter, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hovered, nextCharacter, characters.length]);

  if (!characters.length) return null;

  const active = characters[activeIdx];
  const color = active.accentColor || CLASS_COLORS[active.weaponClass] || '#FFD700';
  const accent30 = hexToRgba(color, 0.3);
  const accent15 = hexToRgba(color, 0.15);

  // Determine background: per-character BG image → section BG → accent gradient
  const bgImageUrl = active.backgroundImage || sectionConfig?.bgImage?.url || null;

  return (
    <section
      className="char-showcase"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ─── Animated Background ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${active.id}`}
          className="char-showcase-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            background: bgImageUrl
              ? `linear-gradient(135deg, ${accent30} 0%, rgba(10,14,33,0.4) 50%, ${accent15} 100%)`
              : `linear-gradient(135deg, ${accent30} 0%, rgba(10,14,33,0.95) 50%, ${accent15} 100%)`,
          }}
        >
          {bgImageUrl && (
            <Image
              src={bgImageUrl}
              alt=""
              fill
              className="char-showcase-bg-img"
              priority
            />
          )}
        </motion.div>
      </AnimatePresence>

      <FloatingParticles count={6} />

      <div className="char-showcase-inner">
        {/* ─── LEFT: Full-bleed Portrait ─── */}
        <div className="char-portrait-zone">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="char-portrait-full"
              initial={{ opacity: 0, scale: 0.92, x: -40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: 40 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glow behind character */}
              <div
                className="char-portrait-glow"
                style={{ background: `radial-gradient(ellipse at 50% 60%, ${accent30}, transparent 70%)` }}
              />
              {active.portrait && (
                <Image
                  src={active.portrait}
                  alt={active.nameEn}
                  width={600}
                  height={720}
                  className="char-portrait-img-full"
                  priority
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Play button overlay */}
          <button className="char-play-btn" aria-label="Play character voice line" style={{ borderColor: `${color}66` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </button>
        </div>

        {/* ─── RIGHT: Info Panel ─── */}
        <div className="char-info-zone">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="char-info-inner"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Weapon label */}
              <div className="char-weapon-label">
                <span className="char-weapon-prefix">Weapon :</span>
                <h2 className="char-weapon-name" style={{ color }}>{active.weaponClass.replace(/_/g, ' ')}</h2>
              </div>

              {/* Character name */}
              <div className="char-name-block">
                <span className="char-class-tag">
                  {WEAPON_ICONS[active.weaponClass] || '⚔️'} {active.classEn}
                </span>
                <h3 className="char-hero-name" style={{ color }}>{active.nameEn}</h3>
                <p className="char-hero-name-th">{active.nameTh} — {active.classTh}</p>
              </div>

              {/* Divider */}
              <div className="char-divider">
                <span className="char-divider-diamond" style={{ background: color }} />
                <span className="char-divider-line" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <span className="char-divider-diamond" style={{ background: color }} />
              </div>

              {/* Description */}
              <p className="char-description">
                {t(active.descriptionTh, active.descriptionEn) || active.descriptionEn}
              </p>

              {/* Voice line */}
              <button className="char-voice-action" style={{ borderColor: `${color}44`, color }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
                  <polygon points="6,3 20,12 6,21" />
                </svg>
                {t(sectionConfig?.voiceButtonTh || 'ฟังเสียงตัวละคร', sectionConfig?.voiceButtonEn || 'Listen to Voice Line')}
              </button>
            </motion.div>
          </AnimatePresence>

          {/* ─── Character Selector Avatars ─── */}
          <div className="char-avatar-row">
            {characters.map((char, i) => {
              const c = char.accentColor || CLASS_COLORS[char.weaponClass] || '#FFD700';
              return (
                <motion.button
                  key={char.id}
                  className={`char-avatar-btn ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  style={i === activeIdx ? { borderColor: c, boxShadow: `0 0 20px ${c}55` } : {}}
                >
                  {char.portrait ? (
                    <Image
                      src={char.portrait}
                      alt={char.nameEn}
                      width={56}
                      height={56}
                      className="char-avatar-img"
                    />
                  ) : (
                    <span className="char-avatar-fallback">{WEAPON_ICONS[char.weaponClass] || '⚔️'}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
