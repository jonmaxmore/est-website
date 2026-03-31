import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { serializePublicWeapon } from '@/lib/public-weapons'

export const dynamic = 'force-dynamic'

/**
 * @deprecated Use /api/public/weapons instead.
 * GET /api/public/characters — Legacy alias for public weapons API.
 * Kept for backward compatibility only.
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

    const characters = result.docs.map((doc) => serializePublicWeapon(doc))

    return NextResponse.json({ characters }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('[API /public/characters] Error:', error)
    return NextResponse.json({ characters: [] }, { status: 500 })
  }
}
