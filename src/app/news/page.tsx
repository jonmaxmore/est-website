'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import { Calendar, RefreshCw, Video, Megaphone, Wrench, Newspaper } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';

/* ═══════════════════════════════════════════════════
   NEWS LISTING PAGE — /news
   CMS-driven, filterable by category, dark fantasy theme
   ═══════════════════════════════════════════════════ */

interface NewsArticle {
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

const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  event: <Calendar size={32} />,
  update: <RefreshCw size={32} />,
  media: <Video size={32} />,
  maintenance: <Wrench size={32} />,
  announcement: <Megaphone size={32} />,
};

const CATEGORIES = [
  { key: 'all', labelTh: 'ทั้งหมด', labelEn: 'All' },
  { key: 'event', labelTh: 'กิจกรรม', labelEn: 'Event' },
  { key: 'update', labelTh: 'อัพเดต', labelEn: 'Update' },
  { key: 'media', labelTh: 'มีเดีย', labelEn: 'Media' },
  { key: 'announcement', labelTh: 'ประกาศ', labelEn: 'Announcement' },
  { key: 'maintenance', labelTh: 'บำรุงรักษา', labelEn: 'Maintenance' },
];

export default function NewsPage() {
  const { lang, t } = useLang();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [footer, setFooter] = useState({
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data?.site?.footer) setFooter(data.site.footer);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const url = activeCategory === 'all'
          ? '/api/news?limit=50'
          : `/api/news?limit=50&category=${activeCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        setArticles(data.articles || []);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [activeCategory]);

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main className="news-main" style={{ paddingTop: '5rem' }}>
        {/* Hero */}
        <section className="news-hero">
          <h1 className="news-hero-title">{t('ข่าวสารและประกาศ', 'News & Announcements')}</h1>
          <p className="news-hero-sub">{t(
            'ติดตามข่าวสาร กิจกรรม และอัพเดตล่าสุดจาก Eternal Tower Saga',
            'Stay updated with the latest news, events, and updates from Eternal Tower Saga'
          )}</p>
        </section>

        {/* Category Filter */}
        <div className="news-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`news-filter-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {t(cat.labelTh, cat.labelEn)}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="news-loading">
            <div className="news-loading-spinner" />
            <p>{t('กำลังโหลด...', 'Loading...')}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="news-empty">
            <p>{t('ยังไม่มีข่าวสารในหมวดนี้', 'No articles in this category yet')}</p>
          </div>
        ) : (
          <div className="news-articles-grid">
            {articles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link href={`/news/${article.slug}`} className="news-article-card">
                  <div className="news-article-thumb">
                    {article.featuredImage ? (
                      <Image
                        src={article.featuredImage.url}
                        alt={article.featuredImage.alt || ''}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="news-article-category-icon" style={{ color: CATEGORY_COLORS[article.category] || '#5BC0EB' }}>
                        {CATEGORY_ICONS[article.category] || <Newspaper size={32} />}
                      </span>
                    )}
                    <div className="news-article-thumb-overlay" />
                    <span
                      className="news-article-badge"
                      style={{ background: CATEGORY_COLORS[article.category] || '#5BC0EB' }}
                    >
                      {article.category?.toUpperCase()}
                    </span>
                  </div>
                  <div className="news-article-body">
                    <h2 className="news-article-title">
                      {t(article.titleTh, article.titleEn)}
                    </h2>
                    <time className="news-article-date">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(
                            lang === 'th' ? 'th-TH' : 'en-US',
                            { day: 'numeric', month: lang === 'th' ? 'short' : 'long', year: 'numeric' }
                          )
                        : t('เร็วๆ นี้', 'Coming Soon')}
                    </time>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
