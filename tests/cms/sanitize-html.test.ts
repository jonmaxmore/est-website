import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { sanitizeRichHtml } from '../../app/shared/cms/sanitize-html'

describe('sanitizeRichHtml', () => {
  it('keeps safe TipTap markup', () => {
    assert.equal(sanitizeRichHtml('<p><strong>Hello</strong></p>'), '<p><strong>Hello</strong></p>')
  })

  it('strips inline scripts and javascript urls', () => {
    const sanitized = sanitizeRichHtml(
      '<img src=x onerror=alert(1)><a href="javascript:alert(1)">bad</a><script>alert(1)</script>',
    )

    assert.equal(sanitized.includes('onerror'), false)
    assert.equal(sanitized.includes('javascript:'), false)
    assert.equal(sanitized.includes('<script>'), false)
  })
})
