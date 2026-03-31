'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cpu, HardDrive, Layers, MemoryStick, Monitor, Smartphone, Tablet } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import FloatingParticles from '@/components/ui/FloatingParticles';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLang } from '@/lib/lang-context';

interface StoreButton {
  platform: string;
  label: string;
  url: string;
}

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

// eslint-disable-next-line max-lines-per-function -- Page keeps platform download and system requirement logic together
export default function DownloadPage() {
  const { t } = useLang();
  const { settings, socialLinks, footer } = useSiteSettings();
  const dlConfig = (settings?.downloadPage as Record<string, string> | undefined) || null;
  const [activePlatform, setActivePlatform] = useState('android');
  const logoUrl = settings?.site?.logo?.url || null;

  const realStoreUrls: Record<string, string> = {
    ios: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
    android: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
    pc: '#',
  };

  const storeButtons = Array.isArray(settings?.storeButtons)
    ? (settings.storeButtons as StoreButton[]).map((button) => ({
      ...button,
      url: button.url === '#' ? (realStoreUrls[button.platform] || '#') : button.url,
    }))
    : [];

  const currentRequirements = SYSTEM_REQUIREMENTS[activePlatform as keyof typeof SYSTEM_REQUIREMENTS];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation logoUrl={logoUrl} />

      <main className="download-main download-main-padded">
        <section className="download-hero">
          <FloatingParticles count={10} />
          <div className="download-hero-glow" />

          <div className="download-hero-content">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Eternal Tower Saga"
                width={200}
                height={133}
                className="download-logo"
              />
            ) : null}
            <h1 className="download-title">{t(dlConfig?.titleTh || 'ดาวน์โหลดเกม', dlConfig?.titleEn || 'Download the Game')}</h1>
            <p className="download-sub">
              {t(
                dlConfig?.subtitleTh || 'เลือกแพลตฟอร์มของคุณและเริ่มผจญภัยใน Eternal Tower Saga',
                dlConfig?.subtitleEn || 'Choose your platform and begin your adventure in Eternal Tower Saga',
              )}
            </p>
          </div>
        </section>

        <section className="download-platforms">
          <h2 className="download-section-title">{t('เลือกแพลตฟอร์ม', 'Choose Platform')}</h2>
          <div className="download-buttons">
            {storeButtons.length > 0 ? (
              storeButtons.map((button) => (
                <a
                  key={button.platform}
                  href={button.url || '#'}
                  className="download-platform-card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="download-platform-icon">
                    {STORE_ICONS[button.platform] || <Smartphone size={32} />}
                  </span>
                  <span className="download-platform-name">{button.label}</span>
                  <span className="download-platform-action">{t('ดาวน์โหลด', 'Download')}</span>
                </a>
              ))
            ) : (
              <>
                <a href={realStoreUrls.ios} className="download-platform-card" target="_blank" rel="noopener noreferrer">
                  <span className="download-platform-icon">{STORE_ICONS.ios}</span>
                  <span className="download-platform-name">App Store</span>
                  <span className="download-platform-action">{t('Pre-order', 'Pre-order')}</span>
                </a>
                <a href={realStoreUrls.android} className="download-platform-card" target="_blank" rel="noopener noreferrer">
                  <span className="download-platform-icon">{STORE_ICONS.android}</span>
                  <span className="download-platform-name">Google Play</span>
                  <span className="download-platform-action">{t('ลงทะเบียนล่วงหน้า', 'Pre-register')}</span>
                </a>
                <div className="download-platform-card coming-soon">
                  <span className="download-platform-icon">{STORE_ICONS.pc}</span>
                  <span className="download-platform-name">PC Client</span>
                  <span className="download-platform-action">{t('เร็ว ๆ นี้', 'Coming soon')}</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="download-requirements">
          <h2 className="download-section-title">{t('สเปคขั้นต่ำ', 'Minimum Requirements')}</h2>

          <div className="download-req-tabs">
            {Object.entries(SYSTEM_REQUIREMENTS).map(([key, requirement]) => (
              <button
                key={key}
                className={`download-req-tab ${activePlatform === key ? 'active' : ''}`}
                onClick={() => setActivePlatform(key)}
              >
                {PLATFORM_TAB_ICONS[key]} {requirement.platform}
              </button>
            ))}
          </div>

          <div className="download-req-table">
            {currentRequirements.specs.map((spec, index) => (
              <div key={index} className="download-req-row">
                <span className="download-req-icon">{spec.icon}</span>
                <span className="download-req-label">{t(spec.labelTh, spec.labelEn)}</span>
                <span className="download-req-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="download-cta-section">
          <p className="download-cta-text">
            {t(
              dlConfig?.ctaCopyTh || 'เกมยังไม่เปิดให้ดาวน์โหลด? ลงทะเบียนล่วงหน้าเพื่อรับรางวัลพิเศษ!',
              dlConfig?.ctaCopyEn || 'Game not out yet? Pre-register first to lock in your launch rewards.',
            )}
          </p>
          <Link href="/event" className="download-cta-btn">
            {t('ลงทะเบียนล่วงหน้า', 'Join the pre-registration')} →
          </Link>
        </section>
      </main>

      <Footer socialLinks={socialLinks} footer={footer} logoUrl={logoUrl} />
    </div>
  );
}
