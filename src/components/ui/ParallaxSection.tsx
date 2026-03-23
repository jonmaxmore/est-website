'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  backgroundUrl?: string | null;
  className?: string;
  /** Parallax speed: 0 = no movement, 0.3 = subtle, 0.5 = strong */
  speed?: number;
  /** Overlay gradient for readability */
  overlay?: 'dark' | 'darker' | 'none';
}

export default function ParallaxSection({
  children,
  backgroundUrl,
  className = '',
  speed = 0.3,
  overlay = 'dark',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  const overlayClass = overlay === 'darker'
    ? 'parallax-overlay-darker'
    : overlay === 'dark'
      ? 'parallax-overlay'
      : '';

  return (
    <section ref={ref} className={`parallax-section ${className}`}>
      {backgroundUrl && (
        <motion.div className="parallax-bg" style={{ y }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundUrl} alt="" aria-hidden="true" />
        </motion.div>
      )}
      {backgroundUrl && overlayClass && <div className={overlayClass} />}
      <div className="parallax-content">
        {children}
      </div>
    </section>
  );
}
