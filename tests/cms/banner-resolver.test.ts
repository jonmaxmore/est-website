import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { resolveMarketingBanners } from '../../server/utils/banner-resolver'

describe('resolveMarketingBanners', () => {
  it('picks the highest-priority matching banner per placement', () => {
    const now = new Date('2026-04-23T12:00:00.000Z')
    const resolved = resolveMarketingBanners({
      now,
      routeType: 'news_index',
      banners: [
        {
          id: 'low',
          placement: 'announcement_bar',
          status: 'LIVE',
          scope: 'global',
          priority: 10,
          isActive: true,
          updatedAt: new Date('2026-04-23T09:00:00.000Z'),
          startsAt: null,
          endsAt: null,
          config: {},
        },
        {
          id: 'high',
          placement: 'announcement_bar',
          status: 'LIVE',
          scope: 'news_index',
          priority: 50,
          isActive: true,
          updatedAt: new Date('2026-04-23T10:00:00.000Z'),
          startsAt: null,
          endsAt: null,
          config: {},
        },
      ],
    })

    assert.equal(resolved.announcement_bar?.id, 'high')
  })

  it('ignores expired and inactive banners', () => {
    const now = new Date('2026-04-23T12:00:00.000Z')
    const resolved = resolveMarketingBanners({
      now,
      routeType: 'news_index',
      banners: [
        {
          id: 'expired',
          placement: 'floating',
          status: 'LIVE',
          scope: 'global',
          priority: 50,
          isActive: true,
          updatedAt: new Date('2026-04-23T10:00:00.000Z'),
          startsAt: null,
          endsAt: new Date('2026-04-22T10:00:00.000Z'),
          config: {},
        },
        {
          id: 'inactive',
          placement: 'floating',
          status: 'LIVE',
          scope: 'global',
          priority: 60,
          isActive: false,
          updatedAt: new Date('2026-04-23T11:00:00.000Z'),
          startsAt: null,
          endsAt: null,
          config: {},
        },
      ],
    })

    assert.equal(resolved.floating, null)
  })

  it('matches specific-topic banners by targetTopicKey', () => {
    const now = new Date('2026-04-23T12:00:00.000Z')
    const resolved = resolveMarketingBanners({
      now,
      routeType: 'topic_page',
      topicKey: 'getting-started',
      banners: [
        {
          id: 'topic-banner',
          placement: 'homepage_inline',
          status: 'LIVE',
          scope: 'specific_topic',
          priority: 20,
          isActive: true,
          updatedAt: new Date('2026-04-23T11:00:00.000Z'),
          startsAt: null,
          endsAt: null,
          targetTopicKey: 'getting-started',
          config: {},
        },
      ],
    })

    assert.equal(resolved.homepage_inline?.id, 'topic-banner')
  })
})
