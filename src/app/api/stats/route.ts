import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Rate limit: 60 requests per 1 minute for stats API
    if (!checkRateLimit(ip, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = await getPayloadClient()

    // Count registrations + get event config in parallel
    const [registrations, eventConfig] = await Promise.all([
      payload.count({ collection: 'registrations' }),
      payload.findGlobal({ slug: 'event-config' }),
    ])

    // Get milestones
    const milestonesResult = await payload.find({
      collection: 'milestones',
      sort: 'sortOrder',
      limit: 50,
    })

    const realCount = registrations.totalDocs
    const multiplier = (eventConfig.countMultiplier as number) || 1
    const offset = (eventConfig.countOffset as number) || 0
    const override = eventConfig.countOverride as number | null | undefined

    // Calculate display count
    const displayCount = (override != null && override > 0)
      ? override
      : Math.round((realCount * multiplier) + offset)

    const milestones = milestonesResult.docs.map((m) => ({
      id: m.id,
      threshold: m.threshold,
      rewardEn: m.rewardEn,
      rewardTh: m.rewardTh,
      icon: m.icon,
      rewardImage: typeof m.rewardImage === 'object' && m.rewardImage ? { url: m.rewardImage.url } : null,
      unlocked: m.unlocked || (displayCount >= (m.threshold || 0)),
    }))

    return NextResponse.json({
      totalRegistrations: displayCount,
      realCount,
      displayCount,
      multiplier,
      offset,
      override: override ?? null,
      milestones,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({
      totalRegistrations: 0,
      milestones: [],
    })
  }
}
