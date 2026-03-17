'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import SocialIcons from '@/components/ui/SocialIcons';
import { SoundToggle } from '@/components/ui/SoundManager';

interface NavProps {
  socialLinks: Record<string, string | null>;
}

interface MegaMenuItem {
  href: string;
  icon: string;
  labelTh: string;
  labelEn: string;
  descTh: string;
  descEn: string;
}

const MEGA_MENUS: Record<string, MegaMenuItem[]> = {
  game: [
    { href: '/#story', icon: '⚔️', labelTh: 'ระบบ Mercenary', labelEn: 'Mercenary System', descTh: 'สหายร่วมรบ 4 คลาส', descEn: '4 companion classes' },
    { href: '/#characters', icon: '👥', labelTh: 'ตัวละคร', labelEn: 'Characters', descTh: 'พบกับสหายทั้งหมด', descEn: 'Meet all companions' },
    { href: '/#features', icon: '✨', labelTh: 'ฟีเจอร์เกม', labelEn: 'Game Features', descTh: 'PvP, กิลด์, ดันเจี้ยน', descEn: 'PvP, Guilds, Dungeons' },
    { href: '/gallery', icon: '🖼️', labelTh: 'แกลเลอรี่', labelEn: 'Gallery', descTh: 'ภาพและวอลเปเปอร์', descEn: 'Screenshots & Wallpapers' },
  ],
  community: [
    { href: '/news', icon: '📰', labelTh: 'ข่าวสาร', labelEn: 'News', descTh: 'อัพเดตล่าสุด', descEn: 'Latest updates' },
    { href: '#', icon: '💬', labelTh: 'Discord', labelEn: 'Discord', descTh: 'เข้าร่วมชุมชน', descEn: 'Join the community' },
    { href: '#', icon: '🎨', labelTh: 'แฟนอาร์ต', labelEn: 'Fan Art', descTh: 'ผลงานจากชุมชน', descEn: 'Community creations' },
  ],
};

export default function Navigation({ socialLinks }: NavProps) {
  const { scrollYProgress } = useScroll();
  const navBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(7,24,51,0)', 'rgba(7,24,51,0.95)']);
  const navOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const { lang, toggle, t } = useLang();

  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header>
      <motion.nav className="main-nav" style={{ backgroundColor: navBg, opacity: navOpacity }}>
        <div className="nav-inner">
          <SocialIcons links={socialLinks} />

          {/* Desktop Nav */}
          <div className="nav-links">
            <Link href="/" className="nav-link active">{t('หน้าหลัก', 'Home')}</Link>

            {/* Game Mega Menu */}
            <div
              className="nav-mega-trigger"
              onMouseEnter={() => setActiveMega('game')}
              onMouseLeave={() => setActiveMega(null)}
            >
              <span className="nav-link">
                {t('แนะนำเกม', 'Game')}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="nav-chevron">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
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
                      <Link key={item.href} href={item.href} className="mega-menu-item">
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
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="nav-chevron">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
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
                      <Link key={item.href + item.labelEn} href={item.href} className="mega-menu-item">
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

            <Link href="/download" className="nav-link">{t('ดาวน์โหลด', 'Download')}</Link>
          </div>

          <div className="nav-actions">
            <SoundToggle />
            <Link href="/event" className="nav-cta">{t('ลงทะเบียน', 'Register')}</Link>
            <button className="nav-lang" onClick={toggle}>{lang === 'th' ? 'EN' : 'TH'}</button>

            {/* Mobile hamburger */}
            <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>
      </motion.nav>

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
              <Link href="/" onClick={() => setMobileOpen(false)}>{t('หน้าหลัก', 'Home')}</Link>
              <Link href="/#story" onClick={() => setMobileOpen(false)}>{t('ระบบ Mercenary', 'Mercenary System')}</Link>
              <Link href="/#characters" onClick={() => setMobileOpen(false)}>{t('ตัวละคร', 'Characters')}</Link>
              <Link href="/#features" onClick={() => setMobileOpen(false)}>{t('ฟีเจอร์เกม', 'Features')}</Link>
              <Link href="/news" onClick={() => setMobileOpen(false)}>{t('ข่าวสาร', 'News')}</Link>
              <Link href="/gallery" onClick={() => setMobileOpen(false)}>{t('แกลเลอรี่', 'Gallery')}</Link>
              <Link href="/download" onClick={() => setMobileOpen(false)}>{t('ดาวน์โหลด', 'Download')}</Link>
              <Link href="/event" className="mobile-menu-cta" onClick={() => setMobileOpen(false)}>{t('ลงทะเบียนล่วงหน้า', 'Pre-Register')}</Link>
            </nav>
            <SocialIcons links={socialLinks} className="mobile-menu-social" />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
