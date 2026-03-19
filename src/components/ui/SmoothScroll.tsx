'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/* ═══════════════════════════════════════════════
   Lenis Smooth Scroll Provider
   Replaces native scroll with buttery-smooth
   interpolated scrolling for premium feel.
   GPU-accelerated, mobile-safe.
   ═══════════════════════════════════════════════ */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,          // Scroll interpolation duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
      touchMultiplier: 2,     // Mobile touch sensitivity
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
