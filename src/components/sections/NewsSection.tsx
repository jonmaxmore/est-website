'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RevealSection from '@/components/ui/RevealSection';
import { Calendar, RefreshCw, Video, Megaphone, ArrowRight } from 'lucide-react';
import type { CMSNewsArticle, CMSNewsSectionConfig } from '@/types/cms';

/* ── Category metadata ── */
const CATEGORY_META: Record<string, {
  gradient: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  event:        { gradient: 'from-amber-500/20 to-amber-700/10', color: '#F5A623', Icon: Calendar },
  update:       { gradient: 'from-sky-500/20 to-sky-700/10',     color: '#5BC0EB', Icon: RefreshCw },
  media:        { gradient: 'from-purple-500/20 to-purple-700/10', color: '#9B59B6', Icon: Video },
  announcement: { gradient: 'from-emerald-500/20 to-emerald-700/10', color: '#2ECC71', Icon: Megaphone },
};

const FILTER_TABS = [
  { value: 'all',          labelEn: 'All',     labelTh: 'ทั้งหมด' },
  { value: 'event',        labelEn: 'Events',  labelTh: 'กิจกรรม' },
  { value: 'update',       labelEn: 'Updates', labelTh: 'อัปเดต' },
  { value: 'media',        labelEn: 'Media',   labelTh: 'สื่อ' },
  { value: 'announcement', labelEn: 'News',    labelTh: 'ประกาศ' },
] as const;

/* ── Animation variants ── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.97,
    transition: { duration: 0.3 },
  },
};

/* ── Featured News Card ── */
function FeaturedNewsCard({ item, meta }: {
  item: { slug: string; title: string; tag: string; date: string; thumb: string | null; category: string };
  meta: typeof CATEGORY_META[string];
}) {
  const inner = (
    <motion.div variants={cardVariants} layout>
      <Card className={cn(
        'group/featured relative overflow-hidden border-0 rounded-2xl',
        'bg-gradient-to-br from-white/[0.06] to-white/[0.02]',
        'ring-1 ring-white/10 hover:ring-amber-500/30',
        'transition-all duration-500 ease-out',
        'hover:shadow-[0_8px_40px_rgba(245,166,35,0.15)]',
        'p-0'
      )}>
        {/* Image area — cinematic ratio for featured */}
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          {item.thumb ? (
            <Image
              src={item.thumb}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover/featured:scale-105"
            />
          ) : (
            <div className={cn(
              'flex h-full w-full items-center justify-center bg-gradient-to-br',
              meta.gradient,
              'bg-[rgba(15,15,25,0.8)]'
            )}>
              <meta.Icon size={64} className="text-white/30" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badge on image */}
          <div className="absolute top-4 left-4">
            <Badge
              className={cn(
                'h-6 rounded-md px-3 text-[0.65rem] font-bold uppercase tracking-wider border-0',
              )}
              style={{ backgroundColor: meta.color, color: '#0f0f19' }}
            >
              {item.tag}
            </Badge>
          </div>

          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-2 drop-shadow-lg group-hover/featured:text-amber-200 transition-colors duration-300">
              {item.title}
            </h3>
            <time className="text-sm text-white/60 font-body">{item.date}</time>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return item.slug ? (
    <Link href={`/news/${item.slug}`} className="block">
      {inner}
    </Link>
  ) : inner;
}

/* ── Regular News Card ── */
function NewsCard({ item, meta }: {
  item: { slug: string; title: string; tag: string; date: string; thumb: string | null; category: string };
  meta: typeof CATEGORY_META[string];
}) {
  const inner = (
    <motion.div variants={cardVariants} layout>
      <Card className={cn(
        'group/news-card relative overflow-hidden border-0 rounded-xl h-full',
        'bg-gradient-to-br from-white/[0.05] to-white/[0.02]',
        'ring-1 ring-white/[0.08] hover:ring-white/20',
        'backdrop-blur-sm',
        'transition-all duration-500 ease-out',
        'hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        'hover:-translate-y-1',
        'p-0'
      )}>
        {/* Thumbnail */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {item.thumb ? (
            <Image
              src={item.thumb}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover/news-card:scale-105"
            />
          ) : (
            <div className={cn(
              'flex h-full w-full items-center justify-center bg-gradient-to-br',
              meta.gradient,
              'bg-[rgba(15,15,25,0.8)]'
            )}>
              <meta.Icon size={40} className="text-white/25" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Card body */}
        <CardContent className="flex flex-col gap-3 p-4">
          <Badge
            className={cn(
              'h-5 w-fit rounded-md px-2.5 text-[0.6rem] font-bold uppercase tracking-wider border-0',
            )}
            style={{ backgroundColor: meta.color, color: '#0f0f19' }}
          >
            {item.tag}
          </Badge>
          <h3 className="font-display text-base font-medium text-white leading-snug line-clamp-2 group-hover/news-card:text-amber-200 transition-colors duration-300">
            {item.title}
          </h3>
          <time className="text-xs text-white/40 font-body mt-auto">{item.date}</time>
        </CardContent>
      </Card>
    </motion.div>
  );

  return item.slug ? (
    <Link href={`/news/${item.slug}`} className="block">
      {inner}
    </Link>
  ) : inner;
}

/* ── Main Section ── */
// eslint-disable-next-line max-lines-per-function -- Section component with filtering logic
export default function NewsSection({
  news,
  sectionConfig,
}: {
  news: CMSNewsArticle[];
  sectionConfig?: CMSNewsSectionConfig;
}) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<string>('all');

  const items = useMemo(() =>
    news.map((item) => ({
      key: item.id,
      slug: item.slug,
      tag: item.category?.toUpperCase() || 'NEWS',
      title: t(item.titleTh, item.titleEn) || item.titleEn,
      date: item.publishedAt
        ? new Date(item.publishedAt).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : t('เร็ว ๆ นี้', 'Coming Soon'),
      thumb: item.featuredImage,
      category: item.category,
    })),
    [news, t]
  );

  const filteredItems = useMemo(
    () => activeTab === 'all' ? items : items.filter((i) => i.category === activeTab),
    [items, activeTab]
  );

  if (items.length === 0) return null;

  const featured = filteredItems[0];
  const rest = filteredItems.slice(1);

  return (
    <section id="news" className="news-section">
      {/* Background decorations */}
      <div className="news-section-bg" aria-hidden="true">
        <div className="news-section-glow news-section-glow--left" />
        <div className="news-section-glow news-section-glow--right" />
      </div>

      <div className="container-custom relative z-10">
        {/* ── Section Header ── */}
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">
              {sectionConfig
                ? t(sectionConfig.badgeTh, sectionConfig.badgeEn)
                : t('ข่าวล่าสุด', 'LATEST NEWS')}
            </span>
            <h2 className="section-title-gold">
              {sectionConfig
                ? t(sectionConfig.titleTh, sectionConfig.titleEn)
                : t('ข่าวสาร', 'News')}
            </h2>
            <div className="title-ornament">
              <span />
              <span />
              <span />
            </div>
          </div>
        </RevealSection>

        {/* ── Category Filter Tabs ── */}
        <RevealSection delay={0.15}>
          <div className="flex justify-center mt-8 mb-10">
            <Tabs
              defaultValue="all"
              onValueChange={(val: string | number | null) => {
                if (val !== null) setActiveTab(String(val));
              }}
              className="w-full max-w-lg"
            >
              <TabsList
                className={cn(
                  'w-full h-10 rounded-xl',
                  'bg-white/[0.04] ring-1 ring-white/10',
                  'backdrop-blur-md',
                  'p-1'
                )}
              >
                {FILTER_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'rounded-lg text-xs sm:text-sm font-medium px-3 py-1.5',
                      'text-white/50 hover:text-white/80',
                      'data-[selected]:bg-amber-500/20 data-[selected]:text-amber-300',
                      'data-active:bg-amber-500/20 data-active:text-amber-300',
                      'transition-all duration-300',
                      'border-0'
                    )}
                  >
                    {t(tab.labelTh, tab.labelEn)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {/* We manage content outside tabs to control layout */}
              {FILTER_TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="hidden" />
              ))}
            </Tabs>
          </div>
        </RevealSection>

        {/* ── Featured News Card ── */}
        {filteredItems.length > 0 && featured && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`featured-${activeTab}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-6"
            >
              <FeaturedNewsCard
                item={featured}
                meta={CATEGORY_META[featured.category] || CATEGORY_META.event}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── News Cards Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'grid gap-5',
              'grid-cols-1',
              'sm:grid-cols-2',
              'lg:grid-cols-3',
            )}
          >
            {rest.map((item) => (
              <NewsCard
                key={item.key}
                item={item}
                meta={CATEGORY_META[item.category] || CATEGORY_META.event}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-white/30"
          >
            <Calendar size={48} className="mb-4" />
            <p className="text-lg font-display">
              {t('ยังไม่มีข่าวในหมวดนี้', 'No news in this category yet')}
            </p>
          </motion.div>
        )}

        {/* ── View All News Button ── */}
        <RevealSection delay={0.3}>
          <div className="flex justify-center mt-12">
            <Button
              render={<Link href="/news" />}
              variant="outline"
              size="lg"
              className={cn(
                'group/btn relative overflow-hidden',
                'h-11 px-8 rounded-xl',
                'border-amber-500/30 text-amber-300',
                'bg-amber-500/[0.06] hover:bg-amber-500/15',
                'hover:border-amber-400/50 hover:text-amber-200',
                'transition-all duration-300',
                'font-medium tracking-wide',
              )}
            >
              {t('ดูข่าวทั้งหมด', 'View All News')}
              <ArrowRight
                size={16}
                className="ml-2 transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </Button>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
