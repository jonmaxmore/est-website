'use client';

import { useLang } from '@/lib/lang-context';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface WeaponData {
  id: string | number;
  name?: string | null;
  nameEn?: string | null;
  nameTh?: string | null;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  rarity?: string | null;
  image?: { url?: string } | string | null;
  imageUrl?: string | null;
}

export interface WeaponSectionData {
  blockType?: 'weaponsShowcase';
  titleEn?: string;
  titleTh?: string;
  introEn?: string;
  introTh?: string;
  weaponsBgImage?: { url?: string } | string | null;
}

interface WeaponSectionProps {
  data: WeaponSectionData;
  weapons: WeaponData[];
}

export default function WeaponSection({ data, weapons }: WeaponSectionProps) {
  const { lang: currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  const intro = currentLang === 'en' ? data.introEn : data.introTh;
  const bgImageUrl = typeof data.weaponsBgImage === 'object' ? data.weaponsBgImage?.url : data.weaponsBgImage;
  
  // Clean Engineering: No Hardcoded Array fallback!
  const displayWeapons = weapons?.length ? weapons : [];

  if (displayWeapons.length === 0) return null; // Graceful Empty State mapping

  return (
    <section 
      className="k-weapon-section"
      style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : {}}
      id="weapons"
    >
      <div className="k-weapon-bg-mask" />
      <div className="k-weapon-glow-sphere" />

      <div className="k-weapon-container">
        <div className="k-weapon-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="k-weapon-title"
          >
            {title}
          </motion.h2>
          {intro && (
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="k-weapon-intro"
            >
              {intro}
            </motion.p>
          )}
        </div>

        <div className="k-weapon-grid">
          {displayWeapons.slice(0,3).map((weapon, idx) => {
            const wName = currentLang === 'en' ? (weapon.nameEn || weapon.name) : (weapon.nameTh || weapon.name);
            const wImage = typeof weapon.image === 'object' ? weapon.image?.url : weapon.imageUrl;

            return (
              <motion.div
                key={weapon.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="k-weapon-card group"
              >
                <div className="k-weapon-card-media">
                  {wImage ? (
                    <Image src={wImage} alt={wName || 'Weapon Image'} fill className="k-weapon-card-image" />
                  ) : (
                    <div className="k-weapon-card-placeholder" />
                  )}
                  {weapon.rarity && (
                    <div className="k-weapon-card-badge">
                      {weapon.rarity}
                    </div>
                  )}
                </div>
                <div className="k-weapon-card-body">
                  <div className="k-weapon-card-accent" />
                  <h3 className="k-weapon-card-name">{wName}</h3>
                  <p className="k-weapon-card-desc">
                    {currentLang === 'en' ? weapon.descriptionEn : weapon.descriptionTh}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center w-full"
        >
          <a href="/weapons" className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[rgba(255,255,255,0.15)] bg-black/40 backdrop-blur-md text-gray-200 text-sm font-bold tracking-widest uppercase hover:bg-white/10 hover:border-[rgba(212,168,67,0.4)] hover:text-white transition-all shadow-lg shadow-black/50">
            {currentLang === 'en' ? 'View All Classes' : 'ดูคลาสทั้งหมด'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
