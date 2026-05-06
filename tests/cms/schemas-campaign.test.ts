/**
 * Tests for the Campaign Zod schema.
 * Audit-2 (W-2) coverage for the new entity from Sprint K.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { campaignCreateSchema, campaignUpdateSchema } from '../../server/utils/schemas-campaign'

const validCampaign = {
  name: 'Summer Launch 2026',
  slug: 'summer-launch-2026',
  description: 'First-class entity for the launch push.',
  ownerEmail: 'marketer@example.com',
  startsAt: '2026-06-01T00:00:00.000Z',
  endsAt: '2026-08-31T23:59:59.000Z',
  status: 'ACTIVE' as const,
  kpis: { downloads: 10000 },
}

describe('campaignCreateSchema', () => {
  it('accepts a full valid payload', () => {
    const out = campaignCreateSchema.safeParse(validCampaign)
    assert.equal(out.success, true)
  })

  it('defaults status to DRAFT when omitted', () => {
    const out = campaignCreateSchema.safeParse({ ...validCampaign, status: undefined })
    assert.equal(out.success, true)
    if (out.success) assert.equal(out.data.status, 'DRAFT')
  })

  it('rejects uppercase or whitespace in slug', () => {
    assert.equal(campaignCreateSchema.safeParse({ ...validCampaign, slug: 'Summer-2026' }).success, false)
    assert.equal(campaignCreateSchema.safeParse({ ...validCampaign, slug: 'summer 2026' }).success, false)
    assert.equal(campaignCreateSchema.safeParse({ ...validCampaign, slug: 'summer_2026' }).success, false)
  })

  it('accepts kebab-case slugs', () => {
    assert.equal(campaignCreateSchema.safeParse({ ...validCampaign, slug: 'a' }).success, true)
    assert.equal(campaignCreateSchema.safeParse({ ...validCampaign, slug: 'launch-2026-q3' }).success, true)
    assert.equal(campaignCreateSchema.safeParse({ ...validCampaign, slug: 'just123' }).success, true)
  })

  it('rejects endsAt <= startsAt', () => {
    const out = campaignCreateSchema.safeParse({
      ...validCampaign,
      startsAt: '2026-08-31T00:00:00.000Z',
      endsAt: '2026-06-01T00:00:00.000Z',
    })
    assert.equal(out.success, false)
  })

  it('rejects endsAt === startsAt', () => {
    const out = campaignCreateSchema.safeParse({
      ...validCampaign,
      startsAt: '2026-06-01T00:00:00.000Z',
      endsAt: '2026-06-01T00:00:00.000Z',
    })
    assert.equal(out.success, false)
  })

  it('accepts campaigns with only a startsAt (open-ended)', () => {
    const out = campaignCreateSchema.safeParse({
      ...validCampaign,
      endsAt: null,
    })
    assert.equal(out.success, true)
  })

  it('accepts campaigns with no schedule', () => {
    const out = campaignCreateSchema.safeParse({
      ...validCampaign,
      startsAt: null,
      endsAt: null,
    })
    assert.equal(out.success, true)
  })

  it('rejects invalid email in ownerEmail', () => {
    const out = campaignCreateSchema.safeParse({ ...validCampaign, ownerEmail: 'not-an-email' })
    assert.equal(out.success, false)
  })

  it('rejects oversized name', () => {
    const out = campaignCreateSchema.safeParse({ ...validCampaign, name: 'x'.repeat(200) })
    assert.equal(out.success, false)
  })
})

describe('campaignUpdateSchema', () => {
  it('accepts partial update with only status', () => {
    const out = campaignUpdateSchema.safeParse({ status: 'COMPLETED' })
    assert.equal(out.success, true)
  })

  it('still applies endsAt > startsAt when both are sent', () => {
    const out = campaignUpdateSchema.safeParse({
      startsAt: '2026-08-31T00:00:00.000Z',
      endsAt: '2026-06-01T00:00:00.000Z',
    })
    assert.equal(out.success, false)
  })

  it('does NOT enforce endsAt > startsAt when only one is sent (delegates to DB)', () => {
    assert.equal(campaignUpdateSchema.safeParse({ endsAt: '2026-06-01T00:00:00.000Z' }).success, true)
    assert.equal(campaignUpdateSchema.safeParse({ startsAt: '2026-06-01T00:00:00.000Z' }).success, true)
  })

  it('rejects invalid status', () => {
    const out = campaignUpdateSchema.safeParse({ status: 'NOT_A_STATUS' })
    assert.equal(out.success, false)
  })
})
