import { NextRequest, NextResponse } from 'next/server'
import { refreshCmsContent } from '@/lib/cms-maintenance'
import { hasInternalApiAccess, internalApiUnauthorizedResponse } from '@/lib/internal-api-auth'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!hasInternalApiAccess(request)) {
      return internalApiUnauthorizedResponse()
    }

    const payload = await getPayloadClient()
    const summary = await refreshCmsContent(payload)

    return NextResponse.json({
      success: true,
      ...summary,
    })
  } catch (error) {
    console.error('Refresh content API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh CMS content',
      },
      { status: 500 },
    )
  }
}
