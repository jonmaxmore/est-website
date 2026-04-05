import { NextResponse, NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `stats:${ip}`

    if (!checkRateLimit(rateLimitKey, 30, 10000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = await getPayloadClient()

    // Count registrations + get event config + milestones + store buttons in parallel
    const [registrations, eventConfig, milestonesResult, storeButtonsResult] = await Promise.all([
      payload.count({ collection: 'registrations', overrideAccess: true }),
      payload.findGlobal({ slug: 'event-config' }),
      payload.find({ collection: 'milestones', sort: 'sortOrder', limit: 50 }),
      payload.find({ collection: 'store-buttons', where: { visible: { equals: true } }, sort: 'sortOrder', limit: 10 }),
    ])

    const realCount = registrations.totalDocs
    const multiplier = (eventConfig.countMultiplier as number) || 1
    const offset = (eventConfig.countOffset as number) || 0
    const override = eventConfig.countOverride as number | null | undefined

    // Calculate display count
    const displayCount = (override != null && override > 0)
      ? override
      : Math.round((realCount * multiplier) + offset)

    const milestones = milestonesResult.docs.map((m) => ({
      id: m.id,
      threshold: m.threshold,
      rewardEn: m.rewardEn,
      rewardTh: m.rewardTh,
      rewardDescriptionEn: m.rewardDescriptionEn || null,
      rewardDescriptionTh: m.rewardDescriptionTh || null,
      icon: m.icon,
      rewardImage: typeof m.rewardImage === 'object' && m.rewardImage ? { url: m.rewardImage.url } : null,
      lockedImage: typeof m.lockedImage === 'object' && m.lockedImage ? { url: m.lockedImage.url } : null,
      unlocked: displayCount >= ((m.threshold as number) || 0),
      sortOrder: m.sortOrder,
    }))

    // Store URLs from CMS
    const storeUrls = {
      ios: (eventConfig.iosStoreUrl as string) || 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
      android: (eventConfig.androidStoreUrl as string) || 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
      pc: (eventConfig.pcStoreUrl as string) || '#',
    }

    // Store Buttons from collection (single source of truth)
    const eventStoreButtons = storeButtonsResult.docs.map((btn) => ({
      platform: btn.platform as string,
      label: btn.label as string,
      sublabel: (btn.sublabel as string) || '',
      url: btn.url as string,
      sortOrder: (btn.sortOrder as number) || 0,
    }))

    // CTA Button Image
    const ctaButtonImage = typeof eventConfig.ctaButtonImage === 'object' && eventConfig.ctaButtonImage
      ? { url: (eventConfig.ctaButtonImage as Record<string, unknown>).url as string }
      : null

    return NextResponse.json({
      totalRegistrations: displayCount,
      realCount,
      displayCount,
      multiplier,
      offset,
      override: override ?? null,
      milestones,
      storeUrls,
      eventStoreButtons,
      ctaButtonImage,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({
      totalRegistrations: 0,
      milestones: [],
      storeUrls: { ios: '#', android: '#', pc: '#' },
    })
  }
}
