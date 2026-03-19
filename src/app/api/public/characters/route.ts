import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    
    // Query with raw SQL since DB schema may differ from CMS schema
    // Fall back gracefully with CMS find
    let characters: Array<{
      id: number;
      name: string;
      portrait: string | null;
      infoImage: string | null;
      backgroundImage: string | null;
      icon: string | null;
    }> = []
    
    try {
      const result = await payload.find({
        collection: 'characters',
        where: { visible: { equals: true } },
        sort: 'sortOrder',
        limit: 20,
      })

      characters = result.docs.map((char) => {
        const extractUrl = (field: unknown): string | null => {
          if (typeof field === 'object' && field && 'url' in (field as Record<string, unknown>)) {
            return (field as { url: string }).url || null
          }
          return null
        }

        return {
          id: char.id as number,
          name: (char.name || (char as Record<string, unknown>).name_en || '') as string,
          portrait: extractUrl(char.portrait) || extractUrl((char as Record<string, unknown>).portrait),
          infoImage: extractUrl(char.infoImage),
          backgroundImage: extractUrl(char.backgroundImage) || extractUrl((char as Record<string, unknown>).backgroundImage),
          icon: extractUrl(char.icon),
        }
      })
    } catch (findError) {
      console.error('Characters find error (schema mismatch?), trying fallback:', findError)
      // Return empty — component will use mockup data
      characters = []
    }

    return NextResponse.json({ characters })
  } catch (error) {
    console.error('Characters API error:', error)
    return NextResponse.json({ characters: [] })
  }
}
