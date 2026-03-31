import type { Payload } from 'payload'

/**
 * Registration Service — MLM referral point logic
 * Extracted from api/register/route.ts for SRP compliance
 */

interface ReferralConfig {
  pointsL1: number
  pointsL2: number
}

interface L1Parent {
  id: string | number
  referralLevel1Count: number
  referralPoints: number
  referredBy?: string
}

// ─── Fetch referral point configuration ───
export async function getReferralConfig(payload: Payload): Promise<ReferralConfig> {
  const eventConfig = await payload.findGlobal({ slug: 'event-config' })
  return {
    pointsL1: (eventConfig.pointsLevel1 as number) ?? 1,
    pointsL2: (eventConfig.pointsLevel2 as number) ?? 0.5,
  }
}

// ─── Validate referral code and find L1 parent ───
export async function findL1Parent(payload: Payload, referredByCode: string): Promise<L1Parent | null> {
  const referrerRes = await payload.find({
    collection: 'registrations',
    where: { referralCode: { equals: referredByCode } },
    limit: 1,
    overrideAccess: true,
  })

  if (referrerRes.docs.length === 0) return null

  const doc = referrerRes.docs[0]
  return {
    id: doc.id,
    referralLevel1Count: (doc.referralLevel1Count as number) || 0,
    referralPoints: (doc.referralPoints as number) || 0,
    referredBy: (doc.referredBy as string) || undefined,
  }
}

// ─── Update L1 parent referral counts ───
async function updateL1Parent(payload: Payload, parent: L1Parent, config: ReferralConfig) {
  const newL1Count = parent.referralLevel1Count + 1
  const l1Doc = await payload.findByID({ collection: 'registrations', id: parent.id, overrideAccess: true })
  const l1Level2Count = (l1Doc.referralLevel2Count as number) || 0
  const recalcPoints = (newL1Count * config.pointsL1) + (l1Level2Count * config.pointsL2)

  await payload.update({
    collection: 'registrations',
    id: parent.id,
    overrideAccess: true,
    data: {
      referralLevel1Count: newL1Count,
      referralPoints: recalcPoints,
      referralCount: newL1Count,
    },
  })
}

// ─── Update L2 grandparent referral counts ───
async function updateL2Grandparent(payload: Payload, referredByCode: string, config: ReferralConfig) {
  const grandparentRes = await payload.find({
    collection: 'registrations',
    where: { referralCode: { equals: referredByCode } },
    limit: 1,
    overrideAccess: true,
  })

  if (grandparentRes.docs.length === 0) return

  const gpDoc = grandparentRes.docs[0]
  const gpL1Count = (gpDoc.referralLevel1Count as number) || 0
  const gpL2Count = ((gpDoc.referralLevel2Count as number) || 0) + 1
  const recalcPoints = (gpL1Count * config.pointsL1) + (gpL2Count * config.pointsL2)

  await payload.update({
    collection: 'registrations',
    id: gpDoc.id,
    overrideAccess: true,
    data: { referralLevel2Count: gpL2Count, referralPoints: recalcPoints },
  })
}

// ─── Process 2-level MLM referral chain ───
export async function processReferralChain(payload: Payload, l1Parent: L1Parent, config: ReferralConfig) {
  await updateL1Parent(payload, l1Parent, config)

  if (l1Parent.referredBy) {
    await updateL2Grandparent(payload, l1Parent.referredBy, config)
  }
}
