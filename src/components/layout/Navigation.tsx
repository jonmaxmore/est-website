'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Gamepad2,
  Download,
} from 'lucide-react';

interface NavProps {
  socialLinks: Record<string, string | null>;
}

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
      href: '/#story',
      icon: <Swords size={20} />,
      labelTh: 'ระบบ Mercenary',
      labelEn: 'Mercenary System',
      descTh: 'สหายร่วมรบ 4 คลาส',
      descEn: '4 companion classes',
    },
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
      labelTh: 'ข่าวสาร',
      labelEn: 'News',
      descTh: 'อัพเดตล่าสุด',
      descEn: 'Latest updates',
    },
    {
      href: '#',
      icon: <MessageSquare size={20} />,
      labelTh: 'Discord',
      labelEn: 'Discord',
      descTh: 'เข้าร่วมชุมชน',
      descEn: 'Join the community',
    },
    {
      href: '#',
      icon: <Palette size={20} />,
      labelTh: 'แฟนอาร์ต',
      labelEn: 'Fan Art',
      descTh: 'ผลงานจากชุมชน',
      descEn: 'Community creations',
    },
  ],
};

export default function Navigation({ socialLinks }: NavProps) {
  const { lang, toggle, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header>
      <nav
        className="main-nav"
        style={{
          backgroundColor: scrolled
            ? 'rgba(4, 14, 33, 0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          height: '64px',
        }}
      >
        <div className="nav-inner" style={{ height: '64px' }}>
          {/* Logo */}
          <Link href="/" className="nav-logo" aria-label="Home">
            <Image
              src="/images/logo.png"
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
            >
              <span className="nav-link">
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
            >
              <span className="nav-link">
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
              <Download size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
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
              aria-expanded={mobileOpen}
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
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeMobile}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 998,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
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
