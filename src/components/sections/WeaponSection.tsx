'use client';

import { useLang } from '@/lib/lang-context';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { CMSWeapon } from '@/types/cms';

export default function WeaponSection({ data, weapons }: { data: any, weapons: CMSWeapon[] }) {
  const { currentLang } = useLang();
  
  if (!data) return null;

  const title = currentLang === 'en' ? data.titleEn : data.titleTh;
  const intro = currentLang === 'en' ? data.introEn : data.introTh;
  
  // Use mock weapons if the CMS collection is empty during setup
  const displayWeapons = weapons?.length ? weapons : [
    { id: '1', nameEn: 'Frostbite Greatsword', nameTh: 'ดาบใหญ่เหมันต์', rarity: 'Legendary', imageUrl: null },
    { id: '2', nameEn: 'Void Bow', nameTh: 'ธนูแห่งความว่างเปล่า', rarity: 'Epic', imageUrl: null },
    { id: '3', nameEn: 'Solar Aegis', nameTh: 'โล่พิทักษ์สุริยะ', rarity: 'Mythic', imageUrl: null },
  ] as any[];

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden border-t border-white/5" id="weapons">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-xl h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-6"
          >
            {title}
          </motion.h2>
          {intro && (
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
            >
              {intro}
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayWeapons.map((weapon, idx) => {
            const wName = currentLang === 'en' ? (weapon.nameEn || weapon.name) : (weapon.nameTh || weapon.name);
            const wImage = typeof weapon.image === 'object' ? weapon.image?.url : weapon.imageUrl;

            return (
              <motion.div
                key={weapon.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-black border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors duration-500"
              >
                {/* Image Container */}
                <div className="relative h-64 w-full bg-zinc-900 overflow-hidden">
                  {wImage ? (
                    <Image 
                      src={wImage} 
                      alt={wName} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-xs">
                      [Weapon Image Placeholder]
                    </div>
                  )}
                  {/* Rarity Badge */}
                  {weapon.rarity && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-white">
                      {weapon.rarity}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 relative">
                  <div className="absolute top-0 left-6 w-12 h-[1px] bg-indigo-500 group-hover:w-24 transition-all duration-300" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">{wName}</h3>
                  <p className="text-gray-500 text-sm">
                    {weapon.descriptionEn || 'A powerful artifact from the ancient era, waiting for a true master.'}
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
