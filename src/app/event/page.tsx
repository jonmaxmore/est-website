'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import { SOCIAL_SVGS } from '@/components/ui/SocialIcons';

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

interface EventSettings {
  badgeTextEn?: string;
  badgeTextTh?: string;
  milestoneBadgeEn?: string;
  milestoneBadgeTh?: string;
  milestoneTitleEn?: string;
  milestoneTitleTh?: string;
  footerText?: string;
  countdownTarget?: string;
  heroImage?: { url: string } | null;
  backgroundImage?: { url: string } | null;
  contentSections?: Array<{ contentType: string; textEn?: string; textTh?: string; image?: { url: string } | null }>;
}

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

const DEFAULT_TARGET = new Date('2026-04-02T23:59:59+07:00').getTime();

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
  const [eventSettings, setEventSettings] = useState<EventSettings>({});
  const [countdownTarget, setCountdownTarget] = useState(DEFAULT_TARGET);

  const { lang, toggle, t } = useLang();

  const countdown = useCountdown(countdownTarget);

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
        if (data.event) {
          setEventSettings(data.event);
          if (data.event.countdownTarget) {
            setCountdownTarget(new Date(data.event.countdownTarget).getTime());
          }
        }
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
        body: JSON.stringify({ email, platform, region }),
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
          <span className="event-badge-text">{t(eventSettings.badgeTextTh || 'ลงทะเบียนล่วงหน้า', eventSettings.badgeTextEn || 'PRE-REGISTER')}</span>
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

        {/* === REGISTRATION COUNT — Large Prominent Display === */}
        <motion.div
          className="event-reg-counter"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className="event-reg-count-number">{registrationCount.toLocaleString()}</span>
          <span className="event-reg-count-label">{t('ผู้ลงทะเบียนล่วงหน้าแล้ว', 'Pre-Registered')}</span>
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
              <span className="section-badge">{t(eventSettings.milestoneBadgeTh || 'รางวัลสะสม', eventSettings.milestoneBadgeEn || 'MILESTONE REWARDS')}</span>
              <h2 className="section-title-gold">{t(eventSettings.milestoneTitleTh || 'รางวัลสะสม Pre-Register', eventSettings.milestoneTitleEn || 'Milestone Rewards')}</h2>
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
          <p className="event-footer-copy">{eventSettings.footerText || '© 2026 Eternal Tower Saga. All rights reserved.'}</p>
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
                  aria-label={t('เลือกภูมิภาค', 'Select region')}
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
