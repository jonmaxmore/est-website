'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LOADING_PARTICLES = 20;
const LOADING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildParticleStyle(index: number) {
  return {
    left: `${seededRandom(index * 7 + 1) * 100}%`,
    top: `${seededRandom(index * 13 + 2) * 100}%`,
    animationDelay: `${seededRandom(index * 17 + 3) * 3}s`,
    animationDuration: `${seededRandom(index * 23 + 4) * 4 + 3}s`,
  };
}

function LoadingParticles() {
  return (
    <div className="loading-particles">
      {Array.from({ length: LOADING_PARTICLES }).map((_, index) => (
        <div
          key={index}
          className="loading-particle"
          style={buildParticleStyle(index)}
        />
      ))}
    </div>
  );
}

function LoadingProgress({ progress }: { progress: number }) {
  const normalizedProgress = Math.min(progress, 100);

  return (
    <div className="loading-progress">
      <div className="loading-progress-track">
        <motion.div
          className="loading-progress-fill"
          initial={{ width: '0%' }}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="loading-progress-text">{Math.round(normalizedProgress)}%</span>
    </div>
  );
}

function LoadingHint() {
  return (
    <motion.p
      className="loading-hint"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      Preparing your adventure...
    </motion.p>
  );
}

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

    const timer = setTimeout(() => setLoading(false), 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          className="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: LOADING_EASE }}
        >
          <LoadingParticles />

          <motion.div
            className="loading-logo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: LOADING_EASE }}
          >
            <div className="loading-logo-text">
              <span className="loading-title">ETERNAL TOWER</span>
              <span className="loading-subtitle">S A G A</span>
            </div>
          </motion.div>

          <LoadingProgress progress={progress} />
          <LoadingHint />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
