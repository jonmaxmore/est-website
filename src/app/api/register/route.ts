import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { nanoid } from 'nanoid'
import { checkRateLimit } from '@/lib/rate-limit'
import { registrationSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

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
      const firstError = parsed.error.errors[0]?.message || 'Invalid input'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { email, platform, region, referredByCode } = parsed.data
    const payload = await getPayloadClient()

    // Validate referral code exists BEFORE creating registration
    let validReferrer: { id: string | number; referralCount: number } | null = null
    if (referredByCode) {
      const referrerRes = await payload.find({
        collection: 'registrations',
        where: { referralCode: { equals: referredByCode } },
        limit: 1,
      })
      if (referrerRes.docs.length > 0) {
        const doc = referrerRes.docs[0]
        validReferrer = {
          id: doc.id,
          referralCount: (doc.referralCount as number) || 0,
        }
      }
      // If referral code is invalid, we still allow registration but ignore the code
    }

    // Generate referral code
    const referralCode = nanoid(8)

    // Create registration — use try/catch for unique constraint (race condition safety net)
    let registration
    try {
      registration = await payload.create({
        collection: 'registrations',
        data: {
          email,
          platform,
          region,
          referralCode,
          referredBy: validReferrer ? referredByCode : undefined,
          referralCount: 0,
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

    // Increment referrer's count (only if referral code was valid)
    if (validReferrer) {
      await payload.update({
        collection: 'registrations',
        id: validReferrer.id,
        data: {
          referralCount: validReferrer.referralCount + 1,
        },
      })
    }

    // Check & unlock milestones
    const totalCount = await payload.count({ collection: 'registrations' })
    const milestones = await payload.find({
      collection: 'milestones',
      where: { unlocked: { equals: false } },
    })

    const milestoneUpdates = milestones.docs
      .filter((m) => totalCount.totalDocs >= ((m.threshold as number) || 0))
      .map((m) => payload.update({
        collection: 'milestones',
        id: m.id,
        data: { unlocked: true },
      }))

    if (milestoneUpdates.length > 0) {
      await Promise.all(milestoneUpdates)
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
