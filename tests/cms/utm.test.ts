/**
 * Tests for server/utils/utm.ts.
 * Audit-2 (W-2): Step 5 UTM column restore + parser shipped without unit coverage.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { extractUtmFromQuery, extractUtmFromUrl } from '../../server/utils/utm'

describe('extractUtmFromQuery', () => {
  it('extracts all three tags from a clean query object', () => {
    const out = extractUtmFromQuery({
      utm_source: 'newsletter',
      utm_medium: 'email',
      utm_campaign: 'launch-week',
    })
    assert.deepEqual(out, {
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'launch-week',
    })
  })

  it('returns nulls when query is null or undefined', () => {
    assert.deepEqual(extractUtmFromQuery(null), {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    })
    assert.deepEqual(extractUtmFromQuery(undefined), {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    })
  })

  it('ignores non-string values', () => {
    const out = extractUtmFromQuery({
      utm_source: 12345 as unknown as string,
      utm_medium: { not: 'a string' } as unknown as string,
      utm_campaign: 'good',
    })
    assert.equal(out.utmSource, null)
    assert.equal(out.utmMedium, null)
    assert.equal(out.utmCampaign, 'good')
  })

  it('trims whitespace', () => {
    const out = extractUtmFromQuery({ utm_source: '  newsletter  ' })
    assert.equal(out.utmSource, 'newsletter')
  })

  it('treats whitespace-only as null', () => {
    const out = extractUtmFromQuery({ utm_source: '   ' })
    assert.equal(out.utmSource, null)
  })

  it('caps values at 64 chars to prevent log pollution', () => {
    const longValue = 'x'.repeat(200)
    const out = extractUtmFromQuery({ utm_source: longValue })
    assert.equal(out.utmSource?.length, 64)
  })

  it('treats empty string as null', () => {
    const out = extractUtmFromQuery({ utm_source: '' })
    assert.equal(out.utmSource, null)
  })
})

describe('extractUtmFromUrl', () => {
  it('parses a full URL with all UTM tags', () => {
    const out = extractUtmFromUrl('https://example.com/news?utm_source=fb&utm_medium=cpc&utm_campaign=summer')
    assert.deepEqual(out, {
      utmSource: 'fb',
      utmMedium: 'cpc',
      utmCampaign: 'summer',
    })
  })

  it('parses a relative URL via the synthetic origin', () => {
    const out = extractUtmFromUrl('/news?utm_source=newsletter')
    assert.equal(out.utmSource, 'newsletter')
  })

  it('returns nulls for a URL with no UTM params', () => {
    const out = extractUtmFromUrl('https://example.com/news')
    assert.deepEqual(out, { utmSource: null, utmMedium: null, utmCampaign: null })
  })

  it('returns nulls for a malformed URL', () => {
    const out = extractUtmFromUrl('::not a url::')
    assert.deepEqual(out, { utmSource: null, utmMedium: null, utmCampaign: null })
  })

  it('returns nulls for an empty string', () => {
    const out = extractUtmFromUrl('')
    assert.deepEqual(out, { utmSource: null, utmMedium: null, utmCampaign: null })
  })

  it('caps each value at 64 chars', () => {
    const url = `https://example.com/?utm_source=${'a'.repeat(200)}`
    const out = extractUtmFromUrl(url)
    assert.equal(out.utmSource?.length, 64)
  })

  it('accepts a URL object', () => {
    const out = extractUtmFromUrl(new URL('https://example.com/?utm_campaign=launch'))
    assert.equal(out.utmCampaign, 'launch')
  })
})
