import { NextRequest, NextResponse } from 'next/server'
import { hasInternalApiAccess, internalApiUnauthorizedResponse } from '@/lib/internal-api-auth'
import { getPayloadClient } from '@/lib/payload'
import {
  buildContentHealthReport,
  buildGameGuideHealthReport,
  buildHomepageHealthReport,
  buildNewsHealthReport,
  buildNewsPageHealthReport,
  buildSiteSettingsHealthReport,
  buildStoreButtonsHealthReport,
} from '@/lib/content-health'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!hasInternalApiAccess(request)) {
      return internalApiUnauthorizedResponse()
    }

    const payload = await getPayloadClient()
    const [newsResult, siteSettings, homepage, gameGuidePage, newsPage, storeButtons] = await Promise.all([
      payload.find({
        collection: 'news',
        sort: '-publishedAt',
        limit: 50,
        depth: 0,
      }),
      payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
      payload.findGlobal({ slug: 'homepage' }).catch(() => null),
      payload.findGlobal({ slug: 'game-guide-page' }).catch(() => null),
      payload.findGlobal({ slug: 'news-page' }).catch(() => null),
      payload.find({
        collection: 'store-buttons',
        sort: 'sortOrder',
        limit: 20,
        depth: 0,
      }).catch(() => ({ docs: [] })),
    ])

    const publishedNews = newsResult.docs
      .map((article) => buildNewsHealthReport(article))
      .filter((article) => article.status === 'published')

    const globals = [
      buildSiteSettingsHealthReport(siteSettings as Record<string, unknown> | null),
      buildHomepageHealthReport(homepage as Record<string, unknown> | null),
      buildGameGuideHealthReport(gameGuidePage as Record<string, unknown> | null),
      buildNewsPageHealthReport(newsPage as Record<string, unknown> | null),
      buildStoreButtonsHealthReport(storeButtons.docs as Array<Record<string, unknown>>),
    ]

    return NextResponse.json(buildContentHealthReport({ news: publishedNews, globals }))
  } catch (error) {
    console.error('Internal content health API error:', error)
    return NextResponse.json({ error: 'Failed to load internal content health' }, { status: 500 })
  }
}
