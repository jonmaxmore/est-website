import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import {
  buildContentHealthReport,
  buildGameGuideHealthReport,
  buildHomepageHealthReport,
  buildNewsHealthReport,
  buildSiteSettingsHealthReport,
} from '@/lib/content-health'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if ('error' in auth) return auth.error

    const { payload } = auth
    const [newsResult, siteSettings, homepage, gameGuidePage] = await Promise.all([
      payload.find({
        collection: 'news',
        sort: '-publishedAt',
        limit: 50,
        depth: 0,
      }),
      payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
      payload.findGlobal({ slug: 'homepage' }).catch(() => null),
      payload.findGlobal({ slug: 'game-guide-page' }).catch(() => null),
    ])

    const news = newsResult.docs.map((article) => buildNewsHealthReport(article))
    const publishedNews = news.filter((article) => article.status === 'published')
    const globals = [
      buildSiteSettingsHealthReport(siteSettings as Record<string, unknown> | null),
      buildHomepageHealthReport(homepage as Record<string, unknown> | null),
      buildGameGuideHealthReport(gameGuidePage as Record<string, unknown> | null),
    ]
    return NextResponse.json(buildContentHealthReport({ news: publishedNews, globals }))
  } catch (error) {
    console.error('Content health API error:', error)
    return NextResponse.json({ error: 'Failed to load content health' }, { status: 500 })
  }
}
