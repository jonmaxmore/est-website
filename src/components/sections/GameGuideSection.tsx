'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Shield, Swords, Wrench } from 'lucide-react';
import Image from 'next/image';
import CmsLink from '@/components/ui/CmsLink';
import { isCmsMediaUrl } from '@/lib/cms-media';
import { useLang } from '@/lib/lang-context';

interface GuideCard {
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  icon: typeof BookOpen;
  image: string | null;
  href: string;
}

const DEFAULT_GUIDES: GuideCard[] = [
  {
    titleEn: "Beginner's Guide",
    titleTh: 'ไกด์เริ่มต้น',
    descriptionEn: 'Everything you need to know to start your journey up the Eternal Tower.',
    descriptionTh: 'ทุกสิ่งที่คุณต้องรู้เพื่อเริ่มต้นการเดินทางสู่หอคอยนิรันดร์',
    icon: BookOpen,
    image: null,
    href: '/guide#beginner',
  },
  {
    titleEn: 'Boss Strategies',
    titleTh: 'กลยุทธ์บอส',
    descriptionEn: 'Master the tactics to defeat the most dangerous bosses on every floor.',
    descriptionTh: 'เรียนรู้กลยุทธ์เพื่อเอาชนะบอสที่อันตรายที่สุดในทุกชั้น',
    icon: Swords,
    image: null,
    href: '/guide#boss',
  },
  {
    titleEn: 'Class Mastery',
    titleTh: 'ความเชี่ยวชาญอาชีพ',
    descriptionEn: 'Deep dives into each combat class, builds, and skill rotations.',
    descriptionTh: 'เจาะลึกอาชีพแต่ละสาย การ Build และการหมุนสกิล',
    icon: Shield,
    image: null,
    href: '/guide#class',
  },
  {
    titleEn: 'Equipment Crafting',
    titleTh: 'การคราฟต์อุปกรณ์',
    descriptionEn: 'Learn the crafting system to forge legendary gear and enhance your power.',
    descriptionTh: 'เรียนรู้ระบบคราฟต์เพื่อสร้างอุปกรณ์ในตำนานและเพิ่มพลังของคุณ',
    icon: Wrench,
    image: null,
    href: '/guide#crafting',
  },
];

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

function GuideCardItem({
  guide,
  index,
  t,
}: {
  guide: GuideCard;
  index: number;
  t: (th: string, en: string) => string;
}) {
  const title = t(guide.titleTh, guide.titleEn);
  const description = t(guide.descriptionTh, guide.descriptionEn);
  const Icon = guide.icon;
  const ctaLabel = t('อ่านเพิ่มเติม', 'Read More');

  return (
    <motion.article className="home-guide__card" variants={cardVariants}>
      <div className="home-guide__cardMedia">
        {guide.image ? (
          <>
            <Image
              src={guide.image}
              alt={title}
              fill
              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw"
              className="home-guide__cardImage"
              unoptimized={isCmsMediaUrl(guide.image)}
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

        <CmsLink href={guide.href} className="home-guide__cardCta">
          {ctaLabel}
          <ArrowRight size={14} />
        </CmsLink>
      </div>
    </motion.article>
  );
}

export default function GameGuideSection() {
  const { t } = useLang();

  const badgeText = t('คู่มือเกม', 'Game Guide');
  const titleText = t('เรียนรู้ เอาชนะ พิชิต', 'Learn. Conquer. Triumph.');
  const introCopy = t(
    'ค้นพบกลยุทธ์และเทคนิคที่จะช่วยให้คุณก้าวขึ้นสู่จุดสูงสุดของหอคอย',
    'Discover the strategies and techniques that will help you reach the top of the tower.',
  );

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
          {DEFAULT_GUIDES.map((guide, index) => (
            <GuideCardItem key={index} guide={guide} index={index} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
