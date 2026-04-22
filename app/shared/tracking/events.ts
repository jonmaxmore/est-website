export const TRACKING_EVENT_NAMES = [
  'page_view',
  'pre_register',
  'pre_register_success',
  'download_click',
  'video_play',
  'social_click',
  'news_click',
  'referral_copy',
] as const

export type TrackingEventName = typeof TRACKING_EVENT_NAMES[number]
export type TrackingEventData = Record<string, unknown>

interface AnalyticsEvent {
  name: string
  params: Record<string, unknown>
}

interface MetaPixelEvent extends AnalyticsEvent {
  method: 'track' | 'trackCustom'
}

const EVENT_SET = new Set<string>(TRACKING_EVENT_NAMES)

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function cleanParams(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export function isTrackingEventName(value: string): value is TrackingEventName {
  return EVENT_SET.has(value)
}

export function toStoredTrackingPayload(eventName: string, data: unknown) {
  if (!isTrackingEventName(eventName)) {
    throw new Error(`Unsupported tracking event: ${eventName}`)
  }

  if (!isRecord(data)) {
    throw new Error('Tracking event data must be an object')
  }

  return {
    eventName,
    eventData: JSON.parse(JSON.stringify(data)) as TrackingEventData,
  }
}

export function toGoogleAnalyticsEvent(eventName: TrackingEventName, data: TrackingEventData = {}): AnalyticsEvent {
  const path = typeof data.path === 'string' ? data.path : undefined
  const platform = typeof data.platform === 'string' ? data.platform : undefined
  const region = typeof data.region === 'string' ? data.region : undefined
  const slug = typeof data.slug === 'string' ? data.slug : undefined
  const label = typeof data.label === 'string' ? data.label : undefined

  if (eventName === 'page_view') {
    return { name: 'page_view', params: cleanParams({ page_path: path, page_title: data.title }) }
  }

  if (eventName === 'pre_register') {
    return {
      name: 'sign_up',
      params: cleanParams({ method: platform || 'web', region, page_path: path }),
    }
  }

  if (eventName === 'pre_register_success') {
    return {
      name: 'generate_lead',
      params: cleanParams({
        content_type: 'pre_registration',
        method: platform || 'web',
        region,
        page_path: path,
      }),
    }
  }

  if (eventName === 'download_click') {
    return {
      name: 'select_content',
      params: cleanParams({ content_type: 'download', item_id: platform || label, page_path: path }),
    }
  }

  if (eventName === 'social_click') {
    return {
      name: 'select_content',
      params: cleanParams({ content_type: 'social', item_id: platform || label, page_path: path }),
    }
  }

  if (eventName === 'news_click') {
    return {
      name: 'select_content',
      params: cleanParams({ content_type: 'news', item_id: slug || label, page_path: path }),
    }
  }

  if (eventName === 'video_play') {
    return {
      name: 'video_start',
      params: cleanParams({ video_title: label || slug, page_path: path }),
    }
  }

  return {
    name: 'share',
    params: cleanParams({ method: 'referral_code', page_path: path }),
  }
}

export function toMetaPixelEvent(eventName: TrackingEventName, data: TrackingEventData = {}): MetaPixelEvent {
  const platform = typeof data.platform === 'string' ? data.platform : undefined
  const region = typeof data.region === 'string' ? data.region : undefined
  const slug = typeof data.slug === 'string' ? data.slug : undefined
  const label = typeof data.label === 'string' ? data.label : undefined

  if (eventName === 'page_view') {
    return { method: 'track', name: 'PageView', params: {} }
  }

  if (eventName === 'pre_register') {
    return {
      method: 'track',
      name: 'Lead',
      params: cleanParams({ content_name: 'pre_registration', content_category: 'conversion', platform, region }),
    }
  }

  if (eventName === 'pre_register_success') {
    return {
      method: 'track',
      name: 'CompleteRegistration',
      params: cleanParams({ content_name: 'pre_registration', content_category: 'conversion', platform, region }),
    }
  }

  if (eventName === 'download_click') {
    return {
      method: 'track',
      name: 'ViewContent',
      params: cleanParams({ content_name: platform || label || 'download', content_category: 'download' }),
    }
  }

  if (eventName === 'news_click') {
    return {
      method: 'track',
      name: 'ViewContent',
      params: cleanParams({ content_name: slug || label || 'news', content_category: 'news' }),
    }
  }

  if (eventName === 'social_click') {
    return {
      method: 'trackCustom',
      name: 'SocialClick',
      params: cleanParams({ content_name: platform || label || 'social', content_category: 'social' }),
    }
  }

  if (eventName === 'video_play') {
    return {
      method: 'trackCustom',
      name: 'VideoPlay',
      params: cleanParams({ content_name: label || slug || 'video', content_category: 'media' }),
    }
  }

  return {
    method: 'trackCustom',
    name: 'ReferralCopy',
    params: { content_category: 'referral' },
  }
}
