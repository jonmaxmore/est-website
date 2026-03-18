'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 20 + 10;
      });
    }, 150);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Background particles */}
          <div className="loading-particles">
            {Array.from({ length: 20 }).map((_, i) => {
              // Deterministic seeded random for SSR/hydration safety
              const sr = (seed: number) => { const x = Math.sin(seed) * 10000; return x - Math.floor(x); };
              return (
                <div
                  key={i}
                  className="loading-particle"
                  style={{
                    left: `${sr(i * 7 + 1) * 100}%`,
                    top: `${sr(i * 13 + 2) * 100}%`,
                    animationDelay: `${sr(i * 17 + 3) * 3}s`,
                    animationDuration: `${sr(i * 23 + 4) * 4 + 3}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Logo */}
          <motion.div
            className="loading-logo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="loading-logo-text">
              <span className="loading-title">ETERNAL TOWER</span>
              <span className="loading-subtitle">S A G A</span>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="loading-progress">
            <div className="loading-progress-track">
              <motion.div
                className="loading-progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="loading-progress-text">
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>

          {/* Loading text */}
          <motion.p
            className="loading-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Preparing your adventure...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
