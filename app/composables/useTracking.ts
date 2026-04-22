import {
  type TrackingEventData,
  type TrackingEventName,
  toGoogleAnalyticsEvent,
  toMetaPixelEvent,
} from '../shared/tracking/events'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    __etsTracking?: {
      enabled: boolean
      googleAnalyticsId?: string
      googleTagManagerId?: string
      metaPixelId?: string
      debug?: boolean
    }
  }
}

function sendBrowserTracking(eventName: TrackingEventName, data: TrackingEventData) {
  if (!import.meta.client) return

  const config = window.__etsTracking
  if (!config?.enabled) return

  if (typeof window.gtag === 'function' && (config.googleAnalyticsId || config.googleTagManagerId)) {
    const ga = toGoogleAnalyticsEvent(eventName, data)
    window.gtag('event', ga.name, ga.params)
  }

  if (typeof window.fbq === 'function' && config.metaPixelId) {
    const meta = toMetaPixelEvent(eventName, data)
    window.fbq(meta.method, meta.name, meta.params)
  }
}

export function useTracking() {
  const route = useRoute()

  async function trackEvent(eventName: TrackingEventName, data: TrackingEventData = {}) {
    const payload = {
      path: route.fullPath,
      ...data,
    }

    sendBrowserTracking(eventName, payload)

    try {
      await $fetch('/api/track', {
        method: 'POST',
        body: {
          eventName,
          eventData: payload,
        },
      })
    } catch {
      // Tracking should never block core user actions.
    }
  }

  return {
    trackEvent,
    trackDownload: (platform: string, label?: string) => trackEvent('download_click', { platform, label }),
    trackSocial: (platform: string, label?: string) => trackEvent('social_click', { platform, label }),
    trackNews: (slug: string, label?: string) => trackEvent('news_click', { slug, label }),
    trackPreRegister: (platform?: string, region?: string) => trackEvent('pre_register', { platform, region }),
    trackPreRegisterSuccess: (platform?: string, region?: string) => trackEvent('pre_register_success', { platform, region }),
    trackReferralCopy: () => trackEvent('referral_copy'),
  }
}
