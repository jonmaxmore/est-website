'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Megaphone, Newspaper, RefreshCw, Video, Wrench } from 'lucide-react';
import Image from 'next/image';
import CmsLink from '@/components/ui/CmsLink';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { formatLocalizedDate } from '@/lib/format-date';
import { useLang } from '@/lib/lang-context';
import { NEWS_CATEGORY_META, NEWS_FILTERS, type NewsFilterKey } from '@/lib/news-categories';
import { hasReliableNewsImage, pickNewsSummary } from '@/lib/news-content';
import type { CMSNewsImage, CMSNewsPageConfig } from '@/types/cms';

interface NewsArticle {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  summaryEn?: string | null;
  summaryTh?: string | null;
  featuredImage: CMSNewsImage | null;
  publishedAt: string;
  href?: string;
  openInNewTab?: boolean;
}

interface NewsApiResponse {
  articles?: NewsArticle[];
  pagination?: {
    totalDocs?: number;
  };
}

type TranslateFn = (th: string, en: string) => string;

const CATEGORY_ICONS = {
  event: Calendar,
  update: RefreshCw,
  media: Video,
  announcement: Megaphone,
  maintenance: Wrench,
} as const;

function TimelineArticle({
  article,
  lang,
  t,
}: {
  article: NewsArticle;
  lang: 'th' | 'en';
  t: TranslateFn;
}) {
  const Icon = CATEGORY_ICONS[article.category as keyof typeof CATEGORY_ICONS] || Newspaper;
  const category = NEWS_CATEGORY_META[article.category as keyof typeof NEWS_CATEGORY_META] || NEWS_CATEGORY_META.announcement;
  const title = t(article.titleTh, article.titleEn) || article.titleEn;
  const summary = pickNewsSummary(lang, article.summaryTh, article.summaryEn, category.labelTh, category.labelEn);
  const image = hasReliableNewsImage(article.featuredImage)
    ? article.featuredImage?.cardUrl || article.featuredImage?.thumbnailUrl || article.featuredImage?.url
    : null;

  return (
    <CmsLink href={article.href || `/news/${article.slug}`} openInNewTab={article.openInNewTab} className="news-rail__item">
      <div className="news-rail__itemMedia">
        {image ? (
          <Image
            src={image}
            alt={article.featuredImage?.alt || title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1180px) 10rem, 8rem"
            className="object-cover"
            unoptimized={isCmsMediaUrl(image)}
          />
        ) : (
          <span className="news-rail__itemIcon" style={{ color: category.color }}>
            <Icon size={26} />
          </span>
        )}
      </div>

      <div className="news-rail__itemBody">
        <div className="news-rail__itemMeta">
          <span className="news-chip" style={{ background: category.color }}>
            {t(category.labelTh, category.labelEn)}
          </span>
          <time>
            {article.publishedAt
              ? formatLocalizedDate(article.publishedAt, lang, {
                day: 'numeric',
                month: lang === 'th' ? 'short' : 'long',
                year: 'numeric',
              })
              : t('à¹€à¸£à¹‡à¸§ à¹† à¸™à¸µà¹‰', 'Coming soon')}
          </time>
        </div>
        <h2 className="news-rail__itemTitle">{title}</h2>
        <p className="news-rail__itemSummary">{summary}</p>
      </div>
    </CmsLink>
  );
}

function ArchiveArticle({
  article,
  index,
  lang,
  t,
}: {
  article: NewsArticle;
  index: number;
  lang: 'th' | 'en';
  t: TranslateFn;
}) {
  const category = NEWS_CATEGORY_META[article.category as keyof typeof NEWS_CATEGORY_META] || NEWS_CATEGORY_META.announcement;
  const title = t(article.titleTh, article.titleEn) || article.titleEn;
  const summary = pickNewsSummary(lang, article.summaryTh, article.summaryEn, category.labelTh, category.labelEn);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.38 }}
    >
      <CmsLink href={article.href || `/news/${article.slug}`} openInNewTab={article.openInNewTab} className="news-archive__card">
        <div className="news-archive__meta">
          <span className="news-chip" style={{ background: category.color }}>
            {t(category.labelTh, category.labelEn)}
          </span>
          <time className="news-archive__date">
            {article.publishedAt
              ? formatLocalizedDate(article.publishedAt, lang, {
                day: 'numeric',
                month: lang === 'th' ? 'short' : 'long',
                year: 'numeric',
              })
              : t('à¹€à¸£à¹‡à¸§ à¹† à¸™à¸µà¹‰', 'Coming soon')}
          </time>
        </div>

        <h2 className="news-archive__title">{title}</h2>
        <p className="news-archive__summary">{summary}</p>
        <span className="news-archive__cta">
          {t('à¸­à¹ˆà¸²à¸™à¸•à¹ˆà¸­', 'Read more')}
          <ArrowRight size={16} />
        </span>
      </CmsLink>
    </motion.div>
  );
}

function useNewsFeed(activeCategory: NewsFilterKey) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDocs, setTotalDocs] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNews() {
      setLoading(true);

      try {
        const url = activeCategory === 'all'
          ? '/api/public/news?limit=50'
          : `/api/public/news?limit=50&category=${activeCategory}`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json() as NewsApiResponse;
        setArticles(data.articles || []);
        setTotalDocs(data.pagination?.totalDocs || 0);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setArticles([]);
          setTotalDocs(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => controller.abort();
  }, [activeCategory]);

  return { articles, loading, totalDocs };
}

function hasArchiveCopy(config: CMSNewsPageConfig | null) {
  return Boolean(
    config?.archiveKickerEn || config?.archiveKickerTh
    || config?.archiveTitleEn || config?.archiveTitleTh
    || config?.archiveIntroEn || config?.archiveIntroTh,
  );
}

function NewsHero({
  config,
  activeCategory,
  activeFilter,
  displayedTotalDocs,
  t,
}: {
  config: CMSNewsPageConfig | null;
  activeCategory: NewsFilterKey;
  activeFilter: (typeof NEWS_FILTERS)[number];
  displayedTotalDocs: number;
  t: TranslateFn;
}) {
  const subtitle = config?.subtitleEn || config?.subtitleTh
    ? t(config.subtitleTh || '', config.subtitleEn || '')
    : t(
      'à¸£à¸§à¸¡à¸‚à¹ˆà¸²à¸§ à¸à¸´à¸ˆà¸à¸£à¸£à¸¡ à¸­à¸±à¸›à¹€à¸”à¸•à¸£à¸°à¸šà¸š à¹à¸¥à¸°à¸›à¸£à¸°à¸à¸²à¸¨à¸ªà¸³à¸„à¸±à¸à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¹ƒà¸™à¸¡à¸¸à¸¡à¸¡à¸­à¸‡à¸—à¸µà¹ˆà¸­à¹ˆà¸²à¸™à¸‡à¹ˆà¸²à¸¢à¸‚à¸¶à¹‰à¸™ à¸ˆà¸±à¸”à¸¥à¸³à¸”à¸±à¸šà¸Šà¸±à¸”à¸‚à¸¶à¹‰à¸™ à¹à¸¥à¸°à¸žà¸£à¹‰à¸­à¸¡à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸—à¸±à¹‰à¸‡ desktop à¸à¸±à¸š mobile',
      'All major announcements, events, updates, and maintenance notices in one place, arranged to read comfortably on both desktop and mobile.',
    );

  return (
    <section className="news-hero">
      {config?.backgroundImage?.url ? (
        <div className="news-hero__bg" aria-hidden="true">
          <Image
            src={config.backgroundImage.url}
            alt=""
            fill
            priority
            className="object-cover"
            unoptimized={isCmsMediaUrl(config.backgroundImage.url)}
          />
          <div className="news-hero__bgOverlay" />
        </div>
      ) : null}

      <div className="news-hero__copy">
        <span className="news-hero-kicker">
          {t(config?.badgeTh || '', config?.badgeEn || '')}
        </span>
        <h1 className="news-hero-title">
          {t(config?.titleTh || '', config?.titleEn || '')}
        </h1>
        <p className="news-hero-sub">{subtitle}</p>

        <div className="news-hero__meta" aria-label={t('à¸ªà¸£à¸¸à¸›à¸¡à¸¸à¸¡à¸¡à¸­à¸‡à¸‚à¹ˆà¸²à¸§', 'News view summary')}>
          <div className="news-hero__metaItem">
            <span className="news-hero__metaLabel">{t('à¸‚à¹ˆà¸²à¸§à¸—à¸µà¹ˆà¸žà¸£à¹‰à¸­à¸¡à¸­à¹ˆà¸²à¸™', 'Stories live')}</span>
            <strong className="news-hero__metaValue">{displayedTotalDocs}</strong>
          </div>

          <span className="news-hero__metaDivider" aria-hidden="true" />

          <div className="news-hero__metaItem">
            <span className="news-hero__metaLabel">{t('à¸¡à¸¸à¸¡à¸¡à¸­à¸‡à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™', 'Current view')}</span>
            <strong className="news-hero__metaValue">
              {activeCategory === 'all'
                ? t('à¸‚à¹ˆà¸²à¸§à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”', 'All stories')
                : t(activeFilter.labelTh, activeFilter.labelEn)}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsCategoryFilters({
  activeCategory,
  onChange,
  t,
}: {
  activeCategory: NewsFilterKey;
  onChange: (category: NewsFilterKey) => void;
  t: TranslateFn;
}) {
  return (
    <div className="news-filters">
      {NEWS_FILTERS.map((category) => (
        <button
          key={category.key}
          className={`news-filter-btn ${activeCategory === category.key ? 'active' : ''}`}
          onClick={() => onChange(category.key)}
        >
          {t(category.labelTh, category.labelEn)}
        </button>
      ))}
    </div>
  );
}

function FeaturedStory({
  article,
  lang,
  t,
}: {
  article: NewsArticle;
  lang: 'th' | 'en';
  t: TranslateFn;
}) {
  const category = NEWS_CATEGORY_META[article.category as keyof typeof NEWS_CATEGORY_META] || NEWS_CATEGORY_META.announcement;
  const title = t(article.titleTh, article.titleEn) || article.titleEn;
  const summary = pickNewsSummary(lang, article.summaryTh, article.summaryEn, category.labelTh, category.labelEn);
  const image = hasReliableNewsImage(article.featuredImage)
    ? article.featuredImage?.heroUrl || article.featuredImage?.url || null
    : null;

  return (
    <motion.div
      className="news-featured"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <CmsLink href={article.href || `/news/${article.slug}`} openInNewTab={article.openInNewTab} className="news-featured__link">
        <div className="news-featured__media">
          {image ? (
            <Image
              src={image}
              alt={article.featuredImage?.alt || title}
              fill
              priority
              sizes="(max-width: 960px) 100vw, 62vw"
              className="object-cover"
              unoptimized={isCmsMediaUrl(image)}
            />
          ) : (
            <div className="news-featured__fallback">
              <Newspaper size={52} />
            </div>
          )}
          <div className="news-featured__overlay" />
        </div>

        <div className="news-featured__body">
          <span className="news-chip" style={{ background: category.color }}>
            {t(category.labelTh, category.labelEn)}
          </span>

          <h2 className="news-featured__title">{title}</h2>
          <p className="news-featured__summary">{summary}</p>

          <div className="news-featured__meta">
            <time>
              {article.publishedAt
                ? formatLocalizedDate(article.publishedAt, lang, {
                  day: 'numeric',
                  month: lang === 'th' ? 'short' : 'long',
                  year: 'numeric',
                })
                : t('à¹€à¸£à¹‡à¸§ à¹† à¸™à¸µà¹‰', 'Coming soon')}
            </time>

            <span className="news-featured__cta">
              {t('à¸­à¹ˆà¸²à¸™à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”', 'Read full update')}
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </CmsLink>
    </motion.div>
  );
}

function NewsRail({
  activeCategory,
  activeFilter,
  articles,
  lang,
  t,
}: {
  activeCategory: NewsFilterKey;
  activeFilter: (typeof NEWS_FILTERS)[number];
  articles: NewsArticle[];
  lang: 'th' | 'en';
  t: TranslateFn;
}) {
  return (
    <aside className="news-rail">
      <div className="news-rail__header">
        <span>{t('à¸¥à¸³à¸”à¸±à¸šà¸‚à¹ˆà¸²à¸§à¸¥à¹ˆà¸²à¸ªà¸¸à¸”', 'Latest stream')}</span>
        <p>
          {activeCategory === 'all'
            ? t('à¹€à¸£à¸·à¹ˆà¸­à¸‡à¸–à¸±à¸”à¸ˆà¸²à¸à¸‚à¹ˆà¸²à¸§à¹€à¸”à¹ˆà¸™à¸—à¸µà¹ˆà¸„à¸§à¸£à¸­à¹ˆà¸²à¸™à¸•à¹ˆà¸­', 'The next stories to read after the featured update.')
            : t(`à¸‚à¹ˆà¸²à¸§${activeFilter.labelTh}à¸—à¸µà¹ˆà¸„à¸±à¸”à¸¡à¸²à¹ƒà¸™à¸¡à¸¸à¸¡à¸¡à¸­à¸‡à¸™à¸µà¹‰`, `Selected ${activeFilter.labelEn.toLowerCase()} stories in this view.`)}
        </p>
      </div>

      <div className="news-rail__list">
        {articles.map((article) => (
          <TimelineArticle key={article.id} article={article} lang={lang} t={t} />
        ))}

        {articles.length === 0 ? (
          <div className="news-rail__empty">
            {t(
              'à¸•à¸­à¸™à¸™à¸µà¹‰à¸¡à¸µà¸‚à¹ˆà¸²à¸§à¹ƒà¸™à¸¡à¸¸à¸¡à¸¡à¸­à¸‡à¸™à¸µà¹‰à¹€à¸žà¸µà¸¢à¸‡à¸Šà¸´à¹‰à¸™à¹€à¸”à¹ˆà¸™à¹€à¸”à¸µà¸¢à¸§ à¸à¸”à¸­à¹ˆà¸²à¸™à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸”à¹‰à¸²à¸™à¸‹à¹‰à¸²à¸¢à¹„à¸”à¹‰à¸—à¸±à¸™à¸—à¸µ',
              'This view currently has one featured story. Open the feature to read the full update.',
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function NewsStage({
  activeCategory,
  activeFilter,
  articles,
  lang,
  t,
}: {
  activeCategory: NewsFilterKey;
  activeFilter: (typeof NEWS_FILTERS)[number];
  articles: NewsArticle[];
  lang: 'th' | 'en';
  t: TranslateFn;
}) {
  const featuredArticle = articles[0] || null;
  const railArticles = articles.slice(1, 4);

  return (
    <div className="news-stage">
      {featuredArticle ? <FeaturedStory article={featuredArticle} lang={lang} t={t} /> : null}
      <NewsRail
        activeCategory={activeCategory}
        activeFilter={activeFilter}
        articles={railArticles}
        lang={lang}
        t={t}
      />
    </div>
  );
}

function NewsArchive({
  config,
  articles,
  lang,
  t,
}: {
  config: CMSNewsPageConfig | null;
  articles: NewsArticle[];
  lang: 'th' | 'en';
  t: TranslateFn;
}) {
  if (articles.length === 0) return null;

  const showHeader = hasArchiveCopy(config);

  return (
    <section className={`news-archive ${showHeader ? '' : 'news-archive--minimal'}`.trim()}>
      {showHeader ? (
        <div className="news-archive__header">
          <div>
            <span className="news-archive__kicker">
              {t(config?.archiveKickerTh || '', config?.archiveKickerEn || '')}
            </span>
            <h2 className="news-archive__heading">
              {t(config?.archiveTitleTh || '', config?.archiveTitleEn || '')}
            </h2>
          </div>
          <p className="news-archive__intro">
            {t(config?.archiveIntroTh || '', config?.archiveIntroEn || '')}
          </p>
        </div>
      ) : null}

      <div className="news-archive__grid">
        {articles.map((article, index) => (
          <ArchiveArticle key={article.id} article={article} index={index} lang={lang} t={t} />
        ))}
      </div>
    </section>
  );
}

export default function NewsPage() {
  const { lang, t } = useLang();
  const { settings } = useSiteSettings();
  const [activeCategory, setActiveCategory] = useState<NewsFilterKey>('all');
  const { articles, loading, totalDocs } = useNewsFeed(activeCategory);
  const newsPage = (settings?.newsPage as CMSNewsPageConfig | undefined) || null;
  const activeFilter = NEWS_FILTERS.find((category) => category.key === activeCategory) || NEWS_FILTERS[0];
  const displayedTotalDocs = totalDocs > 0 ? totalDocs : articles.length;
  const archiveArticles = articles.slice(4);

  return (
    <div className="landing-page news-page">
      
      <main className="news-main" style={{ paddingTop: '5rem' }}>
        <NewsHero
          config={newsPage}
          activeCategory={activeCategory}
          activeFilter={activeFilter}
          displayedTotalDocs={displayedTotalDocs}
          t={t}
        />

        <NewsCategoryFilters
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          t={t}
        />

        {loading ? (
          <div className="news-loading">
            <div className="news-loading-spinner" />
            <p>{t('à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...', 'Loading...')}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="news-empty">
            <p>{t('à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£à¹ƒà¸™à¸«à¸¡à¸§à¸”à¸™à¸µà¹‰', 'No articles in this category yet')}</p>
          </div>
        ) : (
          <>
            <NewsStage
              activeCategory={activeCategory}
              activeFilter={activeFilter}
              articles={articles}
              lang={lang}
              t={t}
            />
            <NewsArchive config={newsPage} articles={archiveArticles} lang={lang} t={t} />
          </>
        )}
      </main>

      
    </div>
  );
}
