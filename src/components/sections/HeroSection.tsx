'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';

export default function HeroSection({ data }: { data: any }) {
  const { currentLang } = useLang();
  
  if (!data) return null;

  const tagline = currentLang === 'en' ? data.taglineEn : data.taglineTh;
  const ctaText = currentLang === 'en' ? data.ctaTextEn : data.ctaTextTh;
  const bgImageUrl = typeof data.backgroundImage === 'object' ? data.backgroundImage?.url : data.backgroundImage;

  return (
    <section 
      className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden snap-start shrink-0 bg-fixed bg-cover bg-center"
      style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : {}}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center mt-16">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
        >
          {tagline}
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12"
        >
          <a 
            href={data.ctaLink || '#'}
            className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-black font-bold text-lg md:text-xl uppercase tracking-widest overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">{ctaText}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
