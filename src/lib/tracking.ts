/* ═══════════════════════════════════════════════
   Tracking Utility — GA4 + Adjust
   Centralized event tracking for all CTA/Store buttons
   ═══════════════════════════════════════════════ */

// Types for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    Adjust?: {
      trackEvent: (params: { eventToken: string; callbackParams?: Array<{ key: string; value: string }> }) => void;
      initSdk: (params: { appToken: string; environment: string }) => void;
    };
  }
}

// ─── GA4 Event Tracking ───
export function trackGA4Event(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  } catch {
    // Silently fail — tracking should never break the app
  }
}

// ─── Adjust Event Tracking ───
export function trackAdjustEvent(
  eventToken: string | undefined,
  callbackParams?: Array<{ key: string; value: string }>,
) {
  try {
    if (typeof window !== 'undefined' && window.Adjust && eventToken) {
      window.Adjust.trackEvent({ eventToken, callbackParams });
    }
  } catch {
    // Silently fail
  }
}

// ─── Convenience: Store Button Click ───
export function trackStoreClick(platform: string, url: string) {
  // GA4
  trackGA4Event('store_button_click', {
    platform,
    destination_url: url,
    page: 'event',
  });

  // Adjust
  const adjustToken = process.env.NEXT_PUBLIC_ADJUST_STORE_CLICK_TOKEN;
  trackAdjustEvent(adjustToken, [
    { key: 'platform', value: platform },
    { key: 'url', value: url },
  ]);
}

// ─── Convenience: CTA Button Click ───
export function trackCTAClick(buttonLabel: string) {
  trackGA4Event('cta_click', {
    button_label: buttonLabel,
    page: 'event',
    action: 'scroll_to_form',
  });
}

// ─── Convenience: Referral Link Copy ───
export function trackReferralCopy(referralCode: string) {
  trackGA4Event('referral_link_copy', {
    referral_code: referralCode,
    page: 'event',
  });
}
