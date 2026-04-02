'use client';

import { useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Megaphone,
  RefreshCw,
  Video,
  Wrench,
} from 'lucide-react';
import Image from 'next/image';
import CmsLink from '@/components/ui/CmsLink';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { formatLocalizedDate } from '@/lib/format-date';
import { useLang } from '@/lib/lang-context';
import { NEWS_CATEGORY_META, NEWS_FILTERS, type NewsFilterKey } from '@/lib/news-categories';
import { hasReliableNewsImage, pickNewsSummary } from '@/lib/news-content';
import type { CMSNewsArticle, CMSNewsSectionConfig } from '@/types/cms';

type NewsCardItem = {
  key: number;
  slug: string;
  title: string;
  summary: string;
  tag: string;
  category: string;
  date: string;
  leadImage: string | null;
  thumbImage: string | null;
  imageAlt: string;
  hasReliableImage: boolean;
  href: string;
  openInNewTab: boolean;
};

type NewsCopy = {
  badgeText: string;
  titleText: string;
  introCopy: string;
  moreStoriesLabel: string;
  readFullLabel: string;
  viewAllLabel: string;
  emptyLabel: string;
  singleStoryLabel: string;
};

function truncateUiText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

const CATEGORY_META: Record<string, {
  color: string;
  labelEn: string;
  labelTh: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
}> = {
  event: { ...NEWS_CATEGORY_META.event, Icon: Calendar },
  update: { ...NEWS_CATEGORY_META.update, Icon: RefreshCw },
  media: { ...NEWS_CATEGORY_META.media, Icon: Video },
  announcement: { ...NEWS_CATEGORY_META.announcement, Icon: Megaphone },
  maintenance: { ...NEWS_CATEGORY_META.maintenance, Icon: Wrench },
};

function buildNewsItem(
  item: CMSNewsArticle,
  lang: 'th' | 'en',
  t: (th: string, en: string) => string,
): NewsCardItem {
  const meta = CATEGORY_META[item.category] || CATEGORY_META.event;
  const alt = item.featuredImage?.alt || t(item.titleTh, item.titleEn) || item.titleEn;
  const title = truncateUiText(t(item.titleTh, item.titleEn) || item.titleEn, 90);
  const summary = truncateUiText(
    pickNewsSummary(lang, item.summaryTh, item.summaryEn, meta.labelTh, meta.labelEn),
    180,
  );

  return {
    key: item.id,
    slug: item.slug,
    title,
    summary,
    tag: t(meta.labelTh, meta.labelEn),
    category: item.category,
    date: item.publishedAt
      ? formatLocalizedDate(item.publishedAt, lang, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      : t('เร็ว ๆ นี้', 'Coming soon'),
    leadImage: item.featuredImage?.heroUrl || item.featuredImage?.url || null,
    thumbImage: item.featuredImage?.cardUrl || item.featuredImage?.thumbnailUrl || item.featuredImage?.url || null,
    imageAlt: alt,
    hasReliableImage: hasReliableNewsImage(item.featuredImage),
    href: item.href || `/news/${item.slug}`,
    openInNewTab: Boolean(item.openInNewTab),
  };
}

function buildNewsCopy(
  sectionConfig: CMSNewsSectionConfig | undefined,
  t: (th: string, en: string) => string,
): NewsCopy {
  return {
    badgeText: sectionConfig
      ? t(sectionConfig.badgeTh, sectionConfig.badgeEn)
      : t('ข่าวล่าสุด', 'Latest news'),
    titleText: sectionConfig
      ? t(sectionConfig.titleTh, sectionConfig.titleEn)
      : t('ข่าวสารและอัปเดต', 'News and updates'),
    introCopy: sectionConfig?.introEn || sectionConfig?.introTh
      ? t(sectionConfig.introTh || '', sectionConfig.introEn || '')
      : t(
        'สรุปข่าวเด่น กิจกรรม และประกาศสำคัญในจังหวะที่อ่านง่ายขึ้นสำหรับหน้าแรก',
        'Latest announcements, events, and patch notes.',
      ),
    moreStoriesLabel: t('ข่าวรอง', 'More stories'),
    readFullLabel: t('อ่านรายละเอียด', 'Read full update'),
    viewAllLabel: t('ดูข่าวทั้งหมด', 'View all news'),
    emptyLabel: t('ยังไม่มีข่าวในหมวดนี้', 'No news in this category yet'),
    singleStoryLabel: t(
      'มุมมองนี้มีข่าวเด่นเพียงรายการเดียวในตอนนี้',
      'This view currently has one featured story.',
    ),
  };
}

function FeaturedArticle({
  item,
  ctaLabel,
}: {
  item: NewsCardItem;
  ctaLabel: string;
}) {
  const meta = CATEGORY_META[item.category] || CATEGORY_META.event;

  return (
    <CmsLink
      href={item.href}
      openInNewTab={item.openInNewTab}
      className={`home-news__featured ${item.hasReliableImage ? '' : 'is-textOnly'}`.trim()}
    >
      <div className="home-news__featuredCopy">
        <div className="home-news__featuredTopline">
          <span className="home-news__badge" style={{ backgroundColor: meta.color, color: '#08111f' }}>
            {item.tag}
          </span>
          <span className="home-news__itemDate">{item.date}</span>
        </div>

        <div className="home-news__featuredBody">
          <h3 className="home-news__featuredTitle">{item.title}</h3>
          <p className="home-news__featuredSummary">{item.summary}</p>
        </div>

        <span className="home-news__featuredCta">
          {ctaLabel}
          <ArrowRight size={16} />
        </span>
      </div>

      {item.hasReliableImage ? (
        <div className="home-news__featuredMedia">
          <Image
            src={item.leadImage as string}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 960px) 100vw, 24rem"
            unoptimized={isCmsMediaUrl(item.leadImage as string)}
          />
        </div>
      ) : (
        <div className="home-news__featuredWatermark" aria-hidden="true">
          <meta.Icon size={76} />
        </div>
      )}
    </CmsLink>
  );
}

function DispatchArticle({
  item,
  active,
  onSelect,
}: {
  item: NewsCardItem;
  active: boolean;
  onSelect: (slug: string) => void;
}) {
  const meta = CATEGORY_META[item.category] || CATEGORY_META.event;

  return (
    <button
      type="button"
      className={`home-news__dispatchItem ${active ? 'is-active' : ''}`.trim()}
      onClick={() => onSelect(item.slug)}
    >
      <span className="home-news__dispatchThumb" aria-hidden="true">
        {item.hasReliableImage && item.thumbImage ? (
          <Image
            src={item.thumbImage}
            alt=""
            fill
            sizes="(max-width: 960px) 6rem, 5.5rem"
            unoptimized={isCmsMediaUrl(item.thumbImage)}
          />
        ) : (
          <meta.Icon size={26} />
        )}
      </span>

      <span className="home-news__dispatchBody">
        <span className="home-news__dispatchMeta">
          <span className="home-news__badge" style={{ backgroundColor: meta.color, color: '#08111f' }}>
            {item.tag}
          </span>
          <span className="home-news__itemDate">{item.date}</span>
        </span>
        <span className="home-news__dispatchTitle">{item.title}</span>
        <span className="home-news__dispatchSummary">{item.summary}</span>
      </span>
    </button>
  );
}

function NewsHeader({
  copy,
  activeTab,
  onSelectTab,
}: {
  copy: NewsCopy;
  activeTab: NewsFilterKey;
  onSelectTab: (tab: NewsFilterKey) => void;
}) {
  const { t } = useLang();

  return (
    <div className="home-news__header">
      <div className="home-news__headerCopy">
        <span className="home-kicker">{copy.badgeText}</span>
        <h2 className="home-section-title">{copy.titleText}</h2>
        <p className="home-section-copy">{copy.introCopy}</p>
      </div>

      <div className="home-news__headerMeta">
        <div className="home-news__filters" role="tablist" aria-label="Filter news">
          {NEWS_FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`home-news__filter ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => onSelectTab(tab.key)}
            >
              {t(tab.labelTh, tab.labelEn)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsBody({
  activeTab,
  featured,
  dispatchItems,
  copy,
  onSelectStory,
}: {
  activeTab: NewsFilterKey;
  featured?: NewsCardItem;
  dispatchItems: NewsCardItem[];
  copy: NewsCopy;
  onSelectStory: (slug: string) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        className="home-news__body"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="home-news__stage">
          {featured ? <FeaturedArticle item={featured} ctaLabel={copy.readFullLabel} /> : null}

          <aside className="home-news__dispatch">
            <div className="home-news__dispatchHeader">
              <span>{copy.moreStoriesLabel}</span>
            </div>

            <div className="home-news__dispatchList">
              {dispatchItems.map((item) => (
                <DispatchArticle
                  key={item.key}
                  item={item}
                  active={featured?.slug === item.slug}
                  onSelect={onSelectStory}
                />
              ))}

              {dispatchItems.length === 0 ? (
                <div className="home-news__dispatchEmpty">{copy.singleStoryLabel}</div>
              ) : null}
            </div>
          </aside>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function NewsSection({
  news,
  sectionConfig,
}: {
  news: CMSNewsArticle[];
  sectionConfig?: CMSNewsSectionConfig;
}) {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState<NewsFilterKey>('all');
  const [selectedSlugs, setSelectedSlugs] = useState<Partial<Record<NewsFilterKey, string>>>({});

  const items = news.map((item) => buildNewsItem(item, lang, t));
  if (items.length === 0) return null;

  const copy = buildNewsCopy(sectionConfig, t);
  const filteredItems = activeTab === 'all'
    ? items
    : items.filter((item) => item.category === activeTab);
  const featured = filteredItems.find((item) => item.slug === selectedSlugs[activeTab]) || filteredItems[0];
  const dispatchItems = filteredItems
    .filter((item) => item.slug !== featured?.slug)
    .slice(0, 4);

  return (
    <section id="news" className="home-news">
      {sectionConfig?.bgImage?.url ? (
        <div className="home-news__bg" aria-hidden="true">
          <Image
            src={sectionConfig.bgImage.url}
            alt=""
            fill
            priority={false}
            className="object-cover"
            unoptimized={isCmsMediaUrl(sectionConfig.bgImage.url)}
          />
        </div>
      ) : null}

      <div className="home-news__veil" />

      <motion.div
        className="home-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <NewsHeader copy={copy} activeTab={activeTab} onSelectTab={setActiveTab} />

        {filteredItems.length === 0 ? (
          <div className="home-news__empty">{copy.emptyLabel}</div>
        ) : (
          <NewsBody
            activeTab={activeTab}
            featured={featured}
            dispatchItems={dispatchItems}
            copy={copy}
            onSelectStory={(slug) => {
              setSelectedSlugs((current) => ({ ...current, [activeTab]: slug }));
            }}
          />
        )}

        <div className="home-news__footer">
          <CmsLink href="/news" className="home-button home-button--ghost">
            {copy.viewAllLabel}
            <ArrowRight size={16} />
          </CmsLink>
        </div>
      </motion.div>
    </section>
  );
}
