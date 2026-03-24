import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * GET /api/public/characters — Public Weapons API
 * Returns all visible weapons sorted by sortOrder.
 * Note: "characters" endpoint name kept for backward compatibility.
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

    const characters = result.docs.map((doc) => ({
      id: doc.id,
      name: (doc.name || '') as string,
      descriptionEn: (doc.descriptionEn as string) || null,
      descriptionTh: (doc.descriptionTh as string) || null,
      portrait: typeof doc.portrait === 'object' && doc.portrait ? doc.portrait.url : null,
      infoImage: typeof doc.infoImage === 'object' && doc.infoImage ? doc.infoImage.url : null,
      backgroundImage: typeof doc.backgroundImage === 'object' && doc.backgroundImage ? doc.backgroundImage.url : null,
      icon: typeof doc.icon === 'object' && doc.icon ? doc.icon.url : null,
      videoType: (doc.videoType as string) || 'none',
      videoUrl: (doc.videoUrl as string) || null,
      videoUpload: typeof doc.videoUpload === 'object' && doc.videoUpload ? (doc.videoUpload as { url: string }).url : null,
      sortOrder: doc.sortOrder || 0,
      visible: doc.visible ?? true,
    }))

    return NextResponse.json({ characters }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('[API /public/characters] Error:', error)
    return NextResponse.json({ characters: [] }, { status: 500 })
  }
}
