/**
 * Tests for pickKnown — the mass-assignment guard used in backup import.
 * Audit-2 (W-2): Step 4 backup hardening shipped without unit coverage.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { pickKnown } from '../../server/utils/pick-known'

describe('pickKnown', () => {
  it('returns only the allowed keys', () => {
    const out = pickKnown({ a: 1, b: 2, c: 3 }, ['a', 'c'])
    assert.deepEqual(out, { a: 1, c: 3 })
  })

  it('strips attacker-injected fields (mass-assignment guard)', () => {
    // Caller's allow-list does NOT include passwordHash → it's stripped.
    const out = pickKnown(
      { slug: 'foo', titleEn: 'X', passwordHash: 'PWN', viewCount: 99999 },
      ['slug', 'titleEn'],
    )
    assert.deepEqual(out, { slug: 'foo', titleEn: 'X' })
    assert.equal('passwordHash' in out, false)
    assert.equal('viewCount' in out, false)
  })

  it('returns an empty object for null input', () => {
    assert.deepEqual(pickKnown(null, ['a', 'b']), {})
  })

  it('returns an empty object for undefined input', () => {
    assert.deepEqual(pickKnown(undefined, ['a', 'b']), {})
  })

  it('returns an empty object for primitive (string) input', () => {
    assert.deepEqual(pickKnown('not-an-object', ['a']), {})
  })

  it('returns an empty object for primitive (number) input', () => {
    assert.deepEqual(pickKnown(42, ['a']), {})
  })

  it('omits keys that are not present on the input (does not coerce to undefined)', () => {
    const out = pickKnown({ a: 1 }, ['a', 'b'])
    assert.deepEqual(out, { a: 1 })
    // Critical: callers depend on `'b' in out === false` so partial-update
    // semantics work (Prisma treats undefined as "no change").
    assert.equal('b' in out, false)
  })

  it('preserves explicit undefined values', () => {
    const out = pickKnown({ a: undefined, b: 2 }, ['a', 'b'])
    // 'a' was explicitly set to undefined on input → present in output.
    assert.equal('a' in out, true)
    assert.equal(out.a, undefined)
    assert.equal(out.b, 2)
  })

  it('preserves null values', () => {
    const out = pickKnown({ a: null, b: 'x' }, ['a', 'b'])
    assert.equal(out.a, null)
    assert.equal(out.b, 'x')
  })

  it('handles empty allow-list', () => {
    assert.deepEqual(pickKnown({ a: 1, b: 2 }, []), {})
  })

  it('handles empty input object', () => {
    assert.deepEqual(pickKnown({}, ['a', 'b']), {})
  })

  it('does not mutate the input', () => {
    const input = { a: 1, b: 2 }
    pickKnown(input, ['a'])
    assert.deepEqual(input, { a: 1, b: 2 })
  })
})
