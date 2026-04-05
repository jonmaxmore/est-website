'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import type { StoreUrls } from '@/types/event';

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  storeUrls: StoreUrls;
}

export default function SuccessModal({ show, onClose, storeUrls }: SuccessModalProps) {
  const { t } = useLang();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="event-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="event-modal-backdrop" onClick={onClose} />
          <motion.div
            className="event-modal"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button onClick={onClose} className="event-modal-close">Ã—</button>

            <div className="event-parchment-card event-success-parchment">
              {/* Corner ornaments */}
              <span className="parchment-corner top-left" />
              <span className="parchment-corner top-right" />
              <span className="parchment-corner bottom-left" />
              <span className="parchment-corner bottom-right" />

              <p className="event-success-title">
                {t('à¸—à¹ˆà¸²à¸™à¹„à¸”à¹‰à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸²à¹€à¸šà¸·à¹‰à¸­à¸‡à¸•à¹‰à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆà¹à¸¥à¹‰à¸§!', 'Your initial pre-registration was successful!')}
              </p>

              <hr className="event-form-divider" />

              <p className="event-success-body">
                {t(
                  'à¸à¸£à¸¸à¸“à¸²à¸„à¸¥à¸´à¸à¸›à¸¸à¹ˆà¸¡à¸”à¹‰à¸²à¸™à¸¥à¹ˆà¸²à¸‡! à¸•à¸²à¸¡à¸­à¸¸à¸›à¸à¸£à¸“à¹Œà¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™\nà¹€à¸žà¸·à¹ˆà¸­à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™',
                  'Please click the button below for your device\nto confirm your registration'
                )}
              </p>

              {/* App Store / Google Play badges â€” using CMS URLs */}
              <div className="event-store-badges">
                <a
                  href={storeUrls.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-store-badge-link"
                >
                  <div className="store-btn store-btn-modal">
                    {STORE_ICONS.ios}
                    <div><small>Pre-order on the</small><strong>App Store</strong></div>
                  </div>
                </a>
                <a
                  href={storeUrls.android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-store-badge-link"
                >
                  <div className="store-btn store-btn-modal">
                    {STORE_ICONS.android}
                    <div><small>Register on</small><strong>Google Play</strong></div>
                  </div>
                </a>
              </div>

              <p className="event-success-pc-note">
                {t('* à¸žà¸šà¸à¸±à¸šà¹€à¸§à¸­à¸£à¹Œà¸Šà¸±à¹ˆà¸™ PC à¹€à¸£à¹‡à¸§à¹† à¸™à¸µà¹‰ *', '* PC version coming soon *')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
