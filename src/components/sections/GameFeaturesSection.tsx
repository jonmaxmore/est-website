'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';

export default function GameFeaturesSection({ data }: { data: any }) {
  const { currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  const items = data.items || [];

  return (
    <section 
      className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden snap-start shrink-0 bg-black"
      id="features"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black z-0 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col justify-center h-full py-20">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-black text-white text-center uppercase tracking-widest mb-10 drop-shadow-lg"
        >
          {title}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[min(180px,20vh)] md:auto-rows-[min(220px,25vh)]">
          {items.slice(0, 4).map((item: any, idx: number) => {
            const itemTitle = currentLang === 'en' ? item.titleEn : item.titleTh;
            const itemDesc = currentLang === 'en' ? item.descriptionEn : item.descriptionTh;
            const isLarge = idx === 0 || idx === 3;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`relative group bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors p-6 md:p-8 flex flex-col justify-end ${
                  isLarge ? 'lg:col-span-2' : 'lg:col-span-1'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {item.icon && (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                      <span className="text-lg md:text-xl">{item.icon}</span>
                    </div>
                  )}
                  <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider mb-1 md:mb-2">{itemTitle}</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
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
