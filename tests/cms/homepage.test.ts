import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  HERO_BACKGROUND_MODES,
  SUPPORTED_HOMEPAGE_SECTION_TYPES,
  isHeroBackgroundMode,
  isSupportedHomepageSectionType,
  normalizeHeroBackgroundMode,
} from '../../app/shared/cms/homepage'

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

describe('hero background modes', () => {
  it('supports image and video modes', () => {
    assert.deepEqual(HERO_BACKGROUND_MODES, ['image', 'video'])
  })

  it('validates background mode', () => {
    assert.equal(isHeroBackgroundMode('image'), true)
    assert.equal(isHeroBackgroundMode('video'), true)
    assert.equal(isHeroBackgroundMode('audio'), false)
  })

  it('normalizes background mode with fallback', () => {
    assert.equal(normalizeHeroBackgroundMode('video'), 'video')
    assert.equal(normalizeHeroBackgroundMode('image'), 'image')
    assert.equal(normalizeHeroBackgroundMode(''), 'image')
    assert.equal(normalizeHeroBackgroundMode(undefined), 'image')
    assert.equal(normalizeHeroBackgroundMode(null), 'image')
  })
})
