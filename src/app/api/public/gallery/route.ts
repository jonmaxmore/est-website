import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * GET /api/gallery — Gallery images from CMS
 * Groups items by category (screenshots, wallpapers, concept)
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'gallery',
      limit: 100,
      sort: 'order',
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

    return NextResponse.json({ gallery: items })
  } catch (error) {
    console.error('[API /gallery] Error fetching gallery:', error)
    return NextResponse.json({ gallery: {} })
  }
}
