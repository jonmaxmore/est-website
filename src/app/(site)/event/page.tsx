'use client';

import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/lang-context';
import FloatingParticles from '@/components/ui/FloatingParticles';
import LightRays from '@/components/ui/LightRays';
import ScrollProgress from '@/components/ui/ScrollProgress';
import ParallaxSection from '@/components/ui/ParallaxSection';

/* Shared layout */

/* Event sub-components */
import EventHero from './components/EventHero';
import EventForm from './components/EventForm';
import EventMilestones from './components/EventMilestones';
import ReferralLeaderboard from './components/ReferralLeaderboard';
import SuccessModal from './components/SuccessModal';

/* Hooks */
import { useEventForm } from '@/hooks/useEventForm';

/* Types & Constants */
import type { Milestone, StoreButton, EventSettings, StoreUrls } from '@/types/event';
import { DEFAULT_COUNTDOWN_TARGET } from '@/types/event';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EVENT PAGE â€” Orchestrator
   2 Independent Systems: Milestone + Referral
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function EventPage() {
  useLang(); // ensure lang context is active

  /* â”€â”€â”€ CMS Data State â”€â”€â”€ */
  const [registrationCount, setRegistrationCount] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [storeButtons, setStoreButtons] = useState<StoreButton[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [siteLogoUrl, setSiteLogoUrl] = useState<string | null>(null);
  const [eventSettings, setEventSettings] = useState<EventSettings>({});
  const [countdownTarget, setCountdownTarget] = useState(DEFAULT_COUNTDOWN_TARGET);
  const [storeUrls, setStoreUrls] = useState<StoreUrls>({
    ios: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
    android: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
    pc: '#',
  });
  const [footer, setFooter] = useState({
    copyrightText: 'Â© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  });

  /* â”€â”€â”€ Fetch CMS data â”€â”€â”€ */
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setRegistrationCount(data.totalRegistrations || 0);
        if (data.milestones?.length) {
          setMilestones(data.milestones);
        }
        if (data.storeUrls) {
          setStoreUrls(data.storeUrls);
        }
        // CMS store buttons (with tracking URLs, badge images)
        if (data.eventStoreButtons?.length) {
          setStoreButtons(data.eventStoreButtons);
        }
        // CTA button image from CMS
        if (data.ctaButtonImage) {
          setEventSettings(prev => ({ ...prev, ctaButtonImage: data.ctaButtonImage }));
        }
      })
      .catch(() => {});

    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        // Legacy store buttons from settings (lower priority)
        if (data.storeButtons && !storeButtons.length) setStoreButtons(data.storeButtons);
        if (data.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data.site?.logo?.url) setSiteLogoUrl(data.site.logo.url);
        if (data.site?.footer) setFooter(data.site.footer);
        if (data.event) {
          setEventSettings(prev => ({ ...prev, ...data.event }));
          if (data.event.countdownTarget) {
            setCountdownTarget(new Date(data.event.countdownTarget).getTime());
          }
          // Store URLs from settings too (fallback)
          if (data.event.storeUrls) {
            setStoreUrls(prev => ({ ...prev, ...data.event.storeUrls }));
          }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* â”€â”€â”€ Display Store Buttons (with fallback + dedup by platform) â”€â”€â”€ */
  const rawStoreButtons = (storeButtons.length ? storeButtons : [
    { platform: 'ios', label: 'App Store', sublabel: 'Pre-order on the', url: storeUrls.ios },
    { platform: 'android', label: 'Google Play', sublabel: 'Register on', url: storeUrls.android },
    { platform: 'pc', label: 'Windows', sublabel: 'Coming soon', url: storeUrls.pc },
  ]).map(btn => ({
    ...btn,
    url: btn.url === '#' ? (storeUrls[btn.platform as keyof StoreUrls] || '#') : btn.url,
  }));
  // Deduplicate: keep first entry per platform
  const seen = new Set<string>();
  const displayStoreButtons = rawStoreButtons.filter(btn => {
    if (seen.has(btn.platform)) return false;
    seen.add(btn.platform);
    return true;
  });

  /* â”€â”€â”€ Registration Form Hook â”€â”€â”€ */
  const form = useEventForm(
    displayStoreButtons,
    // Re-fetch real count from backend after registration (API-first: frontend must not calculate)
    () => {
      fetch('/api/stats')
        .then(r => r.json())
        .then(data => {
          if (data.displayCount != null) setRegistrationCount(data.displayCount);
          else if (data.totalRegistrations != null) setRegistrationCount(data.totalRegistrations);
        })
        .catch(() => {});
    },
  );

  return (
    <div className="landing-page">
      <ScrollProgress />
      
      <main>
        <FloatingParticles count={25} />
        <LightRays />

        {/* â•â•â• SCREEN 1: HERO â•â•â• */}
        <EventHero
          eventSettings={eventSettings}
          countdownTarget={countdownTarget}
          registrationCount={registrationCount}
          displayStoreButtons={displayStoreButtons}
          logoUrl={siteLogoUrl}
        />

        {/* â•â•â• SCREEN 2: REGISTRATION FORM â•â•â• */}
        <ParallaxSection
          backgroundUrl={eventSettings.formBackgroundImage?.url}
          speed={0.25}
          overlay="darker"
        >
          <EventForm
            eventSettings={eventSettings}
            displayStoreButtons={displayStoreButtons}
            email={form.email}
            platform={form.platform}
            region={form.region}
            loading={form.loading}
            error={form.error}
            registered={form.registered}
            referralCode={form.referralCode}
            copied={form.copied}
            setEmail={form.setEmail}
            setPlatform={form.setPlatform}
            setRegion={form.setRegion}
            handleRegister={form.handleRegister}
            copyReferralLink={form.copyReferralLink}
          />
        </ParallaxSection>

        {/* â•â•â• SCREEN 3: MILESTONES â•â•â• */}
        <ParallaxSection
          backgroundUrl={eventSettings.milestonesBackgroundImage?.url}
          speed={0.3}
          overlay="dark"
        >
          <EventMilestones
            eventSettings={eventSettings}
            milestones={milestones}
            registrationCount={registrationCount}
          />
        </ParallaxSection>

        {/* â•â•â• SCREEN 4: REFERRAL LEADERBOARD â•â•â• */}
        <ParallaxSection
          backgroundUrl={eventSettings.leaderboardBackgroundImage?.url}
          speed={0.2}
          overlay="darker"
        >
          <ReferralLeaderboard />
        </ParallaxSection>
      </main>

      

      {/* â•â•â• SUCCESS MODAL â•â•â• */}
      <SuccessModal
        show={form.showSuccessModal}
        onClose={() => form.setShowSuccessModal(false)}
        storeUrls={storeUrls}
      />
    </div>
  );
}
