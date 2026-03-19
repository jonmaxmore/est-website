/* ═══════════════════════════════════════════════
   Analytics Utility — Meta Pixel & GA4
   Centralized tracking calls to avoid duplication
   ═══════════════════════════════════════════════ */

/**
 * Track a registration conversion event across all configured analytics platforms.
 */
export function trackRegistration(data: {
  platform: string;
  region: string;
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

  // GA4
  if ('gtag' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag('event', 'sign_up', {
      method: 'pre-registration',
      platform: data.platform,
      region: data.region,
    });
  }
}
