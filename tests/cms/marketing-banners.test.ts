import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  BANNER_PLACEMENTS,
  BANNER_SCOPES,
  normalizeBannerConfig,
} from '../../app/shared/cms/marketing-banners'

describe('marketing banner helpers', () => {
  it('exports the approved banner placements', () => {
    assert.deepEqual(BANNER_PLACEMENTS, [
      'popup',
      'floating',
      'announcement_bar',
      'homepage_inline',
      'sidebar',
      'article_inline',
      'footer_strip',
    ])
  })

  it('exports the approved banner scopes', () => {
    assert.deepEqual(BANNER_SCOPES, [
      'global',
      'homepage',
      'news_index',
      'article_detail',
      'topic_page',
      'event_page',
      'specific_article',
      'specific_topic',
    ])
  })

  it('normalizes popup config defaults and bounds', () => {
    assert.deepEqual(normalizeBannerConfig('popup', { delaySeconds: -10 }), {
      delaySeconds: 3,
      frequency: 'session',
      mobileEnabled: true,
    })
  })

  it('normalizes article inline insertion point', () => {
    assert.deepEqual(normalizeBannerConfig('article_inline', { insertAfterParagraph: 0 }), {
      insertAfterParagraph: 2,
    })
  })
})
