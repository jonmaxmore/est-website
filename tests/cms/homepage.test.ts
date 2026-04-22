import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SUPPORTED_HOMEPAGE_SECTION_TYPES, isSupportedHomepageSectionType } from '../../app/shared/cms/homepage'

describe('homepage section registry', () => {
  it('allows only release-1 section types', () => {
    assert.deepEqual(SUPPORTED_HOMEPAGE_SECTION_TYPES, ['hero', 'weapons', 'features', 'highlights', 'news', 'cta'])
  })

  it('rejects legacy unsupported section types', () => {
    assert.equal(isSupportedHomepageSectionType('custom_html'), false)
    assert.equal(isSupportedHomepageSectionType('gallery'), false)
    assert.equal(isSupportedHomepageSectionType('video'), false)
  })
})
