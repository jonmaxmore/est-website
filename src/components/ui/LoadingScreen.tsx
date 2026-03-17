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
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

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
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="loading-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 4 + 3}s`,
                }}
              />
            ))}
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
