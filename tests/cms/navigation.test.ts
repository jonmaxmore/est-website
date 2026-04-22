import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizeNavigationConfig, resolveNavigationHref } from '../../app/shared/cms/navigation'

describe('navigation helpers', () => {
  it('normalizes legacy flat navigation arrays into main/footer buckets', () => {
    const normalized = normalizeNavigationConfig([{ labelEn: 'Home', labelTh: 'Home', href: '/' }])

    assert.equal(normalized.main.length, 1)
    assert.equal(normalized.footer.length, 0)
  })

  it('resolves page-backed href values from page records', () => {
    const href = resolveNavigationHref(
      { id: 'nav-home', type: 'page', labelEn: 'Home', labelTh: 'Home', pageKey: 'home', visible: true },
      { key: 'home', slug: '', isSystemPage: true },
    )

    assert.equal(href, '/')
  })

  it('does not invent hrefs for page-backed items without a backing page', () => {
    const href = resolveNavigationHref({
      id: 'nav-missing',
      type: 'page',
      labelEn: 'Missing',
      labelTh: 'Missing',
      pageKey: 'missing',
      visible: true,
    })

    assert.equal(href, null)
  })
})
