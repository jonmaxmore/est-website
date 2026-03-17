import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    // Count registrations
    const registrations = await payload.count({
      collection: 'registrations',
    })

    // Get milestones
    const milestonesResult = await payload.find({
      collection: 'milestones',
      sort: 'sortOrder',
      limit: 50,
    })

    const milestones = milestonesResult.docs.map((m) => ({
      id: m.id,
      threshold: m.threshold,
      rewardEn: m.rewardEn,
      rewardTh: m.rewardTh,
      icon: m.icon,
      unlocked: m.unlocked || (registrations.totalDocs >= (m.threshold || 0)),
    }))

    return NextResponse.json({
      totalRegistrations: registrations.totalDocs,
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
