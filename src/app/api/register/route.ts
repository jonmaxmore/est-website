import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { nanoid } from 'nanoid'
import { checkRateLimit } from '@/lib/rate-limit'
import { registrationSchema } from '@/lib/validation'
import { getReferralConfig, findL1Parent, processReferralChain } from '@/services/registration'

export const dynamic = 'force-dynamic'

/**
 * POST /api/register — Registration endpoint
 * Thin controller: validates input, creates record, delegates referral logic to service
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 5000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    const body = await request.json()
    const parsed = registrationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }

    if (!checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { email, platform, region, referredByCode } = parsed.data
    const payload = await getPayloadClient()
    const config = await getReferralConfig(payload)

    // Validate referral code
    const l1Parent = referredByCode ? await findL1Parent(payload, referredByCode) : null

    // Create registration
    let registration
    try {
      registration = await payload.create({
        collection: 'registrations',
        data: {
          email, platform, region,
          referralCode: nanoid(8),
          referredBy: l1Parent ? referredByCode : undefined,
          referralLevel1Count: 0, referralLevel2Count: 0,
          referralPoints: 0, referralCount: 0,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || '',
        },
      })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg.includes('unique') || errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
        return NextResponse.json({ error: 'This email is already registered' }, { status: 409 })
      }
      throw err
    }

    // Process referral chain (2-level MLM)
    if (l1Parent) {
      await processReferralChain(payload, l1Parent, config)
    }

    return NextResponse.json({
      success: true,
      referralCode: registration.referralCode,
      message: 'Registration successful!',
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
