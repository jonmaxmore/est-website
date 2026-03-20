'use client';

import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/lang-context';
import FloatingParticles from '@/components/ui/FloatingParticles';
import LightRays from '@/components/ui/LightRays';
import ScrollProgress from '@/components/ui/ScrollProgress';

/* Shared layout */
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

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

/* ═══════════════════════════════════════════════
   EVENT PAGE — Orchestrator
   2 Independent Systems: Milestone + Referral
   ═══════════════════════════════════════════════ */
// eslint-disable-next-line max-lines-per-function -- Page component with JSX template
export default function EventPage() {
  useLang(); // ensure lang context is active

  /* ─── CMS Data State ─── */
  const [registrationCount, setRegistrationCount] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [storeButtons, setStoreButtons] = useState<StoreButton[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [eventSettings, setEventSettings] = useState<EventSettings>({});
  const [countdownTarget, setCountdownTarget] = useState(DEFAULT_COUNTDOWN_TARGET);
  const [storeUrls, setStoreUrls] = useState<StoreUrls>({
    ios: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
    android: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
    pc: '#',
  });
  const [footer, setFooter] = useState({
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  });

  /* ─── Fetch CMS data ─── */
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
      })
      .catch(() => {});

    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.storeButtons) setStoreButtons(data.storeButtons);
        if (data.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data.site?.footer) setFooter(data.site.footer);
        if (data.event) {
          setEventSettings(data.event);
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
  }, []);

  /* ─── Display Store Buttons (with fallback + dedup by platform) ─── */
  const rawStoreButtons = (storeButtons.length ? storeButtons : [
    { platform: 'ios', label: 'App Store', sublabel: 'Pre-order on the', url: storeUrls.ios },
    { platform: 'android', label: 'Google Play', sublabel: 'PRE-REGISTER ON', url: storeUrls.android },
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

  /* ─── Registration Form Hook ─── */
  const form = useEventForm(
    displayStoreButtons,
    () => setRegistrationCount(prev => prev + 1),
  );

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        <FloatingParticles count={25} />
        <LightRays />

        {/* ═══ SCREEN 1: HERO ═══ */}
        <EventHero
          eventSettings={eventSettings}
          countdownTarget={countdownTarget}
          registrationCount={registrationCount}
          displayStoreButtons={displayStoreButtons}
        />

        {/* ═══ ORNAMENT DIVIDER ═══ */}
        <div className="ornament-divider">
          <span className="ornament-line" />
          <span className="ornament-diamond" />
          <span className="ornament-center" aria-hidden="true">✦</span>
          <span className="ornament-diamond" />
          <span className="ornament-line" />
        </div>

        {/* ═══ SCREEN 2: REGISTRATION FORM ═══ */}
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

        {/* ═══ ORNAMENT DIVIDER ═══ */}
        <div className="ornament-divider">
          <span className="ornament-line" />
          <span className="ornament-diamond" />
          <span className="ornament-center" aria-hidden="true">✦</span>
          <span className="ornament-diamond" />
          <span className="ornament-line" />
        </div>

        {/* ═══ SCREEN 3: MILESTONES (registration count system) ═══ */}
        <EventMilestones
          eventSettings={eventSettings}
          milestones={milestones}
          registrationCount={registrationCount}
        />

        {/* ═══ ORNAMENT DIVIDER ═══ */}
        <div className="ornament-divider">
          <span className="ornament-line" />
          <span className="ornament-diamond" />
          <span className="ornament-center" aria-hidden="true">✦</span>
          <span className="ornament-diamond" />
          <span className="ornament-line" />
        </div>

        {/* ═══ SCREEN 4: REFERRAL LEADERBOARD (separate system) ═══ */}
        <ReferralLeaderboard />
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />

      {/* ═══ SUCCESS MODAL ═══ */}
      <SuccessModal
        show={form.showSuccessModal}
        onClose={() => form.setShowSuccessModal(false)}
        storeUrls={storeUrls}
      />
    </div>
  );
}
