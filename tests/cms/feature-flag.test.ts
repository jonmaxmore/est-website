/**
 * Tests for the pure isFlagEnabled() helper from useFeatureFlag.
 * The composable + cookie I/O is browser-only and not unit-tested here;
 * we cover the deterministic evaluator instead.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isFlagEnabled } from '../../app/composables/useFeatureFlag'

describe('isFlagEnabled', () => {
  it('returns false when flags map is undefined', () => {
    assert.equal(isFlagEnabled(undefined, 'foo', 50), false)
  })

  it('returns false when flag is missing', () => {
    assert.equal(isFlagEnabled({}, 'missing', 50), false)
  })

  it('returns true for boolean true', () => {
    assert.equal(isFlagEnabled({ foo: true }, 'foo', 1), true)
    assert.equal(isFlagEnabled({ foo: true }, 'foo', 100), true)
  })

  it('returns false for boolean false', () => {
    assert.equal(isFlagEnabled({ foo: false }, 'foo', 1), false)
    assert.equal(isFlagEnabled({ foo: false }, 'foo', 100), false)
  })

  it('returns false when enabled is explicitly false (regardless of rolloutPct)', () => {
    assert.equal(isFlagEnabled({ foo: { enabled: false, rolloutPct: 100 } }, 'foo', 1), false)
  })

  it('respects rolloutPct: bucket within range = on', () => {
    assert.equal(isFlagEnabled({ foo: { rolloutPct: 50 } }, 'foo', 1), true)
    assert.equal(isFlagEnabled({ foo: { rolloutPct: 50 } }, 'foo', 50), true)
  })

  it('respects rolloutPct: bucket beyond range = off', () => {
    assert.equal(isFlagEnabled({ foo: { rolloutPct: 50 } }, 'foo', 51), false)
    assert.equal(isFlagEnabled({ foo: { rolloutPct: 50 } }, 'foo', 100), false)
  })

  it('clamps negative rolloutPct to 0 (everyone off)', () => {
    assert.equal(isFlagEnabled({ foo: { rolloutPct: -5 } }, 'foo', 1), false)
  })

  it('clamps rolloutPct > 100 to 100 (everyone on)', () => {
    assert.equal(isFlagEnabled({ foo: { rolloutPct: 200 } }, 'foo', 100), true)
  })

  it('returns true for { enabled: true } with no rolloutPct', () => {
    assert.equal(isFlagEnabled({ foo: { enabled: true } }, 'foo', 50), true)
  })

  it('returns false for empty object flag (defensive default)', () => {
    assert.equal(isFlagEnabled({ foo: {} }, 'foo', 50), false)
  })

  it('treats rolloutPct: 0 as "everyone off"', () => {
    assert.equal(isFlagEnabled({ foo: { rolloutPct: 0 } }, 'foo', 1), false)
  })

  it('treats rolloutPct: 100 as "everyone on"', () => {
    assert.equal(isFlagEnabled({ foo: { rolloutPct: 100 } }, 'foo', 100), true)
  })
})
