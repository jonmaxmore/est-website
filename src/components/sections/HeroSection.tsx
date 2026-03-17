'use client';

import React, { useCallback, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import FloatingParticles from '@/components/ui/FloatingParticles';
import LightRays from '@/components/ui/LightRays';
import { STORE_ICONS } from '@/components/ui/StoreIcons';

interface HeroProps {
  settings: {
    hero?: {
      taglineEn?: string;
      taglineTh?: string;
      ctaTextEn?: string;
      ctaTextTh?: string;
      ctaLink?: string;
      backgroundImage?: string | null;
      videoUrl?: string | null;
    };
    storeButtons?: Array<{ platform: string; label: string; sublabel: string; url: string }>;
  } | null;
}

export default function HeroSection({ settings }: HeroProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  const bgX = useTransform(smoothX, [-0.5, 0.5], [15, -15]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const logoX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const logoY = useTransform(smoothY, [-0.5, 0.5], [-5, 5]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const { clientX, clientY, currentTarget } = e;
      const { width, height } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX / width - 0.5);
      mouseY.set(clientY / height - 0.5);
    },
    [mouseX, mouseY],
  );

  const { t } = useLang();
  const tagline = t(
    settings?.hero?.taglineTh || 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
    settings?.hero?.taglineEn || 'Rise Together, Conquer the Tower',
  );
  const ctaText = t(
    settings?.hero?.ctaTextTh || 'ลงทะเบียนล่วงหน้าเลย',
    settings?.hero?.ctaTextEn || 'Pre-Register Now',
  );
  const ctaLink = settings?.hero?.ctaLink || '/event';

  const storeButtons = settings?.storeButtons || [
    { platform: 'ios', label: 'App Store', sublabel: 'Pre-order on the', url: '#' },
    { platform: 'android', label: 'Google Play', sublabel: 'PRE-REGISTER ON', url: '#' },
    { platform: 'pc', label: 'Windows', sublabel: 'Coming soon', url: '#' },
  ];

  const videoUrl = settings?.hero?.videoUrl || null;

  return (
    <section className="hero-section" onMouseMove={handleMouseMove}>
      {/* Video Background Layer */}
      {videoUrl && (
        <div className="hero-video-layer">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            className={`hero-video ${videoLoaded ? 'loaded' : ''}`}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>
      )}

      {/* Parallax Background (fallback or additional layer) */}
      <motion.div
        className={`hero-bg-layer hero-bg-far ${videoUrl && videoLoaded ? 'hero-bg-hidden' : ''}`}
        style={{ x: bgX, y: bgY }}
      >
        <Image src="/images/hero-bg.png" alt="" fill className="object-cover" priority />
      </motion.div>

      <LightRays />
      <FloatingParticles count={50} />

      {/* Gradient overlays */}
      <div className="hero-gradient-top" />
      <div className="hero-gradient-bottom" />
      <div className="hero-vignette" />

      {/* Content */}
      <div className="hero-content">
        <motion.div
          style={{ x: logoX, y: logoY }}
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="hero-logo-container"
        >
          <Image
            src="/images/logo.png"
            alt="Eternal Tower Saga"
            width={450}
            height={320}
            className="hero-logo"
            priority
          />
        </motion.div>

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {tagline}
        </motion.p>

        <motion.p
          className="hero-tagline-en"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {settings?.hero?.taglineEn || 'Rise Together. Conquer the Tower.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link href={ctaLink} className="hero-cta">
            <span className="hero-cta-glow" />
            <span className="hero-cta-shimmer" />
            <span className="hero-cta-text">{ctaText}</span>
          </Link>
        </motion.div>

        {/* Trailer Play Button */}
        <motion.div
          className="hero-trailer-btn-wrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <TrailerButton />
        </motion.div>

        {/* Store Buttons */}
        <motion.div
          className="hero-stores"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {storeButtons.map((btn) => (
            <a key={btn.platform} href={btn.url} className="store-btn">
              {STORE_ICONS[btn.platform] || null}
              <div>
                <small>{btn.sublabel}</small>
                <strong>{btn.label}</strong>
              </div>
            </a>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </motion.div>
    </section>
  );
}

/* ─── Trailer Popup Button ─── */
function TrailerButton() {
  const [showTrailer, setShowTrailer] = useState(false);
  const { t } = useLang();

  return (
    <>
      <button
        className="trailer-play-btn"
        onClick={() => setShowTrailer(true)}
        aria-label="Watch Trailer"
      >
        <span className="trailer-play-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        </span>
        <span className="trailer-play-text">{t('ดูตัวอย่างเกม', 'Watch Trailer')}</span>
      </button>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <motion.div
            className="trailer-modal-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="trailer-modal-close" onClick={() => setShowTrailer(false)}>
              ✕
            </button>
            <div className="trailer-video-wrapper">
              {/* Placeholder - replace with actual YouTube embed or video */}
              <div className="trailer-placeholder">
                <div className="trailer-placeholder-inner">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                  <p>{t('วิดีโอตัวอย่างเกมจะแสดงที่นี่', 'Game trailer will be displayed here')}</p>
                  <p className="trailer-placeholder-hint">
                    {t(
                      'เพิ่ม YouTube Video ID ใน CMS เพื่อแสดงวิดีโอจริง',
                      'Add YouTube Video ID in CMS to display actual video',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
