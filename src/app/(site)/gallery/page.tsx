'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import RevealSection from '@/components/ui/RevealSection';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { useLang } from '@/lib/lang-context';

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

const PLACEHOLDER_ITEMS: Record<string, GalleryItem[]> = {
  screenshots: [],
  wallpapers: [],
  concept: [],
};

// eslint-disable-next-line max-lines-per-function -- Page keeps gallery tabs, fetch, and lightbox interaction together
export default function GalleryPage() {
  const { t } = useLang();
  const { socialLinks, footer, settings } = useSiteSettings();
  const galleryConfig = (settings?.galleryPage as Record<string, string> | undefined) || null;
  const [activeTab, setActiveTab] = useState('screenshots');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [galleryData, setGalleryData] = useState<Record<string, GalleryItem[]>>(PLACEHOLDER_ITEMS);

  const heroBadge = galleryConfig ? t(galleryConfig.badgeTh || '', galleryConfig.badgeEn || '') : '';
  const heroTitle = galleryConfig ? t(galleryConfig.titleTh || '', galleryConfig.titleEn || '') : '';
  const heroSubtitle = galleryConfig ? t(galleryConfig.subtitleTh || '', galleryConfig.subtitleEn || '') : t('ภาพและวอลเปเปอร์จากโลกของ Arcatea', 'Images and wallpapers from the world of Arcatea');
  const emptyMessage = galleryConfig ? t(galleryConfig.emptyMessageTh || '', galleryConfig.emptyMessageEn || '') : t('ภาพเพิ่มเติมจะอัปเดตเร็ว ๆ นี้ ติดตามข่าวสารไว้ได้เลย', 'More images coming soon. Stay tuned.');

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await fetch('/api/public/gallery');
        const data = await response.json();
        const cmsGallery = data.gallery || data.items;

        if (cmsGallery && Object.keys(cmsGallery).length > 0) {
          setGalleryData(cmsGallery);
        }
      } catch {
        setGalleryData(PLACEHOLDER_ITEMS);
      }
    }

    fetchGallery();
  }, []);

  const items = galleryData[activeTab] || [];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        <section className="page-hero">
          <div className="page-hero-bg">
            <div className="page-hero-overlay" />
          </div>

          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">{heroBadge}</span>
                <h1 className="page-hero-title">{heroTitle}</h1>
                <p className="page-hero-subtitle">{heroSubtitle}</p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="section-highlights gallery-content-section">
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

            <motion.div className="gallery-grid" layout>
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="gallery-item"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div
                        className="gallery-item-inner"
                    >
                      {item.image ? (
                        <Image
                          src={item.image.url}
                          alt={item.image.alt || item.title}
                          fill
                          className="object-cover"
                          unoptimized={isCmsMediaUrl(item.image.url)}
                        />
                      ) : (
                        <span className="gallery-item-icon">{item.icon || '🖼️'}</span>
                      )}

                      <div className="gallery-item-overlay">
                        <h3>{item.title}</h3>
                        <span className="gallery-item-zoom">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <div className="gallery-notice">
              <p>{emptyMessage}</p>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedItem ? (
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
              onClick={(event) => event.stopPropagation()}
            >
              {selectedItem.image ? (
                <div className="gallery-lightbox-image gallery-lightbox-image-wrapper">
                  <Image
                    src={selectedItem.image.url}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                    unoptimized={isCmsMediaUrl(selectedItem.image.url)}
                  />
                </div>
              ) : (
                <div className="gallery-lightbox-image">
                  <span className="gallery-lightbox-icon">{selectedItem.icon}</span>
                  <h3>{selectedItem.title}</h3>
                  <p className="gallery-lightbox-hint">{t('รูปจริงจะอัปโหลดผ่าน CMS', 'Actual image will be uploaded via CMS')}</p>
                </div>
              )}

              <button className="gallery-lightbox-close" onClick={() => setSelectedItem(null)}>✕</button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
