'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import type { ReferralLeaderboardEntry } from '@/types/event';

// eslint-disable-next-line max-lines-per-function -- leaderboard with table rendering
export default function ReferralLeaderboard() {
  const { t } = useLang();
  const [entries, setEntries] = useState<ReferralLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referral-stats?leaderboard=true')
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="event-leaderboard">
        <div className="container-custom">
          <div className="section-header">
            <span className="section-badge">{t('อันดับผู้เชิญชวน', 'REFERRAL BOARD')}</span>
            <h2 className="section-title-gold">{t('กระดานอันดับ', 'Leaderboard')}</h2>
            <div className="title-ornament"><span /><span /><span /></div>
          </div>
          <p style={{ textAlign: 'center', opacity: 0.6 }}>{t('กำลังโหลด...', 'Loading...')}</p>
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return null; // Don't render section if no referral data
  }

  return (
    <section className="event-leaderboard">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-header">
            <span className="section-badge">{t('อันดับผู้เชิญชวน', 'REFERRAL BOARD')}</span>
            <h2 className="section-title-gold">{t('กระดานอันดับ', 'Leaderboard')}</h2>
            <div className="title-ornament"><span /><span /><span /></div>
          </div>

          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>{t('อันดับ', 'Rank')}</th>
                  <th>{t('ผู้เล่น', 'Player')}</th>
                  <th>{t('เชิญตรง', 'Direct')}</th>
                  <th>{t('เชิญทางอ้อม', 'Indirect')}</th>
                  <th>{t('คะแนน', 'Points')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <motion.tr
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`leaderboard-row ${entry.rank <= 3 ? `leaderboard-top-${entry.rank}` : ''}`}
                  >
                    <td className="leaderboard-rank">
                      {entry.rank <= 3 ? (
                        <span className={`leaderboard-medal medal-${entry.rank}`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        entry.rank
                      )}
                    </td>
                    <td className="leaderboard-email">{entry.email}</td>
                    <td>{entry.level1Count}</td>
                    <td>{entry.level2Count}</td>
                    <td className="leaderboard-points">{entry.totalPoints.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
