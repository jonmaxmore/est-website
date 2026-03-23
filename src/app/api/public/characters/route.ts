import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/public/characters — Public Characters API
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'characters',
      limit: 100,
      depth: 1, // To resolve relationships if any
    })

    const characters = result.docs.map(doc => ({
      id: doc.id,
      name: doc.name || '',
      portrait: typeof doc.portrait === 'object' && doc.portrait ? doc.portrait.url : null,
      infoImage: typeof doc.infoImage === 'object' && doc.infoImage ? doc.infoImage.url : null,
      backgroundImage: typeof doc.backgroundImage === 'object' && doc.backgroundImage ? doc.backgroundImage.url : null,
      icon: typeof doc.icon === 'object' && doc.icon ? doc.icon.url : null,
      sortOrder: doc.sortOrder || 0,
      visible: doc.visible ?? true,
    }))

    return NextResponse.json({ characters })
  } catch (error) {
    console.error('[API /public/characters] Error fetching characters:', error)
    return NextResponse.json({ characters: [] }, { status: 500 })
  }
}
