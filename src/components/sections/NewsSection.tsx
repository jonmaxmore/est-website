'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import RevealSection from '@/components/ui/RevealSection';
import { CATEGORY_COLORS } from '@/components/ui/StoreIcons';

interface CMSNews {
  id: number;
  titleEn: string;
  titleTh: string;
  slug: string;
  category: string;
  publishDate: string;
  featuredImage: string | null;
}

/* Category placeholder images — visually distinct gradient cards instead of emoji */
const CATEGORY_PLACEHOLDERS: Record<string, { gradient: string; icon: string }> = {
  event: { gradient: 'linear-gradient(135deg, #F5A623 0%, #E8941A 50%, #D4821A 100%)', icon: '🎉' },
  update: { gradient: 'linear-gradient(135deg, #5BC0EB 0%, #3A9BD5 50%, #2B7FC9 100%)', icon: '🔄' },
  media: { gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 50%, #7D3C98 100%)', icon: '🎬' },
  maintenance: { gradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 50%, #A93226 100%)', icon: '🔧' },
  announcement: { gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 50%, #219A52 100%)', icon: '📢' },
};

interface NewsSectionConfig {
  badgeEn: string; badgeTh: string;
  titleEn: string; titleTh: string;
}

export default function NewsSection({ news, sectionConfig }: { news: CMSNews[]; sectionConfig?: NewsSectionConfig }) {
  const { t } = useLang();

  const items =
    news.length > 0
      ? news.map((item, i) => ({
          key: item.id,
          slug: item.slug,
          tag: item.category?.toUpperCase() || 'NEWS',
          color: CATEGORY_COLORS[item.category] || '#5BC0EB',
          title: t(item.titleTh, item.titleEn) || item.titleEn,
          date: item.publishDate
            ? new Date(item.publishDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Coming Soon',
          thumb: item.featuredImage,
          category: item.category,
          delay: i * 0.1,
        }))
      : [
          { key: 1, slug: '', tag: 'EVENT', color: '#F5A623', title: t('เปิดลงทะเบียนล่วงหน้าแล้ว!', 'Pre-registration is now open!'), date: '16 มี.ค. 2026', thumb: null, category: 'event', delay: 0 },
          { key: 2, slug: '', tag: 'UPDATE', color: '#5BC0EB', title: t('เผยเนื้อเรื่องซีซั่นแรก', 'Season 1 Story Revealed'), date: 'Coming Soon', thumb: null, category: 'update', delay: 0.1 },
          { key: 3, slug: '', tag: 'MEDIA', color: '#9B59B6', title: t('ตัวอย่างเกมเพลย์แรก', 'First Gameplay Trailer'), date: 'Coming Soon', thumb: null, category: 'media', delay: 0.2 },
        ];

  return (
    <section className="section-news">
      <div className="container-custom">
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">{sectionConfig ? t(sectionConfig.badgeTh, sectionConfig.badgeEn) : 'LATEST NEWS'}</span>
            <h2 className="section-title-gold">{sectionConfig ? t(sectionConfig.titleTh, sectionConfig.titleEn) : t('ข่าวสาร', 'News')}</h2>
            <div className="title-ornament"><span /><span /><span /></div>
          </div>
        </RevealSection>

        <div className="news-grid">
          {items.map((item) => {
            const placeholder = CATEGORY_PLACEHOLDERS[item.category] || CATEGORY_PLACEHOLDERS.event;
            const CardContent = (
              <motion.article className="news-card" whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
                <div className="news-card-thumb">
                  {item.thumb ? (
                    <Image src={item.thumb} alt="" fill className="object-cover" />
                  ) : (
                    <div className="news-card-placeholder" style={{ background: placeholder.gradient }}>
                      <span className="news-card-placeholder-icon">{placeholder.icon}</span>
                      <div className="news-card-placeholder-pattern" />
                    </div>
                  )}
                  <div className="news-card-thumb-overlay" />
                </div>
                <div className="news-card-body">
                  <span className="news-card-tag" style={{ background: item.color }}>{item.tag}</span>
                  <h3 className="news-card-title">{item.title}</h3>
                  <time className="news-card-date">{item.date}</time>
                </div>
              </motion.article>
            );

            return (
              <RevealSection key={item.key} delay={item.delay}>
                {item.slug ? (
                  <Link href={`/news/${item.slug}`} className="news-card-link">
                    {CardContent}
                  </Link>
                ) : (
                  CardContent
                )}
              </RevealSection>
            );
          })}
        </div>

        {/* View All News Button */}
        <RevealSection delay={0.3}>
          <div className="news-view-all">
            <Link href="/news" className="news-view-all-btn">
              {t('ดูข่าวทั้งหมด', 'View All News')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
