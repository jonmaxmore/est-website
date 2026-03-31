import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { nanoid } from 'nanoid'
import { checkRateLimit } from '@/lib/rate-limit'
import { registrationSchema } from '@/lib/validation'
import { getReferralConfig, findL1Parent, processReferralChain } from '@/services/registration'

export const dynamic = 'force-dynamic'

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function collectPayloadErrorEntries(error: unknown): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = []
  const root = asRecord(error)
  if (!root) return records

  const pushErrors = (value: unknown) => {
    if (!Array.isArray(value)) return

    for (const entry of value) {
      const record = asRecord(entry)
      if (record) records.push(record)
    }
  }

  pushErrors(asRecord(root.data)?.errors)
  pushErrors(asRecord(root.cause)?.errors)
  pushErrors(asRecord(asRecord(root.cause)?.data)?.errors)

  return records
}

function isDuplicateRegistrationError(error: unknown) {
  const root = asRecord(error)
  const message = String(error).toLowerCase()
  const status = readNumber(root?.status)
  const payloadErrors = collectPayloadErrorEntries(error)

  if (message.includes('unique') || message.includes('duplicate') || message.includes('already exists')) {
    return true
  }

  if (status !== 400 && status !== 409) {
    return false
  }

  return payloadErrors.some((entry) => {
    const path = readString(entry.path)?.toLowerCase()
    const field = readString(entry.field)?.toLowerCase()
    const label = readString(entry.label)?.toLowerCase()
    const entryMessage = readString(entry.message)?.toLowerCase() || ''

    return path === 'email'
      || field === 'email'
      || label === 'email'
      || entryMessage.includes('field is invalid: email')
      || entryMessage.includes('email')
  })
}

/**
 * POST /api/register — Registration endpoint
 * Thin controller: validates input, creates record, delegates referral logic to service
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `register:${ip}`

    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 5000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    const body = await request.json()
    const parsed = registrationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }

    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
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
      if (isDuplicateRegistrationError(err)) {
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
