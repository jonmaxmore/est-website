import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminConfigWrite } from '../../server/utils/admin-config'

describe('admin config validation', () => {
  it('accepts supported homepage sections only', () => {
    const result = parseAdminConfigWrite({
      key: 'homepage_sections',
      value: { sections: [{ id: 'hero', type: 'hero', visible: true, order: 0, background: '', config: {} }] },
    })

    assert.equal(result.key, 'homepage_sections')
  })

  it('rejects unknown config keys', () => {
    assert.throws(() => parseAdminConfigWrite({ key: 'totally_unknown', value: {} }))
  })

  it('rejects unsupported homepage section types', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'homepage_sections',
        value: { sections: [{ id: 'bad', type: 'custom_html', visible: true, order: 0, background: '', config: {} }] },
      }),
    )
  })

  it('rejects page-backed navigation items without a page key', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'navigation',
        value: {
          main: [{ id: 'nav-missing', type: 'page', labelEn: 'Missing', labelTh: 'Missing', visible: true }],
          footer: [],
        },
      }),
    )
  })
})
