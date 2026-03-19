'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

/* ──────────────────────────────────────────────
   Character Showcase — Smooth Parallax Layers
   Layout: BG (slow) → Portrait (medium) → UI (fast)
   Uses Framer Motion useScroll + useTransform
   Performance: will-change:transform on all layers
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  /* ─── Smooth Parallax — Framer Motion ─── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Background: deepest layer, moves slowest
  const bgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  // Portrait: mid layer, slight counter-movement
  const portraitY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);
  // UI panels: front layer, moves fastest → creates pop-up depth
  const uiY = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);

  // If no CMS data, render minimal container (ref must stay attached for useScroll)
  if (charList.length === 0) return <section ref={containerRef} className="char-showcase" style={{ display: 'none' }} />;

  const active = charList[activeIdx];

  return (
    <section
      ref={containerRef}
      className="char-showcase"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ─── Layer 1: Full Background (slowest parallax) ─── */}
      {active.backgroundImage && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${active.id}`}
            className="char-bg-layer"
            style={{ y: bgY, willChange: 'transform' }}
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

      {/* ─── Layer 2: Character Portrait (medium parallax) ─── */}
      {active.portrait && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`portrait-${active.id}`}
            className="char-portrait-layer"
            style={{ y: portraitY, willChange: 'transform' }}
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

      {/* ─── Layer 3: Weapon Info Panel (fastest parallax) ─── */}
      {active.infoImage && (
        <motion.div
          className="char-right-panel"
          style={{ y: uiY, willChange: 'transform' }}
        >
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
        </motion.div>
      )}

      {/* ─── Layer 4: Character Selector Icons (fastest parallax) ─── */}
      <motion.div
        className="char-icon-selector"
        style={{ y: uiY, willChange: 'transform' }}
      >
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
                width={112}
                height={112}
                className="char-icon-img"
              />
            )}
            <div className="char-icon-ring" />
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
