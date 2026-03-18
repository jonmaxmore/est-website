import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
