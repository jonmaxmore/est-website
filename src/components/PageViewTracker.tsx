'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  trackPageView,
  trackScrollDepth,
  resetScrollMilestones,
  startPageTimer,
  trackTimeOnPage,
  startSessionHeartbeat,
  incrementPageCount,
  getUTMParams,
} from '@/lib/tracking';

// ─── Paths to exclude from tracking ───
const EXCLUDED = ['/admin', '/api/', '/_next/'];

/**
 * Automatically tracks:
 * - Page views on route change (debounced 300ms)
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Time on page (sent on navigation away)
 * Excludes admin and internal routes.
 * Data → /api/track (internal DB, NOT GA4/Adjust)
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatStarted = useRef(false);

  // ─── Scroll handler ───
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const percent = Math.round((scrollTop / docHeight) * 100);
    trackScrollDepth(percent);
  }, []);

  useEffect(() => {
    // Skip admin/internal routes
    if (EXCLUDED.some(p => pathname.startsWith(p))) return;

    // Capture UTM params on first load (sticky for session)
    getUTMParams();

    // Start session heartbeat once per page load
    if (!heartbeatStarted.current) {
      heartbeatStarted.current = true;
      startSessionHeartbeat();
    } else {
      incrementPageCount();
    }

    // Debounce: wait 300ms to avoid double-firing on fast SPA navigation
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      trackPageView(pathname);
      startPageTimer();
      resetScrollMilestones();
    }, 300);

    // Scroll depth listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Time on page: send on beforeunload
    const handleUnload = () => trackTimeOnPage();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleUnload);
      // Also fire time-on-page when navigating within SPA
      trackTimeOnPage();
    };
  }, [pathname, handleScroll]);

  return null; // Invisible component
}
