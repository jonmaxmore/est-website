'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

/* ──────────────────────────────────────────────
   Image-Only Character Showcase
   No text from CMS — everything is images:
   1. Portrait (60% left)
   2. Weapon info image (right)
   3. Background (full section)
   4. Selector icons (bottom-right)
   ────────────────────────────────────────────── */

interface CharacterData {
  id: number;
  portrait: string;
  infoImage: string;
  backgroundImage: string;
  icon: string;
  name: string; // admin-only, for alt text
}

// Mockup data — will be replaced by CMS when images are uploaded
const MOCKUP_CHARACTERS: CharacterData[] = [
  {
    id: 1,
    name: 'Arthur',
    portrait: '/images/characters/arthur.png',
    infoImage: '/images/characters/weapon-info-sword.png',
    backgroundImage: '/images/hero-bg.png',
    icon: '/images/characters/arthur.png',
  },
  {
    id: 2,
    name: 'Elena',
    portrait: '/images/characters/elena.png',
    infoImage: '/images/characters/weapon-info-bow.png',
    backgroundImage: '/images/hero-bg.png',
    icon: '/images/characters/elena.png',
  },
  {
    id: 3,
    name: 'Kaelen',
    portrait: '/images/characters/kaelen.png',
    infoImage: '/images/characters/weapon-info-wand.png',
    backgroundImage: '/images/hero-bg.png',
    icon: '/images/characters/kaelen.png',
  },
  {
    id: 4,
    name: 'Lyra',
    portrait: '/images/characters/lyra.png',
    infoImage: '/images/characters/weapon-info-axe.png',
    backgroundImage: '/images/hero-bg.png',
    icon: '/images/characters/lyra.png',
  },
];

interface CMSCharacter {
  id: number;
  portrait?: string | null;
  infoImage?: string | null;
  backgroundImage?: string | null;
  icon?: string | null;
  name?: string;
}

export default function CharacterShowcase({ characters }: { characters?: CMSCharacter[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use CMS data if available, otherwise mockup
  const charList: CharacterData[] = (characters && characters.length > 0)
    ? characters.map((c, i) => ({
        id: c.id || i,
        name: c.name || `Character ${i + 1}`,
        portrait: c.portrait || MOCKUP_CHARACTERS[i % MOCKUP_CHARACTERS.length].portrait,
        infoImage: c.infoImage || MOCKUP_CHARACTERS[i % MOCKUP_CHARACTERS.length].infoImage,
        backgroundImage: c.backgroundImage || MOCKUP_CHARACTERS[i % MOCKUP_CHARACTERS.length].backgroundImage,
        icon: c.icon || c.portrait || MOCKUP_CHARACTERS[i % MOCKUP_CHARACTERS.length].icon,
      }))
    : MOCKUP_CHARACTERS;

  const nextChar = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % charList.length);
  }, [charList.length]);

  useEffect(() => {
    if (hovered || charList.length <= 1) return;
    timerRef.current = setInterval(nextChar, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hovered, nextChar, charList.length]);

  const active = charList[activeIdx];

  return (
    <section
      className="char-showcase"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ─── Layer 1: Full Background ─── */}
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
          />
        </motion.div>
      </AnimatePresence>

      {/* White gradient top */}
      <div className="char-gradient-top" />
      {/* Dark gradient bottom */}
      <div className="char-gradient-bottom" />

      {/* ─── Layer 2: Character Portrait (60% left) ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`portrait-${active.id}`}
          className="char-portrait-layer"
          initial={{ opacity: 0, x: -60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={active.portrait}
            alt={active.name}
            width={800}
            height={900}
            className="char-portrait-img"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* ─── Layer 3: Weapon Info Image (right side) ─── */}
      <div className="char-info-layer">
        {/* Video/Play button card */}
        <div className="char-play-card">
          <button className="char-play-circle" aria-label="Play character video">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Weapon info image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${active.id}`}
            className="char-weapon-info-img-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Image
              src={active.infoImage}
              alt={`${active.name} weapon info`}
              width={500}
              height={250}
              className="char-weapon-info-img"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Layer 4: Character Selector Icons ─── */}
      <div className="char-icon-selector">
        {charList.map((char, i) => (
          <motion.button
            key={char.id}
            className={`char-icon-btn ${i === activeIdx ? 'active' : ''}`}
            onClick={() => setActiveIdx(i)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Select ${char.name}`}
          >
            <Image
              src={char.icon}
              alt={char.name}
              width={60}
              height={60}
              className="char-icon-img"
            />
          </motion.button>
        ))}
      </div>

      {/* Terms & Policy link */}
      <div className="char-terms">
        <span className="char-terms-icon">📋</span>
        <span>Terms &amp; Policy</span>
      </div>
    </section>
  );
}
