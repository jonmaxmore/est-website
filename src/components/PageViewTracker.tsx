'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/tracking';

/**
 * Automatically tracks page views on route change.
 * Sends to our internal DB via /api/track (NOT GA4/Adjust).
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on initial load and route changes
    trackPageView(pathname);
  }, [pathname]);

  return null; // Invisible component
}
