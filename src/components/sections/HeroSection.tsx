'use client';

import { useLang } from '@/lib/lang-context';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection({ data }: { data: any }) {
  const { currentLang } = useLang();
  
  if (!data) return null;

  const tagline = currentLang === 'en' ? data.taglineEn : data.taglineTh;
  const ctaText = currentLang === 'en' ? data.ctaTextEn : data.ctaTextTh;
  const bgImageUrl = typeof data.backgroundImage === 'object' ? data.backgroundImage.url : data.backgroundImage;

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {bgImageUrl && (
          <Image 
            src={bgImageUrl} 
            alt="Hero Background" 
            fill 
            className="object-cover object-top opacity-70"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        >
          {tagline}
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-10"
        >
          <a 
            href={data.ctaLink || '#'}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold text-lg uppercase tracking-widest overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">{ctaText}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
