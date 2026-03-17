'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';

/* ═══════════════════════════════════════════════════
   DOWNLOAD PAGE — /download
   Platform buttons, system requirements, dark fantasy theme
   ═══════════════════════════════════════════════════ */

interface StoreButton {
  platform: string;
  label: string;
  url: string;
  icon: string;
}

const SYSTEM_REQUIREMENTS = {
  ios: {
    platform: 'iOS',
    icon: '🍎',
    specs: [
      { labelTh: 'ระบบปฏิบัติการ', labelEn: 'OS', value: 'iOS 14.0+' },
      { labelTh: 'เครื่อง', labelEn: 'Device', value: 'iPhone 8+' },
      { labelTh: 'พื้นที่', labelEn: 'Storage', value: '2.5 GB' },
      { labelTh: 'แรม', labelEn: 'RAM', value: '3 GB' },
    ],
  },
  android: {
    platform: 'Android',
    icon: '🤖',
    specs: [
      { labelTh: 'ระบบปฏิบัติการ', labelEn: 'OS', value: 'Android 8.0+' },
      { labelTh: 'โปรเซสเซอร์', labelEn: 'CPU', value: 'Snapdragon 660+' },
      { labelTh: 'พื้นที่', labelEn: 'Storage', value: '2.5 GB' },
      { labelTh: 'แรม', labelEn: 'RAM', value: '3 GB' },
    ],
  },
  pc: {
    platform: 'PC',
    icon: '🖥️',
    specs: [
      { labelTh: 'ระบบปฏิบัติการ', labelEn: 'OS', value: 'Windows 10 64-bit' },
      { labelTh: 'โปรเซสเซอร์', labelEn: 'CPU', value: 'Intel i5 / AMD Ryzen 5' },
      { labelTh: 'การ์ดจอ', labelEn: 'GPU', value: 'GTX 1050 / RX 560' },
      { labelTh: 'แรม', labelEn: 'RAM', value: '8 GB' },
      { labelTh: 'พื้นที่', labelEn: 'Storage', value: '5 GB' },
    ],
  },
};

export default function DownloadPage() {
  const { lang, t, toggle } = useLang();
  const [storeButtons, setStoreButtons] = useState<StoreButton[]>([]);
  const [activePlatform, setActivePlatform] = useState('android');

  const REAL_STORE_URLS: Record<string, string> = {
    ios: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
    android: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
    pc: '#',
  };

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        // Override '#' with real store URLs
        const buttons = (data.storeButtons || []).map((btn: StoreButton) => ({
          ...btn,
          url: btn.url === '#' ? (REAL_STORE_URLS[btn.platform] || '#') : btn.url,
        }));
        setStoreButtons(buttons);
      } catch {
        // fallback
      }
    }
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentReq = SYSTEM_REQUIREMENTS[activePlatform as keyof typeof SYSTEM_REQUIREMENTS];

  return (
    <div className="download-page">
      {/* Navigation */}
      <nav className="main-nav" style={{ backgroundColor: 'rgba(4,14,33,0.95)', opacity: 1 }}>
        <div className="nav-inner">
          <div className="nav-links">
            <Link href="/" className="nav-link">{t('หน้าหลัก', 'Home')}</Link>
            <Link href="/news" className="nav-link">{t('ข่าวสาร', 'News')}</Link>
            <Link href="/download" className="nav-link active">{t('ดาวน์โหลด', 'Download')}</Link>
          </div>
          <div className="nav-actions">
            <Link href="/event" className="nav-cta">{t('ลงทะเบียน', 'Register')}</Link>
            <button className="nav-lang" onClick={toggle}>{lang === 'th' ? 'EN' : 'TH'}</button>
          </div>
        </div>
      </nav>

      <main className="download-main">
        {/* Hero */}
        <section className="download-hero">
          <div className="download-hero-content">
            <Image
              src="/images/logo.webp"
              alt="Eternal Tower Saga"
              width={200}
              height={133}
              className="download-logo"
            />
            <h1 className="download-title">{t('ดาวน์โหลดเกม', 'Download the Game')}</h1>
            <p className="download-sub">{t(
              'เลือกแพลตฟอร์มของคุณและเริ่มผจญภัยใน Eternal Tower Saga',
              'Choose your platform and begin your adventure in Eternal Tower Saga'
            )}</p>
          </div>
        </section>

        {/* Platform Buttons */}
        <section className="download-platforms">
          <h2 className="download-section-title">{t('เลือกแพลตฟอร์ม', 'Choose Platform')}</h2>
          <div className="download-buttons">
            {storeButtons.length > 0 ? storeButtons.map((btn, i) => (
              <a
                key={i}
                href={btn.url || '#'}
                className="download-platform-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="download-platform-icon">{btn.icon || '📱'}</span>
                <span className="download-platform-name">{btn.label}</span>
                <span className="download-platform-action">{t('ดาวน์โหลด', 'Download')}</span>
              </a>
            )) : (
              <>
                <div className="download-platform-card coming-soon">
                  <span className="download-platform-icon">🍎</span>
                  <span className="download-platform-name">App Store</span>
                  <span className="download-platform-action">{t('เร็วๆ นี้', 'Coming Soon')}</span>
                </div>
                <div className="download-platform-card coming-soon">
                  <span className="download-platform-icon">🤖</span>
                  <span className="download-platform-name">Google Play</span>
                  <span className="download-platform-action">{t('เร็วๆ นี้', 'Coming Soon')}</span>
                </div>
                <div className="download-platform-card coming-soon">
                  <span className="download-platform-icon">🖥️</span>
                  <span className="download-platform-name">PC Client</span>
                  <span className="download-platform-action">{t('เร็วๆ นี้', 'Coming Soon')}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* System Requirements */}
        <section className="download-requirements">
          <h2 className="download-section-title">{t('สเปคขั้นต่ำ', 'Minimum Requirements')}</h2>

          <div className="download-req-tabs">
            {Object.entries(SYSTEM_REQUIREMENTS).map(([key, req]) => (
              <button
                key={key}
                className={`download-req-tab ${activePlatform === key ? 'active' : ''}`}
                onClick={() => setActivePlatform(key)}
              >
                {req.icon} {req.platform}
              </button>
            ))}
          </div>

          <div className="download-req-table">
            {currentReq.specs.map((spec, i) => (
              <div key={i} className="download-req-row">
                <span className="download-req-label">{t(spec.labelTh, spec.labelEn)}</span>
                <span className="download-req-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="download-cta-section">
          <p className="download-cta-text">{t(
            'เกมยังไม่เปิดให้ดาวน์โหลด? ลงทะเบียนล่วงหน้าเพื่อรับรางวัลพิเศษ!',
            'Game not available yet? Pre-register now for exclusive rewards!'
          )}</p>
          <Link href="/event" className="download-cta-btn">
            {t('ลงทะเบียนล่วงหน้า', 'Pre-Register Now')} →
          </Link>
        </section>
      </main>

      <footer className="main-footer">
        <div className="footer-inner">
          <div className="footer-copy">
            <p>© 2026 อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
