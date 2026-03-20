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
            <button onClick={onClose} className="event-modal-close">×</button>

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

              {/* App Store / Google Play badges — using CMS URLs */}
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
  );
}
