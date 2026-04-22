import {
  type TrackingEventData,
  toGoogleAnalyticsEvent,
  toMetaPixelEvent,
} from '../shared/tracking/events'

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

export default defineNuxtPlugin(async (nuxtApp) => {
  const { data } = await useFetch<{
    tracking?: {
      enabled: boolean
      googleAnalyticsId?: string
      googleTagManagerId?: string
      metaPixelId?: string
      debug?: boolean
    }
  }>('/api/public/site', { pick: ['tracking'] })

  const tracking = data.value?.tracking
  if (!tracking?.enabled) return

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

  nuxtApp.hook('page:finish', () => {
    sendPageView(window.location.pathname + window.location.search, document.title)
  })
})
