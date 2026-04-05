import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import {
  buildNewsImage,
  hasUsableNewsContent,
  isExternalNewsLink,
  resolveNewsHref,
  sanitizeNewsLocaleValue,
  summarizeNewsField,
} from '@/lib/news-content'

export const dynamic = 'force-dynamic'

type NewsDoc = Record<string, unknown>
type NewsQueryResult = { docs: NewsDoc[] }

async function getSlug(params: Promise<{ slug: string }>) {
  return (await params).slug;
}

function buildSummaryPair(article: NewsDoc) {
  return sanitizeNewsLocaleValue(
    summarizeNewsField(article.excerptTh, article.contentTh),
    summarizeNewsField(article.excerptEn, article.contentEn),
  )
}

function buildArticleResponse(article: NewsDoc) {
  const externalUrl = (article.externalUrl as string) || null
  const summaries = buildSummaryPair(article)
  const contentTh = hasUsableNewsContent(article.contentTh) ? article.contentTh : article.contentEn
  const contentEn = hasUsableNewsContent(article.contentEn) ? article.contentEn : article.contentTh

  return {
    id: article.id,
    titleEn: article.titleEn,
    titleTh: article.titleTh,
    slug: article.slug,
    category: article.category,
    emoji: article.emoji,
    summaryEn: summaries.secondary,
    summaryTh: summaries.primary,
    contentEn,
    contentTh,
    featuredImage: buildNewsImage(typeof article.featuredImage === 'object' ? article.featuredImage : null),
    publishedAt: article.publishedAt,
    externalUrl,
    openInNewTab: Boolean(article.openInNewTab),
    href: resolveNewsHref({ externalUrl, slug: article.slug as string }),
    isExternal: isExternalNewsLink({ externalUrl }),
  }
}

function buildRelatedResponse(item: NewsDoc) {
  const externalUrl = (item.externalUrl as string) || null
  const summaries = buildSummaryPair(item)

  return {
    id: item.id,
    titleEn: item.titleEn,
    titleTh: item.titleTh,
    slug: item.slug,
    category: item.category,
    emoji: item.emoji,
    summaryEn: summaries.secondary,
    summaryTh: summaries.primary,
    featuredImage: buildNewsImage(typeof item.featuredImage === 'object' ? item.featuredImage : null),
    publishedAt: item.publishedAt,
    externalUrl,
    openInNewTab: Boolean(item.openInNewTab),
    href: resolveNewsHref({ externalUrl, slug: item.slug as string }),
    isExternal: isExternalNewsLink({ externalUrl }),
  }
}

async function fetchNewsDetail(slug: string) {
  const payload = await getPayloadClient()
  const articleResult = await payload.find({
    collection: 'news',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 1,
  }) as NewsQueryResult

  const article = articleResult.docs[0]
  if (!article) return null

  const relatedResult = await payload.find({
    collection: 'news',
    where: {
      category: { equals: article.category as string },
      slug: { not_equals: slug },
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  }) as NewsQueryResult

  return {
    article,
    related: relatedResult.docs,
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = await getSlug(params)
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
    }

    const result = await fetchNewsDetail(slug)
    if (!result) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({
      article: buildArticleResponse(result.article),
      related: result.related.map(buildRelatedResponse),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('News article API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
