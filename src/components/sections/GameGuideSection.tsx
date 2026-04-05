'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Shield, Swords, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import CmsLink from '@/components/ui/CmsLink';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { useLang } from '@/lib/lang-context';
import type { CMSGuideConfig, CMSGuideCard } from '@/types/cms';

/* Ã¢â€â‚¬Ã¢â€â‚¬ Icon resolver Ã¢â€â‚¬Ã¢â€â‚¬ */
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Swords,
  Shield,
  Wrench,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] || BookOpen;
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Render-ready card shape Ã¢â€â‚¬Ã¢â€â‚¬ */
interface RenderCard {
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  Icon: LucideIcon;
  image: string | null;
  href: string;
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Default cards (fallback when CMS is empty) Ã¢â€â‚¬Ã¢â€â‚¬ */
const DEFAULT_CARDS: RenderCard[] = [
  {
    titleEn: "Beginner's Guide",
    titleTh: 'Ã Â¹â€žÃ Â¸ÂÃ Â¸â€Ã Â¹Å’Ã Â¹â‚¬Ã Â¸Â£Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¸â€¢Ã Â¹â€°Ã Â¸â„¢',
    descriptionEn: 'Everything you need to know to start your journey up the Eternal Tower.',
    descriptionTh: 'Ã Â¸â€”Ã Â¸Â¸Ã Â¸ÂÃ Â¸ÂªÃ Â¸Â´Ã Â¹Ë†Ã Â¸â€¡Ã Â¸â€”Ã Â¸ÂµÃ Â¹Ë†Ã Â¸â€žÃ Â¸Â¸Ã Â¸â€œÃ Â¸â€¢Ã Â¹â€°Ã Â¸Â­Ã Â¸â€¡Ã Â¸Â£Ã Â¸Â¹Ã Â¹â€°Ã Â¹â‚¬Ã Â¸Å¾Ã Â¸Â·Ã Â¹Ë†Ã Â¸Â­Ã Â¹â‚¬Ã Â¸Â£Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¸â€¢Ã Â¹â€°Ã Â¸â„¢Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£Ã Â¹â‚¬Ã Â¸â€Ã Â¸Â´Ã Â¸â„¢Ã Â¸â€”Ã Â¸Â²Ã Â¸â€¡Ã Â¸ÂªÃ Â¸Â¹Ã Â¹Ë†Ã Â¸Â«Ã Â¸Â­Ã Â¸â€žÃ Â¸Â­Ã Â¸Â¢Ã Â¸â„¢Ã Â¸Â´Ã Â¸Â£Ã Â¸Â±Ã Â¸â„¢Ã Â¸â€Ã Â¸Â£Ã Â¹Å’',
    Icon: BookOpen,
    image: null,
    href: '/guide#beginner',
  },
  {
    titleEn: 'Boss Strategies',
    titleTh: 'Ã Â¸ÂÃ Â¸Â¥Ã Â¸Â¢Ã Â¸Â¸Ã Â¸â€”Ã Â¸ËœÃ Â¹Å’Ã Â¸Å¡Ã Â¸Â­Ã Â¸Âª',
    descriptionEn: 'Master the tactics to defeat the most dangerous bosses on every floor.',
    descriptionTh: 'Ã Â¹â‚¬Ã Â¸Â£Ã Â¸ÂµÃ Â¸Â¢Ã Â¸â„¢Ã Â¸Â£Ã Â¸Â¹Ã Â¹â€°Ã Â¸ÂÃ Â¸Â¥Ã Â¸Â¢Ã Â¸Â¸Ã Â¸â€”Ã Â¸ËœÃ Â¹Å’Ã Â¹â‚¬Ã Â¸Å¾Ã Â¸Â·Ã Â¹Ë†Ã Â¸Â­Ã Â¹â‚¬Ã Â¸Â­Ã Â¸Â²Ã Â¸Å Ã Â¸â„¢Ã Â¸Â°Ã Â¸Å¡Ã Â¸Â­Ã Â¸ÂªÃ Â¸â€”Ã Â¸ÂµÃ Â¹Ë†Ã Â¸Â­Ã Â¸Â±Ã Â¸â„¢Ã Â¸â€¢Ã Â¸Â£Ã Â¸Â²Ã Â¸Â¢Ã Â¸â€”Ã Â¸ÂµÃ Â¹Ë†Ã Â¸ÂªÃ Â¸Â¸Ã Â¸â€Ã Â¹Æ’Ã Â¸â„¢Ã Â¸â€”Ã Â¸Â¸Ã Â¸ÂÃ Â¸Å Ã Â¸Â±Ã Â¹â€°Ã Â¸â„¢',
    Icon: Swords,
    image: null,
    href: '/guide#boss',
  },
  {
    titleEn: 'Class Mastery',
    titleTh: 'Ã Â¸â€žÃ Â¸Â§Ã Â¸Â²Ã Â¸Â¡Ã Â¹â‚¬Ã Â¸Å Ã Â¸ÂµÃ Â¹Ë†Ã Â¸Â¢Ã Â¸Â§Ã Â¸Å Ã Â¸Â²Ã Â¸ÂÃ Â¸Â­Ã Â¸Â²Ã Â¸Å Ã Â¸ÂµÃ Â¸Å¾',
    descriptionEn: 'Deep dives into each combat class, builds, and skill rotations.',
    descriptionTh: 'Ã Â¹â‚¬Ã Â¸Ë†Ã Â¸Â²Ã Â¸Â°Ã Â¸Â¥Ã Â¸Â¶Ã Â¸ÂÃ Â¸Â­Ã Â¸Â²Ã Â¸Å Ã Â¸ÂµÃ Â¸Å¾Ã Â¹ÂÃ Â¸â€¢Ã Â¹Ë†Ã Â¸Â¥Ã Â¸Â°Ã Â¸ÂªÃ Â¸Â²Ã Â¸Â¢ Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£ Build Ã Â¹ÂÃ Â¸Â¥Ã Â¸Â°Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£Ã Â¸Â«Ã Â¸Â¡Ã Â¸Â¸Ã Â¸â„¢Ã Â¸ÂªÃ Â¸ÂÃ Â¸Â´Ã Â¸Â¥',
    Icon: Shield,
    image: null,
    href: '/guide#class',
  },
  {
    titleEn: 'Equipment Crafting',
    titleTh: 'Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£Ã Â¸â€žÃ Â¸Â£Ã Â¸Â²Ã Â¸Å¸Ã Â¸â€¢Ã Â¹Å’Ã Â¸Â­Ã Â¸Â¸Ã Â¸â€ºÃ Â¸ÂÃ Â¸Â£Ã Â¸â€œÃ Â¹Å’',
    descriptionEn: 'Learn the crafting system to forge legendary gear and enhance your power.',
    descriptionTh: 'Ã Â¹â‚¬Ã Â¸Â£Ã Â¸ÂµÃ Â¸Â¢Ã Â¸â„¢Ã Â¸Â£Ã Â¸Â¹Ã Â¹â€°Ã Â¸Â£Ã Â¸Â°Ã Â¸Å¡Ã Â¸Å¡Ã Â¸â€žÃ Â¸Â£Ã Â¸Â²Ã Â¸Å¸Ã Â¸â€¢Ã Â¹Å’Ã Â¹â‚¬Ã Â¸Å¾Ã Â¸Â·Ã Â¹Ë†Ã Â¸Â­Ã Â¸ÂªÃ Â¸Â£Ã Â¹â€°Ã Â¸Â²Ã Â¸â€¡Ã Â¸Â­Ã Â¸Â¸Ã Â¸â€ºÃ Â¸ÂÃ Â¸Â£Ã Â¸â€œÃ Â¹Å’Ã Â¹Æ’Ã Â¸â„¢Ã Â¸â€¢Ã Â¸Â³Ã Â¸â„¢Ã Â¸Â²Ã Â¸â„¢Ã Â¹ÂÃ Â¸Â¥Ã Â¸Â°Ã Â¹â‚¬Ã Â¸Å¾Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¸Å¾Ã Â¸Â¥Ã Â¸Â±Ã Â¸â€¡Ã Â¸â€šÃ Â¸Â­Ã Â¸â€¡Ã Â¸â€žÃ Â¸Â¸Ã Â¸â€œ',
    Icon: Wrench,
    image: null,
    href: '/guide#crafting',
  },
];

function cmsCardToRender(card: CMSGuideCard): RenderCard {
  return {
    titleEn: card.titleEn,
    titleTh: card.titleTh,
    descriptionEn: card.descriptionEn,
    descriptionTh: card.descriptionTh,
    Icon: resolveIcon(card.icon),
    image: card.image,
    href: card.href || '#',
  };
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Animation Ã¢â€â‚¬Ã¢â€â‚¬ */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* Ã¢â€â‚¬Ã¢â€â‚¬ Card component Ã¢â€â‚¬Ã¢â€â‚¬ */
function GuideCardItem({
  card,
  index,
  t,
}: {
  card: RenderCard;
  index: number;
  t: (th: string, en: string) => string;
}) {
  const title = t(card.titleTh, card.titleEn);
  const description = t(card.descriptionTh, card.descriptionEn);
  const Icon = card.Icon;
  const ctaLabel = t('Ã Â¸Â­Ã Â¹Ë†Ã Â¸Â²Ã Â¸â„¢Ã Â¹â‚¬Ã Â¸Å¾Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¹â‚¬Ã Â¸â€¢Ã Â¸Â´Ã Â¸Â¡', 'Read More');

  return (
    <motion.article className="home-guide__card" variants={cardVariants}>
      <div className="home-guide__cardMedia">
        {card.image ? (
          <>
            <Image
              src={card.image}
              alt={title}
              fill
              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw"
              className="home-guide__cardImage"
              unoptimized={isCmsMediaUrl(card.image)}
            />
            <div className="home-guide__cardMediaVeil" />
          </>
        ) : (
          <div className="home-guide__cardGradient" aria-hidden="true">
            <div className="home-guide__cardGradientOrb" />
          </div>
        )}
      </div>

      <div className="home-guide__cardContent">
        <div className="home-guide__cardTop">
          <span className="home-guide__cardIndex">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="home-guide__cardIconWrap">
            <Icon size={24} className="home-guide__cardIconSvg" />
          </span>
        </div>

        <div className="home-guide__cardBody">
          <h3 className="home-guide__cardTitle">{title}</h3>
          <p className="home-guide__cardDesc">{description}</p>
        </div>

        <CmsLink href={card.href} className="home-guide__cardCta">
          {ctaLabel}
          <ArrowRight size={14} />
        </CmsLink>
      </div>
    </motion.article>
  );
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Section Ã¢â€â‚¬Ã¢â€â‚¬ */
export default function GameGuideSection({
  guideConfig,
}: {
  guideConfig?: CMSGuideConfig;
}) {
  const { t } = useLang();

  // Use CMS values if available, fallback to defaults
  const badgeText = t(
    guideConfig?.badgeTh || 'Ã Â¸â€žÃ Â¸Â¹Ã Â¹Ë†Ã Â¸Â¡Ã Â¸Â·Ã Â¸Â­Ã Â¹â‚¬Ã Â¸ÂÃ Â¸Â¡',
    guideConfig?.badgeEn || 'Game Guide',
  );
  const titleText = t(
    guideConfig?.titleTh || 'Ã Â¹â‚¬Ã Â¸Â£Ã Â¸ÂµÃ Â¸Â¢Ã Â¸â„¢Ã Â¸Â£Ã Â¸Â¹Ã Â¹â€° Ã Â¹â‚¬Ã Â¸Â­Ã Â¸Â²Ã Â¸Å Ã Â¸â„¢Ã Â¸Â° Ã Â¸Å¾Ã Â¸Â´Ã Â¸Å Ã Â¸Â´Ã Â¸â€¢',
    guideConfig?.titleEn || 'Learn. Conquer. Triumph.',
  );
  const introCopy = t(
    guideConfig?.introTh || 'Ã Â¸â€žÃ Â¹â€°Ã Â¸â„¢Ã Â¸Å¾Ã Â¸Å¡Ã Â¸ÂÃ Â¸Â¥Ã Â¸Â¢Ã Â¸Â¸Ã Â¸â€”Ã Â¸ËœÃ Â¹Å’Ã Â¹ÂÃ Â¸Â¥Ã Â¸Â°Ã Â¹â‚¬Ã Â¸â€”Ã Â¸â€žÃ Â¸â„¢Ã Â¸Â´Ã Â¸â€žÃ Â¸â€”Ã Â¸ÂµÃ Â¹Ë†Ã Â¸Ë†Ã Â¸Â°Ã Â¸Å Ã Â¹Ë†Ã Â¸Â§Ã Â¸Â¢Ã Â¹Æ’Ã Â¸Â«Ã Â¹â€°Ã Â¸â€žÃ Â¸Â¸Ã Â¸â€œÃ Â¸ÂÃ Â¹â€°Ã Â¸Â²Ã Â¸Â§Ã Â¸â€šÃ Â¸Â¶Ã Â¹â€°Ã Â¸â„¢Ã Â¸ÂªÃ Â¸Â¹Ã Â¹Ë†Ã Â¸Ë†Ã Â¸Â¸Ã Â¸â€Ã Â¸ÂªÃ Â¸Â¹Ã Â¸â€¡Ã Â¸ÂªÃ Â¸Â¸Ã Â¸â€Ã Â¸â€šÃ Â¸Â­Ã Â¸â€¡Ã Â¸Â«Ã Â¸Â­Ã Â¸â€žÃ Â¸Â­Ã Â¸Â¢',
    guideConfig?.introEn || 'Discover the strategies and techniques that will help you reach the top of the tower.',
  );

  // Use CMS cards if available, otherwise defaults
  const cards: RenderCard[] =
    guideConfig?.cards && guideConfig.cards.length > 0
      ? guideConfig.cards.map(cmsCardToRender)
      : DEFAULT_CARDS;

  return (
    <section id="guide" className="home-guide">
      <div className="home-guide__glow home-guide__glow--one" aria-hidden="true" />
      <div className="home-guide__glow home-guide__glow--two" aria-hidden="true" />

      <div className="home-shell">
        <motion.div
          className="home-guide__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="home-kicker">{badgeText}</span>
          <h2 className="home-section-title">{titleText}</h2>
          <p className="home-section-copy">{introCopy}</p>
        </motion.div>

        <motion.div
          className="home-guide__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {cards.map((card, index) => (
            <GuideCardItem key={index} card={card} index={index} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
