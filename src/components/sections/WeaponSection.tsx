'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import { isCmsMediaUrl } from '@/lib/cms-media';
import type { CMSWeapon, CMSWeaponSectionConfig } from '@/types/cms';

interface WeaponSectionProps {
  weapons: CMSWeapon[];
  sectionConfig?: CMSWeaponSectionConfig;
}

type WeaponCopy = {
  badgeText: string;
  titleText: string;
  introCopy: string;
  description: string;
  roleLabel: string;
  playLabel: string;
  previousLabel: string;
  nextLabel: string;
  selectedLabel: string;
  switchLabel: string;
};

function getYoutubeEmbedUrl(url: string) {
  if (!url) return null;

  const videoId = url.includes('v=')
    ? url.split('v=')[1]?.split('&')[0]
    : url.split('/').pop();

  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
}

function buildWeaponCopy(
  sectionConfig: CMSWeaponSectionConfig | undefined,
  activeWeapon: CMSWeapon,
  t: (th: string, en: string) => string,
): WeaponCopy {
  return {
    badgeText: sectionConfig
      ? t(sectionConfig.badgeTh, sectionConfig.badgeEn)
      : '',
    titleText: sectionConfig
      ? t(sectionConfig.titleTh, sectionConfig.titleEn)
      : '',
    introCopy: sectionConfig?.introEn || sectionConfig?.introTh
      ? t(sectionConfig.introTh || '', sectionConfig.introEn || '')
      : '',
    description: t(
      activeWeapon.descriptionTh || '',
      activeWeapon.descriptionEn || '',
    ),
    roleLabel: t('Combat role', 'Combat role'),
    playLabel: t('ดูวิดีโอแนะนำ', 'Play showcase'),
    previousLabel: t('อาวุธก่อนหน้า', 'Previous weapon'),
    nextLabel: t('อาวุธถัดไป', 'Next weapon'),
    selectedLabel: t('กำลังแสดง', 'Selected'),
    switchLabel: t('สลับมุมมอง', 'Switch focus'),
  };
}

function WeaponHeader({
  copy,
  activeIdx,
  totalWeapons,
  onPrev,
  onNext,
}: {
  copy: WeaponCopy;
  activeIdx: number;
  totalWeapons: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="home-weapons__header">
      <div className="home-weapons__intro">
        <span className="home-kicker">{copy.badgeText}</span>
        <h2 className="home-section-title">{copy.titleText}</h2>
        {copy.introCopy ? <p className="home-section-copy">{copy.introCopy}</p> : null}
      </div>

      <div className="home-weapons__toolbar">
        <span className="home-weapons__index">
          {String(activeIdx + 1).padStart(2, '0')} / {String(totalWeapons).padStart(2, '0')}
        </span>

        <div className="home-weapons__nav">
          <button onClick={onPrev} aria-label={copy.previousLabel} type="button">
            <ChevronLeft size={18} />
          </button>
          <button onClick={onNext} aria-label={copy.nextLabel} type="button">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function WeaponPanel({
  activeWeapon,
  copy,
  direction,
  onOpenVideo,
}: {
  activeWeapon: CMSWeapon;
  copy: WeaponCopy;
  direction: number;
  onOpenVideo: () => void;
}) {
  const hasVideo = activeWeapon.videoType !== 'none';

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={`weapon-${activeWeapon.id}`}
        className="home-weapons__panel"
        initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="home-weapons__backdrop">
          {activeWeapon.backgroundImage ? (
            <Image
              src={activeWeapon.backgroundImage}
              alt=""
              fill
              unoptimized={isCmsMediaUrl(activeWeapon.backgroundImage)}
            />
          ) : null}
        </div>

        <div className="home-weapons__shade" />

        <div className="home-weapons__panelBody">
          <span className="home-weapons__eyebrow">{copy.roleLabel}</span>
          <h3 className="home-weapons__name">{activeWeapon.name}</h3>
          <p className="home-weapons__desc">{copy.description}</p>

          {hasVideo ? (
            <button
              className="home-button home-button--ghost home-button--inline"
              onClick={onOpenVideo}
              type="button"
            >
              <Play size={16} />
              <span>{copy.playLabel}</span>
            </button>
          ) : null}
        </div>

        {activeWeapon.infoImage ? (
          <div className="home-weapons__infoImage">
            <Image
              src={activeWeapon.infoImage}
              alt={`${activeWeapon.name} info`}
              width={420}
              height={280}
              unoptimized={isCmsMediaUrl(activeWeapon.infoImage)}
            />
          </div>
        ) : null}

        <div className="home-weapons__portrait">
          {activeWeapon.portrait ? (
            <Image
              src={activeWeapon.portrait}
              alt={activeWeapon.name || ''}
              fill
              unoptimized={isCmsMediaUrl(activeWeapon.portrait)}
            />
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function WeaponSelectorDock({
  weapons,
  activeIdx,
  onSelect,
  copy,
}: {
  weapons: CMSWeapon[];
  activeIdx: number;
  onSelect: (index: number) => void;
  copy: WeaponCopy;
}) {
  return (
    <div className="home-weapons__selectorDock" role="tablist" aria-label="Weapon selector">
      {weapons.map((weapon, index) => (
        <button
          key={weapon.id}
          type="button"
          role="tab"
          aria-selected={index === activeIdx}
          className={`home-weapons__selectorButton ${index === activeIdx ? 'is-active' : ''}`}
          onClick={() => onSelect(index)}
        >
          <span className="home-weapons__selectorIcon">
            {weapon.icon ? (
              <Image
                src={weapon.icon}
                alt={weapon.name || ''}
                width={64}
                height={64}
                unoptimized={isCmsMediaUrl(weapon.icon)}
              />
            ) : (
              <span className="home-weapons__selectorIconFallback">
                {(weapon.name || '?').slice(0, 1)}
              </span>
            )}
          </span>

          <span className="home-weapons__selectorLabel">
            <strong>{weapon.name}</strong>
            <span>{index === activeIdx ? copy.selectedLabel : copy.switchLabel}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function WeaponVideoModal({
  activeWeapon,
  videoOpen,
  onClose,
}: {
  activeWeapon: CMSWeapon;
  videoOpen: boolean;
  onClose: () => void;
}) {
  const videoUrl = activeWeapon.videoType === 'youtube' && activeWeapon.videoUrl
    ? getYoutubeEmbedUrl(activeWeapon.videoUrl)
    : null;

  return (
    <AnimatePresence>
      {videoOpen ? (
        <div className="home-weapons__modal">
          <button
            type="button"
            className="home-weapons__modalBackdrop"
            onClick={onClose}
            aria-label="Close video"
          />

          <motion.div
            className="home-weapons__modalContent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.24 }}
          >
            <button
              className="home-weapons__modalClose"
              onClick={onClose}
              aria-label="Close video"
              type="button"
            >
              <X size={18} />
            </button>

            {activeWeapon.videoType === 'youtube' && videoUrl ? (
              <iframe src={videoUrl} allow="autoplay; encrypted-media" allowFullScreen title="Weapon showcase" />
            ) : null}

            {activeWeapon.videoType === 'upload' && activeWeapon.videoUpload ? (
              <video src={activeWeapon.videoUpload} controls autoPlay />
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export default function WeaponSection({ weapons, sectionConfig }: WeaponSectionProps) {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [videoOpen, setVideoOpen] = useState(false);

  if (weapons.length === 0) return null;

  const activeWeapon = weapons[activeIdx] || weapons[0];
  const copy = buildWeaponCopy(sectionConfig, activeWeapon, t);

  const goTo = (index: number) => {
    setDirection(index > activeIdx ? 1 : -1);
    setActiveIdx(index);

    const weapon = weapons[index];
    if (!weapon) return;

    import('@/lib/tracking').then((module) => module.trackWeaponClick(weapon.name || `Weapon_${index}`));
  };

  return (
    <section
      id="weapons"
      className="home-weapons"
      style={sectionConfig?.bgImage?.url
        ? {
          backgroundImage: `linear-gradient(180deg, rgba(2, 7, 16, 0.56), rgba(2, 7, 16, 0.86)), url(${sectionConfig.bgImage.url})`,
        }
        : undefined}
    >
      <div className="home-shell">
        <WeaponHeader
          copy={copy}
          activeIdx={activeIdx}
          totalWeapons={weapons.length}
          onPrev={() => goTo((activeIdx - 1 + weapons.length) % weapons.length)}
          onNext={() => goTo((activeIdx + 1) % weapons.length)}
        />

        <div className="home-weapons__stage">
          <WeaponPanel
            activeWeapon={activeWeapon}
            copy={copy}
            direction={direction}
            onOpenVideo={() => setVideoOpen(true)}
          />

          <WeaponSelectorDock
            weapons={weapons}
            activeIdx={activeIdx}
            onSelect={goTo}
            copy={copy}
          />
        </div>
      </div>

      <WeaponVideoModal
        activeWeapon={activeWeapon}
        videoOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
      />
    </section>
  );
}
