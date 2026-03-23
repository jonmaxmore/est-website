import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const category = searchParams.get('category')

    const where: Where = {
      status: { equals: 'published' },
    }

    if (category) {
      where.category = { equals: category }
    }

    const result = await payload.find({
      collection: 'news',
      where: where,
      sort: '-publishedAt',
      page,
      limit,
    })

    const articles = result.docs.map((article) => ({
      id: article.id,
      titleEn: article.titleEn,
      titleTh: article.titleTh,
      slug: article.slug,
      category: article.category,
      emoji: article.emoji,
      featuredImage: typeof article.featuredImage === 'object' && article.featuredImage ? {
        url: article.featuredImage.url,
        alt: article.featuredImage.alt,
        sizes: article.featuredImage.sizes,
      } : null,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
    }))

    return NextResponse.json({
      articles,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        limit,
      }
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({ articles: [], pagination: { totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false, limit: 10 } })
  }
}
