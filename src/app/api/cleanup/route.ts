import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

// POST /api/cleanup — Clean duplicate data and re-seed properly
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if ('error' in auth) return auth.error
    const { payload } = auth
    const results: string[] = []

    // 1. Clean duplicate milestones — keep only one per threshold
    const milestones = await payload.find({ collection: 'milestones', limit: 100 })
    const seenThresholds = new Set<number>()
    let deletedMilestones = 0
    for (const m of milestones.docs) {
      if (seenThresholds.has(m.threshold)) {
        await payload.delete({ collection: 'milestones', id: m.id })
        deletedMilestones++
      } else {
        seenThresholds.add(m.threshold)
      }
    }
    results.push(`🗑️ Deleted ${deletedMilestones} duplicate milestones`)

    // 2. Clean duplicate store buttons — keep only one per platform
    const buttons = await payload.find({ collection: 'store-buttons', limit: 100 })
    const seenPlatforms = new Set<string>()
    let deletedButtons = 0
    for (const b of buttons.docs) {
      if (seenPlatforms.has(b.platform)) {
        await payload.delete({ collection: 'store-buttons', id: b.id })
        deletedButtons++
      } else {
        seenPlatforms.add(b.platform)
      }
    }
    results.push(`🗑️ Deleted ${deletedButtons} duplicate store buttons`)

    // 3. Clean duplicate characters — keep only one per nameEn
    const characters = await payload.find({ collection: 'characters', limit: 100 })
    const seenNames = new Set<string>()
    let deletedChars = 0
    for (const c of characters.docs) {
      if (seenNames.has(c.nameEn)) {
        await payload.delete({ collection: 'characters', id: c.id })
        deletedChars++
      } else {
        seenNames.add(c.nameEn)
      }
    }
    results.push(`🗑️ Deleted ${deletedChars} duplicate characters`)

    // 4. Clean duplicate news — keep only one per slug
    const news = await payload.find({ collection: 'news', limit: 100 })
    const seenSlugs = new Set<string>()
    let deletedNews = 0
    for (const n of news.docs) {
      if (seenSlugs.has(n.slug)) {
        await payload.delete({ collection: 'news', id: n.id })
        deletedNews++
      } else {
        seenSlugs.add(n.slug)
      }
    }
    results.push(`🗑️ Deleted ${deletedNews} duplicate news`)

    // Summary
    const remaining = {
      milestones: (await payload.find({ collection: 'milestones', limit: 1 })).totalDocs,
      characters: (await payload.find({ collection: 'characters', limit: 1 })).totalDocs,
      news: (await payload.find({ collection: 'news', limit: 1 })).totalDocs,
      storeButtons: (await payload.find({ collection: 'store-buttons', limit: 1 })).totalDocs,
      registrations: (await payload.find({ collection: 'registrations', limit: 1 })).totalDocs,
    }
    results.push(`📊 Remaining: ${JSON.stringify(remaining)}`)

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
