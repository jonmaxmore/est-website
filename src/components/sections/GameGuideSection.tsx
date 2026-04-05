'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Shield, Swords, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import CmsLink from '@/components/ui/CmsLink';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { useLang } from '@/lib/lang-context';
import type { CMSGuideConfig, CMSGuideCard } from '@/types/cms';

/* => Icon resolver => */
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Swords,
  Shield,
  Wrench,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] || BookOpen;
}

/* => Render-ready card shape => */
interface RenderCard {
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  Icon: LucideIcon;
  image: string | null;
  href: string;
}

function cmsCardToRender(card: CMSGuideCard): RenderCard {
  return {
    titleEn: card.titleEn || '',
    titleTh: card.titleTh || '',
    descriptionEn: card.descriptionEn || '',
    descriptionTh: card.descriptionTh || '',
    Icon: resolveIcon(card.icon || 'BookOpen'),
    image: card.image || null,
    href: card.href || '#',
  };
}

/* => Animation => */
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

/* => Card component => */
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
  const ctaLabel = t('อ่านเพิ่มเติม', 'Read More');

  return (
    <motion.article className="home-guide__card" variants={cardVariants}>
      <div className="home-guide__cardMedia">
        {card.image ? (
          <>
            <Image
              src={card.image}
              alt={title || 'Guide'}
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

/* => Section => */
export default function GameGuideSection({
  data,
}: {
  data?: CMSGuideConfig;
}) {
  const { t } = useLang();

  if (!data) return null;

  // Use CMS values if available, fallback to defaults purely for section meta
  const badgeText = t(
    data?.badgeTh || 'คู่มือการเอาตัวรอด',
    data?.badgeEn || 'Game Guide',
  );
  const titleText = t(
    data?.titleTh || 'เตรียมพร้อมเข้าสู่หอคอยแห่งอาเคเทีย',
    data?.titleEn || 'Learn. Conquer. Triumph.',
  );
  const introCopy = t(
    data?.introTh || 'คู่มือและเทคนิคการเล่นจากผู้เล่นระดับพระกาฬ',
    data?.introEn || 'Discover the strategies and techniques that will help you reach the top of the tower.',
  );

  const rawCards = data?.cards || (data as any)?.data?.cards;
  const cards: RenderCard[] =
    rawCards && rawCards.length > 0
      ? rawCards.map((c: any) => cmsCardToRender({ ...c }))
      : [];

  // Graceful empty state matching the zero-hardcode enterprise rules
  if (cards.length === 0) return null;

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
