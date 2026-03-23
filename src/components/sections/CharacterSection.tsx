'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CMSCharacter } from '@/types/cms';

/* ═══════════════════════════════════════════════
   WEAPON SHOWCASE — Image-Only Full-Viewport
   Each weapon = 4 images: portrait, infoImage (text), bg, icon
   No text — everything is communicated via images
   ═══════════════════════════════════════════════ */

interface CharacterSectionProps {
  characters: CMSCharacter[];
}

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function CharacterSection({ characters }: CharacterSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  const itemCount = characters.length;
  const activeChar = characters[activeIdx];

  /* Navigation helpers — must be before early return (rules of hooks) */
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

  // Don't render section if no weapons uploaded
  if (itemCount === 0) return null;

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



  return (
    <section id="characters" className="char-showcase" aria-label="Weapon Showcase">
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
              <div className="char-bg-img char-bg-fallback" />
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
              <div className="char-portrait-placeholder" aria-hidden="true" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Layer 4: Navigation Arrows ── */}
      <button
        className="char-nav-arrow prev"
        onClick={goPrev}
        aria-label="Previous weapon"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="char-nav-arrow next"
        onClick={goNext}
        aria-label="Next weapon"
      >
        <ChevronRight size={24} />
      </button>

      {/* ── Layer 5: Glassmorphism Icon Selector Panel ── */}
      <div
        className="char-icon-selector-panel"
        onKeyDown={handleKeyDown}
      >
        <div className="char-selector-header">
          <span className="char-selector-badge">ARSENAL</span>
          <h3 className="char-selector-title">Select Weapon</h3>
          <div className="char-divider" />
        </div>
        
        <div className="char-icon-grid" role="tablist" aria-label="Select weapon">
          {characters.map((char, i) => (
            <motion.button
              key={char.id}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={char.name || `Weapon ${i + 1}`}
              tabIndex={i === activeIdx ? 0 : -1}
              className={`char-icon-btn ${i === activeIdx ? 'active' : ''}`}
              onClick={() => goTo(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {char.icon ? (
                <Image
                  src={char.icon}
                  alt={char.name || ''}
                  width={80}
                  height={80}
                  className="char-icon-img"
                />
              ) : (
                <span className="char-icon-placeholder" aria-hidden="true">
                  {(char.name || '?').charAt(0)}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
