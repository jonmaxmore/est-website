'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';

const TABS = [
  { key: 'screenshots', labelTh: 'ภาพหน้าจอ', labelEn: 'Screenshots' },
  { key: 'wallpapers', labelTh: 'วอลเปเปอร์', labelEn: 'Wallpapers' },
  { key: 'concept', labelTh: 'คอนเซ็ปต์อาร์ต', labelEn: 'Concept Art' },
];

/* Placeholder gallery items — replace with CMS data */
const GALLERY_ITEMS = {
  screenshots: [
    { id: 1, title: 'The Boundless Spire', gradient: 'linear-gradient(135deg, #1E6FBF 0%, #071833 100%)', icon: '🏰' },
    { id: 2, title: 'PvP Arena Battle', gradient: 'linear-gradient(135deg, #E74C3C 0%, #8B0000 100%)', icon: '⚔️' },
    { id: 3, title: 'Mercenary Companions', gradient: 'linear-gradient(135deg, #D4A843 0%, #8B6914 100%)', icon: '🤝' },
    { id: 4, title: 'Arcatéa World Map', gradient: 'linear-gradient(135deg, #2ECC71 0%, #1A5632 100%)', icon: '🗺️' },
    { id: 5, title: 'Guild Raid Boss', gradient: 'linear-gradient(135deg, #9B59B6 0%, #4A235A 100%)', icon: '🐉' },
    { id: 6, title: 'Dungeon Exploration', gradient: 'linear-gradient(135deg, #F5A623 0%, #8B5A00 100%)', icon: '🔦' },
  ],
  wallpapers: [
    { id: 7, title: 'Swordsman Class', gradient: 'linear-gradient(135deg, #FFD700 0%, #8B6914 100%)', icon: '⚔️' },
    { id: 8, title: 'Archer Class', gradient: 'linear-gradient(135deg, #4CAF50 0%, #1B5E20 100%)', icon: '🏹' },
    { id: 9, title: 'Mage Class', gradient: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)', icon: '🔮' },
    { id: 10, title: 'Priest Class', gradient: 'linear-gradient(135deg, #E1BEE7 0%, #7B1FA2 100%)', icon: '🪄' },
  ],
  concept: [
    { id: 11, title: 'World of Arcatéa', gradient: 'linear-gradient(135deg, #87CEEB 0%, #0D2B5C 100%)', icon: '🌍' },
    { id: 12, title: 'The Boundless Spire Design', gradient: 'linear-gradient(135deg, #D4A843 0%, #071833 100%)', icon: '🏗️' },
    { id: 13, title: 'Character Sketches', gradient: 'linear-gradient(135deg, #FFB84D 0%, #8B5A00 100%)', icon: '✏️' },
  ],
};

export default function GalleryPage() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('screenshots');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const items = GALLERY_ITEMS[activeTab as keyof typeof GALLERY_ITEMS] || [];

  return (
    <div className="gallery-page">
      {/* Header */}
      <div className="gallery-hero">
        <div className="gallery-hero-bg" />
        <div className="container-custom">
          <nav className="gallery-breadcrumb">
            <Link href="/">{t('หน้าหลัก', 'Home')}</Link>
            <span>/</span>
            <span>{t('แกลเลอรี่', 'Gallery')}</span>
          </nav>
          <h1 className="gallery-title">{t('แกลเลอรี่', 'Gallery')}</h1>
          <p className="gallery-desc">{t('ภาพและวอลเปเปอร์จากโลกของ Arcatéa', 'Images and wallpapers from the world of Arcatéa')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="container-custom">
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
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="gallery-item-inner" style={{ background: item.gradient }}>
                  <span className="gallery-item-icon">{item.icon}</span>
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
              {(() => {
                const allItems = [...GALLERY_ITEMS.screenshots, ...GALLERY_ITEMS.wallpapers, ...GALLERY_ITEMS.concept];
                const item = allItems.find((i) => i.id === selectedItem);
                if (!item) return null;
                return (
                  <div className="gallery-lightbox-image" style={{ background: item.gradient }}>
                    <span className="gallery-lightbox-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                    <p className="gallery-lightbox-hint">
                      {t('รูปจริงจะอัพโหลดผ่าน CMS', 'Actual image will be uploaded via CMS')}
                    </p>
                  </div>
                );
              })()}
              <button className="gallery-lightbox-close" onClick={() => setSelectedItem(null)}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back nav */}
      <div className="container-custom gallery-back-nav">
        <Link href="/" className="gallery-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t('กลับหน้าหลัก', 'Back to Home')}
        </Link>
      </div>
    </div>
  );
}
