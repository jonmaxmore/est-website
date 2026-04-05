'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';

export interface GameFeatureItem {
  id?: string | number;
  titleEn?: string | null;
  titleTh?: string | null;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  icon?: string | null;
  image?: { url?: string } | string | null;
}

export interface GameFeaturesSectionData {
  blockType?: 'gameFeatures';
  titleEn?: string | null;
  titleTh?: string | null;
  items?: GameFeatureItem[];
}

interface GameFeaturesSectionProps {
  data: GameFeaturesSectionData;
}

export default function GameFeaturesSection({ data }: GameFeaturesSectionProps) {
  const { lang: currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  
  // Clean Engineering: Strict CMS check, no hardcoding
  const items = data.items && Array.isArray(data.items) ? data.items : [];

  if (items.length === 0) return null; // Graceful Empty State

  return (
    <section className="k-features-section" id="features">
      <div className="k-features-bg-radial" />

      <div className="k-features-container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="k-features-title"
        >
          {title}
        </motion.h2>

        <div className="k-features-grid">
          {items.slice(0, 4).map((item, idx) => {
            const itemTitle = currentLang === 'en' ? item.titleEn : item.titleTh;
            const itemDesc = currentLang === 'en' ? item.descriptionEn : item.descriptionTh;
            const isLarge = idx === 0 || idx === 3;

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`k-features-card ${isLarge ? 'k-features-card--large' : 'k-features-card--small'} group`}
              >
                <div className="k-features-card-glow" />
                <div className="k-features-card-content">
                  {item.icon && (
                    <div className="k-features-icon-wrapper">
                      <span className="k-features-icon">{item.icon}</span>
                    </div>
                  )}
                  <h3 className="k-features-card-title">{itemTitle}</h3>
                  <p className="k-features-card-desc">
                    {itemDesc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center w-full"
        >
          <a href="/game-guide" className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[rgba(255,255,255,0.15)] bg-black/40 backdrop-blur-md text-gray-200 text-sm font-bold tracking-widest uppercase hover:bg-white/10 hover:border-[#6366f1] hover:text-white transition-all shadow-lg shadow-black/50">
            {currentLang === 'en' ? 'Explore Game Guide' : 'อ่านคู่มือเกม'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
