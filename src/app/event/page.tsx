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
import SuccessModal from './components/SuccessModal';

/* Hooks */
import { useEventForm } from '@/hooks/useEventForm';

/* Types & Constants */
import type { Milestone, StoreButton, EventSettings } from '@/types/event';
import {
  DEFAULT_MILESTONES,
  DEFAULT_COUNTDOWN_TARGET,
  REAL_STORE_URLS,
} from '@/types/event';

/* ═══════════════════════════════════════════════
   EVENT PAGE — Orchestrator
   Uses shared Navigation + Footer for consistent UX
   ═══════════════════════════════════════════════ */
export default function EventPage() {
  const { t } = useLang();

  /* ─── CMS Data State ─── */
  const [registrationCount, setRegistrationCount] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [storeButtons, setStoreButtons] = useState<StoreButton[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [eventSettings, setEventSettings] = useState<EventSettings>({});
  const [countdownTarget, setCountdownTarget] = useState(DEFAULT_COUNTDOWN_TARGET);
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
          setMilestones(data.milestones.map((m: { threshold: number; rewardEn: string; rewardTh: string; rewardImage?: { url: string } | null }) => ({
            threshold: m.threshold,
            label: m.threshold.toLocaleString(),
            rewards: [m.rewardTh || m.rewardEn],
            rewardImage: m.rewardImage?.url || null,
          })));
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
        }
      })
      .catch(() => {});
  }, []);

  /* ─── Display Store Buttons (with fallback) ─── */
  const displayStoreButtons = (storeButtons.length ? storeButtons : [
    { platform: 'ios', label: 'App Store', sublabel: 'Pre-order on the', url: REAL_STORE_URLS.ios },
    { platform: 'android', label: 'Google Play', sublabel: 'PRE-REGISTER ON', url: REAL_STORE_URLS.android },
    { platform: 'pc', label: 'Windows', sublabel: 'Coming soon', url: '#' },
  ]).map(btn => ({
    ...btn,
    url: btn.url === '#' ? (REAL_STORE_URLS[btn.platform] || '#') : btn.url,
  }));

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

        {/* ═══ SCREEN 3: MILESTONES ═══ */}
        <EventMilestones
          eventSettings={eventSettings}
          milestones={milestones}
          registrationCount={registrationCount}
        />
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />

      {/* ═══ SUCCESS MODAL ═══ */}
      <SuccessModal
        show={form.showSuccessModal}
        onClose={() => form.setShowSuccessModal(false)}
      />
    </div>
  );
}
