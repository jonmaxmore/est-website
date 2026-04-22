import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildPagePath, isReservedCmsSlug } from '../../app/shared/cms/pages'

describe('page helpers', () => {
  it('builds system and custom paths correctly', () => {
    assert.equal(buildPagePath({ slug: 'support', isSystemPage: true }), '/support')
    assert.equal(buildPagePath({ slug: 'about-us', isSystemPage: false }), '/about-us')
  })

  it('rejects reserved cms slugs', () => {
    assert.equal(isReservedCmsSlug('news'), true)
    assert.equal(isReservedCmsSlug('event'), true)
    assert.equal(isReservedCmsSlug('about-us'), false)
  })
})
