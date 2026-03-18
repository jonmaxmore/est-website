'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';

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

          {/* Desktop Nav — 5 direct links matching reference site */}
          <div className="nav-links">
            <Link href="/" className="nav-link active">
              {t('หน้าหลัก', 'Home')}
            </Link>
            <Link href="/game-guide" className="nav-link">
              {t('แนะนำเกม', 'Game Guide')}
            </Link>
            <Link href="/story" className="nav-link">
              {t('เนื้อเรื่อง', 'Story')}
            </Link>
            <Link href="/character" className="nav-link">
              {t('ตัวละคร', 'Characters')}
            </Link>
            <Link href="/news" className="nav-link">
              {t('ข่าวสาร', 'News')}
            </Link>
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
              <Link href="/" onClick={closeMobile}>
                {t('หน้าหลัก', 'Home')}
              </Link>
              <Link href="/game-guide" onClick={closeMobile}>
                {t('แนะนำเกม', 'Game Guide')}
              </Link>
              <Link href="/story" onClick={closeMobile}>
                {t('เนื้อเรื่อง', 'Story')}
              </Link>
              <Link href="/character" onClick={closeMobile}>
                {t('ตัวละคร', 'Characters')}
              </Link>
              <Link href="/news" onClick={closeMobile}>
                {t('ข่าวสาร', 'News')}
              </Link>
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
