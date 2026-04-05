'use client';

import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';

export default function HeroSection({ data }: { data: any }) {
  const { lang: currentLang } = useLang();
  
  if (!data) return null;

  const tagline = currentLang === 'en' ? data.taglineEn : data.taglineTh;
  const ctaText = currentLang === 'en' ? data.ctaTextEn : data.ctaTextTh;
  const bgImageUrl = typeof data.backgroundImage === 'object' ? data.backgroundImage?.url : data.backgroundImage;
  const videoUrl = typeof data.backgroundVideo === 'object' ? data.backgroundVideo?.url : null;

  return (
    <section 
      className="relative w-full h-[100svh] flex flex-col justify-center items-center overflow-hidden snap-start shrink-0 bg-black"
    >
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : bgImageUrl ? (
          <div 
            className="w-full h-full bg-cover bg-center bg-fixed opacity-80"
            style={{ backgroundImage: `url(${bgImageUrl})` }}
          />
        ) : null}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)]" />
      </div>

      <div className="relative z-10 text-center px-4 md:px-6 w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full pt-16">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] w-full"
        >
          {tagline}
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-8 md:mt-12"
        >
          <a 
            href={data.ctaLink || '#'}
            className="group relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 bg-white text-black font-bold text-base md:text-xl uppercase tracking-widest overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10">{ctaText}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>
      </div>

      {/* New subtle scroll indicator replacing the old hardcoded text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none"
      >
        <div className="w-[1px] h-12 md:h-16 bg-gradient-to-b from-transparent via-white to-transparent opacity-50 overflow-hidden relative">
          <motion.div 
            animate={{ y: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
