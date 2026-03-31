import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

/**
 * @deprecated Admin-only utility. Not called by frontend.
 * POST /api/cleanup - Clean duplicate data and re-seed properly
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if ('error' in auth) return auth.error
    const { payload } = auth
    const results: string[] = []

    // 1. Clean duplicate milestones - keep only one per threshold
    const milestones = await payload.find({ collection: 'milestones', limit: 100 })
    const seenThresholds = new Set<number>()
    let deletedMilestones = 0
    for (const milestone of milestones.docs) {
      if (seenThresholds.has(milestone.threshold)) {
        await payload.delete({ collection: 'milestones', id: milestone.id })
        deletedMilestones++
      } else {
        seenThresholds.add(milestone.threshold)
      }
    }
    results.push(`Deleted ${deletedMilestones} duplicate milestones`)

    // 2. Clean duplicate store buttons - keep only one per platform
    const buttons = await payload.find({ collection: 'store-buttons', limit: 100 })
    const seenPlatforms = new Set<string>()
    let deletedButtons = 0
    for (const button of buttons.docs) {
      const platform = String(button.platform || '').trim().toLowerCase()
      if (!platform) continue

      if (seenPlatforms.has(platform)) {
        await payload.delete({ collection: 'store-buttons', id: button.id })
        deletedButtons++
      } else {
        seenPlatforms.add(platform)
      }
    }
    results.push(`Deleted ${deletedButtons} duplicate store buttons`)

    // 3. Clean duplicate weapons - keep only one per name
    const weapons = await payload.find({ collection: 'weapons', limit: 100 })
    const seenNames = new Set<string>()
    let deletedWeapons = 0
    for (const weapon of weapons.docs) {
      const weaponName = String(weapon.name || '').trim().toLowerCase()
      if (!weaponName) continue

      if (seenNames.has(weaponName)) {
        await payload.delete({ collection: 'weapons', id: weapon.id })
        deletedWeapons++
      } else {
        seenNames.add(weaponName)
      }
    }
    results.push(`Deleted ${deletedWeapons} duplicate weapons`)

    // 4. Clean duplicate news - keep only one per slug
    const news = await payload.find({ collection: 'news', limit: 100 })
    const seenSlugs = new Set<string>()
    let deletedNews = 0
    for (const article of news.docs) {
      if (seenSlugs.has(article.slug)) {
        await payload.delete({ collection: 'news', id: article.id })
        deletedNews++
      } else {
        seenSlugs.add(article.slug)
      }
    }
    results.push(`Deleted ${deletedNews} duplicate news`)

    const remaining = {
      milestones: (await payload.find({ collection: 'milestones', limit: 1 })).totalDocs,
      weapons: (await payload.find({ collection: 'weapons', limit: 1 })).totalDocs,
      news: (await payload.find({ collection: 'news', limit: 1 })).totalDocs,
      storeButtons: (await payload.find({ collection: 'store-buttons', limit: 1 })).totalDocs,
      registrations: (await payload.find({ collection: 'registrations', limit: 1 })).totalDocs,
    }
    results.push(`Remaining: ${JSON.stringify(remaining)}`)

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
