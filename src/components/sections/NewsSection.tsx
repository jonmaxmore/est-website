'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { CMSNewsArticle } from '@/types/cms';

export default function NewsSection({ data, news }: { data: any, news: CMSNewsArticle[] }) {
  const { lang: currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  const displayNews = news?.length ? news : [
    { id: '1', slug: 'patch-1', titleEn: 'Patch 1.0.4 Update', category: 'Update', publishedAt: '2026-04-01' },
    { id: '2', slug: 'event-1', titleEn: 'Spring Festival Event', category: 'Event', publishedAt: '2026-03-28' },
    { id: '3', slug: 'notice-1', titleEn: 'Server Maintenance', category: 'Notice', publishedAt: '2026-03-25' },
  ] as any[];

  return (
    <section 
      className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden snap-start shrink-0 bg-zinc-950" 
      id="news"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/10 to-transparent pointer-events-none z-0" />

      <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row gap-8 lg:gap-16 items-center relative z-10 py-20 h-full">
        <div className="md:w-1/3 flex flex-col justify-center">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-widest mb-6 drop-shadow-lg"
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
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-white font-bold uppercase tracking-wider text-sm transition-colors group"
            >
              View All News 
              <span className="group-hover:translate-x-2 transition-transform">Ã¢â€ â€™</span>
            </Link>
          </motion.div>
        </div>

        <div className="md:w-2/3 flex flex-col gap-3 md:gap-4 w-full max-w-2xl">
          {displayNews.slice(0, 3).map((item, idx) => {
            const itemTitle = currentLang === 'en' ? (item.titleEn || item.title) : (item.titleTh || item.title);
            const date = new Date(item.publishedAt).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'th-TH', {
              year: 'numeric', month: 'short', day: 'numeric'
            });

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
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-black/60 backdrop-blur-sm border border-white/10 hover:border-indigo-500/50 rounded-xl transition-all hover:bg-zinc-900/80"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                    <span className="px-3 py-1 bg-white/5 text-gray-300 group-hover:text-white group-hover:bg-indigo-500/20 text-xs font-bold uppercase tracking-wider rounded-sm w-fit transition-colors">
                      {item.category || 'News'}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-gray-300 group-hover:text-white transition-colors line-clamp-1">
                      {itemTitle}
                    </h3>
                  </div>
                  <span className="text-gray-500 text-xs md:text-sm mt-3 sm:mt-0 whitespace-nowrap font-mono">
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
