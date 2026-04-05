'use client';

import Image from 'next/image';
import { Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from '@/components/site/Navigation';
import Footer from '@/components/site/Footer';
import RevealSection from '@/components/ui/RevealSection';
import ScrollProgress from '@/components/ui/ScrollProgress';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLang } from '@/lib/lang-context';
import { isCmsMediaUrl } from '@/lib/cms-media';

interface WeaponData {
  id: number;
  name: string;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  portrait?: string | null;
  infoImage?: string | null;
  backgroundImage?: string | null;
  icon?: string | null;
  videoType?: 'none' | 'youtube' | 'upload';
  videoUrl?: string | null;
  videoUpload?: string | null;
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId = parsed.searchParams.get('v');
    if (!videoId && parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function WeaponVideoButton({ weapon, onOpen }: { weapon: WeaponData; onOpen: () => void }) {
  const hasVideo = weapon.videoType === 'youtube' && weapon.videoUrl;
  if (!hasVideo) return null;

  return (
    <button type="button" className="weapons-detail__videoBtn" onClick={onOpen}>
      <Play size={18} />
      <span>Watch Video</span>
    </button>
  );
}

function VideoModal({ weapon, open, onClose }: { weapon: WeaponData; open: boolean; onClose: () => void }) {
  const embedUrl = weapon.videoType === 'youtube' && weapon.videoUrl
    ? getYoutubeEmbedUrl(weapon.videoUrl)
    : null;

  return (
    <AnimatePresence>
      {open && embedUrl ? (
        <div className="weapons-detail__modal">
          <button
            type="button"
            className="weapons-detail__modalBackdrop"
            onClick={onClose}
            aria-label="Close video overlay"
          />
          <motion.div
            className="weapons-detail__modalContent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <button type="button" className="weapons-detail__modalClose" onClick={onClose} aria-label="Close video">
              <X size={20} />
            </button>
            <iframe
              src={embedUrl}
              title={weapon.name}
              allowFullScreen
              className="weapons-detail__iframe"
            />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

// eslint-disable-next-line max-lines-per-function -- Single page component with weapon cards
export default function WeaponsPage() {
  const { t } = useLang();
  const { socialLinks, footer } = useSiteSettings();
  const [videoWeapon, setVideoWeapon] = useState<WeaponData | null>(null);
  const [weapons, setWeapons] = useState<WeaponData[]>([]);

  useEffect(() => {
    fetch('/api/public/weapons')
      .then((res) => res.json())
      .then((data) => {
        const docs = Array.isArray(data?.docs) ? data.docs : Array.isArray(data?.weapons) ? data.weapons : [];
        if (docs.length > 0) {
          setWeapons(docs.map((w: Record<string, unknown>) => ({
            id: w.id as number,
            name: (w.name as string) || '',
            descriptionEn: (w.descriptionEn as string) || null,
            descriptionTh: (w.descriptionTh as string) || null,
            portrait: w.portrait && typeof w.portrait === 'object' ? (w.portrait as Record<string, string>).url : null,
            infoImage: w.infoImage && typeof w.infoImage === 'object' ? (w.infoImage as Record<string, string>).url : null,
            backgroundImage: w.backgroundImage && typeof w.backgroundImage === 'object' ? (w.backgroundImage as Record<string, string>).url : null,
            icon: w.icon && typeof w.icon === 'object' ? (w.icon as Record<string, string>).url : null,
            videoType: (w.videoType as 'none' | 'youtube' | 'upload') || 'none',
            videoUrl: (w.videoUrl as string) || null,
            videoUpload: w.videoUpload && typeof w.videoUpload === 'object' ? (w.videoUpload as Record<string, string>).url : null,
          })));
        }
      })
      .catch(() => { /* fallback to empty */ });
  }, []);

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        <section className="page-hero">
          <div className="page-hero-bg"><div className="page-hero-overlay" /></div>
          <FloatingParticles count={8} />
          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">{t('à¸­à¸²à¸§à¸¸à¸˜', 'WEAPONS')}</span>
                <h1 className="page-hero-title">{t('à¸­à¸²à¸§à¸¸à¸˜à¹à¸«à¹ˆà¸‡ Arcatea', 'Weapons of Arcatea')}</h1>
                <p className="page-hero-subtitle">
                  {t(
                    'à¹€à¸¥à¸·à¸­à¸à¸­à¸²à¸§à¸¸à¸˜ à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸ªà¹„à¸•à¸¥à¹Œà¸à¸²à¸£à¹€à¸¥à¹ˆà¸™ à¹à¸•à¹ˆà¸¥à¸°à¸­à¸²à¸§à¸¸à¸˜à¸¡à¸µà¹€à¸­à¸à¸¥à¸±à¸à¸©à¸“à¹Œà¹à¸¥à¸°à¸ªà¸à¸´à¸¥à¹€à¸‰à¸žà¸²à¸°à¸•à¸±à¸§',
                    'Choose your weapon, change your playstyle. Each weapon has its own identity and skills.',
                  )}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="weapons-detail__list">
          <div className="container-custom">
            {weapons.length === 0 ? (
              <RevealSection>
                <div className="weapons-detail__empty">
                  <p>{t('à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸­à¸²à¸§à¸¸à¸˜à¸ˆà¸°à¹€à¸›à¸´à¸”à¹ƒà¸«à¹‰à¸”à¸¹à¹€à¸£à¹‡à¸§ à¹† à¸™à¸µà¹‰', 'Weapon details coming soon.')}</p>
                </div>
              </RevealSection>
            ) : (
              weapons.map((weapon, index) => (
                <RevealSection key={weapon.id} delay={index * 0.1}>
                  <article className={`weapons-detail__card ${index % 2 === 1 ? 'weapons-detail__card--reverse' : ''}`}>
                    <div className="weapons-detail__media">
                      {weapon.portrait ? (
                        <Image
                          src={weapon.portrait}
                          alt={weapon.name}
                          width={480}
                          height={600}
                          className="weapons-detail__portrait"
                          unoptimized={isCmsMediaUrl(weapon.portrait)}
                        />
                      ) : weapon.infoImage ? (
                        <Image
                          src={weapon.infoImage}
                          alt={weapon.name}
                          width={480}
                          height={600}
                          className="weapons-detail__portrait"
                          unoptimized={isCmsMediaUrl(weapon.infoImage)}
                        />
                      ) : (
                        <div className="weapons-detail__placeholder">
                          <span className="weapons-detail__placeholderIcon">âš”ï¸</span>
                        </div>
                      )}
                    </div>

                    <div className="weapons-detail__info">
                      <span className="weapons-detail__index">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="weapons-detail__name">{weapon.name}</h2>
                      <p className="weapons-detail__desc">
                        {t(weapon.descriptionTh || '', weapon.descriptionEn || '')}
                      </p>
                      <WeaponVideoButton weapon={weapon} onOpen={() => setVideoWeapon(weapon)} />
                    </div>
                  </article>
                </RevealSection>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />

      {videoWeapon ? (
        <VideoModal
          weapon={videoWeapon}
          open={Boolean(videoWeapon)}
          onClose={() => setVideoWeapon(null)}
        />
      ) : null}
    </div>
  );
}
