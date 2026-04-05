'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface HeroSectionData {
  blockType?: 'hero';
  taglineEn?: string;
  taglineTh?: string;
  ctaTextEn?: string;
  ctaTextTh?: string;
  ctaLink?: string;
  backgroundImage?: { url?: string } | string | null;
  mobileCrop?: { url?: string } | string | null;
  backgroundVideo?: { url?: string } | string | null;
  characterOverlay?: { url?: string } | string | null;
  kvLogo?: { url?: string } | string | null;
  particlesEnabled?: boolean;
}

interface HeroSectionProps {
  data: HeroSectionData;
}

export default function HeroSection({ data }: HeroSectionProps) {
  const { lang: currentLang } = useLang();
  
  if (!data) return null;

  const tagline = currentLang === 'en' ? data.taglineEn : data.taglineTh;
  const ctaText = currentLang === 'en' ? data.ctaTextEn : data.ctaTextTh;
  
  const bgImageUrl = typeof data.backgroundImage === 'object' ? data.backgroundImage?.url : data.backgroundImage;
  const mobileCropUrl = typeof data.mobileCrop === 'object' ? data.mobileCrop?.url : data.mobileCrop;
  const videoUrl = typeof data.backgroundVideo === 'object' ? data.backgroundVideo?.url : null;
  const charOverlayUrl = typeof data.characterOverlay === 'object' ? data.characterOverlay?.url : data.characterOverlay;
  const logoUrl = typeof data.kvLogo === 'object' ? data.kvLogo?.url : data.kvLogo;
  const enableParticles = data.particlesEnabled !== false;

  return (
    <section className="k-hero-section">
      {/* Background Environment Layer */}
      <div className="k-hero-bg-container">
        <picture>
          {mobileCropUrl && <source media="(max-width: 768px)" srcSet={mobileCropUrl} />}
          <img 
            src={bgImageUrl || ''} 
            alt="Cinematic Background" 
            className="k-hero-bg-image"
          />
        </picture>
        
        {videoUrl && (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="k-hero-bg-video"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        
        {/* Seamless Fade Masks */}
        <div className="k-hero-mask-top" />
        <div className="k-hero-mask-bottom" />
      </div>

      {/* VFX Particles */}
      {enableParticles && (
        <div className="k-hero-vfx-particles" />
      )}

      {/* Cinematic Character Focus */}
      {charOverlayUrl && (
        <div className="k-hero-character-overlay">
          <Image 
            src={charOverlayUrl} 
            alt="Featured Hero Character" 
            fill 
            className="k-hero-character-image"
            priority
          />
        </div>
      )}

      {/* Direct Content Layer */}
      <div className="k-hero-content-layer">
        {logoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="k-hero-logo"
          >
            <Image src={logoUrl} alt="Game Title Logo" fill className="k-hero-logo-image" priority />
          </motion.div>
        )}

        {tagline && (
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: logoUrl ? 0.4 : 0 }}
            className="k-hero-tagline"
          >
            {tagline}
          </motion.h1>
        )}
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="k-hero-actions"
        >
          <a 
            href={data.ctaLink || '#'}
            className="k-hero-cta group"
          >
            <span className="k-hero-cta-text">{ctaText}</span>
            <div className="k-hero-cta-glow-sweep" />
            <div className="k-hero-cta-accent-line" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
