'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/lang-context';

/* ═══════════════════════════════════════════════
   Navigation — Section-aware sticky nav
   On homepage: scrolls to sections + highlights active section
   On other pages: links normally
   ═══════════════════════════════════════════════ */

/** Section definitions for homepage scroll navigation */
const SECTIONS = [
  { id: 'hero', labelTh: 'หน้าหลัก', labelEn: 'Home', href: '/' },
  { id: 'weapons', labelTh: 'อาวุธ', labelEn: 'Weapons', href: '/character' },
  { id: 'features', labelTh: 'ไฮไลท์', labelEn: 'Highlights', href: '/game-guide' },
  { id: 'news', labelTh: 'ข่าวสาร', labelEn: 'News', href: '/news' },
];

// eslint-disable-next-line max-lines-per-function -- Navigation with scroll tracking + mobile menu
export default function Navigation() {
  const { lang, toggle, t } = useLang();
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  /* ─── Scroll detection ─── */
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);

    // Only track sections on homepage
    if (!isHomepage || isScrollingRef.current) return;

    const scrollY = window.scrollY + window.innerHeight * 0.35;
    let current = 'hero';

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el && el.offsetTop <= scrollY) {
        current = section.id;
      }
    }

    if (current !== activeSection) {
      setActiveSection(current);
      // Update URL hash without triggering scroll
      const hash = current === 'hero' ? '' : `#${current}`;
      window.history.replaceState(null, '', `/${hash}`);
    }
  }, [isHomepage, activeSection]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ─── Handle initial hash on mount ─── */
  useEffect(() => {
    if (!isHomepage) return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(hash);
        }, 500);
      }
    }
  }, [isHomepage]);

  /* ─── Smooth scroll to section ─── */
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    isScrollingRef.current = true;
    setActiveSection(sectionId);

    const hash = sectionId === 'hero' ? '' : `#${sectionId}`;
    window.history.replaceState(null, '', `/${hash}`);

    el.scrollIntoView({ behavior: 'smooth' });

    // Re-enable scroll tracking after animation
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  /* ─── Mobile menu ─── */
  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleNavClick = (section: typeof SECTIONS[number], e: React.MouseEvent) => {
    if (isHomepage) {
      e.preventDefault();
      scrollToSection(section.id);
      closeMobile();
    }
    // On other pages, let Link handle navigation normally
  };

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

          {/* Desktop Nav — Section links on homepage, page links elsewhere */}
          <div className="nav-links">
            {SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={isHomepage ? `/#${section.id}` : section.href}
                className={`nav-link ${isHomepage && activeSection === section.id ? 'nav-link-active' : ''}`}
                onClick={(e) => handleNavClick(section, e)}
              >
                {t(section.labelTh, section.labelEn)}
              </Link>
            ))}
          </div>

          {/* Section progress indicator (homepage only) */}
          {isHomepage && scrolled && (
            <div className="nav-section-indicator">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  className={`nav-dot ${activeSection === section.id ? 'nav-dot-active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                  aria-label={t(section.labelTh, section.labelEn)}
                  title={t(section.labelTh, section.labelEn)}
                />
              ))}
            </div>
          )}

          <div className="nav-actions">
            <Link href="/event" className="nav-cta">
              {t('ลงทะเบียน', 'Register')}
            </Link>
            <button
              className="nav-lang"
              onClick={toggle}
              aria-label={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            >
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
              {SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={isHomepage ? `/#${section.id}` : section.href}
                  className={isHomepage && activeSection === section.id ? 'mobile-link-active' : ''}
                  onClick={(e) => handleNavClick(section, e)}
                >
                  {t(section.labelTh, section.labelEn)}
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
