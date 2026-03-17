'use client';

import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;
    };

    const animate = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.transform = `translate(${trailX - 20}px, ${trailY - 20}px)`;
      requestAnimationFrame(animate);
    };

    const handleMouseDown = () => {
      cursor.classList.add('cursor-click');
      setTimeout(() => cursor.classList.remove('cursor-click'), 150);
    };

    const handleHoverStart = () => cursor.classList.add('cursor-hover');
    const handleHoverEnd = () => cursor.classList.remove('cursor-hover');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    animate();

    // Add hover detection for interactive elements
    const interactives = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(() => {
      const newInteractives = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
      newInteractives.forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      observer.disconnect();
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      <div ref={trailRef} className="custom-cursor-trail" />
      <div ref={cursorRef} className="custom-cursor" />
    </>
  );
}
