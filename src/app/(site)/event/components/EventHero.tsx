'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import { useCountdown } from '@/hooks/useCountdown';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import { trackStoreClick, trackCTAClick } from '@/lib/tracking';
import type { EventSettings, StoreButton } from '@/types/event';

interface EventHeroProps {
  eventSettings: EventSettings;
  countdownTarget: number;
  registrationCount: number;
  displayStoreButtons: StoreButton[];
  logoUrl?: string | null;
}

// eslint-disable-next-line max-lines-per-function -- Hero component with JSX template
export default function EventHero({
  eventSettings,
  countdownTarget,
  registrationCount,
  displayStoreButtons,
  logoUrl,
}: EventHeroProps) {
  const { t } = useLang();
  const countdown = useCountdown(countdownTarget);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const scrollToForm = () => {
    const label = t(eventSettings.ctaButtonTh || '', eventSettings.ctaButtonEn || '');
    trackCTAClick(label);
    document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStoreClick = (btn: StoreButton) => {
    const url = btn.trackingUrl || btn.url;
    trackStoreClick(btn.platform, url);
  };

  // CTA image from CMS
  const ctaImage = eventSettings.ctaButtonImage;

  return (
    <section className="event-hero" ref={heroRef}>
      {/* Background — video (priority) or image with parallax */}
      <motion.div className="event-hero-bg" style={{ y: eventSettings.backgroundVideo ? undefined : bgY }}>
        {eventSettings.backgroundVideo?.url ? (
          <video
            className="event-hero-video"
            autoPlay
            loop
            muted
            playsInline
            poster={eventSettings.backgroundImage?.url || undefined}
          >
            <source src={eventSettings.backgroundVideo.url} type={eventSettings.backgroundVideo.mimeType || 'video/mp4'} />
          </video>
        ) : eventSettings.backgroundImage?.url ? (
          <Image
            src={eventSettings.backgroundImage.url}
            alt=""
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        ) : null}
        <div className="event-hero-gradient-top" />
        <div className="event-hero-gradient" />
      </motion.div>

      <div className="event-hero-content">
        {/* Game Logo */}
        <motion.div
          className="event-logo-wrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {logoUrl ? (
            <Image src={logoUrl} alt="Eternal Tower Saga" width={380} height={250} className="event-logo" priority />
          ) : null}
        </motion.div>

        {/* Tagline — CMS: Event Config → Media → Tagline Image, or Copy & Text → Description */}
        <motion.div
          className="event-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {(eventSettings.descriptionImageTh?.url || eventSettings.descriptionImageEn?.url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t(eventSettings.descriptionImageTh?.url || '', eventSettings.descriptionImageEn?.url || '')}
              alt={t(eventSettings.descriptionTh || '', eventSettings.descriptionEn || '')}
              className="event-tagline-image"
            />
          ) : (
            <p>
              {t(
                eventSettings.descriptionTh || '',
                eventSettings.descriptionEn || ''
              )}
            </p>
          )}
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          className="event-countdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { value: countdown.days, label: t('วัน', 'Days') },
            { value: countdown.hours, label: t('ชั่วโมง', 'Hours') },
            { value: countdown.minutes, label: t('นาที', 'Minutes') },
            { value: countdown.seconds, label: t('วินาที', 'Seconds') },
          ].map((item) => (
            <div key={item.label} className="countdown-unit">
              <motion.div
                className="countdown-value"
                key={item.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {String(item.value).padStart(2, '0')}
              </motion.div>
              <span className="countdown-label">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Registration Count */}
        <motion.div
          className="event-reg-counter"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="event-reg-count-number">{registrationCount.toLocaleString()}</span>
          <span className="event-reg-count-label">{t('ผู้ลงทะเบียนล่วงหน้าแล้ว', 'Pre-Registered')}</span>
        </motion.div>

        {/* CTA Button — scrolls to form */}
        <motion.button
          onClick={scrollToForm}
          className="event-cta"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(245,166,35,0.4)' }}
          whileTap={{ scale: 0.98 }}
        >
          {ctaImage?.url ? (
            <Image
              src={ctaImage.url}
              alt={t(eventSettings.ctaButtonTh || '', eventSettings.ctaButtonEn || '')}
              width={300}
              height={60}
              className="event-cta-image"
            />
          ) : (
            <>
              <span className="hero-cta-shimmer" />
              <span className="event-cta-text">
                {t(eventSettings.ctaButtonTh || '', eventSettings.ctaButtonEn || '')}
              </span>
            </>
          )}
        </motion.button>

        {/* Store Buttons */}
        <motion.div
          className="hero-stores"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {displayStoreButtons.map((btn) => {
            const href = btn.trackingUrl || btn.url;
            return (
              <a
                key={btn.platform}
                href={href}
                className="store-btn"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleStoreClick(btn)}
                data-track-platform={btn.platform}
              >
                {btn.badgeImage?.url ? (
                  <Image
                    src={btn.badgeImage.url}
                    alt={btn.label}
                    width={160}
                    height={48}
                    className="store-badge-img"
                  />
                ) : (
                  <>
                    {STORE_ICONS[btn.platform] || null}
                    <div><small>{btn.sublabel}</small><strong>{btn.label}</strong></div>
                  </>
                )}
              </a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
