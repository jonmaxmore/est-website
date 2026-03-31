import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

export const dynamic = 'force-dynamic'

/**
 * @deprecated Admin-only utility. Not called by frontend.
 * POST /api/stats/reset — Reset multiplier/offset to real numbers
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if ('error' in auth) return auth.error

    const { payload } = auth

    await payload.updateGlobal({
      slug: 'event-config',
      data: {
        countMultiplier: 1,
        countOffset: 0,
        countOverride: null,
      },
    })

    const registrations = await payload.count({ collection: 'registrations', overrideAccess: true })

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
