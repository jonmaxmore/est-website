'use client';

import React, { useRef } from 'react';
import RevealSection from '@/components/ui/RevealSection';

export default function FeatureCard({
  icon,
  title,
  desc,
  delay = 0,
}: {
  icon: string;
  title: string;
  desc: string;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    cardRef.current.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
  };

  return (
    <RevealSection delay={delay}>
      <div ref={cardRef} className="feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className="feature-card-icon">{icon}</div>
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-desc">{desc}</p>
        <div className="feature-card-shine" />
      </div>
    </RevealSection>
  );
}
