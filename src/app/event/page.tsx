'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';

/* ═══════════════════════════════════════════════
   FLOATING PARTICLES — reused from landing page
   ═══════════════════════════════════════════════ */
function FloatingParticles({ count = 25 }: { count?: number }) {
  const particles = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.1,
    })),
    [count]
  );

  return (
    <div className="particle-field">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COUNTDOWN HOOK
   ═══════════════════════════════════════════════ */
function useCountdown(targetTimestamp: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = targetTimestamp - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return timeLeft;
}

/* ═══════════════════════════════════════════════
   CMS TYPES
   ═══════════════════════════════════════════════ */
interface Milestone {
  threshold: number;
  label: string;
  rewards: string[];
}

interface StoreButton {
  platform: string;
  label: string;
  sublabel: string;
  url: string;
}

const STORE_ICONS: Record<string, React.ReactElement> = {
  ios: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z"/><path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
  android: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814 13.792 12 3.609 22.186a.996.996 0 0 1-.609-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707L15.6 8.9l-8.428-4.883 10.525 6.083zm.689.4 2.5 1.448c.68.394.68 1.036 0 1.43l-2.5 1.448L16.19 12l2.198-2.6z"/></svg>,
  pc: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>,
};

const SOCIAL_SVGS: Record<string, React.ReactElement> = {
  facebook: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  tiktok: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  youtube: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#071833"/></svg>,
  discord: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
};

/* ═══════════════════════════════════════════════
   DEFAULT MILESTONES (fallback if CMS unavailable)
   ═══════════════════════════════════════════════ */
const DEFAULT_MILESTONES: Milestone[] = [
  { threshold: 10000, label: '10,000', rewards: ['Gold ×200,000', 'Fatigue Scroll ×10'] },
  { threshold: 25000, label: '25,000', rewards: ['Weapon Stone ×100', 'Armor Stone ×100'] },
  { threshold: 50000, label: '50,000', rewards: ['Mana ×12,000', 'Accessory Stone ×100'] },
  { threshold: 100000, label: '100,000', rewards: ['Clothing Ticket ×10'] },
  { threshold: 150000, label: '150,000', rewards: ['Summon Ticket ×10'] },
  { threshold: 200000, label: '200,000', rewards: ['Fortune House ×1', 'Reset Potions ×4'] },
];

// Stable target timestamp outside component
const TARGET_DATE_TIMESTAMP = new Date('2026-04-02T23:59:59+07:00').getTime();

/* ═══════════════════════════════════════════════
   EVENT PAGE — Premium Pre-Registration
   ═══════════════════════════════════════════════ */
export default function EventPage() {
  const [registered, setRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [storeButtons, setStoreButtons] = useState<StoreButton[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});

  const { lang, toggle, t } = useLang();

  const countdown = useCountdown(TARGET_DATE_TIMESTAMP);

  // Fetch CMS data
  useEffect(() => {
    // Stats
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setRegistrationCount(data.totalRegistrations || 0);
        if (data.milestones?.length) {
          setMilestones(data.milestones.map((m: { threshold: number; rewardNameEn: string; rewardNameTh: string }) => ({
            threshold: m.threshold,
            label: m.threshold.toLocaleString(),
            rewards: [m.rewardNameTh || m.rewardNameEn],
          })));
        }
      })
      .catch(() => {});

    // Settings
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.storeButtons) setStoreButtons(data.storeButtons);
        if (data.site?.socialLinks) setSocialLinks(data.site.socialLinks);
      })
      .catch(() => {});
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, platform, region, recaptchaToken: 'dev-mode' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setReferralCode(data.referralCode);
      setRegistered(true);
      setRegistrationCount(prev => prev + 1);

      // Find the selected store URL and redirect
      const selectedStore = displayStoreButtons.find(btn => btn.platform === platform);
      if (selectedStore && selectedStore.url && selectedStore.url !== '#') {
        // Show success briefly, then redirect
        setTimeout(() => {
          window.open(selectedStore.url, '_blank');
        }, 1500);
      }
      setShowModal(false);

      // Track conversion — Meta Pixel
      if (typeof window !== 'undefined' && 'fbq' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fbq('track', 'CompleteRegistration', {
          content_name: 'Pre-Registration',
          platform,
          region,
        });
      }
      // Track conversion — GA4
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gtag('event', 'sign_up', {
          method: 'pre-registration',
          platform,
          region,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = useCallback(() => {
    const link = `${window.location.origin}/event?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralCode]);

  const maxThreshold = milestones.length ? milestones[milestones.length - 1].threshold : 200000;
  const progressPercent = Math.min((registrationCount / maxThreshold) * 100, 100);

  const REAL_STORE_URLS: Record<string, string> = {
    ios: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
    android: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
    pc: '#',
  };

  const displayStoreButtons = (storeButtons.length ? storeButtons : [
    { platform: 'ios', label: 'App Store', sublabel: 'Pre-order on the', url: REAL_STORE_URLS.ios },
    { platform: 'android', label: 'Google Play', sublabel: 'PRE-REGISTER ON', url: REAL_STORE_URLS.android },
    { platform: 'pc', label: 'Windows', sublabel: 'Coming soon', url: '#' },
  ]).map(btn => ({
    ...btn,
    // Override '#' with real store URLs
    url: btn.url === '#' ? (REAL_STORE_URLS[btn.platform] || '#') : btn.url,
  }));

  return (
    <main className="event-page">
      <FloatingParticles count={35} />

      {/* ═══ LIGHT RAYS ═══ */}
      <div className="light-rays">
        <div className="ray ray-1" />
        <div className="ray ray-2" />
      </div>

      {/* ═══ NAV BAR ═══ */}
      <nav className="event-nav">
        <div className="event-nav-inner">
          <div className="nav-social">
            {Object.entries(socialLinks).map(([key, url]) => {
              if (!url || !SOCIAL_SVGS[key]) return null;
              return (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="nav-social-icon">
                  {SOCIAL_SVGS[key]}
                </a>
              );
            })}
            {!Object.values(socialLinks).some(v => v) && (
              <>
                <a href="#" className="nav-social-icon" aria-label="Discord">{SOCIAL_SVGS.discord}</a>
                <a href="#" className="nav-social-icon" aria-label="Facebook">{SOCIAL_SVGS.facebook}</a>
                <a href="#" className="nav-social-icon" aria-label="YouTube">{SOCIAL_SVGS.youtube}</a>
              </>
            )}
          </div>
          <div className="event-nav-right">
          <Link href="/" className="event-back-link">← {t('หน้าแรก', 'Home')}</Link>
            <button className="nav-lang" onClick={toggle}>{lang === 'th' ? 'EN' : 'TH'}</button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="event-hero">
        {/* Game Logo */}
        <motion.div
          className="event-logo-wrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src="/images/logo.webp" alt="Eternal Tower Saga" width={380} height={250} className="event-logo" priority />
        </motion.div>

        {/* Pre-register Badge */}
        <motion.div
          className="event-badge"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="event-badge-text">PRE-REGISTER</span>
          <span className="event-badge-shimmer" />
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          className="event-countdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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

        {/* CTA / Success State */}
        {!registered ? (
          <motion.button
            onClick={() => setShowModal(true)}
            className="event-cta"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(91,192,235,0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="hero-cta-shimmer" />
            <span className="event-cta-text">{t('ลงทะเบียนล่วงหน้าเลย', 'Pre-Register Now')}</span>
          </motion.button>
        ) : (
          <motion.div
            className="event-success-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="event-success-title">✅ {t('ลงทะเบียนสำเร็จ!', 'Registration Successful!')}</p>
            <p className="event-success-sub">{t('แชร์ให้เพื่อนเพื่อรับรางวัลพิเศษ', 'Share with friends for bonus rewards')}</p>

            {/* Store redirect button */}
            {(() => {
              const selectedStore = displayStoreButtons.find(btn => btn.platform === platform);
              return selectedStore ? (
                <a
                  href={selectedStore.url !== '#' ? selectedStore.url : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-store-redirect-btn"
                >
                  {STORE_ICONS[selectedStore.platform] || null}
                  <span>{t(`ไปที่ ${selectedStore.label}`, `Go to ${selectedStore.label}`)}</span>
                  <span className="event-store-redirect-arrow">→</span>
                </a>
              ) : null;
            })()}

            <div className="event-referral-row">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/event?ref=${referralCode}`}
                className="event-referral-input"
              />
              <button onClick={copyReferralLink} className="event-referral-btn">
                {copied ? t('✓ คัดลอก!', '✓ Copied!') : t('คัดลอก', 'Copy')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Store Buttons — from CMS */}
        <motion.div
          className="hero-stores"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {displayStoreButtons.map((btn) => (
            <a key={btn.platform} href={btn.url} className="store-btn">
              {STORE_ICONS[btn.platform] || null}
              <div><small>{btn.sublabel}</small><strong>{btn.label}</strong></div>
            </a>
          ))}
        </motion.div>
      </section>

      {/* ═══ ORNAMENT ═══ */}
      <div className="ornament-divider">
        <span className="ornament-line" />
        <span className="ornament-diamond" />
        <span className="ornament-center">✦</span>
        <span className="ornament-diamond" />
        <span className="ornament-line" />
      </div>

      {/* ═══ MILESTONE TRACKER ═══ */}
      <section className="event-milestones">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-header">
              <span className="section-badge">MILESTONE REWARDS</span>
              <h2 className="section-title-gold">{t('รางวัลสะสม Pre-Register', 'Milestone Rewards')}</h2>
              <div className="title-ornament"><span /><span /><span /></div>
            </div>

            {/* Progress Bar */}
            <div className="milestone-progress-wrap">
              <div className="milestone-progress-header">
                <span>{t('🚩 จำนวนผู้ลงทะเบียน', '🚩 Total Registrations')}</span>
                <span className="milestone-count">{registrationCount.toLocaleString()} / {maxThreshold.toLocaleString()}</span>
              </div>
              <div className="milestone-bar-dark">
                <motion.div
                  className="milestone-bar-fill-dark"
                  initial={{ width: '0%' }}
                  whileInView={{ width: `${progressPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                />
                {milestones.map((m) => (
                  <div
                    key={m.threshold}
                    className={`milestone-node-dark ${registrationCount >= m.threshold ? 'unlocked' : ''}`}
                    style={{ left: `${(m.threshold / maxThreshold) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Reward Tiers Grid */}
            <div className="milestone-grid">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.threshold}
                  className={`milestone-card ${registrationCount >= m.threshold ? 'unlocked' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
                >
                  <div className="milestone-card-icon">
                    {registrationCount >= m.threshold ? '🎁' : '🔒'}
                  </div>
                  <div className="milestone-card-threshold">{m.label}</div>
                  {m.rewards.map((r, j) => (
                    <div key={j} className="milestone-card-reward">{r}</div>
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="event-footer">
        <div className="event-footer-inner">
          <Image src="/images/logo.webp" alt="EST" width={120} height={80} className="footer-logo" />
          <p className="event-footer-copy">© 2026 Eternal Tower Saga. All rights reserved.</p>
        </div>
      </footer>

      {/* ═══ REGISTRATION MODAL ═══ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="event-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="event-modal-backdrop" onClick={() => setShowModal(false)} />
            <motion.div
              className="event-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button onClick={() => setShowModal(false)} className="event-modal-close">×</button>

              <h2 className="event-modal-title">{t('ลงทะเบียนล่วงหน้า', 'Pre-Register')}</h2>

              <form onSubmit={handleRegister} className="event-modal-form">
                <input
                  type="email"
                  placeholder={t('กรอก Email ของท่าน', 'Enter your email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="event-input"
                />

                {/* Store Selection Cards — Must select before submit */}
                <label className="event-store-label">{t('เลือกสโตร์ที่ต้องการ', 'Choose your store')} <span className="required">*</span></label>
                <div className="event-store-cards">
                  {displayStoreButtons.map((btn) => (
                    <button
                      key={btn.platform}
                      type="button"
                      className={`event-store-card ${platform === btn.platform ? 'selected' : ''}`}
                      onClick={() => setPlatform(btn.platform)}
                    >
                      <span className="event-store-card-icon">{STORE_ICONS[btn.platform] || null}</span>
                      <span className="event-store-card-name">{btn.label}</span>
                    </button>
                  ))}
                </div>
                {!platform && <p className="event-store-hint">{t('กรุณาเลือกสโตร์ก่อนลงทะเบียน', 'Please select a store to continue')}</p>}

                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  className="event-select"
                >
                  <option value="">{t('เลือกภูมิภาค', 'Select region')}</option>
                  <option value="th">{t('ไทย', 'Thailand')}</option>
                  <option value="sea">{t('เอเชียตะวันออกเฉียงใต้', 'Southeast Asia')}</option>
                  <option value="global">{t('ทั่วโลก', 'Global')}</option>
                </select>
                {error && <p className="event-error">{error}</p>}
                <button type="submit" disabled={loading || !platform} className={`event-submit-btn ${!platform ? 'disabled' : ''}`}>
                  {loading ? t('กำลังลงทะเบียน...', 'Registering...') : t('ลงทะเบียนและไปที่สโตร์', 'Register & Go to Store')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
