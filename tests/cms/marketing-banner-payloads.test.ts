import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseMarketingBannerPayload } from '../../server/utils/marketing-banners'

describe('marketing banner payload parsing', () => {
  it('accepts a scheduled announcement bar pointing to an article', () => {
    const payload = parseMarketingBannerPayload({
      placement: 'announcement_bar',
      status: 'SCHEDULED',
      scope: 'global',
      priority: 10,
      titleEn: 'Launch Week',
      titleTh: 'Launch Week',
      targetType: 'article',
      targetArticleId: 1,
      startsAt: '2026-04-23T00:00:00.000Z',
      endsAt: '2026-04-30T00:00:00.000Z',
      config: { sticky: true },
    })

    assert.equal(payload.placement, 'announcement_bar')
    assert.equal(payload.targetArticleId, 1)
  })

  it('rejects scoped banners without a valid target', () => {
    assert.throws(() =>
      parseMarketingBannerPayload({
        placement: 'popup',
        status: 'LIVE',
        scope: 'specific_article',
        titleEn: 'Broken',
        titleTh: 'Broken',
        targetType: 'article',
        config: {},
      }),
    )
  })
})
