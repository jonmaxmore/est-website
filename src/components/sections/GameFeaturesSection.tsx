'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';

export default function GameFeaturesSection({ data }: { data: any }) {
  const { currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  const items = data.items || [];

  return (
    <section className="py-24 bg-black relative border-t border-white/5" id="features">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-black text-white text-center uppercase tracking-widest mb-16"
        >
          {title}
        </motion.h2>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
          {items.map((item: any, idx: number) => {
            const itemTitle = currentLang === 'en' ? item.titleEn : item.titleTh;
            const itemDesc = currentLang === 'en' ? item.descriptionEn : item.descriptionTh;
            
            // Make the first two items larger (span 2 columns on large screens)
            const isLarge = idx === 0 || idx === 3;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`relative group bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-zinc-800/50 transition-colors p-8 flex flex-col justify-end ${
                  isLarge ? 'lg:col-span-2' : 'lg:col-span-1'
                }`}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {item.icon && (
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 group-hover:scale-110 transition-transform">
                      <span className="text-xl">{item.icon}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">{itemTitle}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {itemDesc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
