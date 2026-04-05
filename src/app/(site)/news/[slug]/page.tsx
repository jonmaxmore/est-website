import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { formatLocalizedDate } from '@/lib/format-date'
import { buildNewsImage, hasUsableNewsContent } from '@/lib/news-content'
import { NEWS_CATEGORY_META } from '@/lib/news-categories'
import { isCmsMediaUrl } from '@/lib/cms-media'
import '@/app/styles/pages/news-article.css'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getArticleData(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] || null
}

async function getRelatedArticles(category: string, currentSlug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: {
      category: { equals: category },
      slug: { not_equals: currentSlug },
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  })

  return result.docs
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleData(slug)

  if (!article) return {}

  const title = (article.titleEn as string) || (article.titleTh as string) || 'News'
  const summary = (article.summaryEn as string) || (article.summaryTh as string) || ''
  
  // Safe cast since we know the generic structure from Payload
  const featuredImageObj = typeof article.featuredImage === 'object' ? article.featuredImage : null
  const image = buildNewsImage(featuredImageObj as any)

  return {
    title: `${title} | Eternal Tower Saga`,
    description: summary,
    openGraph: {
      title: `${title} | Eternal Tower Saga`,
      description: summary,
      type: 'article',
      publishedTime: article.publishedAt ? new Date(article.publishedAt as string).toISOString() : undefined,
      images: image?.heroUrl ? [{ url: image.heroUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Eternal Tower Saga`,
      description: summary,
      images: image?.heroUrl ? [image.heroUrl] : undefined,
    },
  }
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleData(slug)

  if (!article) {
    notFound()
  }

  const categoryMeta = NEWS_CATEGORY_META[article.category as keyof typeof NEWS_CATEGORY_META] || NEWS_CATEGORY_META.announcement
  const title = (article.titleEn as string) || (article.titleTh as string)
  const summary = (article.summaryEn as string) || (article.summaryTh as string)
  
  const contentToRender = hasUsableNewsContent(article.contentEn) ? article.contentEn : article.contentTh
  
  const featuredImageObj = typeof article.featuredImage === 'object' ? article.featuredImage : null
  const image = buildNewsImage(featuredImageObj as any)

  const relatedArticles = await getRelatedArticles(article.category as string, slug)

  return (
    <div className="news-article-page">
      <article className="news-article-main">
        <header className="news-article-hero">
          <Link href="/news" className="news-article-back">
            <ChevronLeft size={16} />
            Back to News
          </Link>
          
          <div className="news-article-meta">
            <span className="news-article-category" style={{ color: categoryMeta.color, backgroundColor: `${categoryMeta.color}15` }}>
              {categoryMeta.labelEn}
            </span>
            <time className="news-article-date">
              {article.publishedAt ? formatLocalizedDate(article.publishedAt as string, 'en', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : 'Coming soon'}
            </time>
          </div>
          
          <h1 className="news-article-title">{title}</h1>
          {summary && <p className="news-article-summary">{summary}</p>}
        </header>

        {image?.heroUrl && (
          <div className="news-article-featured-image">
            <Image
              src={image.heroUrl}
              alt={title || ''}
              fill
              priority
              className="object-cover"
              unoptimized={isCmsMediaUrl(image.heroUrl)}
            />
          </div>
        )}

        {contentToRender ? (
          <div className="news-article-content">
            <RichText data={contentToRender} />
          </div>
        ) : null}
      </article>

      {relatedArticles.length > 0 && (
        <section className="news-related-section">
          <h2 className="news-related-title">Related News</h2>
          <div className="news-related-grid">
            {relatedArticles.map((item) => {
              const itemCategoryMeta = NEWS_CATEGORY_META[item.category as keyof typeof NEWS_CATEGORY_META] || NEWS_CATEGORY_META.announcement
              const itemImageObj = typeof item.featuredImage === 'object' ? item.featuredImage : null
              const itemImage = buildNewsImage(itemImageObj as any)
              
              return (
                <Link key={item.id} href={`/news/${item.slug}`} className="news-archive__card">
                  <div className="news-archive__meta">
                    <span className="news-chip" style={{ background: itemCategoryMeta.color }}>
                      {itemCategoryMeta.labelEn}
                    </span>
                    <time className="news-archive__date">
                      {item.publishedAt ? formatLocalizedDate(item.publishedAt as string, 'en', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Coming soon'}
                    </time>
                  </div>
                  <h3 className="news-archive__title">{item.titleEn as string || item.titleTh as string}</h3>
                  <p className="news-archive__summary">{item.summaryEn as string || item.summaryTh as string}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
