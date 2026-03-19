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
  rewardImage?: string | null;
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
  ctaButtonEn?: string;
  ctaButtonTh?: string;
  modalTitleEn?: string;
  modalTitleTh?: string;
  emailPlaceholderEn?: string;
  emailPlaceholderTh?: string;
  storeLabelEn?: string;
  storeLabelTh?: string;
  submitButtonEn?: string;
  submitButtonTh?: string;
  successTitleEn?: string;
  successTitleTh?: string;
}

/* ═══════════════════════════════════════════════
   DEFAULT MILESTONES
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

/* Country options from Figma */
const COUNTRIES = [
  { value: 'th', labelTh: 'ไทย', labelEn: 'Thailand' },
  { value: 'my', labelTh: 'มาเลเซีย', labelEn: 'Malaysia' },
  { value: 'id', labelTh: 'อินโดนีเซีย', labelEn: 'Indonesia' },
  { value: 'ph', labelTh: 'ฟิลิปปินส์', labelEn: 'Philippines' },
  { value: 'sg', labelTh: 'สิงคโปร์', labelEn: 'Singapore' },
];

/* ═══════════════════════════════════════════════
   EVENT PAGE — Figma Design (3 Screens)
   Screen 1: Hero
   Screen 2: Registration Form (inline)
   Screen 3: Milestone Rewards
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [storeButtons, setStoreButtons] = useState<StoreButton[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [eventSettings, setEventSettings] = useState<EventSettings>({});
  const [countdownTarget, setCountdownTarget] = useState(DEFAULT_TARGET);

  const { lang, toggle, t } = useLang();
  const countdown = useCountdown(countdownTarget);

  // Fetch CMS data
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setRegistrationCount(data.totalRegistrations || 0);
        if (data.milestones?.length) {
          setMilestones(data.milestones.map((m: { threshold: number; rewardEn: string; rewardTh: string; rewardImage?: { url: string } | null }) => ({
            threshold: m.threshold,
            label: m.threshold.toLocaleString(),
            rewards: [m.rewardTh || m.rewardEn],
            rewardImage: m.rewardImage?.url || null,
          })));
        }
      })
      .catch(() => {});

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
    url: btn.url === '#' ? (REAL_STORE_URLS[btn.platform] || '#') : btn.url,
  }));

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
      setShowSuccessModal(true);

      // Redirect to store
      const selectedStore = displayStoreButtons.find(btn => btn.platform === platform);
      if (selectedStore && selectedStore.url && selectedStore.url !== '#') {
        setTimeout(() => {
          window.open(selectedStore.url, '_blank');
        }, 2000);
      }

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

  const scrollToForm = () => {
    document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="event-page">
      <FloatingParticles count={35} />

      {/* ═══ LIGHT RAYS ═══ */}
      <div className="light-rays">
        <div className="ray ray-1" />
        <div className="ray ray-2" />
      </div>

      {/* ═══ ORANGE PRE-REGISTER TAB ═══ */}
      <div className="event-prereg-tab">
        <div className="event-prereg-tab-inner">
          {t('Pre-register', 'Pre-register')}
        </div>
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

      {/* ═══════════════════════════════════════════════
         SCREEN 1: HERO
         ═══════════════════════════════════════════════ */}
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

      {/* ═══ ORNAMENT DIVIDER ═══ */}
      <div className="ornament-divider">
        <span className="ornament-line" />
        <span className="ornament-diamond" />
        <span className="ornament-center">✦</span>
        <span className="ornament-diamond" />
        <span className="ornament-line" />
      </div>

      {/* ═══════════════════════════════════════════════
         SCREEN 2: REGISTRATION FORM (Inline)
         ═══════════════════════════════════════════════ */}
      <section id="register-form" className="event-form-section">
        <motion.div
          className="event-parchment-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Corner ornaments */}
          <span className="parchment-corner top-left" />
          <span className="parchment-corner top-right" />
          <span className="parchment-corner bottom-left" />
          <span className="parchment-corner bottom-right" />

          {!registered ? (
            <>
              <h2 className="event-form-title">
                {t(eventSettings.modalTitleTh || 'ลงทะเบียนล่วงหน้า', eventSettings.modalTitleEn || 'Pre-registration')}
              </h2>

              <p className="event-form-step">
                <strong>1.</strong> {t(
                  'กรอกข้อมูล และตรวจสอบความถูกต้องก่อนลงทะเบียน',
                  'Fill in your information and verify its accuracy before registering.'
                )}
              </p>

              <form onSubmit={handleRegister}>
                {/* Email */}
                <input
                  type="email"
                  placeholder={t(eventSettings.emailPlaceholderTh || 'กรุณากรอก E-MAIL ของคุณ', eventSettings.emailPlaceholderEn || 'Please enter your E-mail address')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="event-input"
                />

                {/* Country Radio Buttons */}
                <div className="event-radio-group">
                  {COUNTRIES.map((country) => (
                    <label key={country.value} className="event-radio-label">
                      <input
                        type="radio"
                        name="region"
                        value={country.value}
                        checked={region === country.value}
                        onChange={(e) => setRegion(e.target.value)}
                        className="event-radio-input"
                      />
                      {t(country.labelTh, country.labelEn)}
                    </label>
                  ))}
                </div>

                <hr className="event-form-divider" />

                {/* Step 2 */}
                <p className="event-form-step">
                  <strong>2.</strong> {t(
                    'คลิกเลือกอุปกรณ์เพื่อลงทะเบียน เมื่อคลิกจะไปยังหน้าสโตร์โดยอัตโนมัติ',
                    'Select your device to proceed and confirm your registration.'
                  )}
                </p>

                {/* Store Selection */}
                <div className="event-form-stores">
                  {displayStoreButtons.filter(btn => btn.platform !== 'pc').map((btn) => (
                    <button
                      key={btn.platform}
                      type="button"
                      className={`event-form-store-btn ${platform === btn.platform ? 'selected' : ''}`}
                      onClick={() => setPlatform(btn.platform)}
                    >
                      {STORE_ICONS[btn.platform] || null}
                      <span>{btn.label}</span>
                    </button>
                  ))}
                </div>

                {error && <p className="event-error">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !platform || !region}
                  className={`event-submit-btn ${(!platform || !region) ? 'disabled' : ''}`}
                >
                  {loading
                    ? t('กำลังลงทะเบียน...', 'Registering...')
                    : t(eventSettings.submitButtonTh || 'กดลงทะเบียน', eventSettings.submitButtonEn || 'Confirm Registration')
                  }
                </button>
              </form>
            </>
          ) : (
            /* After registration — show success inline */
            <div style={{ textAlign: 'center' }}>
              <p className="event-success-title">
                ✅ {t(eventSettings.successTitleTh || 'ลงทะเบียนสำเร็จ!', eventSettings.successTitleEn || 'Registration Successful!')}
              </p>
              <p className="event-form-step">
                {t('แชร์ให้เพื่อนเพื่อรับรางวัลพิเศษ', 'Share with friends for bonus rewards')}
              </p>

              {/* Referral link */}
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
            </div>
          )}
        </motion.div>
      </section>

      {/* ═══ ORNAMENT DIVIDER ═══ */}
      <div className="ornament-divider">
        <span className="ornament-line" />
        <span className="ornament-diamond" />
        <span className="ornament-center">✦</span>
        <span className="ornament-diamond" />
        <span className="ornament-line" />
      </div>

      {/* ═══════════════════════════════════════════════
         SCREEN 3: MILESTONE REWARDS
         ═══════════════════════════════════════════════ */}
      <section className="event-milestones">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-header">
              <span className="section-badge">
                {t(eventSettings.milestoneBadgeTh || 'รางวัลกิจกรรม', eventSettings.milestoneBadgeEn || 'MILESTONE REWARDS')}
              </span>
              <h2 className="section-title-gold">
                {t(eventSettings.milestoneTitleTh || 'รางวัลกิจกรรม', eventSettings.milestoneTitleEn || 'Milestone Rewards')}
              </h2>
              <div className="title-ornament"><span /><span /><span /></div>
            </div>

            {/* Large Registration Count */}
            <div className="event-milestone-count">
              <div className="event-milestone-count-number">{registrationCount.toLocaleString()}</div>
              <div className="event-milestone-count-label">{t('ผู้ลงทะเบียน', 'Users')}</div>
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
                    {m.rewardImage ? (
                      <img src={m.rewardImage} alt="reward" width={64} height={64} className="milestone-reward-img" />
                    ) : (
                      registrationCount >= m.threshold ? '🎁' : '🔒'
                    )}
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

      {/* ═══════════════════════════════════════════════
         SUCCESS POPUP (POP UP 1 — Parchment Style)
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="event-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="event-modal-backdrop" onClick={() => setShowSuccessModal(false)} />
            <motion.div
              className="event-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button onClick={() => setShowSuccessModal(false)} className="event-modal-close">×</button>

              <div className="event-parchment-card event-success-parchment">
                {/* Corner ornaments */}
                <span className="parchment-corner top-left" />
                <span className="parchment-corner top-right" />
                <span className="parchment-corner bottom-left" />
                <span className="parchment-corner bottom-right" />

                <p className="event-success-title">
                  {t('ท่านได้ลงทะเบียนล่วงหน้าเบื้องต้นสำเร็จแล้ว!', 'Your initial pre-registration was successful!')}
                </p>

                <hr className="event-form-divider" />

                <p className="event-success-body">
                  {t(
                    'กรุณาคลิกปุ่มด้านล่าง! ตามอุปกรณ์ของท่าน\nเพื่อยืนยันการลงทะเบียน',
                    'Please click the button below for your device\nto confirm your registration'
                  )}
                </p>

                {/* App Store / Google Play badges */}
                <div className="event-store-badges">
                  <a
                    href={REAL_STORE_URLS.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-store-badge-link"
                  >
                    <div className="store-btn" style={{ minWidth: '200px' }}>
                      {STORE_ICONS.ios}
                      <div><small>Pre-order on the</small><strong>App Store</strong></div>
                    </div>
                  </a>
                  <a
                    href={REAL_STORE_URLS.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-store-badge-link"
                  >
                    <div className="store-btn" style={{ minWidth: '200px' }}>
                      {STORE_ICONS.android}
                      <div><small>PRE-REGISTER ON</small><strong>Google Play</strong></div>
                    </div>
                  </a>
                </div>

                <p className="event-success-pc-note">
                  {t('* พบกับเวอร์ชั่น PC เร็วๆ นี้ *', '* PC version coming soon *')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
