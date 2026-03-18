import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'characters',
      where: { visible: { equals: true } },
      sort: 'sortOrder',
      limit: 20,
    })

    const characters = result.docs.map((char) => ({
      id: char.id,
      name: char.name || '',
      portrait: typeof char.portrait === 'object' && char.portrait ? (char.portrait as { url?: string }).url || null : null,
      infoImage: typeof char.infoImage === 'object' && char.infoImage ? (char.infoImage as { url?: string }).url || null : null,
      backgroundImage: typeof char.backgroundImage === 'object' && char.backgroundImage ? (char.backgroundImage as { url?: string }).url || null : null,
      icon: typeof char.icon === 'object' && char.icon ? (char.icon as { url?: string }).url || null : null,
    }))

    return NextResponse.json({ characters })
  } catch (error) {
    console.error('Characters API error:', error)
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}
