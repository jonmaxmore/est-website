/**
 * ═══ Tracking Plugin (client-only) ═══
 * Loads GA4 / GTM / Meta Pixel ONLY after the user has explicitly consented
 * via the cookie banner. Until consent is `'accepted'` we keep the queue but
 * do not inject any third-party scripts and do not fire page_view events
 * (PDPA / GDPR compliance — audit-2 finding C-2 / M-1).
 *
 * Flow:
 *  1. Plugin starts. Reads tracking config from /api/public/site.
 *  2. If admin disabled tracking globally → return immediately.
 *  3. If consent is missing or 'rejected' → wait. Pixels never load.
 *  4. On 'ets:consent' { status: 'accepted' } event (fired by useConsent.accept()),
 *     boot the pixels and start firing page_view on every route change.
 *  5. If consent is 'accepted' on first paint, boot pixels right away (returning
 *     visitor with cookie already set).
 */
import {
  type TrackingEventData,
  toGoogleAnalyticsEvent,
  toMetaPixelEvent,
} from '../shared/tracking/events'

type TrackingConfig = {
  enabled: boolean
  googleAnalyticsId?: string
  googleTagManagerId?: string
  metaPixelId?: string
  debug?: boolean
}

function injectScript(id: string, src: string) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

function sendPageView(path: string, title?: string) {
  const data: TrackingEventData = { path, title }
  const tracking = window.__etsTracking
  if (!tracking?.enabled) return

  if (typeof window.gtag === 'function' && (tracking.googleAnalyticsId || tracking.googleTagManagerId)) {
    const ga = toGoogleAnalyticsEvent('page_view', data)
    window.gtag('event', ga.name, ga.params)
  }

  if (typeof window.fbq === 'function' && tracking.metaPixelId) {
    const meta = toMetaPixelEvent('page_view', data)
    window.fbq(meta.method, meta.name, meta.params)
  }
}

function bootPixels(tracking: TrackingConfig) {
  window.__etsTracking = tracking

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  if (tracking.googleAnalyticsId) {
    injectScript('ets-google-tag', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tracking.googleAnalyticsId)}`)
    window.gtag('js', new Date())
    window.gtag('config', tracking.googleAnalyticsId, { send_page_view: false })
  }

  if (tracking.googleTagManagerId) {
    injectScript('ets-gtm', `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(tracking.googleTagManagerId)}`)
  }

  if (tracking.metaPixelId) {
    window.fbq = window.fbq || function fbq(...args: unknown[]) {
      ;(window.fbq as { queue?: unknown[] }).queue = (window.fbq as { queue?: unknown[] }).queue || []
      ;(window.fbq as { queue?: unknown[] }).queue?.push(args)
    }
    injectScript('ets-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', tracking.metaPixelId)
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const { data } = await useFetch<{ tracking?: TrackingConfig }>('/api/public/site', { pick: ['tracking'] })

  const tracking = data.value?.tracking
  if (!tracking?.enabled) return

  const consent = useConsent()
  let booted = false

  function maybeBoot() {
    if (booted || !consent.accepted.value) return
    bootPixels(tracking!)
    booted = true
    // Fire a synthetic page_view for the page the user accepted on so the
    // first event in GA/Meta isn't an SPA-route change.
    sendPageView(window.location.pathname + window.location.search, document.title)
  }

  // Boot on first paint if consent already accepted (returning visitor)
  maybeBoot()

  // Boot on Accept-click (forwarded by useConsent)
  if (import.meta.client) {
    window.addEventListener('ets:consent', (ev) => {
      const detail = (ev as CustomEvent<{ status: string }>).detail
      if (detail?.status === 'accepted') maybeBoot()
    })
  }

  nuxtApp.hook('page:finish', () => {
    if (!booted) return
    sendPageView(window.location.pathname + window.location.search, document.title)
  })
})
