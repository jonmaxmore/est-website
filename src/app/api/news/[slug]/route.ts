import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'news',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = result.docs[0]

    // Also fetch 3 related articles (same category, different slug)
    const related = await payload.find({
      collection: 'news',
      where: {
        category: { equals: article.category },
        slug: { not_equals: slug },
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      limit: 3,
    })

    return NextResponse.json({
      article: {
        id: article.id,
        titleEn: article.titleEn,
        titleTh: article.titleTh,
        slug: article.slug,
        category: article.category,
        emoji: article.emoji,
        contentEn: article.contentEn,
        contentTh: article.contentTh,
        featuredImage: typeof article.featuredImage === 'object' && article.featuredImage ? {
          url: article.featuredImage.url,
          alt: article.featuredImage.alt,
        } : null,
        publishedAt: article.publishedAt,
      },
      related: related.docs.map((r) => ({
        id: r.id,
        titleEn: r.titleEn,
        titleTh: r.titleTh,
        slug: r.slug,
        category: r.category,
        emoji: r.emoji,
        featuredImage: typeof r.featuredImage === 'object' && r.featuredImage ? {
          url: r.featuredImage.url,
          alt: r.featuredImage.alt,
        } : null,
        publishedAt: r.publishedAt,
      })),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('News article API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
