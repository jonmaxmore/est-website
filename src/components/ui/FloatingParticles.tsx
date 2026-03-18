'use client';

import { useState } from 'react';

// Seeded pseudo-random to ensure deterministic particle positions (avoids hydration mismatch)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 7 + 1) * 100,
    y: seededRandom(i * 13 + 2) * 100,
    size: seededRandom(i * 17 + 3) * 4 + 1,
    duration: seededRandom(i * 23 + 4) * 15 + 10,
    delay: seededRandom(i * 29 + 5) * 5,
    opacity: seededRandom(i * 31 + 6) * 0.5 + 0.1,
  }));
}

export default function FloatingParticles({ count = 30 }: { count?: number }) {
  // useState initializer runs once — safe, pure, and deterministic
  const [particles] = useState(() => generateParticles(count));

  return (
    <div className="particle-field">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
