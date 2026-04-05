'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import type { EventSettings, StoreButton, ReferralStats } from '@/types/event';
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

// eslint-disable-next-line max-lines-per-function -- form component with registration + referral stats
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
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  // Fetch referral stats after registration
  useEffect(() => {
    if (registered && referralCode) {
      fetch(`/api/referral-stats?code=${referralCode}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.referralCode) setReferralStats(data);
        })
        .catch(() => {});
    }
  }, [registered, referralCode]);

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
              {t(eventSettings.modalTitleTh || '', eventSettings.modalTitleEn || '')}
            </h2>

            <p className="event-form-step">
              <strong>1.</strong> {t(
                eventSettings.emailPlaceholderTh ? 'à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ à¹à¸¥à¸°à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸„à¸§à¸²à¸¡à¸–à¸¹à¸à¸•à¹‰à¸­à¸‡à¸à¹ˆà¸­à¸™à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™' : 'à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ à¹à¸¥à¸°à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸„à¸§à¸²à¸¡à¸–à¸¹à¸à¸•à¹‰à¸­à¸‡à¸à¹ˆà¸­à¸™à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™',
                'Fill in your information and verify its accuracy before registering.'
              )}
            </p>

            <form onSubmit={handleRegister}>
              {/* Email */}
              <input
                type="email"
                placeholder={t(eventSettings.emailPlaceholderTh || '', eventSettings.emailPlaceholderEn || '')}
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
                  eventSettings.storeLabelTh || '',
                  eventSettings.storeLabelEn || ''
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
                  ? t('à¸à¸³à¸¥à¸±à¸‡à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™...', 'Registering...')
                  : t(eventSettings.submitButtonTh || '', eventSettings.submitButtonEn || '')
                }
              </button>
            </form>
          </>
        ) : (
          /* After registration â€” show success inline + referral stats */
          <div className="event-success-inline">
            <p className="event-success-title">
              âœ… {t(eventSettings.successTitleTh || '', eventSettings.successTitleEn || '')}
            </p>
            <p className="event-form-step">
              {t('à¹à¸Šà¸£à¹Œà¹ƒà¸«à¹‰à¹€à¸žà¸·à¹ˆà¸­à¸™à¹€à¸žà¸·à¹ˆà¸­à¸£à¸±à¸šà¸£à¸²à¸‡à¸§à¸±à¸¥à¸žà¸´à¹€à¸¨à¸©', 'Share with friends for bonus rewards')}
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
                {copied ? t('âœ“ à¸„à¸±à¸”à¸¥à¸­à¸!', 'âœ“ Copied!') : t('à¸„à¸±à¸”à¸¥à¸­à¸', 'Copy')}
              </button>
            </div>

            {/* Referral Stats */}
            {referralStats && (
              <div className="event-referral-stats">
                <div className="referral-stats-grid">
                  <div className="referral-stat-item">
                    <span className="referral-stat-value">{referralStats.level1Count}</span>
                    <span className="referral-stat-label">{t('à¹€à¸Šà¸´à¸à¸•à¸£à¸‡ (L1)', 'Direct (L1)')}</span>
                  </div>
                  <div className="referral-stat-item">
                    <span className="referral-stat-value">{referralStats.level2Count}</span>
                    <span className="referral-stat-label">{t('à¸—à¸²à¸‡à¸­à¹‰à¸­à¸¡ (L2)', 'Indirect (L2)')}</span>
                  </div>
                  <div className="referral-stat-item">
                    <span className="referral-stat-value">{referralStats.totalPoints}</span>
                    <span className="referral-stat-label">{t('à¸„à¸°à¹à¸™à¸™à¸£à¸§à¸¡', 'Total Points')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}
