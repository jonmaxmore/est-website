'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Swords, Map, Castle, Sparkles, Shield, Users,
  type LucideIcon,
} from 'lucide-react';
import { useLang } from '@/lib/lang-context';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CMSFeature, CMSHighlightsConfig } from '@/types/cms';

/* ─── Lucide icon lookup ─── */
const LUCIDE_ICONS: Record<string, LucideIcon> = {
  swords: Swords, map: Map, castle: Castle,
  sparkles: Sparkles, shield: Shield, users: Users,
};
const DEFAULT_ICONS = [Swords, Map, Castle, Shield, Sparkles, Users];

/** Render a CMS icon field — supports Lucide icon names and emoji strings */
function FeatureIcon({ icon, index }: { icon: string; index: number }) {
  const name = icon.toLowerCase().trim();
  const LIcon = LUCIDE_ICONS[name];
  if (LIcon) return <LIcon size={24} className="highlights-icon-svg" />;
  if (icon) return <span className="highlights-emoji">{icon}</span>;
  const Default = DEFAULT_ICONS[index % DEFAULT_ICONS.length];
  return <Default size={24} className="highlights-icon-svg" />;
}

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/* ─── Props ─── */
interface HighlightsSectionProps {
  features: CMSFeature[];
  sectionConfig?: CMSHighlightsConfig;
}

// eslint-disable-next-line max-lines-per-function -- Section component with grid template
export default function HighlightsSection({ features, sectionConfig }: HighlightsSectionProps) {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const highlights = features.slice(0, 6).map((feat, i) => ({
    key: i,
    icon: feat.icon,
    iconImage: feat.iconImage?.url || null,
    title: t(feat.titleTh, feat.titleEn || feat.titleTh),
    desc: t(feat.descriptionTh, feat.descriptionEn || feat.descriptionTh),
  }));

  if (highlights.length === 0) return null;

  const badgeText = sectionConfig
    ? t(sectionConfig.badgeTh, sectionConfig.badgeEn)
    : 'GAME FEATURES';
  const titleText = sectionConfig
    ? t(sectionConfig.titleTh, sectionConfig.titleEn)
    : t('ไฮไลท์เกม', 'Game Highlights');

  return (
    <section id="features" ref={sectionRef}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          className="highlights-header"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <Badge
            className="highlights-badge"
          >
            {badgeText}
          </Badge>
          <h2 className="section-title-gold">{titleText}</h2>
          <div className="title-ornament"><span /><span /><span /></div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="highlights-grid-v2"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {highlights.map((item) => (
            <motion.div key={item.key} variants={cardVariants}>
              <Card
                className={cn(
                  'highlights-card',
                  item.iconImage && 'highlights-card--has-bg'
                )}
              >
                {/* Background image layer */}
                {item.iconImage && (
                  <>
                    <div
                      className="highlights-card__bg"
                      style={{ backgroundImage: `url(${item.iconImage})` }}
                    />
                    <div className="highlights-card__overlay" />
                  </>
                )}

                <CardHeader className="highlights-card__header">
                  {!item.iconImage && (
                    <div className="highlights-card__icon">
                      <FeatureIcon icon={item.icon} index={item.key} />
                    </div>
                  )}
                  <CardTitle className="highlights-card__title">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="highlights-card__content">
                  <CardDescription className="highlights-card__desc">
                    {item.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
