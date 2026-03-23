'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLang } from '@/lib/lang-context';

/* ═══════════════════════════════════════════════════
   NEWS ARTICLE PAGE — /news/[slug]
   ═══════════════════════════════════════════════════ */

interface RichTextNode {
  type?: string;
  tag?: string;
  text?: string;
  format?: number;
  children?: RichTextNode[];
  fields?: { url?: string; newTab?: boolean };
  url?: string;
}

interface Article {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  emoji: string;
  contentEn: { root: { children: RichTextNode[] } } | null;
  contentTh: { root: { children: RichTextNode[] } } | null;
  featuredImage: { url: string; alt: string } | null;
  publishedAt: string;
}

interface RelatedArticle {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  emoji: string;
  featuredImage: { url: string; alt: string } | null;
  publishedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  event: '#F5A623',
  update: '#5BC0EB',
  media: '#9B59B6',
  maintenance: '#E74C3C',
  announcement: '#2ECC71',
};

/* Render Payload richText to HTML */
function renderRichText(node: RichTextNode): string {
  if (!node) return '';

  // Text node
  if (node.text !== undefined) {
    let text = node.text;
    // format on text node is bitwise for bold/italic/underline
    if (typeof node.format === 'number') {
      if (node.format & 1) text = `<strong>${text}</strong>`; // bold
      if (node.format & 2) text = `<em>${text}</em>`; // italic
      if (node.format & 8) text = `<u>${text}</u>`; // underline
    }
    return text;
  }

  // Handling paragraph block level alignment
  let textAlignStyle = '';
  // @ts-expect-error Lexical node format is sometimes used for alignment on blocks format
  if (['left', 'center', 'right', 'justify'].includes(node.format)) {
    textAlignStyle = ` style="text-align: ${node.format}"`;
  }

  const children = (node.children || []).map(renderRichText).join('');

  switch (node.type) {
    case 'heading':
      return `<${node.tag || 'h2'}${textAlignStyle}>${children}</${node.tag || 'h2'}>`;
    case 'paragraph':
      return `<p${textAlignStyle}>${children}</p>`;
    case 'list':
      const listTag = node.tag === 'ol' ? 'ol' : 'ul';
      return `<${listTag}>${children}</${listTag}>`;
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
      return `<hr />`;
    case 'upload': {
      // @ts-expect-error upload value has media structure
      const val = node.value || {};
      const url = val.url || '';
      const alt = val.alt || '';
      if (!url) return '';
      return `<figure style="margin: 2rem 0; text-align: center;">
        <img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px;" />
        ${val.caption ? `<figcaption style="color: #A0ABC0; font-size: 0.85em; margin-top: 0.5rem;">${val.caption}</figcaption>` : ''}
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

/** Sanitize HTML from CMS richText to prevent XSS */
function sanitizeHtml(html: string): string {
  return html
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[\s>][\s\S]*?<\/iframe>/gi, '') // Remove iframes
    .replace(/javascript:/gi, ''); // Remove javascript: URLs
}

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function NewsArticlePage() {
  const { lang, t, toggle } = useLang();
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/news-detail?slug=${slug}`);
        if (!res.ok) { setError(true); return; }
        const data = await res.json();
        setArticle(data.article);
        setRelated(data.related || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchArticle();
  }, [slug]);

  if (loading) return (
    <div className="news-page">
      <div className="news-loading" style={{ minHeight: '100vh' }}>
        <div className="news-loading-spinner" />
        <p>{t('กำลังโหลด...', 'Loading...')}</p>
      </div>
    </div>
  );

  if (error || !article) return (
    <div className="news-page">
      <div className="news-empty" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
        <p>{t('ไม่พบบทความนี้', 'Article not found')}</p>
        <Link href="/news" className="article-back-link">{t('← กลับหน้าข่าวสาร', '← Back to News')}</Link>
      </div>
    </div>
  );

  const contentHtml = sanitizeHtml(renderContent(lang === 'th' ? article.contentTh : article.contentEn));

  return (
    <div className="news-page">
      {/* Navigation */}
      <nav className="main-nav" style={{ backgroundColor: 'rgba(4,14,33,0.95)', opacity: 1 }}>
        <div className="nav-inner">
          <div className="nav-links">
            <Link href="/" className="nav-link">{t('หน้าหลัก', 'Home')}</Link>
            <Link href="/news" className="nav-link active">{t('ข่าวสาร', 'News')}</Link>
            <Link href="/download" className="nav-link">{t('ดาวน์โหลด', 'Download')}</Link>
          </div>
          <div className="nav-actions">
            <Link href="/event" className="nav-cta">{t('ลงทะเบียน', 'Register')}</Link>
            <button className="nav-lang" onClick={toggle}>{lang === 'th' ? 'EN' : 'TH'}</button>
          </div>
        </div>
      </nav>

      <main className="article-main">
        {/* Breadcrumbs */}
        <nav className="article-breadcrumbs">
          <Link href="/">{t('หน้าหลัก', 'Home')}</Link>
          <span>›</span>
          <Link href="/news">{t('ข่าวสาร', 'News')}</Link>
          <span>›</span>
          <span className="active">{t(article.titleTh, article.titleEn)}</span>
        </nav>

        {/* Article Header */}
        <header className="article-header">
          <span
            className="article-category"
            style={{ background: CATEGORY_COLORS[article.category] || '#5BC0EB' }}
          >
            {article.category?.toUpperCase()}
          </span>
          <h1 className="article-title">{t(article.titleTh, article.titleEn)}</h1>
          <time className="article-date">
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString(
                  lang === 'th' ? 'th-TH' : 'en-US',
                  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
                )
              : ''}
          </time>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="article-featured-image">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.titleEn}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        {contentHtml ? (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <div className="article-content">
            <p className="article-placeholder">
              {t(
                'เนื้อหาบทความนี้กำลังจะมาเร็วๆ นี้ กรุณาติดตามข่าวสารต่อไป!',
                'This article content is coming soon. Stay tuned for more updates!'
              )}
            </p>
          </div>
        )}

        {/* Back Link */}
        <Link href="/news" className="article-back-link">
          {t('← กลับหน้าข่าวสาร', '← Back to News')}
        </Link>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="article-related">
            <h2 className="article-related-title">
              {t('ข่าวสารที่เกี่ยวข้อง', 'Related Articles')}
            </h2>
            <div className="article-related-grid">
              {related.map((r) => (
                <Link key={r.id} href={`/news/${r.slug}`} className="news-article-card">
                  <div className="news-article-thumb">
                    {r.featuredImage ? (
                      <Image src={r.featuredImage.url} alt="" fill className="object-cover" />
                    ) : (
                      <span className="news-article-emoji">{r.emoji || '📰'}</span>
                    )}
                    <div className="news-article-thumb-overlay" />
                  </div>
                  <div className="news-article-body">
                    <h3 className="news-article-title">{t(r.titleTh, r.titleEn)}</h3>
                    <time className="news-article-date">
                      {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString(
                        lang === 'th' ? 'th-TH' : 'en-US',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      ) : ''}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="main-footer">
        <div className="footer-inner">
          <div className="footer-copy">
            <p>© 2026 อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
