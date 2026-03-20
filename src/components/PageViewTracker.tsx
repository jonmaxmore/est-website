'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/tracking';

// ─── Paths to exclude from tracking ───
const EXCLUDED = ['/admin', '/api/', '/_next/'];

/**
 * Automatically tracks page views on route change.
 * - Debounces rapid SPA navigations (300ms)
 * - Excludes admin and internal routes
 * - Sends to our internal DB via /api/track (NOT GA4/Adjust)
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip admin/internal routes
    if (EXCLUDED.some(p => pathname.startsWith(p))) return;

    // Debounce: wait 300ms to avoid double-firing on fast SPA navigation
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      trackPageView(pathname);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return null; // Invisible component
}
