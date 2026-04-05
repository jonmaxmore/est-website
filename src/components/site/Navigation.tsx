'use client';

import { useEffect, useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  links?: {
    id?: string | null;
    labelEn?: string;
    labelTh?: string;
    href: string;
    sectionId?: string | null;
  }[];
  logoUrl?: string | null;
  registrationUrl?: string;
}

export default function Navigation({ links = [], logoUrl, registrationUrl = '/event' }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-4' 
          : 'bg-gradient-to-b from-black/80 to-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="relative z-50 flex items-center gap-4 group">
          <div className="w-10 h-10 relative">
            <Image src={logoUrl || "/api/media/file/logo.webp"} alt="Eternal Tower Saga" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-serif font-bold tracking-widest uppercase text-sm drop-shadow-md">
              Eternal Tower Saga
            </span>
            <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">
              à¹€à¸à¸¡ RPG à¸šà¸™à¸¡à¸·à¸­à¸–à¸·à¸­
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 ml-8 mr-auto">
          {links.map((link, index) => {
            const href = link.sectionId && pathname === '/' ? `#${link.sectionId}` : link.href;
            return (
              <a
                key={link.id || link.href || index}
                href={href}
                onClick={(e) => handleNavClick(e, link.sectionId)}
                className="text-gray-300 hover:text-white text-sm font-medium tracking-wide transition-colors relative group"
              >
                {link.labelEn || link.labelTh}
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-3 mr-4">
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">f</a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">t</a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">y</a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">d</a>
          </div>
          
          <a 
            href={registrationUrl || "/event"}
            className="px-6 py-2.5 bg-[#D4A843] hover:bg-[#E5B954] text-black text-sm font-bold tracking-wider rounded-full transition-all shadow-[0_0_15px_rgba(212,168,67,0.3)] hover:shadow-[0_0_25px_rgba(212,168,67,0.5)]"
          >
            à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™
          </a>

          <button className="w-10 h-10 rounded-full border border-white/20 text-xs font-bold text-gray-300 hover:text-white hover:border-white transition-colors">
            EN
          </button>
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
            className="fixed inset-0 top-[72px] bg-black/95 backdrop-blur-xl border-t border-white/10 flex flex-col p-6 lg:hidden"
          >
            <nav className="flex flex-col gap-6 items-center text-center mt-10">
              {links.map((link, index) => {
                const href = link.sectionId && pathname === '/' ? `#${link.sectionId}` : link.href;
                return (
                  <a
                key={link.id || link.href || index}
                    href={href}
                    onClick={(e) => handleNavClick(e, link.sectionId)}
                    className="text-2xl text-gray-300 hover:text-white font-medium tracking-wide"
                  >
                    {link.labelEn || link.labelTh}
                  </a>
                );
              })}
            </nav>
            
            <div className="mt-auto mb-10 flex flex-col gap-4 items-center">
              <a 
                href={registrationUrl || "/event"}
                className="w-full max-w-sm py-4 bg-[#D4A843] text-black text-center text-lg font-bold tracking-wider rounded-full"
              >
                à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸²
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
