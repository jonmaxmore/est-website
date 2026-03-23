'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
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
      taglineImageEn?: { url: string } | null;
      taglineImageTh?: { url: string } | null;
      ctaTextEn?: string;
      ctaTextTh?: string;
      ctaLink?: string;
      backgroundImage?: { url: string } | null;
      backgroundVideo?: { url: string } | null;
    };
    storeButtons?: Array<{ platform: string; label: string; sublabel: string; url: string }>;
  } | null;
}

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function HeroSection({ settings }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  // Mouse parallax (hover interaction)
  const bgX = useTransform(smoothX, [-0.5, 0.5], [15, -15]);
  const logoX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const logoYMouse = useTransform(smoothY, [-0.5, 0.5], [-5, 5]);

  // Scroll parallax — background moves slower, content moves faster
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgYScroll = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentYScroll = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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
  const taglineImageUrl = t(
    settings?.hero?.taglineImageTh?.url || '',
    settings?.hero?.taglineImageEn?.url || '',
  ) || null;
  const ctaText = t(
    settings?.hero?.ctaTextTh || 'ลงทะเบียนล่วงหน้าเลย',
    settings?.hero?.ctaTextEn || 'Pre-Register Now',
  );
  const ctaLink = settings?.hero?.ctaLink || '/event';

  const rawStoreButtons = settings?.storeButtons || [];
  // Deduplicate: keep first entry per platform
  const storeButtons = rawStoreButtons.filter((btn, _i, arr) =>
    arr.findIndex(b => b.platform === btn.platform) === arr.indexOf(btn)
  );

  const videoUrl = settings?.hero?.backgroundVideo?.url || null;
  const bgImageUrl = settings?.hero?.backgroundImage?.url || null;
  const isWebM = videoUrl?.endsWith('.webm');

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="hero-section"
      onMouseMove={handleMouseMove}
    >
      {/* Video Background Layer */}
      {videoUrl && (
        <div className="hero-video-layer" aria-hidden="true">
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
            <source src={videoUrl} type={isWebM ? 'video/webm' : 'video/mp4'} />
          </video>
          <div className="hero-video-overlay" />
        </div>
      )}

      {/* Parallax Background — CMS image with static fallback */}
      <motion.div
        className={`hero-bg-layer hero-bg-far ${videoUrl && videoLoaded ? 'hero-bg-hidden' : ''}`}
        style={{ x: bgX, y: bgYScroll, willChange: 'transform' }}
      >
        <Image src={bgImageUrl || '/images/hero-bg.webp'} alt="" fill className="object-cover" priority />
      </motion.div>

      <LightRays />
      <FloatingParticles count={15} />

      {/* Gradient overlays */}
      <div className="hero-gradient-top" />
      <div className="hero-gradient-bottom" />
      <div className="hero-vignette" />

      {/* Content — scroll parallax: moves faster than bg for depth */}
      <motion.div
        className="hero-content"
        style={{ y: contentYScroll, opacity: contentOpacity, willChange: 'transform, opacity' }}
      >
        <motion.div
          style={{ x: logoX, y: logoYMouse }}
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="hero-logo-container"
        >
          <h1 className="sr-only">Eternal Tower Saga</h1>
          <Image
            src="/images/logo.webp"
            alt="Eternal Tower Saga"
            width={450}
            height={320}
            className="hero-logo"
            priority
          />
        </motion.div>

        {/* Spacer — keeps character art visible in the middle */}
        <div style={{ flex: 1 }} />

        {/* Bottom action zone — glassmorphism panel */}
        <div className="hero-bottom-actions">
          {/* Tagline: image or text */}
          <motion.div
            className="hero-tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {taglineImageUrl ? (
              <Image
                src={taglineImageUrl}
                alt={tagline}
                width={700}
                height={100}
                className="hero-tagline-img"
                style={{ width: 'auto', height: 'auto', maxWidth: '90%', maxHeight: '80px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{tagline}</p>
            )}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="hero-actions-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link href={ctaLink} className="hero-cta hero-cta-primary">
              <span className="hero-cta-glow" />
              <span className="hero-cta-shimmer" />
              <span className="hero-cta-text">{ctaText}</span>
            </Link>
          </motion.div>

          {/* Store Badge Images */}
          <motion.div
            className="hero-store-badges"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {storeButtons
              .filter((btn) => btn.platform === 'ios' || btn.platform === 'android')
              .map((btn) => {
              const badgeSrc = btn.platform === 'android'
                ? '/images/badge-google-play.webp'
                : '/images/badge-app-store.webp';
              return (
                <a key={btn.platform} href={btn.url} className="hero-store-badge-link" title={`${btn.sublabel} ${btn.label}`}>
                  <Image
                    src={badgeSrc}
                    alt={`${btn.sublabel} ${btn.label}`}
                    width={188}
                    height={56}
                    className="hero-store-badge-img"
                  />
                </a>
              );
            })}
            {/* PC/Windows Coming Soon — text style */}
            {storeButtons
              .filter((btn) => btn.platform !== 'ios' && btn.platform !== 'android')
              .map((btn) => (
                <a
                  key={btn.platform}
                  href={btn.url}
                  className="store-btn store-btn-sm store-btn-hero"
                >
                  {STORE_ICONS[btn.platform] || null}
                  <div>
                    <small className="store-sublabel">{btn.sublabel}</small>
                    <strong className="store-label">{btn.label}</strong>
                  </div>
                </a>
              ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        aria-hidden="true"
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

