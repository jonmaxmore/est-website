import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

// POST /api/stats/reset — Reset multiplier/offset to real numbers
export async function POST() {
  try {
    const payload = await getPayloadClient()

    await payload.updateGlobal({
      slug: 'event-config',
      data: {
        countMultiplier: 1,
        countOffset: 0,
        countOverride: null,
      },
    })

    const registrations = await payload.count({ collection: 'registrations' })

    return NextResponse.json({
      success: true,
      message: 'Count reset to real numbers',
      realCount: registrations.totalDocs,
      displayCount: registrations.totalDocs,
      multiplier: 1,
      offset: 0,
      override: null,
    })
  } catch (error) {
    console.error('Reset API error:', error)
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 })
  }
}
