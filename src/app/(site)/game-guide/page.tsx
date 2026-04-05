'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Castle, Map, Shield, Sparkles, Swords, Users, type LucideIcon } from 'lucide-react';
import CmsLink from '@/components/ui/CmsLink';
import RevealSection from '@/components/ui/RevealSection';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { DEFAULT_GAME_GUIDE_FEATURES, GAME_GUIDE_PILLARS } from '@/lib/game-guide-content';
import { useLang } from '@/lib/lang-context';
import type { CMSFeature } from '@/types/cms';

const ICON_MAP: Record<string, LucideIcon> = {
  swords: Swords,
  map: Map,
  castle: Castle,
  shield: Shield,
  sparkles: Sparkles,
  users: Users,
};

type TranslateFn = (th: string, en: string) => string;

interface GuideImage {
  url: string;
  alt?: string | null;
}

interface GameGuideFeature {
  icon: string;
  iconImage?: GuideImage | null;
  previewImage?: GuideImage | null;
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  href?: string | null;
  ctaLabelEn?: string | null;
  ctaLabelTh?: string | null;
}

interface GameGuidePageConfig {
  heroImage: GuideImage | null;
  systemsBackgroundImage?: GuideImage | null;
  badgeEn: string;
  badgeTh: string;
  titleEn: string;
  titleTh: string;
  subtitleEn: string;
  subtitleTh: string;
  heroPanelLabelEn?: string | null;
  heroPanelLabelTh?: string | null;
  heroPanelCopyEn?: string | null;
  heroPanelCopyTh?: string | null;
  systemsBadgeEn?: string | null;
  systemsBadgeTh?: string | null;
  systemsTitleEn?: string | null;
  systemsTitleTh?: string | null;
  systemsCopyEn?: string | null;
  systemsCopyTh?: string | null;
  pillarsEn?: string[];
  pillarsTh?: string[];
  features: GameGuideFeature[];
}

interface GuideCopy {
  badge: string;
  title: string;
  subtitle: string;
  heroPanelLabel: string;
  heroPanelCopy: string;
  systemsBadge: string;
  systemsTitle: string;
  systemsCopy: string;
  selectLabel: string;
}

function FeatureIcon({ feature }: { feature: GameGuideFeature }) {
  if (feature.iconImage?.url) {
    return (
      <Image
        src={feature.iconImage.url}
        alt=""
        width={26}
        height={26}
        unoptimized={isCmsMediaUrl(feature.iconImage.url)}
      />
    );
  }

  const IconComponent = ICON_MAP[feature.icon?.toLowerCase()] || Sparkles;
  return <IconComponent size={24} />;
}

function buildGuideCopy(config: GameGuidePageConfig | null, t: TranslateFn): GuideCopy {
  return {
    badge: config ? t(config.badgeTh, config.badgeEn) : t('à¹à¸™à¸°à¸™à¸³à¹€à¸à¸¡', 'GAME GUIDE'),
    title: config ? t(config.titleTh, config.titleEn) : t('à¹à¸™à¸°à¸™à¸³à¹€à¸à¸¡', 'Game Guide'),
    subtitle: config
      ? t(config.subtitleTh, config.subtitleEn)
      : t(
        'à¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸£à¸°à¸šà¸šà¸«à¸¥à¸±à¸à¸‚à¸­à¸‡ Eternal Tower Saga à¹à¸šà¸šà¹€à¸£à¹‡à¸§à¸‚à¸¶à¹‰à¸™ à¸žà¸£à¹‰à¸­à¸¡à¹€à¸«à¹‡à¸™à¸ à¸²à¸žà¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡à¸‚à¸­à¸‡à¹à¸•à¹ˆà¸¥à¸°à¸«à¸±à¸§à¸‚à¹‰à¸­à¸Šà¸±à¸”à¹€à¸ˆà¸™à¸‚à¸¶à¹‰à¸™',
        'Learn the core flow of Eternal Tower Saga through a cleaner guide with clearer visual examples for each system.',
      ),
    heroPanelLabel: config?.heroPanelLabelEn || config?.heroPanelLabelTh
      ? t(config.heroPanelLabelTh || '', config.heroPanelLabelEn || '')
      : t('à¸ à¸²à¸žà¸£à¸§à¸¡à¸ªà¸³à¸«à¸£à¸±à¸šà¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™à¹ƒà¸«à¸¡à¹ˆ', 'Starter overview'),
    heroPanelCopy: config?.heroPanelCopyEn || config?.heroPanelCopyTh
      ? t(config.heroPanelCopyTh || '', config.heroPanelCopyEn || '')
      : t(
        'à¹€à¸£à¸µà¸¢à¸‡à¹€à¸ªà¹‰à¸™à¸—à¸²à¸‡à¸à¸²à¸£à¹€à¸¥à¹ˆà¸™à¸•à¸±à¹‰à¸‡à¹à¸•à¹ˆà¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™ à¸ªà¸°à¸ªà¸¡à¸—à¸£à¸±à¸žà¸¢à¸²à¸à¸£ à¸­à¸±à¸›à¹€à¸à¸£à¸”à¸­à¸¸à¸›à¸à¸£à¸“à¹Œ à¸ˆà¸™à¸•à¹ˆà¸­à¸¢à¸­à¸”à¸ªà¸¹à¹ˆà¸„à¸­à¸™à¹€à¸—à¸™à¸•à¹Œà¸£à¹ˆà¸§à¸¡à¸—à¸µà¸¡à¹ƒà¸™à¸¡à¸¸à¸¡à¸—à¸µà¹ˆà¸­à¹ˆà¸²à¸™à¸‡à¹ˆà¸²à¸¢à¸‚à¸¶à¹‰à¸™',
        'A clearer progression path from onboarding and upgrades to party-focused content, framed in an easier reading flow.',
      ),
    systemsBadge: config?.systemsBadgeEn || config?.systemsBadgeTh
      ? t(config.systemsBadgeTh || '', config.systemsBadgeEn || '')
      : t('à¸Ÿà¸µà¹€à¸ˆà¸­à¸£à¹Œà¹€à¸à¸¡', 'Core systems'),
    systemsTitle: config?.systemsTitleEn || config?.systemsTitleTh
      ? t(config.systemsTitleTh || '', config.systemsTitleEn || '')
      : t('à¹„à¸®à¹„à¸¥à¸—à¹Œà¹€à¸à¸¡', 'Game systems to explore'),
    systemsCopy: config?.systemsCopyEn || config?.systemsCopyTh
      ? t(config.systemsCopyTh || '', config.systemsCopyEn || '')
      : t(
        'à¹€à¸¥à¸·à¸­à¸à¸«à¸±à¸§à¸‚à¹‰à¸­à¸”à¹‰à¸²à¸™à¸‚à¸§à¸²à¹€à¸žà¸·à¹ˆà¸­à¸”à¸¹à¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡à¹à¸¥à¸°à¸„à¸³à¸­à¸˜à¸´à¸šà¸²à¸¢à¹à¸šà¸šà¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‚à¸¶à¹‰à¸™à¹ƒà¸™à¸à¸±à¹ˆà¸‡à¸‹à¹‰à¸²à¸¢',
        'Select a topic from the right rail to preview its visual and read a more focused explanation.',
      ),
    selectLabel: t('à¸”à¸¹à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸«à¸±à¸§à¸‚à¹‰à¸­à¸™à¸µà¹‰', 'Focus this system'),
  };
}

function resolveGuidePillars(config: GameGuidePageConfig | null, lang: 'th' | 'en') {
  const configuredPillars = lang === 'th' ? config?.pillarsTh : config?.pillarsEn;
  if (configuredPillars?.length) return configuredPillars;
  return lang === 'th' ? GAME_GUIDE_PILLARS.th : GAME_GUIDE_PILLARS.en;
}

function mergeGuideFeatures(
  configFeatures: GameGuideFeature[],
  homepageFeatures: CMSFeature[],
): GameGuideFeature[] {
  return configFeatures.map((feature, index) => {
    const fallback = homepageFeatures[index];

    return {
      ...feature,
      iconImage: feature.iconImage || fallback?.iconImage || null,
      previewImage: feature.previewImage || fallback?.previewImage || fallback?.iconImage || null,
    };
  });
}

function GuideHero({
  config,
  copy,
}: {
  config: GameGuidePageConfig | null;
  copy: GuideCopy;
}) {
  return (
    <section className="page-hero guide-hero">
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
          <div className="guide-hero__content">
            <div className="page-hero-content">
              <span className="section-badge">{copy.badge}</span>
              <h1 className="page-hero-title">{copy.title}</h1>
              <p className="page-hero-subtitle">{copy.subtitle}</p>
            </div>

            <div className="guide-hero__panel">
              <span className="guide-hero__panelLabel">{copy.heroPanelLabel}</span>
              <p className="guide-hero__panelCopy">{copy.heroPanelCopy}</p>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

function GuideSystemsSpotlight({
  activeFeature,
  activeIdx,
  t,
}: {
  activeFeature: GameGuideFeature;
  activeIdx: number;
  t: TranslateFn;
}) {
  return (
    <RevealSection>
      <article className="guide-systemSpotlight">
        {activeFeature.previewImage?.url ? (
          <div className="guide-systemSpotlight__media">
            <Image
              src={activeFeature.previewImage.url}
              alt={t(activeFeature.titleTh, activeFeature.titleEn)}
              fill
              className="object-cover"
              sizes="(max-width: 1180px) 100vw, 44rem"
              unoptimized={isCmsMediaUrl(activeFeature.previewImage.url)}
            />
          </div>
        ) : null}

        <div className="guide-systemSpotlight__body">
          <div className="guide-systemSpotlight__meta">
            <span className="guide-systemSpotlight__index">
              {String(activeIdx + 1).padStart(2, '0')}
            </span>
            <div className="guide-systemSpotlight__icon">
              <FeatureIcon feature={activeFeature} />
            </div>
          </div>

          <h3 className="guide-systemSpotlight__title">
            {t(activeFeature.titleTh, activeFeature.titleEn)}
          </h3>
          <p className="guide-systemSpotlight__description">
            {t(activeFeature.descriptionTh, activeFeature.descriptionEn)}
          </p>

          {activeFeature.href ? (
            <CmsLink href={activeFeature.href} className="guide-systemSpotlight__cta">
              {t(activeFeature.ctaLabelTh || '', activeFeature.ctaLabelEn || '')}
            </CmsLink>
          ) : null}
        </div>
      </article>
    </RevealSection>
  );
}

function GuideSystemsList({
  features,
  activeIdx,
  onSelect,
  selectLabel,
  t,
}: {
  features: GameGuideFeature[];
  activeIdx: number;
  onSelect: (index: number) => void;
  selectLabel: string;
  t: TranslateFn;
}) {
  return (
    <div className="guide-systemList" role="tablist" aria-label={selectLabel}>
      {features.map((feature, index) => (
        <RevealSection key={`${feature.titleEn}-${index}`} delay={index * 0.05}>
          <button
            type="button"
            role="tab"
            aria-selected={index === activeIdx}
            className={`guide-systemList__item ${index === activeIdx ? 'is-active' : ''}`.trim()}
            onClick={() => onSelect(index)}
            onMouseEnter={() => onSelect(index)}
          >
            <span className="guide-systemList__index">{String(index + 1).padStart(2, '0')}</span>
            <span className="guide-systemList__icon">
              <FeatureIcon feature={feature} />
            </span>
            <span className="guide-systemList__copy">
              <strong>{t(feature.titleTh, feature.titleEn)}</strong>
              <span>{t(feature.descriptionTh, feature.descriptionEn)}</span>
            </span>
            <span className="guide-systemList__hint">{selectLabel}</span>
          </button>
        </RevealSection>
      ))}
    </div>
  );
}

function GuideSystems({
  config,
  copy,
  pillars,
  features,
  activeIdx,
  onSelect,
  t,
}: {
  config: GameGuidePageConfig | null;
  copy: GuideCopy;
  pillars: readonly string[];
  features: GameGuideFeature[];
  activeIdx: number;
  onSelect: (index: number) => void;
  t: TranslateFn;
}) {
  const activeFeature = features[activeIdx] || features[0];

  return (
    <section
      className="guide-systems"
      style={config?.systemsBackgroundImage?.url
        ? {
          backgroundImage: `linear-gradient(180deg, rgba(3, 10, 20, 0.62), rgba(3, 10, 20, 0.9)), url(${config.systemsBackgroundImage.url})`,
        }
        : undefined}
    >
      <div className="guide-systems__veil" />

      <div className="container-custom guide-systems__shell">
        <RevealSection>
          <div className="guide-systems__intro">
            <span className="section-badge">{copy.systemsBadge}</span>
            <h2 className="guide-systems__title">{copy.systemsTitle}</h2>
            <p className="guide-systems__copy">{copy.systemsCopy}</p>

            <div className="guide-systems__pillars">
              {pillars.map((pillar) => (
                <span key={pillar} className="guide-systems__pillar">
                  {pillar}
                </span>
              ))}
            </div>
          </div>
        </RevealSection>

        <div className="guide-systems__stage">
          <GuideSystemsSpotlight activeFeature={activeFeature} activeIdx={activeIdx} t={t} />
          <GuideSystemsList
            features={features}
            activeIdx={activeIdx}
            onSelect={onSelect}
            selectLabel={copy.selectLabel}
            t={t}
          />
        </div>
      </div>
    </section>
  );
}

export default function GameGuidePage() {
  const { lang, t } = useLang();
  const { settings, socialLinks, footer, navigationLinks, registrationUrl } = useSiteSettings();
  const config = (settings?.gameGuidePage as GameGuidePageConfig | undefined) || null;
  const copy = buildGuideCopy(config, t);
  const homepageFeatures = useMemo(
    () => (((settings?.hero as { features?: CMSFeature[] } | undefined)?.features || []) as CMSFeature[]),
    [settings?.hero],
  );
  const baseFeatures = useMemo(
    () => (config?.features?.length
      ? config.features
      : [...DEFAULT_GAME_GUIDE_FEATURES] as unknown as GameGuideFeature[]),
    [config],
  );
  const features = useMemo(() => mergeGuideFeatures(baseFeatures, homepageFeatures), [baseFeatures, homepageFeatures]);
  const [activeIdx, setActiveIdx] = useState(0);
  const safeActiveIdx = Math.min(activeIdx, Math.max(features.length - 1, 0));
  const pillars = resolveGuidePillars(config, lang);

  return (
    <div className="landing-page guide-page">
      
      <main>
        <GuideHero config={config} copy={copy} />
        <GuideSystems
          config={config}
          copy={copy}
          pillars={pillars}
          features={features}
          activeIdx={safeActiveIdx}
          onSelect={setActiveIdx}
          t={t}
        />
      </main>

      
    </div>
  );
}
