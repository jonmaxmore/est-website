import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limit: 30 requests per minute
    if (!checkRateLimit(ip, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const leaderboard = url.searchParams.get('leaderboard')

    const payload = await getPayloadClient()

    // ── Leaderboard Mode ──
    if (leaderboard === 'true') {
      const topReferrers = await payload.find({
        collection: 'registrations',
        where: { referralPoints: { greater_than: 0 } },
        sort: '-referralPoints',
        limit: 20,
      })

      const entries = topReferrers.docs.map((doc, index) => {
        const email = doc.email as string
        // Mask email: show first 2 chars + *** + domain
        const [local, domain] = email.split('@')
        const masked = `${local.slice(0, 2)}***@${domain}`

        return {
          rank: index + 1,
          email: masked,
          level1Count: (doc.referralLevel1Count as number) || 0,
          level2Count: (doc.referralLevel2Count as number) || 0,
          totalPoints: (doc.referralPoints as number) || 0,
        }
      })

      return NextResponse.json({
        leaderboard: entries,
      }, {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
      })
    }

    // ── Individual Referral Stats Mode ──
    if (!code) {
      return NextResponse.json({ error: 'Missing code or leaderboard parameter' }, { status: 400 })
    }

    const result = await payload.find({
      collection: 'registrations',
      where: { referralCode: { equals: code } },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
    }

    const user = result.docs[0]

    // Fetch L1 referrals (people who used this code)
    const l1Referrals = await payload.find({
      collection: 'registrations',
      where: { referredBy: { equals: code } },
      sort: '-createdAt',
      limit: 50,
    })

    const l1List = l1Referrals.docs.map((doc) => {
      const email = doc.email as string
      const [local, domain] = email.split('@')
      const masked = `${local.slice(0, 2)}***@${domain}`
      return {
        email: masked,
        createdAt: doc.createdAt,
      }
    })

    return NextResponse.json({
      referralCode: user.referralCode,
      level1Count: (user.referralLevel1Count as number) || 0,
      level2Count: (user.referralLevel2Count as number) || 0,
      totalPoints: (user.referralPoints as number) || 0,
      level1Referrals: l1List,
    }, {
      headers: { 'Cache-Control': 'private, max-age=5' },
    })

  } catch (error) {
    console.error('Referral stats API error:', error)
    return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 })
  }
}
