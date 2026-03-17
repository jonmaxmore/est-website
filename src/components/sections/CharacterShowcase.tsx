'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { WEAPON_ICONS, CLASS_COLORS } from '@/components/ui/StoreIcons';

interface CMSCharacter {
  id: number;
  nameEn: string;
  nameTh: string;
  classEn: string;
  classTh: string;
  weaponClass: string;
  descriptionEn: string;
  descriptionTh: string;
  accentColor: string;
  portrait: string | null;
}

/* Skill data per weapon class */
const SKILL_DATA: Record<string, Array<{ nameEn: string; nameTh: string; icon: string; type: string }>> = {
  sword: [
    { nameEn: 'Blade Storm', nameTh: 'พายุดาบ', icon: '⚔️', type: 'Active' },
    { nameEn: 'Iron Wall', nameTh: 'กำแพงเหล็ก', icon: '🛡️', type: 'Passive' },
    { nameEn: 'Valor Strike', nameTh: 'สังหารกล้า', icon: '💥', type: 'Ultimate' },
  ],
  bow: [
    { nameEn: 'Rain of Arrows', nameTh: 'สายฝนลูกศร', icon: '🏹', type: 'Active' },
    { nameEn: 'Eagle Eye', nameTh: 'ตาเหยี่ยว', icon: '👁️', type: 'Passive' },
    { nameEn: 'Piercing Shot', nameTh: 'ลูกศรทะลุเกราะ', icon: '🎯', type: 'Ultimate' },
  ],
  'crystal-orb': [
    { nameEn: 'Arcane Blast', nameTh: 'ระเบิดเวท', icon: '🔮', type: 'Active' },
    { nameEn: 'Mana Shield', nameTh: 'โล่มานา', icon: '🔵', type: 'Passive' },
    { nameEn: 'Meteor Shower', nameTh: 'ฝนอุกกาบาต', icon: '☄️', type: 'Ultimate' },
  ],
  wand: [
    { nameEn: 'Holy Light', nameTh: 'แสงศักดิ์สิทธิ์', icon: '✨', type: 'Active' },
    { nameEn: 'Blessing', nameTh: 'พรอวยพร', icon: '🙏', type: 'Passive' },
    { nameEn: 'Divine Heal', nameTh: 'เยียวยาสวรรค์', icon: '💖', type: 'Ultimate' },
  ],
};

/* Stats per weapon class */
const STAT_DATA: Record<string, { atk: number; def: number; hp: number; spd: number }> = {
  sword: { atk: 85, def: 90, hp: 95, spd: 60 },
  bow: { atk: 90, def: 45, hp: 65, spd: 95 },
  'crystal-orb': { atk: 95, def: 40, hp: 55, spd: 70 },
  wand: { atk: 50, def: 55, hp: 70, spd: 80 },
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="char-stat-row">
      <span className="char-stat-label">{label}</span>
      <div className="char-stat-bar-bg">
        <motion.div
          className="char-stat-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
      <span className="char-stat-value">{value}</span>
    </div>
  );
}

export default function CharacterShowcase({ characters }: { characters: CMSCharacter[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'stats'>('info');
  const { t } = useLang();

  if (!characters.length) return null;

  const active = characters[activeIdx];
  const color = active.accentColor || CLASS_COLORS[active.weaponClass] || '#FFD700';
  const accent = color.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('##', '#');
  const weaponKey = active.weaponClass.toLowerCase();
  const skills = SKILL_DATA[weaponKey] || SKILL_DATA.sword;
  const stats = STAT_DATA[weaponKey] || STAT_DATA.sword;

  return (
    <section className="section-characters">
      <FloatingParticles count={15} />

      <div className="char-layout">
        {/* Left: Portrait */}
        <div className="char-portrait-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="char-portrait-wrapper"
              initial={{ opacity: 0, x: -60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="char-glow"
                style={{ background: `radial-gradient(ellipse at center, ${accent}, transparent 70%)` }}
              />
              {active.portrait ? (
                <Image src={active.portrait} alt={active.nameEn} width={500} height={600} className="char-portrait-img" />
              ) : (
                <Image
                  src={`/images/characters/${active.nameEn.toLowerCase()}.png`}
                  alt={active.nameEn}
                  width={500}
                  height={600}
                  className="char-portrait-img"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Info with Tabs */}
        <div className="char-info-area">
          {/* Tab Navigation */}
          <div className="char-tabs">
            {(['info', 'skills', 'stats'] as const).map((tab) => (
              <button
                key={tab}
                className={`char-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? { borderColor: color, color } : {}}
              >
                {tab === 'info' && t('ข้อมูล', 'Info')}
                {tab === 'skills' && t('สกิล', 'Skills')}
                {tab === 'stats' && t('สเตตัส', 'Stats')}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${active.id}-${activeTab}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="char-info-content"
            >
              {activeTab === 'info' && (
                <>
                  <div className="char-class-badge" style={{ borderColor: `${color}44` }}>
                    <span>{WEAPON_ICONS[active.weaponClass] || '⚔️'}</span>
                    <span>{active.classEn}</span>
                  </div>
                  <h2 className="char-name-display" style={{ color }}>
                    {active.nameEn}
                  </h2>
                  <h3 className="char-name-th">
                    {active.nameTh} — {active.classTh}
                  </h3>
                  <div className="char-weapon-divider">
                    <span className="divider-diamond" style={{ background: color }} />
                    <span className="divider-line" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <span className="divider-diamond" style={{ background: color }} />
                  </div>
                  <p className="char-desc">{t(active.descriptionTh, active.descriptionEn) || active.descriptionEn}</p>

                  {/* Voice line placeholder */}
                  <div className="char-voice-line">
                    <button className="char-voice-btn" style={{ borderColor: `${color}66` }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
                        <polygon points="6,3 20,12 6,21" />
                      </svg>
                      <span style={{ color }}>{t('ฟังเสียงตัวละคร', 'Listen to Voice Line')}</span>
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'skills' && (
                <div className="char-skills-list">
                  <h3 className="char-skills-title" style={{ color }}>
                    {WEAPON_ICONS[active.weaponClass] || '⚔️'} {t('สกิลของ', 'Skills of')} {t(active.nameTh, active.nameEn)}
                  </h3>
                  {skills.map((skill, i) => (
                    <motion.div
                      key={skill.nameEn}
                      className="char-skill-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{ borderLeftColor: color }}
                    >
                      <div className="char-skill-icon">{skill.icon}</div>
                      <div className="char-skill-info">
                        <div className="char-skill-name">{t(skill.nameTh, skill.nameEn)}</div>
                        <span className="char-skill-type" style={{ color }}>{skill.type}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="char-stats-panel">
                  <h3 className="char-stats-title" style={{ color }}>
                    {t('สถิติของ', 'Stats of')} {t(active.nameTh, active.nameEn)}
                  </h3>
                  <StatBar label="ATK" value={stats.atk} color={color} />
                  <StatBar label="DEF" value={stats.def} color={color} />
                  <StatBar label="HP" value={stats.hp} color={color} />
                  <StatBar label="SPD" value={stats.spd} color={color} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Character selector */}
          <div className="char-selector">
            {characters.map((char, i) => {
              const c = char.accentColor || CLASS_COLORS[char.weaponClass] || '#FFD700';
              return (
                <motion.button
                  key={char.id}
                  className={`char-selector-btn ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => { setActiveIdx(i); setActiveTab('info'); }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  style={i === activeIdx ? { borderColor: c, boxShadow: `0 0 25px ${c}44` } : {}}
                >
                  {char.portrait ? (
                    <Image src={char.portrait} alt={char.nameEn} width={60} height={60} className="char-selector-icon" />
                  ) : (
                    <Image src={`/images/characters/${char.nameEn.toLowerCase()}.png`} alt={char.nameEn} width={60} height={60} className="char-selector-icon" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
