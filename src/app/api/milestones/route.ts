import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'milestones',
      sort: 'sortOrder',
      limit: 50,
    })

    const milestones = result.docs.map((m) => ({
      id: m.id,
      threshold: m.threshold,
      rewardEn: m.rewardEn,
      rewardTh: m.rewardTh,
      icon: m.icon,
      rewardImage: typeof m.rewardImage === 'object' && m.rewardImage ? {
        url: m.rewardImage.url,
        alt: m.rewardImage.alt,
      } : null,
      unlocked: m.unlocked,
      sortOrder: m.sortOrder,
    }))

    return NextResponse.json({ milestones }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Milestones API error:', error)
    return NextResponse.json({ milestones: [] })
  }
}
