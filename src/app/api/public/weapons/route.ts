import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { serializePublicWeapon } from '@/lib/public-weapons'

export const dynamic = 'force-dynamic'

/**
 * GET /api/public/weapons - Canonical public weapons API
 * Returns all visible weapons sorted by sortOrder.
 */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'weapons',
      where: { visible: { equals: true } },
      sort: 'sortOrder',
      limit: 100,
      depth: 2,
    })

    const weapons = result.docs.map((doc) => serializePublicWeapon(doc))

    return NextResponse.json(
      { weapons },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      },
    )
  } catch (error) {
    console.error('[API /public/weapons] Error:', error)
    return NextResponse.json({ weapons: [] }, { status: 500 })
  }
}
