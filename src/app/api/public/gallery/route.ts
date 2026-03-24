import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * GET /api/public/gallery — Gallery images from CMS
 * Groups items by category (screenshots, wallpapers, concept)
 */
export async function GET() {
  try {
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'gallery',
      limit: 100,
      sort: 'order',
      depth: 2,
    })

    // Group by category
    const items: Record<string, Array<{
      id: number | string
      title: string
      category: string
      image: { url: string; alt?: string } | null
    }>> = {}

    for (const doc of result.docs) {
      const category = (doc.category as string) || 'screenshots'
      if (!items[category]) items[category] = []

      const imageField = doc.image as { url?: string; alt?: string } | null
      items[category].push({
        id: doc.id,
        title: (doc.title as string) || '',
        category,
        image: imageField?.url ? { url: imageField.url, alt: imageField.alt } : null,
      })
    }

    return NextResponse.json({ gallery: items }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('[API /public/gallery] Error:', error)
    return NextResponse.json({ gallery: {} })
  }
}
