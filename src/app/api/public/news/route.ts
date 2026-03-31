import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  buildNewsImage,
  summarizeNewsField,
  sortNewsForEditorial,
  resolveNewsHref,
  isExternalNewsLink,
  sanitizeNewsLocaleValue,
} from '@/lib/news-content'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)
    const category = searchParams.get('category')

    const where: Where = {
      status: { equals: 'published' },
      publishedAt: { exists: true },
    }

    if (category) {
      where.category = { equals: category }
    }

    const result = await payload.find({
      collection: 'news',
      where,
      sort: '-publishedAt',
      page,
      limit,
      depth: 1,
    })

    const articles = sortNewsForEditorial(result.docs.map((article) => {
      const externalUrl = article.externalUrl || null
      const slug = article.slug || ''
      const sanitizedSummaries = sanitizeNewsLocaleValue(
        summarizeNewsField(article.excerptTh, article.contentTh),
        summarizeNewsField(article.excerptEn, article.contentEn),
      )

      return {
        id: article.id,
        titleEn: article.titleEn,
        titleTh: article.titleTh,
        slug,
        category: article.category,
        emoji: article.emoji,
        summaryEn: sanitizedSummaries.secondary,
        summaryTh: sanitizedSummaries.primary,
        featuredImage: buildNewsImage(typeof article.featuredImage === 'object' ? article.featuredImage : null),
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        externalUrl,
        openInNewTab: Boolean(article.openInNewTab),
        featureOnHome: Boolean(article.featureOnHome),
        homePriority: typeof article.homePriority === 'number' ? article.homePriority : 0,
        href: resolveNewsHref({ externalUrl, slug }),
        isExternal: isExternalNewsLink({ externalUrl }),
      }
    }))

    return NextResponse.json({
      articles,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        limit,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({
      articles: [],
      pagination: { totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false, limit: 10 },
    })
  }
}
