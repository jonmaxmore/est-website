'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';

/* ═══════════════════════════════════════════════
   Navigation — Direct links matching site structure
   หน้าหลัก | แนะนำเกม | เนื้อเรื่อง | ตัวละคร | ข่าวสาร
   ═══════════════════════════════════════════════ */

const NAV_LINKS = [
  { href: '/', labelTh: 'หน้าหลัก', labelEn: 'Home' },
  { href: '/#features', labelTh: 'แนะนำเกม', labelEn: 'Game Guide' },
  { href: '/#story', labelTh: 'เนื้อเรื่อง', labelEn: 'Story' },
  { href: '/character', labelTh: 'ตัวละคร', labelEn: 'Characters' },
  { href: '/news', labelTh: 'ข่าวสาร', labelEn: 'News' },
];

export default function Navigation() {
  const { lang, toggle, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    // Lock body scroll when menu is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header>
      <nav className={`main-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo" aria-label="Home">
            <Image
              src="/images/logo.webp"
              alt="Game Logo"
              width={120}
              height={40}
              style={{ height: '40px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Nav — Direct links */}
          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {t(link.labelTh, link.labelEn)}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <Link href="/event" className="nav-cta">
              {t('ลงทะเบียน', 'Register')}
            </Link>
            <button className="nav-lang" onClick={toggle}>
              {lang === 'th' ? 'EN' : 'TH'}
            </button>

            {/* Mobile hamburger */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              aria-expanded={mobileOpen ? 'true' : 'false'}
            >
              <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu-backdrop-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileMenuRef}
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className="mobile-menu-nav">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMobile}>
                  {t(link.labelTh, link.labelEn)}
                </Link>
              ))}
              <Link
                href="/event"
                className="mobile-menu-cta"
                onClick={closeMobile}
              >
                {t('ลงทะเบียนล่วงหน้า', 'Pre-Register')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
