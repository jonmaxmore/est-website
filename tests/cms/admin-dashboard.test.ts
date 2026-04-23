import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildWebzineDashboardSummary } from '../../app/shared/cms/admin-dashboard'

describe('buildWebzineDashboardSummary', () => {
  it('summarizes live banners, scheduled banners, and article cleanup queues', () => {
    const summary = buildWebzineDashboardSummary({
      banners: [
        { status: 'LIVE', placement: 'announcement_bar' },
        { status: 'SCHEDULED', placement: 'popup' },
      ],
      articles: [
        { status: 'DRAFT', primaryTopicKey: null, featuredImage: null },
        { status: 'PUBLISHED', primaryTopicKey: 'getting-started', featuredImage: '/x.webp' },
      ],
    })

    assert.deepEqual(summary, {
      liveBanners: 1,
      scheduledBanners: 1,
      draftArticles: 1,
      articlesMissingTopic: 1,
      articlesMissingFeaturedImage: 1,
    })
  })
})
