import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    // Get characters from CMS, sorted by sortOrder
    const result = await payload.find({
      collection: 'characters',
      where: {
        visible: { equals: true },
      },
      sort: 'sortOrder',
      limit: 50,
    })

    const characters = result.docs.map((char) => ({
      id: char.id,
      nameEn: char.nameEn,
      nameTh: char.nameTh,
      classEn: char.classEn,
      classTh: char.classTh,
      weaponClass: char.weaponClass,
      faction: char.faction,
      descriptionEn: char.descriptionEn,
      descriptionTh: char.descriptionTh,
      portrait: typeof char.portrait === 'object' && char.portrait ? {
        url: char.portrait.url,
        alt: char.portrait.alt,
      } : null,
      accentColor: char.accentColor,
      sortOrder: char.sortOrder,
    }))

    return NextResponse.json({ characters }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('Characters API error:', error)
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}
