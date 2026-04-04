'use client';

import { useEffect, useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLang } from '@/lib/lang-context';
import type { CMSNavLink } from '@/types/cms';
import { Menu, X } from 'lucide-react';

export default function Navigation({ links, registrationUrl, logoUrl }: any) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, currentLang, switchLang } = useLang();
  
  const navLinks = links?.filter((l: any) => l.visible !== false) || [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, sectionId?: string | null) => {
    if (sectionId && pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-xl border-white/10 py-3' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="relative z-50 flex items-center gap-3 group">
          <div className="w-10 h-10 relative overflow-hidden rounded-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:border-primary/50 transition-colors">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
            )}
          </div>
          <span className="text-white font-bold tracking-widest uppercase text-sm sm:text-base drop-shadow-md">
            Eternal <span className="text-gray-400">Tower</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link: CMSNavLink) => {
            const label = currentLang === 'en' ? (link.labelEn || link.label) : (link.labelTh || link.label);
            const isExternal = link.href?.startsWith('http');
            const target = isExternal ? '_blank' : undefined;
            const href = link.sectionId && pathname === '/' ? `#${link.sectionId}` : link.href || '/';
            
            return (
              <a
                key={link.id}
                href={href}
                target={target}
                onClick={(e) => handleNavClick(e, link.sectionId)}
                className="text-gray-300 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <button 
            onClick={() => switchLang(currentLang === 'en' ? 'th' : 'en')}
            className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest border border-gray-600/50 rounded-full px-3 py-1 hover:border-white transition-colors"
          >
            {currentLang === 'en' ? 'TH' : 'EN'}
          </button>
          
          <a 
            href={registrationUrl || '#'}
            className="relative px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold uppercase tracking-wider rounded-sm backdrop-blur-md border border-white/20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] overflow-hidden group"
          >
            <span className="relative z-10">{t('Pre-Register', 'ลงทะเบียนล่วงหน้า')}</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden relative z-50 p-2 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full h-screen bg-black/95 backdrop-blur-3xl border-t border-white/10 flex flex-col pt-10 px-6 lg:hidden"
          >
            <nav className="flex flex-col gap-6 items-center text-center">
              {navLinks.map((link: CMSNavLink) => {
                const label = currentLang === 'en' ? (link.labelEn || link.label) : (link.labelTh || link.label);
                const href = link.sectionId && pathname === '/' ? `#${link.sectionId}` : link.href || '/';
                return (
                  <a
                    key={link.id}
                    href={href}
                    onClick={(e) => handleNavClick(e, link.sectionId)}
                    className="text-2xl text-gray-300 hover:text-white font-light tracking-widest uppercase"
                  >
                    {label}
                  </a>
                );
              })}
            </nav>
            
            <div className="mt-12 flex flex-col gap-6 items-center">
              <a 
                href={registrationUrl || '#'}
                className="w-full max-w-sm py-4 bg-white text-black text-center text-lg font-bold uppercase tracking-wider rounded-sm"
              >
                {t('Pre-Register', 'ลงทะเบียนล่วงหน้า')}
              </a>
              <button 
                onClick={() => switchLang(currentLang === 'en' ? 'th' : 'en')}
                className="text-sm font-bold text-gray-400 uppercase tracking-widest"
              >
                Switch to {currentLang === 'en' ? 'Thai' : 'English'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
