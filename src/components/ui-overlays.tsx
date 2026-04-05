'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_DISMISSED_AT_KEY = 'cookie-consent-dismissed-at';
const COOKIE_DISMISS_WINDOW_MS = 1000 * 60 * 60 * 12;

function useCookieBannerHeight(show: boolean, bannerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!show || !bannerRef.current) {
      document.body.style.removeProperty('--cookie-banner-height');
      return;
    }

    const syncBannerHeight = () => {
      const nextHeight = Math.ceil(bannerRef.current?.getBoundingClientRect().height || 0);

      if (nextHeight > 0) {
        document.body.style.setProperty('--cookie-banner-height', `${nextHeight}px`);
      }
    };

    syncBannerHeight();

    const resizeObserver = new ResizeObserver(() => syncBannerHeight());
    resizeObserver.observe(bannerRef.current);
    window.addEventListener('resize', syncBannerHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncBannerHeight);
      document.body.style.removeProperty('--cookie-banner-height');
    };
  }, [bannerRef, show]);
}

function useFooterProximity(show: boolean) {
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    if (!show) return;

    const syncFooterProximity = () => {
      const footer = document.querySelector('.site-footer');

      if (!footer) {
        setNearFooter(false);
        return;
      }

      const footerTop = footer.getBoundingClientRect().top;
      setNearFooter(footerTop < window.innerHeight - 24);
    };

    syncFooterProximity();
    window.addEventListener('scroll', syncFooterProximity, { passive: true });
    window.addEventListener('resize', syncFooterProximity);

    return () => {
      window.removeEventListener('scroll', syncFooterProximity);
      window.removeEventListener('resize', syncFooterProximity);
    };
  }, [show]);

  return nearFooter;
}

function CookieBannerContent({
  accept,
  dismiss,
}: {
  accept: () => void;
  dismiss: () => void;
}) {
  return (
    <div className="cookie-inner">
      <div className="cookie-copy">
        <span className="cookie-label">Cookies</span>
        <p className="cookie-text">
          à¹€à¸£à¸²à¹ƒà¸Šà¹‰à¸„à¸¸à¸à¸à¸µà¹‰à¸—à¸µà¹ˆà¸ˆà¸³à¹€à¸›à¹‡à¸™à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰à¹€à¸§à¹‡à¸šà¹„à¸‹à¸•à¹Œà¸—à¸³à¸‡à¸²à¸™à¹€à¸ªà¸–à¸µà¸¢à¸£à¹à¸¥à¸°à¸§à¸±à¸”à¸œà¸¥à¸à¸²à¸£à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸žà¸·à¹‰à¸™à¸à¸²à¸™à¹„à¸”à¹‰à¸­à¸¢à¹ˆà¸²à¸‡à¸–à¸¹à¸à¸•à¹‰à¸­à¸‡
          <span className="cookie-text-en"> Essential cookies keep the site stable and help measure basic performance.</span>
        </p>
      </div>

      <div className="cookie-actions">
        <button onClick={dismiss} className="cookie-dismiss" type="button">
          à¸ à¸²à¸¢à¸«à¸¥à¸±à¸‡
        </button>
        <button onClick={accept} className="cookie-accept" type="button">
          à¸¢à¸­à¸¡à¸£à¸±à¸š / Accept
        </button>
      </div>
    </div>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          className="fab-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname() || '';
  const isNewsBanner = pathname === '/news';
  const isGameGuideBanner = pathname === '/game-guide';
  const isCompactBanner = isNewsBanner || isGameGuideBanner;
  const nearFooter = useFooterProximity(show);
  const bannerClassName = [
    'cookie-banner',
    isCompactBanner ? 'cookie-banner--compact' : '',
    isNewsBanner ? 'cookie-banner--news' : '',
    isGameGuideBanner ? 'cookie-banner--game-guide' : '',
    nearFooter ? 'cookie-banner--retreat' : '',
  ].filter(Boolean).join(' ');

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    const dismissedAt = Number(localStorage.getItem(COOKIE_DISMISSED_AT_KEY) || '0');
    const dismissedRecently = dismissedAt > 0 && Date.now() - dismissedAt < COOKIE_DISMISS_WINDOW_MS;

    if (accepted || dismissedRecently || show) return;

    let timer: number | null = null;
    const startTimer = (delay: number) => {
      if (timer) return;
      timer = window.setTimeout(() => setShow(true), delay);
    };

    if (!isCompactBanner) {
      startTimer(1800);
    } else {
      const scrollThreshold = Math.max(560, Math.round(window.innerHeight * 0.72));
      const maybeScheduleShow = () => {
        if (window.scrollY >= scrollThreshold) {
          startTimer(280);
        }
      };

      maybeScheduleShow();
      window.addEventListener('scroll', maybeScheduleShow, { passive: true });

      return () => {
        if (timer) window.clearTimeout(timer);
        window.removeEventListener('scroll', maybeScheduleShow);
      };
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isCompactBanner, show]);

  useEffect(() => {
    document.body.classList.toggle('has-cookie-banner', show);

    return () => {
      document.body.classList.remove('has-cookie-banner');
      document.body.style.removeProperty('--cookie-banner-height');
    };
  }, [show]);

  useCookieBannerHeight(show, bannerRef);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.removeItem(COOKIE_DISMISSED_AT_KEY);
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem(COOKIE_DISMISSED_AT_KEY, String(Date.now()));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          ref={bannerRef}
          className={bannerClassName}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <CookieBannerContent accept={accept} dismiss={dismiss} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
