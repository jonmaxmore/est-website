'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import RevealSection from '@/components/ui/RevealSection';

const COMMUNITY_LINKS = [
  {
    platform: 'Discord',
    icon: '💬',
    color: '#5865F2',
    membersTh: '10,000+ สมาชิก',
    membersEn: '10,000+ Members',
    descTh: 'พูดคุย แชร์ไอเดีย หาปาร์ตี้ร่วมเล่น',
    descEn: 'Chat, share ideas, find party members',
    url: '#',
  },
  {
    platform: 'Facebook',
    icon: '👥',
    color: '#1877F2',
    membersTh: '50,000+ ผู้ติดตาม',
    membersEn: '50,000+ Followers',
    descTh: 'อัพเดตข่าวสารและกิจกรรมพิเศษ',
    descEn: 'News updates and special events',
    url: '#',
  },
  {
    platform: 'YouTube',
    icon: '🎬',
    color: '#FF0000',
    membersTh: '5,000+ ผู้ติดตาม',
    membersEn: '5,000+ Subscribers',
    descTh: 'ดูตัวอย่างเกมเพลย์และไกด์',
    descEn: 'Watch gameplay trailers and guides',
    url: '#',
  },
  {
    platform: 'TikTok',
    icon: '🎵',
    color: '#000000',
    membersTh: '20,000+ ผู้ติดตาม',
    membersEn: '20,000+ Followers',
    descTh: 'คลิปสั้นสุดมันส์จากในเกม',
    descEn: 'Short clips and highlights',
    url: '#',
  },
];

export default function CommunitySection() {
  const { t } = useLang();

  return (
    <section className="section-community">
      <div className="container-custom">
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">COMMUNITY</span>
            <h2 className="section-title-gold">{t('เข้าร่วมชุมชน', 'Join Our Community')}</h2>
            <p className="section-subtitle">{t('พบกับนักผจญภัยคนอื่นๆ และร่วมสนุกไปด้วยกัน', 'Meet fellow adventurers and have fun together')}</p>
            <div className="title-ornament"><span /><span /><span /></div>
          </div>
        </RevealSection>

        <div className="community-grid">
          {COMMUNITY_LINKS.map((item, i) => (
            <RevealSection key={item.platform} delay={i * 0.1}>
              <motion.a
                href={item.url}
                className="community-card"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -8, boxShadow: `0 12px 40px ${item.color}33` }}
              >
                <div className="community-card-header" style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}11)` }}>
                  <span className="community-card-icon">{item.icon}</span>
                  <div>
                    <h3 className="community-card-name">{item.platform}</h3>
                    <span className="community-card-members" style={{ color: item.color }}>
                      {t(item.membersTh, item.membersEn)}
                    </span>
                  </div>
                </div>
                <p className="community-card-desc">{t(item.descTh, item.descEn)}</p>
                <span className="community-card-join" style={{ color: item.color }}>
                  {t('เข้าร่วม', 'Join')} →
                </span>
              </motion.a>
            </RevealSection>
          ))}
        </div>

        {/* Discord Widget Embed Area */}
        <RevealSection delay={0.3}>
          <div className="community-discord-embed">
            <div className="discord-widget-placeholder">
              <span className="discord-widget-icon">💬</span>
              <h3>{t('Discord Live Chat', 'Discord Live Chat')}</h3>
              <p>{t('เข้าร่วม Discord เพื่อพูดคุยกับชุมชนแบบเรียลไทม์', 'Join Discord to chat with the community in real-time')}</p>
              <a href="#" className="discord-join-btn">
                {t('เข้าร่วม Discord', 'Join Discord Server')}
              </a>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
