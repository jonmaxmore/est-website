'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface NewsArticleData {
  id: string | number;
  slug: string;
  title?: string | null;
  titleEn?: string | null;
  titleTh?: string | null;
  category?: string | null;
  publishedAt?: string | null;
}

export interface NewsSectionData {
  blockType?: 'newsTicker';
  titleEn?: string;
  titleTh?: string;
  featuredArticles?: NewsArticleData[];
}

interface NewsSectionProps {
  data: NewsSectionData;
  news: NewsArticleData[];
}

export default function NewsSection({ data, news }: NewsSectionProps) {
  const { lang: currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  
  const featured = data.featuredArticles && Array.isArray(data.featuredArticles) && data.featuredArticles.length > 0
    ? data.featuredArticles
    : news;

  // Clean Engineering: Removed Mock Array Hardcode
  const displayNews = featured?.length ? featured : [];

  if (displayNews.length === 0) return null; // Graceful empty state

  return (
    <section 
      className="k-news-section" 
      id="news"
    >
      <div className="k-news-bg-glow" />

      <div className="k-news-container">
        <div className="k-news-header">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="k-news-title"
          >
            {title}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/news" 
              className="k-news-view-all group"
            >
              View All News 
              <span className="k-news-arrow">→</span>
            </Link>
          </motion.div>
        </div>

        <div className="k-news-list">
          {displayNews.slice(0, 3).map((item, idx) => {
            const itemTitle = currentLang === 'en' ? (item.titleEn || item.titleTh) : (item.titleTh || item.titleEn);
            const date = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'th-TH', {
              year: 'numeric', month: 'short', day: 'numeric'
            }) : '';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link 
                  href={`/news/${item.slug}`}
                  className="k-news-card group"
                >
                  <div className="k-news-card-inner">
                    <span className="k-news-category">
                      {item.category || 'News'}
                    </span>
                    <h3 className="k-news-card-title">
                      {itemTitle}
                    </h3>
                  </div>
                  <span className="k-news-date">
                    {date}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
