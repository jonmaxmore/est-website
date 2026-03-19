'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import { useCountdown } from '@/hooks/useCountdown';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import type { EventSettings, StoreButton } from '@/types/event';

interface EventHeroProps {
  eventSettings: EventSettings;
  countdownTarget: number;
  registrationCount: number;
  displayStoreButtons: StoreButton[];
}

export default function EventHero({
  eventSettings,
  countdownTarget,
  registrationCount,
  displayStoreButtons,
}: EventHeroProps) {
  const { t } = useLang();
  const countdown = useCountdown(countdownTarget);

  const scrollToForm = () => {
    document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="event-hero">
      {/* Background */}
      <div className="event-hero-bg">
        <Image
          src={eventSettings.backgroundImage?.url || '/images/hero-bg.webp'}
          alt=""
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
        <div className="event-hero-gradient-top" />
        <div className="event-hero-gradient" />
      </div>

      <div className="event-hero-content">
        {/* Game Logo */}
        <motion.div
          className="event-logo-wrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src="/images/logo.webp" alt="Eternal Tower Saga" width={380} height={250} className="event-logo" priority />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="event-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {t(
            'สัมผัสประสบการณ์ใหม่กับ Eternal Tower Saga (ETS)\n"อาวุธเปลี่ยน เกมก็เปลี่ยน จากผู้เล่น สู่...ผู้กุมเกม"',
            'Rewrite the rules of the MMORPG!\nStep into a whole new experience with Eternal Tower Saga (ETS)\n"Switch your weapon. Shift the battlefield.\nRise from player... to ruler of the game."'
          )}
        </motion.p>

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
          <span className="hero-cta-shimmer" />
          <span className="event-cta-text">
            {t(eventSettings.ctaButtonTh || 'ลงทะเบียนล่วงหน้าเลย', eventSettings.ctaButtonEn || 'Pre-Register Now')}
          </span>
        </motion.button>

        {/* Store Buttons */}
        <motion.div
          className="hero-stores"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {displayStoreButtons.map((btn) => (
            <a key={btn.platform} href={btn.url} className="store-btn" target="_blank" rel="noopener noreferrer">
              {STORE_ICONS[btn.platform] || null}
              <div><small>{btn.sublabel}</small><strong>{btn.label}</strong></div>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
