import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { nanoid } from 'nanoid'
import { checkRateLimit } from '@/lib/rate-limit'
import { registrationSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line max-lines-per-function -- registration with MLM referral logic
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limit: 5 requests per minute
    if (!checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input with Zod schema
    const body = await request.json()
    const parsed = registrationSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { email, platform, region, referredByCode } = parsed.data
    const payload = await getPayloadClient()

    // ── Fetch referral point config ──
    const eventConfig = await payload.findGlobal({ slug: 'event-config' })
    const pointsL1 = (eventConfig.pointsLevel1 as number) ?? 1
    const pointsL2 = (eventConfig.pointsLevel2 as number) ?? 0.5

    // ── Validate L1 referrer (direct parent) ──
    let l1Parent: { id: string | number; referralLevel1Count: number; referralPoints: number; referredBy?: string } | null = null
    if (referredByCode) {
      const referrerRes = await payload.find({
        collection: 'registrations',
        where: { referralCode: { equals: referredByCode } },
        limit: 1,
      })
      if (referrerRes.docs.length > 0) {
        const doc = referrerRes.docs[0]
        l1Parent = {
          id: doc.id,
          referralLevel1Count: (doc.referralLevel1Count as number) || 0,
          referralPoints: (doc.referralPoints as number) || 0,
          referredBy: (doc.referredBy as string) || undefined,
        }
      }
      // If referral code is invalid, we still allow registration but ignore the code
    }

    // ── Generate referral code ──
    const referralCode = nanoid(8)

    // ── Create registration ──
    let registration
    try {
      registration = await payload.create({
        collection: 'registrations',
        data: {
          email,
          platform,
          region,
          referralCode,
          referredBy: l1Parent ? referredByCode : undefined,
          referralLevel1Count: 0,
          referralLevel2Count: 0,
          referralPoints: 0,
          referralCount: 0, // legacy field
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || '',
        },
      })
    } catch (err: unknown) {
      // Check for unique constraint violation (duplicate email)
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg.includes('unique') || errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 409 }
        )
      }
      throw err // Re-throw unexpected errors
    }

    // ── 2-Level MLM Referral Updates ──
    if (l1Parent) {
      // Update L1 parent: +1 direct referral
      const newL1Count = l1Parent.referralLevel1Count + 1
      const l1Doc = await payload.findByID({ collection: 'registrations', id: l1Parent.id })
      const l1Level2Count = (l1Doc.referralLevel2Count as number) || 0
      const recalcL1Points = (newL1Count * pointsL1) + (l1Level2Count * pointsL2)

      await payload.update({
        collection: 'registrations',
        id: l1Parent.id,
        data: {
          referralLevel1Count: newL1Count,
          referralPoints: recalcL1Points,
          referralCount: newL1Count, // legacy compat
        },
      })

      // ── Find L2 grandparent (L1's referredBy) ──
      if (l1Parent.referredBy) {
        const grandparentRes = await payload.find({
          collection: 'registrations',
          where: { referralCode: { equals: l1Parent.referredBy } },
          limit: 1,
        })
        if (grandparentRes.docs.length > 0) {
          const gpDoc = grandparentRes.docs[0]
          const gpL1Count = (gpDoc.referralLevel1Count as number) || 0
          const gpL2Count = ((gpDoc.referralLevel2Count as number) || 0) + 1
          const recalcGpPoints = (gpL1Count * pointsL1) + (gpL2Count * pointsL2)

          await payload.update({
            collection: 'registrations',
            id: gpDoc.id,
            data: {
              referralLevel2Count: gpL2Count,
              referralPoints: recalcGpPoints,
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      referralCode: registration.referralCode,
      message: 'Registration successful!',
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
