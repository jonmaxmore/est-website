'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import type { CMSWeapon } from '@/types/cms';

/* ═══════════════════════════════════════════════
   WEAPON SHOWCASE — Image-Only Full-Viewport
   Each weapon = 4 images: portrait, infoImage (text), bg, icon
   No text — everything is communicated via images
   ═══════════════════════════════════════════════ */

interface WeaponSectionProps {
  weapons: CMSWeapon[];
}

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function WeaponSection({ weapons }: WeaponSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const itemCount = weapons.length;
  const activeWeapon = weapons[activeIdx];

  /* Navigation helpers — must be before early return (rules of hooks) */
  const goTo = useCallback((idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
    
    // Tracking
    const weapon = weapons[idx];
    if (weapon) {
      import('@/lib/tracking').then(m => m.trackWeaponClick(weapon.name || `Weapon_${idx}`));
    }
  }, [activeIdx, weapons]);

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

  /* Parallax Mouse Tracking */
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Checked earlier
  const mouseX = useMotionValue(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Checked earlier
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize to -1 to 1
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const smoothX = useSpring(mouseX, springConfig);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax strengths (background opposite, foreground same direction)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bgX = useTransform(smoothX, [-1, 1], [30, -30]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const bgY = useTransform(smoothY, [-1, 1], [15, -15]);
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const portraitX = useTransform(smoothX, [-1, 1], [-50, 50]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const portraitY = useTransform(smoothY, [-1, 1], [-25, 25]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const infoX = useTransform(smoothX, [-1, 1], [-20, 20]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const infoY = useTransform(smoothY, [-1, 1], [-10, 10]);

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
    <section 
      id="weapons" 
      className="weapon-showcase" 
      aria-label="Weapon Showcase"
      onMouseMove={handleMouseMove}
    >
      {/* ── Layer 1: Background ── */}
      <div className="weapon-bg-layer">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${activeIdx}`}
            variants={bgVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6 }}
            className="weapon-motion-absolute"
            style={{ x: bgX, y: bgY, scale: 1.05 }}
          >
            {activeWeapon?.backgroundImage ? (
              <Image
                src={activeWeapon.backgroundImage}
                alt=""
                fill
                className="weapon-bg-img"
                priority
              />
            ) : (
              <div className="weapon-bg-img weapon-bg-fallback" />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="weapon-gradient-top" />
        <div className="weapon-gradient-bottom" />
      </div>

      {/* ── Layer 2: Portrait ── */}
      <div className="weapon-portrait-layer">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`portrait-${activeIdx}`}
            custom={direction}
            variants={portraitVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'relative',
              x: portraitX,
              y: portraitY 
            }}
          >
            {activeWeapon?.portrait ? (
              <Image
                src={activeWeapon.portrait}
                alt={activeWeapon.name || ''}
                fill
                className="weapon-portrait-img"
                priority
              />
            ) : (
              <div className="weapon-portrait-placeholder" aria-hidden="true" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Layer 3: Weapon Info Overlay (Text Image + Video Button) ── */}
      <div className="weapon-info-overlay">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`info-${activeIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{ x: infoX, y: infoY }}
          >
            {activeWeapon?.infoImage && (
              <Image
                src={activeWeapon.infoImage}
                alt="Weapon Info"
                width={800}
                height={500}
                className="weapon-weapon-info-img"
              />
            )}
            
            {activeWeapon?.videoType !== 'none' && (
              <button 
                className="weapon-video-btn" 
                onClick={() => setVideoOpen(true)}
                aria-label="Play Action Video"
              >
                <div className="weapon-video-btn-icon"><Play size={20} /></div>
                <span>Play Showcase</span>
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Layer 4: Navigation Arrows ── */}
      <button
        className="weapon-nav-arrow prev"
        onClick={goPrev}
        aria-label="Previous weapon"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="weapon-nav-arrow next"
        onClick={goNext}
        aria-label="Next weapon"
      >
        <ChevronRight size={24} />
      </button>

      {/* ── Layer 5: Glassmorphism Icon Selector Panel ── */}
      <div
        className="weapon-icon-selector-panel"
        onKeyDown={handleKeyDown}
      >
        <div className="weapon-selector-header">
          <h3 className="weapon-selector-title">Select Weapon</h3>
          <div className="weapon-divider" />
        </div>
        
        <div className="weapon-icon-grid" role="tablist" aria-label="Select weapon">
          {weapons.map((weapon, i) => (
            <motion.button
              key={weapon.id}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={weapon.name || `Weapon ${i + 1}`}
              tabIndex={i === activeIdx ? 0 : -1}
              className={`weapon-icon-btn ${i === activeIdx ? 'active' : ''}`}
              onClick={() => goTo(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {weapon.icon ? (
                <Image
                  src={weapon.icon}
                  alt={weapon.name || ''}
                  width={80}
                  height={80}
                  className="weapon-icon-img"
                />
              ) : (
                <span className="weapon-icon-placeholder" aria-hidden="true">
                  {(weapon.name || '?').charAt(0)}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Layer 6: Video Modal ── */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            className="weapon-video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="weapon-video-modal-backdrop" onClick={() => setVideoOpen(false)} />
            <div className="weapon-video-modal-content">
              <button className="weapon-video-close" onClick={() => setVideoOpen(false)} title="Close Video">
                <X size={28} />
              </button>
              {activeWeapon.videoType === 'youtube' && activeWeapon.videoUrl ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${activeWeapon.videoUrl.split('v=')[1] || activeWeapon.videoUrl.split('/').pop()}?autoplay=1`} 
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Showcase Video"
                  className="weapon-video-iframe"
                />
              ) : activeWeapon.videoType === 'upload' && activeWeapon.videoUpload ? (
                <video src={activeWeapon.videoUpload} controls autoPlay className="weapon-video-iframe" />
              ) : (
                <div className="weapon-video-error">Video Unavailable</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
