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

// ─── Visitor ID (persists across sessions in localStorage) ───
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let vid = localStorage.getItem('_est_vid');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('_est_vid', vid);
  }
  return vid;
}

// ─── UTM Parameter Capture ───
export function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  // Persist UTM params in sessionStorage so they survive navigation
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem('_est_utm', JSON.stringify(utm));
  }
  return utm;
}

/** Get UTM params — from URL or from sessionStorage (sticky) */
function getStickyUTM(): Record<string, string> {
  const fresh = getUTMParams();
  if (Object.keys(fresh).length > 0) return fresh;
  try {
    const stored = sessionStorage.getItem('_est_utm');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// ─── Screen dimensions ───
function getScreenDimensions(): { screenWidth: number; screenHeight: number } {
  if (typeof window === 'undefined') return { screenWidth: 0, screenHeight: 0 };
  return { screenWidth: window.screen.width, screenHeight: window.screen.height };
}

// ─── Internal DB Tracking (our own data) ───
function sendToInternalDB(data: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    const utm = getStickyUTM();
    const screen = getScreenDimensions();
    const body = JSON.stringify({
      ...data,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      utmSource: utm.utm_source || '',
      utmMedium: utm.utm_medium || '',
      utmCampaign: utm.utm_campaign || '',
      utmTerm: utm.utm_term || '',
      utmContent: utm.utm_content || '',
      ...screen,
    });
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

  // Auto-detect funnel: event page visit
  const currentPath = path || window.location.pathname;
  if (currentPath === '/event') {
    trackFunnelStep('event_page');
  }
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
  trackInternalEvent('store_click', { platform, url });
  trackFunnelStep('store_click', { platform });
  trackGA4Event('store_button_click', { platform, destination_url: url, page: 'event' });
  const adjustToken = process.env.NEXT_PUBLIC_ADJUST_STORE_CLICK_TOKEN;
  trackAdjustEvent(adjustToken, [
    { key: 'platform', value: platform },
    { key: 'url', value: url },
  ]);
}

// ─── Convenience: Weapon/Character Click ───
export function trackWeaponClick(weaponName: string) {
  trackInternalEvent('weapon_click', { weaponName });
  trackFunnelStep('weapon_click', { weaponName });
  trackGA4Event('character_click', { character_name: weaponName, page: 'homepage' });
}

// ─── Convenience: CTA Button Click ───
export function trackCTAClick(buttonLabel: string) {
  trackInternalEvent('cta_click', { button_label: buttonLabel, action: 'scroll_to_form' });
  trackGA4Event('cta_click', { button_label: buttonLabel, page: 'event', action: 'scroll_to_form' });
}

// ─── Convenience: Referral Link Copy ───
export function trackReferralCopy(referralCode: string) {
  trackInternalEvent('referral_copy', { referral_code: referralCode });
  trackGA4Event('referral_link_copy', { referral_code: referralCode, page: 'event' });
}

// ─── Scroll Depth Tracking ───
const scrollMilestones = new Set<number>();

export function trackScrollDepth(depth: number) {
  const milestones = [25, 50, 75, 100];
  for (const m of milestones) {
    if (depth >= m && !scrollMilestones.has(m)) {
      scrollMilestones.add(m);
      trackInternalEvent('scroll_depth', {
        depth: m,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      });
      trackGA4Event('scroll', { percent_scrolled: m });

      // Funnel: 50%+ scroll = engagement
      if (m >= 50) {
        trackFunnelStep('engagement');
      }
    }
  }
}

export function resetScrollMilestones() {
  scrollMilestones.clear();
}

// ─── Navigation Click Tracking ───
export function trackNavClick(label: string, destination: string) {
  trackInternalEvent('nav_click', { label, destination });
  trackGA4Event('nav_click', { link_text: label, link_url: destination });
}

// ─── Time on Page ───
let pageEntryTime = 0;

export function startPageTimer() {
  pageEntryTime = Date.now();
}

export function trackTimeOnPage() {
  if (pageEntryTime <= 0) return;
  const seconds = Math.round((Date.now() - pageEntryTime) / 1000);
  if (seconds < 2 || seconds > 3600) return; // Ignore <2s or >1hr
  trackInternalEvent('time_on_page', {
    seconds,
    page: typeof window !== 'undefined' ? window.location.pathname : '',
  });
  pageEntryTime = 0;
}

// ─── Funnel Step Tracking ───
const recordedFunnelSteps = new Set<string>();

export function trackFunnelStep(step: string, metadata?: Record<string, unknown>) {
  // Deduplicate per session — each step fires once
  if (recordedFunnelSteps.has(step)) return;
  recordedFunnelSteps.add(step);

  sendToInternalDB({
    type: 'funnel',
    funnelStep: step,
    funnelMetadata: metadata || {},
    path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

// ─── Session Heartbeat — sends duration + scroll depth periodically ───
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let sessionPageCount = 0;

export function startSessionHeartbeat() {
  if (typeof window === 'undefined') return;
  if (heartbeatInterval) return; // Already running

  sessionPageCount++;
  const sessionStart = Date.now();

  heartbeatInterval = setInterval(() => {
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    const maxScroll = Math.max(...Array.from(scrollMilestones), 0);

    sendToInternalDB({
      type: 'session_update',
      duration,
      maxScrollDepth: maxScroll,
      exitPage: window.location.pathname,
      pageCount: sessionPageCount,
    });
  }, 30_000); // Every 30 seconds

  // Send final update on page unload
  window.addEventListener('beforeunload', () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    const maxScroll = Math.max(...Array.from(scrollMilestones), 0);

    sendToInternalDB({
      type: 'session_update',
      duration,
      maxScrollDepth: maxScroll,
      exitPage: window.location.pathname,
      pageCount: sessionPageCount,
    });
  });
}

export function incrementPageCount() {
  sessionPageCount++;
}
