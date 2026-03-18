'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

/* ──────────────────────────────────────────────
   Character Showcase — Pure CMS, No Hardcode
   Layout: Portrait(60% full-height) | Movie Clip + Weapon Info | Icons
   All images come from CMS. No fallback mockups.
   ────────────────────────────────────────────── */

interface CharacterData {
  id: number;
  name?: string;
  portrait?: string | null;
  infoImage?: string | null;
  backgroundImage?: string | null;
  icon?: string | null;
}

export default function CharacterShowcase({ characters }: { characters?: CharacterData[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use only CMS data — no hardcoded fallback
  const charList = characters && characters.length > 0 ? characters : [];

  const nextChar = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % charList.length);
  }, [charList.length]);

  useEffect(() => {
    if (hovered || charList.length <= 1) return;
    timerRef.current = setInterval(nextChar, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hovered, nextChar, charList.length]);

  // If no CMS data, render nothing
  if (charList.length === 0) return null;

  const active = charList[activeIdx];

  return (
    <section
      className="char-showcase"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ─── Layer 1: Full Background ─── */}
      {active.backgroundImage && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${active.id}`}
            className="char-bg-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={active.backgroundImage}
              alt=""
              fill
              className="char-bg-img"
              priority
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Gradients */}
      <div className="char-gradient-top" />
      <div className="char-gradient-bottom" />

      {/* ─── Layer 2: Character Portrait (60% left, full height) ─── */}
      {active.portrait && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`portrait-${active.id}`}
            className="char-portrait-layer"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={active.portrait!}
              alt={active.name || ''}
              fill
              className="char-portrait-img"
              priority
              sizes="60vw"
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* ─── Layer 3: Right Panel (Movie Clip + Weapon Info) ─── */}
      <div className="char-right-panel">
        {/* Movie Clip Player */}
        <div className="char-movie-clip">
          <div className="char-movie-clip-inner">
            <button className="char-movie-play-btn" aria-label="Play character movie clip">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weapon Info Image */}
        {active.infoImage && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${active.id}`}
              className="char-weapon-info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Image
                src={active.infoImage}
                alt={`${active.name || ''} weapon info`}
                width={480}
                height={220}
                className="char-weapon-info-img"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ─── Layer 4: Character Selector Icons ─── */}
      <div className="char-icon-selector">
        {charList.map((char, i) => (
          <motion.button
            key={char.id}
            className={`char-icon-btn ${i === activeIdx ? 'active' : ''}`}
            onClick={() => setActiveIdx(i)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label={`Select ${char.name}`}
          >
            {(char.icon || char.portrait) && (
              <Image
                src={char.icon || char.portrait || ''}
                alt={char.name || ''}
                width={56}
                height={56}
                className="char-icon-img"
              />
            )}
            <div className="char-icon-ring" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
