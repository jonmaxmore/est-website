'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang-context';
import { SOCIAL_SVGS } from '@/components/ui/SocialIcons';

interface EventNavProps {
  socialLinks: Record<string, string | null>;
}

export default function EventNav({ socialLinks }: EventNavProps) {
  const { lang, toggle, t } = useLang();

  return (
    <nav className="event-nav">
      <div className="event-nav-inner">
        <div className="nav-social">
          {Object.entries(socialLinks).map(([key, url]) => {
            if (!url || !SOCIAL_SVGS[key]) return null;
            return (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="nav-social-icon">
                {SOCIAL_SVGS[key]}
              </a>
            );
          })}
          {!Object.values(socialLinks).some(v => v) && (
            <>
              <a href="#" className="nav-social-icon" aria-label="Discord">{SOCIAL_SVGS.discord}</a>
              <a href="#" className="nav-social-icon" aria-label="Facebook">{SOCIAL_SVGS.facebook}</a>
              <a href="#" className="nav-social-icon" aria-label="YouTube">{SOCIAL_SVGS.youtube}</a>
            </>
          )}
        </div>
        <div className="event-nav-right">
          <Link href="/" className="event-back-link">â† {t('à¸«à¸™à¹‰à¸²à¹à¸£à¸', 'Home')}</Link>
          <button className="nav-lang" onClick={toggle}>{lang === 'th' ? 'EN' : 'TH'}</button>
        </div>
      </div>
    </nav>
  );
}
