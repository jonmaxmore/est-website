'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { STORE_ICONS } from '@/components/ui/StoreIcons';
import type { CMSSettings } from '@/types/cms';

interface HeroProps {
  settings: CMSSettings | null;
}

// eslint-disable-next-line max-lines-per-function -- Hero keeps media, CTA, and store badge rendering together for clarity
export default function HeroSection({ settings }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { t } = useLang();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.35]);

  const eyebrow = settings?.event?.enabled
    ? t(settings?.event?.titleTh || '', settings?.event?.titleEn || '')
    : '';

  const tagline = t(
    settings?.hero?.taglineTh || '',
    settings?.hero?.taglineEn || '',
  );

  const description = t(
    settings?.site?.description || '',
    settings?.site?.description || '',
  );

  const ctaText = t(
    settings?.hero?.ctaTextTh || '',
    settings?.hero?.ctaTextEn || '',
  );

  const taglineImageUrl = t(
    settings?.hero?.taglineImageTh?.url || '',
    settings?.hero?.taglineImageEn?.url || '',
  ) || null;

  const mastheadCopy = t(
    settings?.site?.description || '',
    settings?.site?.description || '',
  );
  const ctaLink = settings?.hero?.ctaLink || '/event';
  const brandLogoUrl = settings?.site?.logo || null;
  const backgroundImage = settings?.hero?.backgroundImage?.url || null;
  const videoUrl = settings?.hero?.backgroundVideo?.url || null;
  const storeButtons = Array.from(
    new Map((settings?.storeButtons || []).map((button) => [button.platform, button])).values(),
  );

  return (
    <section id="hero" ref={sectionRef} className="home-hero">
      <div className="home-hero__media" aria-hidden="true">
        {videoUrl ? (
          <div className="home-hero__video">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={() => setVideoLoaded(true)}
              className={videoLoaded ? 'is-ready' : ''}
            >
              <source src={videoUrl} type={videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
            </video>
          </div>
        ) : null}

        {backgroundImage ? (
          <div className="home-hero__image">
            <Image src={backgroundImage} alt="" fill priority unoptimized={isCmsMediaUrl(backgroundImage)} />
          </div>
        ) : null}
      </div>

      <div className="home-hero__veil" />
      <div className="home-hero__orb home-hero__orb--one" />
      <div className="home-hero__orb home-hero__orb--two" />

      <motion.div
        className="home-hero__content"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="home-shell home-hero__shell">
          <div className="home-hero__copy">
            <div className="home-hero__masthead">
              <span className="home-hero__mastheadTitle">{settings?.site?.name || ''}</span>
              <span className="home-hero__mastheadDivider" aria-hidden="true" />
              <span className="home-hero__mastheadCopy">{mastheadCopy}</span>
            </div>

            <span className="home-kicker">{eyebrow}</span>

            {brandLogoUrl ? (
              <motion.div
                className="home-hero__brand"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={brandLogoUrl}
                  alt={settings?.site?.name || ''}
                  width={520}
                  height={320}
                  priority
                  unoptimized={isCmsMediaUrl(brandLogoUrl)}
                />
              </motion.div>
            ) : null}

            <motion.div
              className="home-hero__taglineWrap"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="sr-only">{tagline}</h1>
              {taglineImageUrl ? (
                <Image
                  src={taglineImageUrl}
                  alt={tagline}
                  width={720}
                  height={160}
                  className="home-hero__taglineImage"
                  unoptimized={isCmsMediaUrl(taglineImageUrl)}
                />
              ) : (
                <p className="home-hero__tagline">{tagline}</p>
              )}
            </motion.div>

            <motion.p
              className="home-hero__lede"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {description}
            </motion.p>

            <motion.div
              className="home-hero__actions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={ctaLink} className="home-button home-button--primary">
                {ctaText}
              </Link>
            </motion.div>

            {storeButtons.length > 0 ? (
              <motion.div
                className="home-hero__stores"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
              >
                {storeButtons.map((button) => {
                  const badgeSrc = button.icon?.url || null;
                  const hasBadgeImage = Boolean(badgeSrc);

                  return (
                    <a
                      key={button.platform}
                      href={button.url}
                      className={`home-store-button ${hasBadgeImage ? 'home-store-button--market' : ''}`.trim()}
                      title={`${button.sublabel} ${button.label}`.trim()}
                      onClick={() => {
                        import('@/lib/tracking').then((module) => module.trackStoreClick(button.platform, button.url));
                      }}
                    >
                      {hasBadgeImage ? (
                        <span className="home-store-button__visual">
                          <Image
                            src={badgeSrc as string}
                            alt={`${button.sublabel} ${button.label}`.trim()}
                            width={188}
                            height={56}
                            className="home-store-button__badgeImage"
                            unoptimized={isCmsMediaUrl(badgeSrc as string)}
                          />
                        </span>
                      ) : (
                        <>
                          {STORE_ICONS[button.platform] || null}
                          <span className="home-store-button__copy">
                            <small>{button.sublabel}</small>
                            <strong>{button.label}</strong>
                          </span>
                        </>
                      )}
                    </a>
                  );
                })}
              </motion.div>
            ) : null}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="home-hero__scroll"
        aria-hidden="true"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>{t('เลื่อนลง', 'Scroll')}</span>
        <span className="home-hero__scrollDot">↓</span>
      </motion.div>
    </section>
  );
}
