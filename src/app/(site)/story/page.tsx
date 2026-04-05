'use client';

import Image from 'next/image';
import Navigation from '@/components/site/Navigation';
import Footer from '@/components/site/Footer';
import RevealSection from '@/components/ui/RevealSection';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { useLang } from '@/lib/lang-context';

interface StorySection {
  titleEn: string;
  titleTh: string;
  contentEn: string;
  contentTh: string;
}

interface StoryPageConfig {
  heroImage: { url: string } | null;
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  subtitleEn: string;
  subtitleTh: string;
  sections: StorySection[];
}

export default function StoryPage() {
  const { t } = useLang();
  const { settings, loaded, socialLinks, footer } = useSiteSettings();
  const config = (settings?.storyPage as StoryPageConfig | undefined) || null;

  const badge = config ? t(config.badgeTh, config.badgeEn) : 'LORE';
  const title = config ? t(config.titleTh, config.titleEn) : t('à¹€à¸™à¸·à¹‰à¸­à¹€à¸£à¸·à¹ˆà¸­à¸‡', 'Story');
  const subtitle = config
    ? t(config.subtitleTh, config.subtitleEn)
    : t('à¹€à¸£à¸·à¹ˆà¸­à¸‡à¸£à¸²à¸§à¹à¸«à¹ˆà¸‡à¸”à¸´à¸™à¹à¸”à¸™ Arcatea à¹à¸¥à¸°à¸«à¸­à¸„à¸­à¸¢à¹„à¸£à¹‰à¸‚à¸­à¸šà¹€à¸‚à¸•', 'The tale of Arcatea and The Boundless Spire');
  const sections = config?.sections || [];

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        <section className="page-hero page-hero-story">
          <div className="page-hero-bg">
            {config?.heroImage?.url ? (
              <Image
                src={config.heroImage.url}
                alt=""
                fill
                className="object-cover"
                priority
                unoptimized={isCmsMediaUrl(config.heroImage.url)}
              />
            ) : null}
            <div className="page-hero-overlay" />
          </div>

          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">{badge}</span>
                <h1 className="page-hero-title">{title}</h1>
                <p className="page-hero-subtitle">{subtitle}</p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="section-story-content">
          <div className="container-custom">
            {sections.map((section, index) => (
              <RevealSection key={`${section.titleEn}-${index}`} delay={index * 0.1}>
                <div className="story-block">
                  <h2 className="story-block-title">{t(section.titleTh, section.titleEn)}</h2>
                  <p className="story-block-text">{t(section.contentTh, section.contentEn)}</p>
                </div>
              </RevealSection>
            ))}

            {sections.length === 0 ? (
              <div className="story-block story-empty-state">
                <p>
                  {loaded
                    ? t('à¹€à¸™à¸·à¹‰à¸­à¹€à¸£à¸·à¹ˆà¸­à¸‡à¸à¸³à¸¥à¸±à¸‡à¸ˆà¸°à¸¡à¸²à¹€à¸£à¹‡à¸§ à¹† à¸™à¸µà¹‰...', 'Story coming soon...')
                    : t('à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”à¹€à¸™à¸·à¹‰à¸­à¹€à¸£à¸·à¹ˆà¸­à¸‡...', 'Loading story...')}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
