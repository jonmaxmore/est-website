'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';

/* ═══════════════════════════════════════════════════
   GALLERY PAGE — /gallery
   CMS-driven image gallery with tabs and lightbox
   ═══════════════════════════════════════════════════ */

const TABS = [
  { key: 'screenshots', labelTh: 'ภาพหน้าจอ', labelEn: 'Screenshots' },
  { key: 'wallpapers', labelTh: 'วอลเปเปอร์', labelEn: 'Wallpapers' },
  { key: 'concept', labelTh: 'คอนเซ็ปต์อาร์ต', labelEn: 'Concept Art' },
];

interface GalleryItem {
  id: number | string;
  title: string;
  category: string;
  image: { url: string; alt?: string } | null;
  gradient?: string;
  icon?: string;
}

/* Placeholder gallery items — used when CMS data is not available */
const PLACEHOLDER_ITEMS: Record<string, GalleryItem[]> = {
  screenshots: [
    { id: 1, title: 'The Boundless Spire', category: 'screenshots', image: null, gradient: 'linear-gradient(135deg, #1E6FBF 0%, #071833 100%)', icon: '🏰' },
    { id: 2, title: 'PvP Arena Battle', category: 'screenshots', image: null, gradient: 'linear-gradient(135deg, #E74C3C 0%, #8B0000 100%)', icon: '⚔️' },
    { id: 3, title: 'Combat System', category: 'screenshots', image: null, gradient: 'linear-gradient(135deg, #D4A843 0%, #8B6914 100%)', icon: '⚔️' },
    { id: 4, title: 'Arcatéa World Map', category: 'screenshots', image: null, gradient: 'linear-gradient(135deg, #2ECC71 0%, #1A5632 100%)', icon: '🗺️' },
    { id: 5, title: 'Guild Raid Boss', category: 'screenshots', image: null, gradient: 'linear-gradient(135deg, #9B59B6 0%, #4A235A 100%)', icon: '🐉' },
    { id: 6, title: 'Dungeon Exploration', category: 'screenshots', image: null, gradient: 'linear-gradient(135deg, #F5A623 0%, #8B5A00 100%)', icon: '🔦' },
  ],
  wallpapers: [
    { id: 7, title: 'Swordsman Class', category: 'wallpapers', image: null, gradient: 'linear-gradient(135deg, #FFD700 0%, #8B6914 100%)', icon: '⚔️' },
    { id: 8, title: 'Archer Class', category: 'wallpapers', image: null, gradient: 'linear-gradient(135deg, #4CAF50 0%, #1B5E20 100%)', icon: '🏹' },
    { id: 9, title: 'Mage Class', category: 'wallpapers', image: null, gradient: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)', icon: '🔮' },
    { id: 10, title: 'Priest Class', category: 'wallpapers', image: null, gradient: 'linear-gradient(135deg, #E1BEE7 0%, #7B1FA2 100%)', icon: '🪄' },
  ],
  concept: [
    { id: 11, title: 'World of Arcatéa', category: 'concept', image: null, gradient: 'linear-gradient(135deg, #87CEEB 0%, #0D2B5C 100%)', icon: '🌍' },
    { id: 12, title: 'The Boundless Spire Design', category: 'concept', image: null, gradient: 'linear-gradient(135deg, #D4A843 0%, #071833 100%)', icon: '🏗️' },
    { id: 13, title: 'Character Sketches', category: 'concept', image: null, gradient: 'linear-gradient(135deg, #FFB84D 0%, #8B5A00 100%)', icon: '✏️' },
  ],
};

// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function GalleryPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('screenshots');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [galleryData, setGalleryData] = useState<Record<string, GalleryItem[]>>(PLACEHOLDER_ITEMS);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [footer, setFooter] = useState({
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  });

  useEffect(() => {
    // Fetch CMS gallery data
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data?.site?.footer) setFooter(data.site.footer);
      })
      .catch(() => {});

    // Try to fetch gallery items from CMS
    fetch('/api/public/gallery')
      .then((r) => r.json())
      .then((data) => {
        if (data?.items && Object.keys(data.items).length > 0) {
          setGalleryData(data.items);
        }
      })
      .catch(() => {
        // Use placeholder data
      });
  }, []);

  const items = galleryData[activeTab] || [];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        {/* Hero */}
        <section className="page-hero">
          <div className="page-hero-bg">
            <div className="page-hero-overlay" />
          </div>
          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">GALLERY</span>
                <h1 className="page-hero-title">{t('แกลเลอรี่', 'Gallery')}</h1>
                <p className="page-hero-subtitle">
                  {t('ภาพและวอลเปเปอร์จากโลกของ Arcatéa', 'Images and wallpapers from the world of Arcatéa')}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* Tabs & Grid */}
        <section className="section-highlights" style={{ paddingTop: '2rem' }}>
          <div className="container-custom">
            {/* Tabs */}
            <div className="gallery-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`gallery-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {t(tab.labelTh, tab.labelEn)}
                </button>
              ))}
            </div>

            {/* Grid */}
            <motion.div className="gallery-grid" layout>
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="gallery-item"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="gallery-item-inner" style={{ background: item.image ? undefined : (item.gradient || 'var(--deeper-navy)') }}>
                      {item.image ? (
                        <Image
                          src={item.image.url}
                          alt={item.image.alt || item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="gallery-item-icon">{item.icon || '🖼️'}</span>
                      )}
                      <div className="gallery-item-overlay">
                        <h3>{item.title}</h3>
                        <span className="gallery-item-zoom">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Placeholder notice */}
            <div className="gallery-notice">
              <p>{t('ภาพเพิ่มเติมจะอัพเดตเร็วๆ นี้ — ติดตามข่าวสาร!', 'More images coming soon — stay tuned!')}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="gallery-lightbox-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.image ? (
                <div className="gallery-lightbox-image" style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                  <Image src={selectedItem.image.url} alt={selectedItem.title} fill className="object-cover" style={{ borderRadius: '12px' }} />
                </div>
              ) : (
                <div className="gallery-lightbox-image" style={{ background: selectedItem.gradient }}>
                  <span className="gallery-lightbox-icon">{selectedItem.icon}</span>
                  <h3>{selectedItem.title}</h3>
                  <p className="gallery-lightbox-hint">
                    {t('รูปจริงจะอัพโหลดผ่าน CMS', 'Actual image will be uploaded via CMS')}
                  </p>
                </div>
              )}
              <button className="gallery-lightbox-close" onClick={() => setSelectedItem(null)}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
