'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { Monitor, Smartphone, Tablet, HardDrive, Cpu, MemoryStick, Layers } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';

/* ═══════════════════════════════════════════════════
   DOWNLOAD PAGE — /download
   Premium platform download cards with system requirements
   ═══════════════════════════════════════════════════ */

interface StoreButton {
  platform: string;
  label: string;
  url: string;
  icon: string;
}

/* Platform SVG icons for system requirements tabs */
const PLATFORM_TAB_ICONS: Record<string, React.ReactElement> = {
  ios: <Smartphone size={18} />,
  android: <Tablet size={18} />,
  pc: <Monitor size={18} />,
};

const SYSTEM_REQUIREMENTS = {
  ios: {
    platform: 'iOS',
    specs: [
      { labelTh: 'ระบบปฏิบัติการ', labelEn: 'OS', value: 'iOS 14.0+', icon: <Layers size={16} /> },
      { labelTh: 'เครื่อง', labelEn: 'Device', value: 'iPhone 8+', icon: <Smartphone size={16} /> },
      { labelTh: 'พื้นที่', labelEn: 'Storage', value: '2.5 GB', icon: <HardDrive size={16} /> },
      { labelTh: 'แรม', labelEn: 'RAM', value: '3 GB', icon: <MemoryStick size={16} /> },
    ],
  },
  android: {
    platform: 'Android',
    specs: [
      { labelTh: 'ระบบปฏิบัติการ', labelEn: 'OS', value: 'Android 8.0+', icon: <Layers size={16} /> },
      { labelTh: 'โปรเซสเซอร์', labelEn: 'CPU', value: 'Snapdragon 660+', icon: <Cpu size={16} /> },
      { labelTh: 'พื้นที่', labelEn: 'Storage', value: '2.5 GB', icon: <HardDrive size={16} /> },
      { labelTh: 'แรม', labelEn: 'RAM', value: '3 GB', icon: <MemoryStick size={16} /> },
    ],
  },
  pc: {
    platform: 'PC',
    specs: [
      { labelTh: 'ระบบปฏิบัติการ', labelEn: 'OS', value: 'Windows 10 64-bit', icon: <Layers size={16} /> },
      { labelTh: 'โปรเซสเซอร์', labelEn: 'CPU', value: 'Intel i5 / AMD Ryzen 5', icon: <Cpu size={16} /> },
      { labelTh: 'การ์ดจอ', labelEn: 'GPU', value: 'GTX 1050 / RX 560', icon: <Monitor size={16} /> },
      { labelTh: 'แรม', labelEn: 'RAM', value: '8 GB', icon: <MemoryStick size={16} /> },
      { labelTh: 'พื้นที่', labelEn: 'Storage', value: '5 GB', icon: <HardDrive size={16} /> },
    ],
  },
};

export default function DownloadPage() {
  const { t } = useLang();
  const [storeButtons, setStoreButtons] = useState<StoreButton[]>([]);
  const [activePlatform, setActivePlatform] = useState('android');
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [footer, setFooter] = useState({
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  });

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
        const buttons = (data.storeButtons || []).map((btn: StoreButton) => ({
          ...btn,
          url: btn.url === '#' ? (REAL_STORE_URLS[btn.platform] || '#') : btn.url,
        }));
        setStoreButtons(buttons);
        if (data?.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data?.site?.footer) setFooter(data.site.footer);
      } catch {
        // fallback
      }
    }
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentReq = SYSTEM_REQUIREMENTS[activePlatform as keyof typeof SYSTEM_REQUIREMENTS];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main className="download-main" style={{ paddingTop: '5rem' }}>
        {/* Hero with visual depth */}
        <section className="download-hero">
          <FloatingParticles count={10} />
          <div className="download-hero-glow" />
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

        {/* Platform Buttons — with SVG store icons */}
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
                <span className="download-platform-icon">
                  {STORE_ICONS[btn.platform] || <Smartphone size={32} />}
                </span>
                <span className="download-platform-name">{btn.label}</span>
                <span className="download-platform-action">{t('ดาวน์โหลด', 'Download')}</span>
              </a>
            )) : (
              <>
                <a href={REAL_STORE_URLS.ios} className="download-platform-card" target="_blank" rel="noopener noreferrer">
                  <span className="download-platform-icon">{STORE_ICONS.ios}</span>
                  <span className="download-platform-name">App Store</span>
                  <span className="download-platform-action">{t('Pre-order', 'Pre-order')}</span>
                </a>
                <a href={REAL_STORE_URLS.android} className="download-platform-card" target="_blank" rel="noopener noreferrer">
                  <span className="download-platform-icon">{STORE_ICONS.android}</span>
                  <span className="download-platform-name">Google Play</span>
                  <span className="download-platform-action">{t('ลงทะเบียนล่วงหน้า', 'Pre-Register')}</span>
                </a>
                <div className="download-platform-card coming-soon">
                  <span className="download-platform-icon">{STORE_ICONS.pc}</span>
                  <span className="download-platform-name">PC Client</span>
                  <span className="download-platform-action">{t('เร็วๆ นี้', 'Coming Soon')}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* System Requirements — with SVG tab icons */}
        <section className="download-requirements">
          <h2 className="download-section-title">{t('สเปคขั้นต่ำ', 'Minimum Requirements')}</h2>

          <div className="download-req-tabs">
            {Object.entries(SYSTEM_REQUIREMENTS).map(([key, req]) => (
              <button
                key={key}
                className={`download-req-tab ${activePlatform === key ? 'active' : ''}`}
                onClick={() => setActivePlatform(key)}
              >
                {PLATFORM_TAB_ICONS[key]} {req.platform}
              </button>
            ))}
          </div>

          <div className="download-req-table">
            {currentReq.specs.map((spec, i) => (
              <div key={i} className="download-req-row">
                <span className="download-req-icon">{spec.icon}</span>
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

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
