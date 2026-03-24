'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ReactNode } from 'react';

/* ─── Animation Variant Definitions ─── */
const VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  stagger: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
} as const;

export type AnimationVariant = keyof typeof VARIANTS;

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header';
  once?: boolean;
}

/**
 * Reusable scroll-triggered animation wrapper.
 * Uses framer-motion useInView for viewport detection and motion.div for animation.
 *
 * @example
 * <AnimatedSection variant="fadeUp" delay={0.2}>
 *   <h2>Section Title</h2>
 * </AnimatedSection>
 */
export default function AnimatedSection({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.7,
  threshold = 0.15,
  className = '',
  as = 'div',
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin: `0px 0px -${Math.round(threshold * 100)}% 0px` as `${number}px ${number}px ${number}px ${number}px`,
  });

  const selectedVariant = VARIANTS[variant];

  const MotionTag = motion[as];

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={selectedVariant}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </MotionTag>
  );
}

export { VARIANTS };
