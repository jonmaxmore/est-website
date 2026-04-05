'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cpu, HardDrive, Layers, MemoryStick, Monitor, Smartphone, Tablet } from 'lucide-react';
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
      { labelTh: 'à¸£à¸°à¸šà¸šà¸›à¸à¸´à¸šà¸±à¸•à¸´à¸à¸²à¸£', labelEn: 'OS', value: 'iOS 14.0+', icon: <Layers size={16} /> },
      { labelTh: 'à¹€à¸„à¸£à¸·à¹ˆà¸­à¸‡', labelEn: 'Device', value: 'iPhone 8+', icon: <Smartphone size={16} /> },
      { labelTh: 'à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ', labelEn: 'Storage', value: '2.5 GB', icon: <HardDrive size={16} /> },
      { labelTh: 'à¹à¸£à¸¡', labelEn: 'RAM', value: '3 GB', icon: <MemoryStick size={16} /> },
    ],
  },
  android: {
    platform: 'Android',
    specs: [
      { labelTh: 'à¸£à¸°à¸šà¸šà¸›à¸à¸´à¸šà¸±à¸•à¸´à¸à¸²à¸£', labelEn: 'OS', value: 'Android 8.0+', icon: <Layers size={16} /> },
      { labelTh: 'à¹‚à¸›à¸£à¹€à¸‹à¸ªà¹€à¸‹à¸­à¸£à¹Œ', labelEn: 'CPU', value: 'Snapdragon 660+', icon: <Cpu size={16} /> },
      { labelTh: 'à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ', labelEn: 'Storage', value: '2.5 GB', icon: <HardDrive size={16} /> },
      { labelTh: 'à¹à¸£à¸¡', labelEn: 'RAM', value: '3 GB', icon: <MemoryStick size={16} /> },
    ],
  },
  pc: {
    platform: 'PC',
    specs: [
      { labelTh: 'à¸£à¸°à¸šà¸šà¸›à¸à¸´à¸šà¸±à¸•à¸´à¸à¸²à¸£', labelEn: 'OS', value: 'Windows 10 64-bit', icon: <Layers size={16} /> },
      { labelTh: 'à¹‚à¸›à¸£à¹€à¸‹à¸ªà¹€à¸‹à¸­à¸£à¹Œ', labelEn: 'CPU', value: 'Intel i5 / AMD Ryzen 5', icon: <Cpu size={16} /> },
      { labelTh: 'à¸à¸²à¸£à¹Œà¸”à¸ˆà¸­', labelEn: 'GPU', value: 'GTX 1050 / RX 560', icon: <Monitor size={16} /> },
      { labelTh: 'à¹à¸£à¸¡', labelEn: 'RAM', value: '8 GB', icon: <MemoryStick size={16} /> },
      { labelTh: 'à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ', labelEn: 'Storage', value: '5 GB', icon: <HardDrive size={16} /> },
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
            <h1 className="download-title">{t(dlConfig?.titleTh || '', dlConfig?.titleEn || '')}</h1>
            <p className="download-sub">
              {t(
                dlConfig?.subtitleTh || '',
                dlConfig?.subtitleEn || '',
              )}
            </p>
          </div>
        </section>

        <section className="download-platforms">
          <h2 className="download-section-title">{t('à¹€à¸¥à¸·à¸­à¸à¹à¸žà¸¥à¸•à¸Ÿà¸­à¸£à¹Œà¸¡', 'Choose Platform')}</h2>
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
                  <span className="download-platform-action">{t('à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”', 'Download')}</span>
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
                  <span className="download-platform-action">{t('à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸²', 'Pre-register')}</span>
                </a>
                <div className="download-platform-card coming-soon">
                  <span className="download-platform-icon">{STORE_ICONS.pc}</span>
                  <span className="download-platform-name">PC Client</span>
                  <span className="download-platform-action">{t('à¹€à¸£à¹‡à¸§ à¹† à¸™à¸µà¹‰', 'Coming soon')}</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="download-requirements">
          <h2 className="download-section-title">{t('à¸ªà¹€à¸›à¸„à¸‚à¸±à¹‰à¸™à¸•à¹ˆà¸³', 'Minimum Requirements')}</h2>

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
              dlConfig?.ctaCopyTh || '',
              dlConfig?.ctaCopyEn || '',
            )}
          </p>
          <Link href="/event" className="download-cta-btn">
            {t('à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸²', 'Join the pre-registration')} â†’
          </Link>
        </section>
      </main>

      
    </div>
  );
}
