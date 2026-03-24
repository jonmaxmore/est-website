'use client';

import React, { useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  }),
};

const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

/**
 * Wraps children in a staggered animation container.
 * Each direct child animates in sequence with configurable stagger delay.
 * Uses AnimatePresence for mount/unmount animations.
 *
 * @example
 * <StaggerChildren staggerDelay={0.1}>
 *   <div>Card 1</div>
 *   <div>Card 2</div>
 *   <div>Card 3</div>
 * </StaggerChildren>
 */
export default function StaggerChildren({
  children,
  staggerDelay = 0.08,
  duration = 0.6,
  className = '',
  threshold = 0.1,
  once = true,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    margin: `0px 0px -${Math.round(threshold * 100)}% 0px` as `${number}px ${number}px ${number}px ${number}px`,
  });

  const childArray = React.Children.toArray(children);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      custom={staggerDelay}
      style={{ willChange: 'transform' }}
    >
      <AnimatePresence mode="sync">
        {childArray.map((child, index) => (
          <motion.div
            key={index}
            variants={childVariants}
            transition={{ duration }}
            style={{ willChange: 'transform, opacity' }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export { childVariants, containerVariants };
