'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import type { EventSettings, StoreButton } from '@/types/event';
import { COUNTRIES } from '@/types/event';

interface EventFormProps {
  eventSettings: EventSettings;
  displayStoreButtons: StoreButton[];
  /* Form state (from useEventForm hook) */
  email: string;
  platform: string;
  region: string;
  loading: boolean;
  error: string;
  registered: boolean;
  referralCode: string;
  copied: boolean;
  setEmail: (v: string) => void;
  setPlatform: (v: string) => void;
  setRegion: (v: string) => void;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  copyReferralLink: () => void;
}

export default function EventForm({
  eventSettings,
  displayStoreButtons,
  email,
  platform,
  region,
  loading,
  error,
  registered,
  referralCode,
  copied,
  setEmail,
  setPlatform,
  setRegion,
  handleRegister,
  copyReferralLink,
}: EventFormProps) {
  const { t } = useLang();

  return (
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
          <div className="event-success-inline">
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
                aria-label="Referral link"
              />
              <button onClick={copyReferralLink} className="event-referral-btn">
                {copied ? t('✓ คัดลอก!', '✓ Copied!') : t('คัดลอก', 'Copy')}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
