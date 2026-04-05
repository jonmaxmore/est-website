'use client';

import { useLang } from '@/lib/lang-context';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { CMSWeapon } from '@/types/cms';

export default function WeaponSection({ data, weapons }: { data: any, weapons: CMSWeapon[] }) {
  const { lang: currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  const intro = currentLang === 'en' ? data.introEn : data.introTh;
  const bgImageUrl = typeof data.weaponsBgImage === 'object' ? data.weaponsBgImage?.url : data.weaponsBgImage;
  
  const displayWeapons = weapons?.length ? weapons : [
    { id: '1', nameEn: 'Frostbite Greatsword', nameTh: 'Ã Â¸â€Ã Â¸Â²Ã Â¸Å¡Ã Â¹Æ’Ã Â¸Â«Ã Â¸ÂÃ Â¹Ë†Ã Â¹â‚¬Ã Â¸Â«Ã Â¸Â¡Ã Â¸Â±Ã Â¸â„¢Ã Â¸â€¢Ã Â¹Å’', rarity: 'Legendary', imageUrl: null },
    { id: '2', nameEn: 'Void Bow', nameTh: 'Ã Â¸ËœÃ Â¸â„¢Ã Â¸Â¹Ã Â¹ÂÃ Â¸Â«Ã Â¹Ë†Ã Â¸â€¡Ã Â¸â€žÃ Â¸Â§Ã Â¸Â²Ã Â¸Â¡Ã Â¸Â§Ã Â¹Ë†Ã Â¸Â²Ã Â¸â€¡Ã Â¹â‚¬Ã Â¸â€ºÃ Â¸Â¥Ã Â¹Ë†Ã Â¸Â²', rarity: 'Epic', imageUrl: null },
    { id: '3', nameEn: 'Solar Aegis', nameTh: 'Ã Â¹â€šÃ Â¸Â¥Ã Â¹Ë†Ã Â¸Å¾Ã Â¸Â´Ã Â¸â€”Ã Â¸Â±Ã Â¸ÂÃ Â¸Â©Ã Â¹Å’Ã Â¸ÂªÃ Â¸Â¸Ã Â¸Â£Ã Â¸Â´Ã Â¸Â¢Ã Â¸Â°', rarity: 'Mythic', imageUrl: null },
  ] as any[];

  return (
    <section 
      className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden snap-start shrink-0 bg-zinc-950 bg-fixed bg-cover bg-center"
      style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})` } : {}}
      id="weapons"
    >
      <div className="absolute inset-0 bg-black/80 z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-screen-xl h-[500px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col justify-center h-full py-20">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-lg"
          >
            {title}
          </motion.h2>
          {intro && (
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
            >
              {intro}
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors duration-500"
              >
                <div className="relative h-48 md:h-56 w-full bg-zinc-900/50 overflow-hidden">
                  {wImage ? (
                    <Image src={wImage} alt={wName} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-mono text-xs">
                      [Weapon Image]
                    </div>
                  )}
                  {weapon.rarity && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase text-white">
                      {weapon.rarity}
                    </div>
                  )}
                </div>
                <div className="p-5 relative">
                  <div className="absolute top-0 left-5 w-8 h-[1px] bg-indigo-500 group-hover:w-16 transition-all duration-300" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">{wName}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2">
                    {weapon.descriptionEn || 'Ancient artifact of immense power.'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
