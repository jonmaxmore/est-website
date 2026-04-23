import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  WEBZINE_CONTENT_TYPES,
  estimateReadingTimeMinutes,
  normalizeWebzineTopics,
} from '../../app/shared/cms/webzine'

describe('webzine helpers', () => {
  it('exports the approved webzine content types', () => {
    assert.deepEqual(WEBZINE_CONTENT_TYPES, ['ANNOUNCEMENT', 'EVENT', 'PATCH_NOTES', 'GUIDE', 'LORE', 'DEV_BLOG'])
  })

  it('normalizes topics with slug and localized fallbacks', () => {
    const topics = normalizeWebzineTopics([
      {
        key: 'getting-started',
        slug: '',
        labelEn: 'Getting Started',
        labelTh: '',
        visible: true,
      },
    ])

    assert.deepEqual(topics, [
      {
        key: 'getting-started',
        slug: 'getting-started',
        labelEn: 'Getting Started',
        labelTh: 'Getting Started',
        descriptionEn: '',
        descriptionTh: '',
        icon: '',
        color: '',
        visible: true,
      },
    ])
  })

  it('estimates reading time with a 1 minute floor', () => {
    assert.equal(estimateReadingTimeMinutes(`<p>${'word '.repeat(420)}</p>`), 3)
    assert.equal(estimateReadingTimeMinutes(''), 1)
  })
})
