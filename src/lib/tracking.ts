/* ═══════════════════════════════════════════════
   Tracking Utility — GA4 + Adjust + Internal DB
   Centralized event tracking for all CTA/Store buttons
   Data sources are separated:
   - Internal DB: /api/track (our own analytics)
   - GA4: gtag events (Google's analytics)
   - Adjust: SDK events (mobile attribution)
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

// ─── Session ID (persists per browser session) ───
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('_est_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_est_sid', sid);
  }
  return sid;
}

// ─── Internal DB Tracking (our own data) ───
function sendToInternalDB(data: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify({ ...data, sessionId: getSessionId() });
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/track', blob);
  } catch {
    // Never break the app for tracking
  }
}

/** Track a page view in our internal DB */
export function trackPageView(path?: string) {
  sendToInternalDB({
    type: 'pageview',
    path: path || window.location.pathname,
    referrer: document.referrer || '',
    language: navigator.language || '',
  });
}

/** Track an event in our internal DB */
function trackInternalEvent(eventName: string, eventData?: Record<string, unknown>) {
  sendToInternalDB({
    type: 'event',
    eventName,
    eventData: eventData || {},
    path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
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
  // Internal DB
  trackInternalEvent('store_click', { platform, url });

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
  // Internal DB
  trackInternalEvent('cta_click', { button_label: buttonLabel, action: 'scroll_to_form' });

  // GA4
  trackGA4Event('cta_click', {
    button_label: buttonLabel,
    page: 'event',
    action: 'scroll_to_form',
  });
}

// ─── Convenience: Referral Link Copy ───
export function trackReferralCopy(referralCode: string) {
  // Internal DB
  trackInternalEvent('referral_copy', { referral_code: referralCode });

  // GA4
  trackGA4Event('referral_link_copy', {
    referral_code: referralCode,
    page: 'event',
  });
}

