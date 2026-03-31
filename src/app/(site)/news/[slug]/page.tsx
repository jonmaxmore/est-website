'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Navigation from '@/components/layout/Navigation';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { formatLocalizedDate } from '@/lib/format-date';
import { useLang } from '@/lib/lang-context';
import { NEWS_CATEGORY_META } from '@/lib/news-categories';
import {
  buildFallbackNewsArticleHtml,
  extractLexicalPlainText,
  hasReliableNewsImage,
  isPlaceholderNewsTitle,
  pickNewsSummary,
} from '@/lib/news-content';
import type { CMSNewsImage } from '@/types/cms';

interface RichTextNode {
  type?: string;
  tag?: string;
  text?: string;
  format?: number | string;
  children?: RichTextNode[];
  fields?: { url?: string; newTab?: boolean };
  url?: string;
  value?: { url?: string; alt?: string; caption?: string };
}

interface Article {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  emoji: string;
  summaryEn?: string | null;
  summaryTh?: string | null;
  contentEn: { root: { children: RichTextNode[] } } | null;
  contentTh: { root: { children: RichTextNode[] } } | null;
  featuredImage: CMSNewsImage | null;
  publishedAt: string;
}

interface RelatedArticle {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  emoji: string;
  featuredImage: CMSNewsImage | null;
  publishedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  event: '#F5A623',
  update: '#5BC0EB',
  media: '#9B59B6',
  maintenance: '#E74C3C',
  announcement: '#2ECC71',
};

function renderRichText(node: RichTextNode): string {
  if (!node) return '';

  if (node.text !== undefined) {
    let text = node.text;

    if (typeof node.format === 'number') {
      if (node.format & 1) text = `<strong>${text}</strong>`;
      if (node.format & 2) text = `<em>${text}</em>`;
      if (node.format & 8) text = `<u>${text}</u>`;
    }

    return text;
  }

  const textAlignStyle = typeof node.format === 'string' && ['left', 'center', 'right', 'justify'].includes(node.format)
    ? ` style="text-align: ${node.format}"`
    : '';
  const children = (node.children || []).map(renderRichText).join('');

  switch (node.type) {
    case 'heading':
      return `<${node.tag || 'h2'}${textAlignStyle}>${children}</${node.tag || 'h2'}>`;
    case 'paragraph':
      return `<p${textAlignStyle}>${children}</p>`;
    case 'list': {
      const listTag = node.tag === 'ol' ? 'ol' : 'ul';
      return `<${listTag}>${children}</${listTag}>`;
    }
    case 'listitem':
      return `<li>${children}</li>`;
    case 'link': {
      const href = node.fields?.url || node.url || '#';
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${target}>${children}</a>`;
    }
    case 'quote':
      return `<blockquote>${children}</blockquote>`;
    case 'horizontalrule':
      return '<hr />';
    case 'upload': {
      const media = node.value || {};
      if (!media.url) return '';

      return `<figure style="margin: 2rem 0; text-align: center;">
        <img src="${media.url}" alt="${media.alt || ''}" style="max-width: 100%; height: auto; border-radius: 8px;" />
        ${media.caption ? `<figcaption style="color: #A0ABC0; font-size: 0.85em; margin-top: 0.5rem;">${media.caption}</figcaption>` : ''}
      </figure>`;
    }
    default:
      return children;
  }
}

function renderContent(content: { root: { children: RichTextNode[] } } | null): string {
  if (!content?.root?.children) return '';
  return content.root.children.map(renderRichText).join('');
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s>][\s\S]*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '');
}

// eslint-disable-next-line max-lines-per-function -- Article page keeps fetch, render, and related items together
export default function NewsArticlePage() {
  const { lang, t } = useLang();
  const { socialLinks, footer } = useSiteSettings();
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch(`/api/public/news-detail?slug=${slug}`);

        if (!response.ok) {
          setError(true);
          return;
        }

        const data = await response.json();
        setArticle(data.article || null);
        setRelated(data.related || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="landing-page news-page">
        <ScrollProgress />
        <Navigation />
        <div className="news-loading" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
          <div className="news-loading-spinner" />
          <p>{t('กำลังโหลด...', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="landing-page news-page">
        <ScrollProgress />
        <Navigation />
        <div className="news-empty" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
          <p>{t('ไม่พบบทความนี้', 'Article not found')}</p>
          <Link href="/news" className="article-back-link">{t('← กลับหน้าข่าวสาร', '← Back to News')}</Link>
        </div>
      </div>
    );
  }

  const categoryMeta = NEWS_CATEGORY_META[article.category as keyof typeof NEWS_CATEGORY_META];
  const thaiContentText = extractLexicalPlainText(article.contentTh);
  const preferredContent = lang === 'th' && thaiContentText && !isPlaceholderNewsTitle(thaiContentText)
    ? article.contentTh
    : article.contentEn || article.contentTh;
  const contentHtml = sanitizeHtml(renderContent(preferredContent));
  const articleSummary = pickNewsSummary(
    lang,
    article.summaryTh,
    article.summaryEn,
    categoryMeta?.labelTh || 'ข่าวสาร',
    categoryMeta?.labelEn || 'news',
  );
  const fallbackArticleHtml = buildFallbackNewsArticleHtml(
    lang,
    article.category,
    t(article.titleTh, article.titleEn) || article.titleEn,
    articleSummary,
  );
  const categoryLabel = categoryMeta
    ? t(categoryMeta.labelTh, categoryMeta.labelEn)
    : article.category?.toUpperCase();
  const featuredImage = hasReliableNewsImage(article.featuredImage) ? article.featuredImage : null;

  return (
    <div className="landing-page news-page">
      <ScrollProgress />
      <Navigation />

      <main className="article-main" style={{ paddingTop: '6rem' }}>
        <nav className="article-breadcrumbs">
          <Link href="/">{t('หน้าหลัก', 'Home')}</Link>
          <span>›</span>
          <Link href="/news">{t('ข่าวสาร', 'News')}</Link>
          <span>›</span>
          <span className="active">{t(article.titleTh, article.titleEn)}</span>
        </nav>

        <header className="article-header">
          <span
            className="article-category"
            style={{ background: CATEGORY_COLORS[article.category] || '#5BC0EB' }}
          >
            {categoryLabel}
          </span>
          <h1 className="article-title">{t(article.titleTh, article.titleEn)}</h1>
          <time className="article-date">
            {article.publishedAt
              ? formatLocalizedDate(article.publishedAt, lang, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              : ''}
          </time>
        </header>

        {featuredImage ? (
          <div className="article-featured-image">
            <Image
              src={featuredImage.heroUrl || featuredImage.url || ''}
              alt={featuredImage.alt || article.titleEn}
              fill
              className="object-cover"
              sizes="(max-width: 820px) 100vw, 800px"
              unoptimized={isCmsMediaUrl(featuredImage.heroUrl || featuredImage.url || '')}
            />
          </div>
        ) : (
          <div className="article-featured-fallback">
            <span
              className="article-category"
              style={{ background: CATEGORY_COLORS[article.category] || '#5BC0EB' }}
            >
              {categoryLabel}
            </span>
            <strong>{t('อัปเดตอย่างเป็นทางการ', 'Official update')}</strong>
            <p>{articleSummary}</p>
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml || fallbackArticleHtml }}
        />

        <Link href="/news" className="article-back-link">
          {t('← กลับหน้าข่าวสาร', '← Back to News')}
        </Link>

        {related.length > 0 ? (
          <section className="article-related">
            <h2 className="article-related-title">{t('ข่าวสารที่เกี่ยวข้อง', 'Related Articles')}</h2>
            <div className="article-related-grid">
              {related.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="news-article-card">
                  <div className="news-article-thumb">
                    {hasReliableNewsImage(item.featuredImage) ? (
                      <Image
                        src={item.featuredImage!.cardUrl || item.featuredImage!.thumbnailUrl || item.featuredImage!.url || ''}
                        alt={item.featuredImage!.alt || item.titleEn}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 240px"
                        unoptimized={
                          isCmsMediaUrl(item.featuredImage!.cardUrl || item.featuredImage!.thumbnailUrl || item.featuredImage!.url || '')
                        }
                      />
                    ) : (
                      <span className="news-article-emoji">{item.emoji || '📰'}</span>
                    )}
                    <div className="news-article-thumb-overlay" />
                  </div>

                  <div className="news-article-body">
                    <h3 className="news-article-title">{t(item.titleTh, item.titleEn)}</h3>
                    <time className="news-article-date">
                      {item.publishedAt
                        ? formatLocalizedDate(item.publishedAt, lang, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                        : ''}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
