import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

// POST /api/stats/reset — Reset multiplier/offset to real numbers (admin only)
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // ── Auth Guard: require valid Payload CMS token ──
    const token =
      request.cookies.get('payload-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify token via Payload's internal user lookup
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 })
    }

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

