'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Castle,
  Map,
  Shield,
  Sparkles,
  Swords,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import CmsLink from '@/components/ui/CmsLink';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { useLang } from '@/lib/lang-context';
import type { CMSFeature, CMSHighlightsConfig } from '@/types/cms';

const LUCIDE_ICONS: Record<string, LucideIcon> = {
  swords: Swords,
  map: Map,
  castle: Castle,
  sparkles: Sparkles,
  shield: Shield,
  users: Users,
};

const DEFAULT_ICONS = [Swords, Map, Castle, Shield, Sparkles, Users];

type HighlightItem = {
  key: number;
  feature: CMSFeature;
  title: string;
  desc: string;
  ctaLabel: string;
};

type HighlightsCopy = {
  badgeText: string;
  titleText: string;
  introCopy: string;
  systemLabel: string;
};

function truncateUiText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function resolveHighlightPreview(feature: CMSFeature) {
  return feature.previewImage?.url || feature.iconImage?.url || null;
}

function FeatureIcon({
  feature,
  index,
  size = 24,
}: {
  feature: CMSFeature;
  index: number;
  size?: number;
}) {
  if (feature.iconImage?.url) {
    return (
      <Image
        src={feature.iconImage.url}
        alt=""
        width={size}
        height={size}
        className="home-highlightRow__iconImage"
        unoptimized={isCmsMediaUrl(feature.iconImage.url)}
      />
    );
  }

  const normalized = feature.icon.toLowerCase().trim();
  const Icon = LUCIDE_ICONS[normalized] || DEFAULT_ICONS[index % DEFAULT_ICONS.length];

  return <Icon size={size} className="home-highlightRow__icon" />;
}

function buildHighlightItems(
  features: CMSFeature[],
  t: (th: string, en: string) => string,
): HighlightItem[] {
  return features.slice(0, 6).map((feature, index) => ({
    key: index,
    feature,
    title: truncateUiText(t(feature.titleTh, feature.titleEn || feature.titleTh), 84),
    desc: truncateUiText(t(feature.descriptionTh, feature.descriptionEn || feature.descriptionTh), 180),
    ctaLabel: feature.ctaLabelEn || feature.ctaLabelTh
      ? t(feature.ctaLabelTh || '', feature.ctaLabelEn || '')
      : '',
  }));
}

function buildHighlightsCopy(
  sectionConfig: CMSHighlightsConfig | undefined,
  t: (th: string, en: string) => string,
): HighlightsCopy {
  return {
    badgeText: sectionConfig
      ? t(sectionConfig.badgeTh, sectionConfig.badgeEn)
      : t('ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â®ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹Ãƒâ€¦Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â¡', 'Game highlights'),
    titleText: sectionConfig
      ? t(sectionConfig.titleTh, sectionConfig.titleEn)
      : t('ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â³ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â«ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚ÂµÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¹Ãƒâ€¹Ã¢â‚¬Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â­', 'Systems that keep the world alive'),
    introCopy: sectionConfig?.introEn || sectionConfig?.introTh
      ? t(sectionConfig.introTh || '', sectionConfig.introEn || '')
      : '',
    systemLabel: t('ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â£ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â°ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â«ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â¥ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â', 'Core system'),
  };
}

function HighlightSpotlight({
  activeHighlight,
  activeIdx,
  systemLabel,
}: {
  activeHighlight: HighlightItem;
  activeIdx: number;
  systemLabel: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={activeHighlight.key}
        className="home-highlights__spotlight"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -26 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="home-highlights__spotlightCopy">
          <div className="home-highlights__spotlightTopline">
            <div className="home-highlights__spotlightMeta">
              <span className="home-highlights__spotlightIndex">
                {String(activeIdx + 1).padStart(2, '0')}
              </span>
              <span className="home-highlights__spotlightLabel">{systemLabel}</span>
            </div>

            <div className="home-highlights__spotlightIcon">
              <FeatureIcon feature={activeHighlight.feature} index={activeIdx} size={30} />
            </div>
          </div>

          <h3 className="home-highlights__spotlightTitle">{activeHighlight.title}</h3>
          <p className="home-highlights__spotlightDesc">{activeHighlight.desc}</p>

          {activeHighlight.feature.href ? (
            <CmsLink
              href={activeHighlight.feature.href}
              className="home-highlights__spotlightCta"
            >
              {activeHighlight.ctaLabel}
              <ArrowRight size={16} />
            </CmsLink>
          ) : null}
        </div>

        {resolveHighlightPreview(activeHighlight.feature) ? (
          <div className="home-highlights__spotlightMedia">
            <Image
              src={resolveHighlightPreview(activeHighlight.feature) as string}
              alt={activeHighlight.title}
              fill
              sizes="(max-width: 960px) 100vw, 32rem"
              className="object-cover"
              unoptimized={isCmsMediaUrl(resolveHighlightPreview(activeHighlight.feature) as string)}
            />
          </div>
        ) : (
          <div className="home-highlights__spotlightFallback" aria-hidden="true">
            <FeatureIcon feature={activeHighlight.feature} index={activeIdx} size={48} />
          </div>
        )}
      </motion.article>
    </AnimatePresence>
  );
}

function HighlightsRail({
  highlights,
  activeIdx,
  onSelect,
}: {
  highlights: HighlightItem[];
  activeIdx: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="home-highlights__rail">
      {highlights.map((item, index) => (
        <button
          key={item.key}
          type="button"
          className={`home-highlights__item ${index === activeIdx ? 'is-active' : ''}`}
          onClick={() => onSelect(index)}
          onMouseEnter={() => onSelect(index)}
          onFocus={() => onSelect(index)}
        >
          <span className="home-highlights__itemIndex">{String(index + 1).padStart(2, '0')}</span>
          <span className="home-highlights__itemIcon">
            <FeatureIcon feature={item.feature} index={index} size={22} />
          </span>
          <span className="home-highlights__itemCopy">
            <strong>{item.title}</strong>
            <span>{item.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

interface HighlightsSectionProps {
  features: CMSFeature[];
  sectionConfig?: CMSHighlightsConfig;
}

export default function HighlightsSection({
  features,
  sectionConfig,
}: HighlightsSectionProps) {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);

  const highlights = buildHighlightItems(features, t);
  if (highlights.length === 0) return null;

  const copy = buildHighlightsCopy(sectionConfig, t);
  const activeHighlight = highlights[activeIdx] || highlights[0];

  return (
    <section id="features" className="home-highlights">
      {sectionConfig?.bgImage?.url ? (
        <div className="home-highlights__bg" aria-hidden="true">
          <Image
            src={sectionConfig.bgImage.url}
            alt=""
            fill
            priority={false}
            className="object-cover"
            unoptimized={isCmsMediaUrl(sectionConfig.bgImage.url)}
          />
        </div>
      ) : null}

      <div className="home-highlights__veil" />

      <motion.div
        className="home-shell home-highlights__shell"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="home-highlights__lead">
          <div className="home-highlights__intro">
            <span className="home-kicker">{copy.badgeText}</span>
            <h2 className="home-section-title">{copy.titleText}</h2>
            {copy.introCopy ? <p className="home-section-copy">{copy.introCopy}</p> : null}
          </div>

          <HighlightSpotlight
            activeHighlight={activeHighlight}
            activeIdx={activeIdx}
            systemLabel={copy.systemLabel}
          />
        </div>

        <HighlightsRail
          highlights={highlights}
          activeIdx={activeIdx}
          onSelect={setActiveIdx}
        />
      </motion.div>
    </section>
  );
}
