import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

import { checkRateLimit } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limit
    // Rate limit: 5 requests per minute
    if (!checkRateLimit(ip, 5, 60000)) {
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
