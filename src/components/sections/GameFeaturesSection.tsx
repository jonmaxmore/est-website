'use client';

import { motion } from 'framer-motion';
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
import type { CMSFeature } from '@/types/cms';

const LUCIDE_ICONS: Record<string, LucideIcon> = {
  swords: Swords,
  map: Map,
  castle: Castle,
  sparkles: Sparkles,
  shield: Shield,
  users: Users,
};

const DEFAULT_ICONS = [Swords, Map, Castle, Shield, Sparkles, Users];

interface GameFeaturesSectionProps {
  features: CMSFeature[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function FeatureIcon({
  feature,
  index,
  size = 28,
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
        className="home-gameFeatures__iconImage"
        unoptimized={isCmsMediaUrl(feature.iconImage.url)}
      />
    );
  }

  const normalized = feature.icon.toLowerCase().trim();
  const Icon = LUCIDE_ICONS[normalized] || DEFAULT_ICONS[index % DEFAULT_ICONS.length];

  return <Icon size={size} className="home-gameFeatures__iconSvg" />;
}

function getBentoSpan(index: number, total: number) {
  if (total <= 3) return 'home-gameFeatures__card--wide';
  if (total === 4) return '';
  // For 5-6 items: make the first two wide
  if (index === 0) return 'home-gameFeatures__card--hero';
  if (index === 1) return 'home-gameFeatures__card--wide';
  return '';
}

function FeatureCard({
  feature,
  index,
  total,
  t,
}: {
  feature: CMSFeature;
  index: number;
  total: number;
  t: (th: string, en: string) => string;
}) {
  const title = t(feature.titleTh, feature.titleEn || feature.titleTh);
  const desc = t(feature.descriptionTh, feature.descriptionEn || feature.descriptionTh);
  const ctaLabel = feature.ctaLabelEn || feature.ctaLabelTh
    ? t(feature.ctaLabelTh || '', feature.ctaLabelEn || '')
    : '';
  const previewUrl = feature.previewImage?.url || null;
  const bentoClass = getBentoSpan(index, total);

  return (
    <motion.article
      className={`home-gameFeatures__card ${bentoClass}`.trim()}
      variants={cardVariants}
    >
      {previewUrl ? (
        <div className="home-gameFeatures__cardMedia">
          <Image
            src={previewUrl}
            alt={title}
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="home-gameFeatures__cardImage"
            unoptimized={isCmsMediaUrl(previewUrl)}
          />
          <div className="home-gameFeatures__cardMediaVeil" />
        </div>
      ) : (
        <div className="home-gameFeatures__cardGradient" aria-hidden="true">
          <div className="home-gameFeatures__cardGradientOrb" />
        </div>
      )}

      <div className="home-gameFeatures__cardContent">
        <div className="home-gameFeatures__cardTop">
          <span className="home-gameFeatures__cardIndex">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="home-gameFeatures__cardIconWrap">
            <FeatureIcon feature={feature} index={index} size={26} />
          </span>
        </div>

        <div className="home-gameFeatures__cardBody">
          <h3 className="home-gameFeatures__cardTitle">{title}</h3>
          <p className="home-gameFeatures__cardDesc">{desc}</p>
        </div>

        {feature.href && ctaLabel ? (
          <CmsLink href={feature.href} className="home-gameFeatures__cardCta">
            {ctaLabel}
            <ArrowRight size={14} />
          </CmsLink>
        ) : null}
      </div>
    </motion.article>
  );
}

export default function GameFeaturesSection({ features }: GameFeaturesSectionProps) {
  const { t } = useLang();

  const items = features.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section id="game-features" className="home-gameFeatures">
      <div className="home-gameFeatures__glow home-gameFeatures__glow--one" aria-hidden="true" />
      <div className="home-gameFeatures__glow home-gameFeatures__glow--two" aria-hidden="true" />

      <div className="home-shell">
        <motion.div
          className="home-gameFeatures__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="home-kicker">
            {t('ฟีเจอร์เกม', 'Game Features')}
          </span>
          <h2 className="home-section-title">
            {t('สิ่งที่ทำให้โลกนี้มีชีวิต', 'What makes this world come alive')}
          </h2>
          <p className="home-section-copy">
            {t(
              'สำรวจระบบหลักของเกมที่ออกแบบมาเพื่อให้ทุกช่วงเวลาของการผจญภัยเต็มไปด้วยความตื่นเต้น',
              'Discover the core systems designed to make every moment of your adventure thrilling.',
            )}
          </p>
        </motion.div>

        <motion.div
          className="home-gameFeatures__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {items.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              total={items.length}
              t={t}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

