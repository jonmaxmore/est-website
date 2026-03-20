/* ═══════════════════════════════════════════════
   Analytics Utility — Meta Pixel, GA4 & Adjust
   Centralized tracking calls to avoid duplication
   ═══════════════════════════════════════════════ */

import { trackGA4Event, trackAdjustEvent } from '@/lib/tracking';

/**
 * Track a registration conversion event across all configured analytics platforms.
 */
export function trackRegistration(data: {
  platform: string;
  region: string;
  email?: string;
}) {
  if (typeof window === 'undefined') return;

  // Meta Pixel
  if ('fbq' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq('track', 'CompleteRegistration', {
      content_name: 'Pre-Registration',
      platform: data.platform,
      region: data.region,
    });
  }

  // GA4 — enhanced event
  trackGA4Event('pre_registration', {
    method: 'email',
    platform: data.platform,
    region: data.region,
  });

  // Adjust — registration conversion
  const adjustToken = process.env.NEXT_PUBLIC_ADJUST_REGISTER_TOKEN;
  trackAdjustEvent(adjustToken, [
    { key: 'platform', value: data.platform },
    { key: 'region', value: data.region },
  ]);
}
