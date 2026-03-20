'use client';

import { useState, useCallback, useEffect } from 'react';
import { trackRegistration } from '@/lib/analytics';
import { trackReferralCopy } from '@/lib/tracking';
import type { StoreButton } from '@/types/event';

interface UseEventFormReturn {
  /* State */
  email: string;
  platform: string;
  region: string;
  loading: boolean;
  error: string;
  registered: boolean;
  referralCode: string;
  copied: boolean;
  showSuccessModal: boolean;
  /* Setters */
  setEmail: (v: string) => void;
  setPlatform: (v: string) => void;
  setRegion: (v: string) => void;
  setShowSuccessModal: (v: boolean) => void;
  /* Actions */
  handleRegister: (e: React.FormEvent) => Promise<void>;
  copyReferralLink: () => void;
}

// eslint-disable-next-line max-lines-per-function -- Hook with form logic + clipboard fallback
export function useEventForm(
  displayStoreButtons: StoreButton[],
  onRegistered?: () => void,
): UseEventFormReturn {
  const [registered, setRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [referredByCode, setReferredByCode] = useState('');

  // Extract ?ref= parameter from URL for referral tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferredByCode(refCode);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, platform, region, referredByCode: referredByCode || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setReferralCode(data.referralCode);
      setRegistered(true);
      setShowSuccessModal(true);
      onRegistered?.();

      const selectedStore = displayStoreButtons.find(btn => btn.platform === platform);
      if (selectedStore) {
        const storeUrl = selectedStore.trackingUrl || selectedStore.url;
        if (storeUrl && storeUrl !== '#') {
          setTimeout(() => {
            window.open(storeUrl, '_blank');
          }, 2000);
        }
      }

      // Track conversion
      trackRegistration({ platform, region });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = useCallback(() => {
    const link = `${window.location.origin}/event?ref=${referralCode}`;
    
    // Clipboard API requires HTTPS — fallback for HTTP/IP sites
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    setCopied(true);
    trackReferralCopy(referralCode);
    setTimeout(() => setCopied(false), 2000);
  }, [referralCode]);

  return {
    email,
    platform,
    region,
    loading,
    error,
    registered,
    referralCode,
    copied,
    showSuccessModal,
    setEmail,
    setPlatform,
    setRegion,
    setShowSuccessModal,
    handleRegister,
    copyReferralLink,
  };
}
