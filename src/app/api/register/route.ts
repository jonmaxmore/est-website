import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

// Rate limit store
// NOTE: In-memory — resets on PM2/server restart. For production-grade limiting,
// consider Redis, Upstash, or Payload CMS's RateLimitLog collection.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5
const WINDOW_MS = 60 * 1000

// Periodic cleanup to prevent unbounded memory growth (every 5 min)
if (typeof globalThis !== 'undefined') {
  const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap) {
      if (now > record.resetTime) rateLimitMap.delete(key)
    }
  }, CLEANUP_INTERVAL_MS).unref?.()
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return true
  }

  if (record.count >= RATE_LIMIT) return false
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { platform, region, referredByCode } = body

    // Sanitize email
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    // Validate
    if (!email || !platform || !region) {
      return NextResponse.json(
        { error: 'Email, platform, and region are required' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (!['ios', 'android', 'pc'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    if (!['th', 'sea', 'global'].includes(region)) {
      return NextResponse.json(
        { error: 'Invalid region' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Check if already registered
    const existing = await payload.find({
      collection: 'registrations',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      )
    }

    // Generate referral code
    const referralCode = nanoid(8)

    // Create registration
    const registration = await payload.create({
      collection: 'registrations',
      data: {
        email,
        platform,
        region,
        referralCode,
        referredBy: referredByCode || undefined,
        referralCount: 0,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || '',
      },
    })

    // If referred by someone, increment their referral count
    if (referredByCode) {
      const referrer = await payload.find({
        collection: 'registrations',
        where: { referralCode: { equals: referredByCode } },
        limit: 1,
      })

      if (referrer.docs.length > 0) {
        await payload.update({
          collection: 'registrations',
          id: referrer.docs[0].id,
          data: {
            referralCount: (referrer.docs[0].referralCount || 0) + 1,
          },
        })
      }
    }

    // Check & unlock milestones
    const totalCount = await payload.count({ collection: 'registrations' })
    const milestones = await payload.find({
      collection: 'milestones',
      where: { unlocked: { equals: false } },
    })

    for (const milestone of milestones.docs) {
      if (totalCount.totalDocs >= (milestone.threshold || 0)) {
        await payload.update({
          collection: 'milestones',
          id: milestone.id,
          data: { unlocked: true },
        })
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
