'use client';

import React from 'react';

/* ═══════════════════════════════════════════════════
   SKELETON UI — Loading placeholder components
   ═══════════════════════════════════════════════════ */

/** Generic skeleton block with pulse animation */
export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '8px',
  className = '',
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

/** Card skeleton for news/gallery items */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      <div className="skeleton-card-image skeleton-pulse" />
      <div className="skeleton-card-body">
        <Skeleton width="80%" height="1.2rem" />
        <Skeleton width="50%" height="0.9rem" />
      </div>
    </div>
  );
}

/** Character showcase skeleton */
export function SkeletonCharacter() {
  return (
    <div className="skeleton-character" aria-hidden="true">
      <div className="skeleton-character-portrait skeleton-pulse" />
      <div className="skeleton-character-icons">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="64px" height="64px" borderRadius="50%" />
        ))}
      </div>
    </div>
  );
}

/** News grid skeleton — 3 cards */
export function SkeletonNewsGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="news-articles-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Highlights/features skeleton — 6 items */
export function SkeletonHighlights({ count = 6 }: { count?: number }) {
  return (
    <div className="highlights-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="highlight-card" aria-hidden="true">
          <Skeleton width="48px" height="48px" borderRadius="12px" />
          <Skeleton width="70%" height="1rem" />
          <Skeleton width="90%" height="0.85rem" />
        </div>
      ))}
    </div>
  );
}
