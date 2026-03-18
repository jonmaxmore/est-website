'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import {
  Swords,
  Users,
  Sparkles,
  Newspaper,
  MessageSquare,
  Palette,
  Download,
} from 'lucide-react';

/* socialLinks prop removed — unused in this component */

interface MegaMenuItem {
  href: string;
  icon: React.ReactNode;
  labelTh: string;
  labelEn: string;
  descTh: string;
  descEn: string;
}

const MEGA_MENUS: Record<string, MegaMenuItem[]> = {
  game: [
    {
      href: '/#characters',
      icon: <Users size={20} />,
      labelTh: 'ตัวละคร',
      labelEn: 'Characters',
      descTh: 'พบกับสหายทั้งหมด',
      descEn: 'Meet all companions',
    },
    {
      href: '/#features',
      icon: <Sparkles size={20} />,
      labelTh: 'ฟีเจอร์เกม',
      labelEn: 'Game Features',
      descTh: 'PvP, กิลด์, ดันเจี้ยน',
      descEn: 'PvP, Guilds, Dungeons',
    },
  ],
  community: [
    {
      href: '/news',
      icon: <Newspaper size={20} />,
      labelTh: 'ข่าวสารทั้งหมด',
      labelEn: 'All News',
      descTh: 'อัพเดตล่าสุดและประกาศ',
      descEn: 'Latest updates & announcements',
    },
    {
      href: '/news?category=event',
      icon: <Sparkles size={20} />,
      labelTh: 'อีเว้นท์',
      labelEn: 'Events',
      descTh: 'กิจกรรมและโปรโมชั่น',
      descEn: 'Activities & promotions',
    },
    {
      href: '/news?category=update',
      icon: <Swords size={20} />,
      labelTh: 'อัพเดตเกม',
      labelEn: 'Game Updates',
      descTh: 'แพทช์โน้ตและฟีเจอร์ใหม่',
      descEn: 'Patch notes & new features',
    },
  ],
};

export default function Navigation() {
  const { lang, toggle, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
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

          {/* Desktop Nav */}
          <div className="nav-links">
            <Link href="/" className="nav-link active">
              {t('หน้าหลัก', 'Home')}
            </Link>

            {/* Game Mega Menu */}
            <div
              className="nav-mega-trigger"
              onMouseEnter={() => setActiveMega('game')}
              onMouseLeave={() => setActiveMega(null)}
              onFocus={() => setActiveMega('game')}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setActiveMega(null); }}
            >
              <span className="nav-link" role="button" tabIndex={0} aria-expanded={activeMega === 'game'} aria-haspopup="true">
                {t('แนะนำเกม', 'Game')}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                  className="nav-chevron"
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </span>

              <AnimatePresence>
                {activeMega === 'game' && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {MEGA_MENUS.game.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="mega-menu-item"
                      >
                        <span className="mega-menu-icon">{item.icon}</span>
                        <div>
                          <strong>{t(item.labelTh, item.labelEn)}</strong>
                          <small>{t(item.descTh, item.descEn)}</small>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Community Mega Menu */}
            <div
              className="nav-mega-trigger"
              onMouseEnter={() => setActiveMega('community')}
              onMouseLeave={() => setActiveMega(null)}
              onFocus={() => setActiveMega('community')}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setActiveMega(null); }}
            >
              <span className="nav-link" role="button" tabIndex={0} aria-expanded={activeMega === 'community'} aria-haspopup="true">
                {t('ชุมชน', 'Community')}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                  className="nav-chevron"
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </span>

              <AnimatePresence>
                {activeMega === 'community' && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {MEGA_MENUS.community.map((item) => (
                      <Link
                        key={item.href + item.labelEn}
                        href={item.href}
                        className="mega-menu-item"
                      >
                        <span className="mega-menu-icon">{item.icon}</span>
                        <div>
                          <strong>{t(item.labelTh, item.labelEn)}</strong>
                          <small>{t(item.descTh, item.descEn)}</small>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/download" className="nav-link">
              {t('ดาวน์โหลด', 'Download')}
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
              <Link href="/#story" onClick={closeMobile}>
                {t('ระบบ Mercenary', 'Mercenary System')}
              </Link>
              <Link href="/#characters" onClick={closeMobile}>
                {t('ตัวละคร', 'Characters')}
              </Link>
              <Link href="/#features" onClick={closeMobile}>
                {t('ฟีเจอร์เกม', 'Features')}
              </Link>
              <Link href="/news" onClick={closeMobile}>
                {t('ข่าวสาร', 'News')}
              </Link>
              <Link href="/download" onClick={closeMobile}>
                {t('ดาวน์โหลด', 'Download')}
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
