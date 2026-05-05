import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  TRACKING_EVENT_NAMES,
  toGoogleAnalyticsEvent,
  toMetaPixelEvent,
  toStoredTrackingPayload,
} from '../../app/shared/tracking/events'

describe('tracking event mapping', () => {
  it('maps download and social clicks to structured engagement events', () => {
    assert.equal(toGoogleAnalyticsEvent('download_click', { platform: 'pc' }).name, 'select_content')
    assert.equal(toMetaPixelEvent('download_click', { platform: 'pc' }).name, 'ViewContent')
    assert.equal(toGoogleAnalyticsEvent('social_click', { platform: 'youtube' }).params.content_type, 'social')
    assert.equal(toMetaPixelEvent('social_click', { platform: 'youtube' }).method, 'trackCustom')
  })

  it('stores only known event names and serializable object data', () => {
    assert.ok(TRACKING_EVENT_NAMES.includes('download_click'))
    assert.deepEqual(toStoredTrackingPayload('news_click', { slug: 'launch', nested: { ok: true } }), {
      eventName: 'news_click',
      eventData: { slug: 'launch', nested: { ok: true } },
    })

    assert.throws(() => toStoredTrackingPayload('unknown_event', {}))
    assert.throws(() => toStoredTrackingPayload('download_click', null))
  })
})
