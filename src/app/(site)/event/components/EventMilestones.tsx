'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import type { EventSettings, Milestone } from '@/types/event';

interface EventMilestonesProps {
  eventSettings: EventSettings;
  milestones: Milestone[];
  registrationCount: number;
}

// eslint-disable-next-line max-lines-per-function -- milestone grid with progress bar
export default function EventMilestones({
  eventSettings,
  milestones,
  registrationCount,
}: EventMilestonesProps) {
  const { t } = useLang();

  const maxThreshold = milestones.length ? milestones[milestones.length - 1].threshold : 200000;
  const progressPercent = Math.min((registrationCount / maxThreshold) * 100, 100);

  return (
    <section className="event-milestones">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-header">
            <span className="section-badge">
              {t(eventSettings.milestoneBadgeTh || 'รางวัลกิจกรรม', eventSettings.milestoneBadgeEn || 'MILESTONE REWARDS')}
            </span>
            <h2 className="section-title-gold">
              {t(eventSettings.milestoneTitleTh || 'รางวัลกิจกรรม', eventSettings.milestoneTitleEn || 'Milestone Rewards')}
            </h2>
            <div className="title-ornament"><span /><span /><span /></div>
          </div>

          {/* Large Registration Count */}
          <div className="event-milestone-count">
            <div className="event-milestone-count-number">{registrationCount.toLocaleString()}</div>
            <div className="event-milestone-count-label">{t('ผู้ลงทะเบียน', 'Users')}</div>
          </div>

          {/* Progress Bar */}
          <div className="milestone-progress-wrap">
            <div className="milestone-progress-header">
              <span>{t('จำนวนผู้ลงทะเบียน', 'Total registrations')}</span>
              <span className="milestone-count">{registrationCount.toLocaleString()} / {maxThreshold.toLocaleString()}</span>
            </div>
            <div className="milestone-bar-dark">
              <motion.div
                className="milestone-bar-fill-dark"
                initial={{ width: '0%' }}
                whileInView={{ width: `${progressPercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              />
              {milestones.map((m) => (
                <div
                  key={m.threshold}
                  className={`milestone-node-dark ${m.unlocked ? 'unlocked' : ''}`}
                  style={{ left: `${(m.threshold / maxThreshold) * 100}%` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>

          {/* Reward Tiers Grid */}
          <div className="milestone-grid">
            {milestones.map((m, i) => (
              <motion.div
                key={m.id}
                className={`milestone-card ${m.unlocked ? 'unlocked' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
              >
                <div className="milestone-card-icon">
                  {m.unlocked ? (
                    m.rewardImage ? (
                      <Image src={m.rewardImage.url} alt={t(m.rewardTh, m.rewardEn)} width={64} height={64} className="milestone-reward-img" />
                    ) : (
                      m.icon || '🎁'
                    )
                  ) : (
                    m.lockedImage ? (
                      <Image src={m.lockedImage.url} alt="Locked" width={64} height={64} className="milestone-reward-img milestone-locked-img" />
                    ) : (
                      '🔒'
                    )
                  )}
                </div>
                <div className="milestone-card-threshold">{m.threshold.toLocaleString()}</div>
                <div className="milestone-card-reward">
                  {t(m.rewardTh, m.rewardEn)}
                </div>
                {(m.rewardDescriptionEn || m.rewardDescriptionTh) && (
                  <div className="milestone-card-description">
                    {t(m.rewardDescriptionTh || '', m.rewardDescriptionEn || '')
                      .split('\n')
                      .map((line, j) => (
                        <div key={j} className="milestone-card-desc-line">{line}</div>
                      ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
