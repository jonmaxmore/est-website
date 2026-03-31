'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CmsLink from '@/components/ui/CmsLink';
import { SOCIAL_SVGS } from '@/components/ui/SocialIcons';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLang } from '@/lib/lang-context';
import { DEFAULT_NAVIGATION_LINKS, DEFAULT_REGISTRATION_URL } from '@/lib/site-settings-defaults';
import type { CMSNavLink } from '@/types/cms';

interface NavigationProps {
  links?: CMSNavLink[];
  registrationUrl?: string;
  logoUrl?: string | null;
}

interface NavigationLinkListProps {
  links: CMSNavLink[];
  isHomepage: boolean;
  isLinkActive: (link: CMSNavLink) => boolean;
  onNavClick: (link: CMSNavLink, event: MouseEvent<HTMLElement>) => void;
  t: (th: string, en: string) => string;
}

function normalizeNavigationLinks(links?: CMSNavLink[]) {
  const source = links?.length ? links : DEFAULT_NAVIGATION_LINKS;
  return source.filter((link) => link.visible !== false);
}

function buildNavHref(link: CMSNavLink, isHomepage: boolean) {
  if (link.sectionId) {
    if (isHomepage) return `/#${link.sectionId}`;
    if (link.href === '/' || link.href === '/#') return `/#${link.sectionId}`;
  }

  return link.href || '/';
}

function normalizeSocialLinks(socialLinks: Record<string, string | null>) {
  return Object.entries(socialLinks)
    .filter(([, url]) => typeof url === 'string' && url.trim().length > 0 && url !== '#')
    .slice(0, 4)
    .map(([platform, url]) => ({ platform, url: url as string }));
}

function getDefaultSection(links: CMSNavLink[]) {
  return links.find((link) => link.sectionId)?.sectionId || 'hero';
}

function findActiveSection(links: CMSNavLink[], probe: number) {
  let current = getDefaultSection(links);

  for (const link of links) {
    if (!link.sectionId) continue;

    const element = document.getElementById(link.sectionId);
    if (element && element.offsetTop <= probe) {
      current = link.sectionId;
    }
  }

  return current;
}

function scrollToSection(sectionId: string, setActiveSection: (sectionId: string) => void) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: 'smooth' });
  setActiveSection(sectionId);
}

function useNavigationScrollState(isHomepage: boolean, links: CMSNavLink[]) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      if (!isHomepage) return;

      const probe = window.scrollY + window.innerHeight * 0.35;
      setActiveSection(findActiveSection(links, probe));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomepage, links]);

  return { scrolled, activeSection, setActiveSection };
}

function useBodyScrollLock(locked: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!locked) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [locked, onEscape]);
}

function useHomepageHashSync(isHomepage: boolean, setActiveSection: (sectionId: string) => void) {
  useEffect(() => {
    if (!isHomepage) return;

    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const element = document.getElementById(hash);
    if (!element) return;

    const timer = window.setTimeout(() => scrollToSection(hash, setActiveSection), 150);
    return () => window.clearTimeout(timer);
  }, [isHomepage, setActiveSection]);
}

function BrandLink({
  brandLogoSrc,
  subtitle,
}: {
  brandLogoSrc: string | null;
  subtitle: string;
}) {
  return (
    <Link href="/" className="site-nav__brand" aria-label="Eternal Tower Saga home">
      {brandLogoSrc ? (
        <Image
          src={brandLogoSrc}
          alt="Eternal Tower Saga"
          width={120}
          height={72}
          className="site-nav__brandMark"
        />
      ) : null}

      <span className="site-nav__brandCopy">
        <strong>Eternal Tower Saga</strong>
        <span>{subtitle}</span>
      </span>
    </Link>
  );
}

function DesktopNavigationLinks({
  links,
  isHomepage,
  isLinkActive,
  onNavClick,
  t,
}: NavigationLinkListProps) {
  return (
    <div className="site-nav__links">
      {links.map((link) => (
        <CmsLink
          key={`${link.href}-${link.sectionId || ''}-${link.labelEn}`}
          href={buildNavHref(link, isHomepage)}
          openInNewTab={link.openInNewTab}
          className={`site-nav__link ${isLinkActive(link) ? 'is-active' : ''}`}
          onClick={(event) => onNavClick(link, event)}
        >
          {t(link.labelTh, link.labelEn)}
        </CmsLink>
      ))}
    </div>
  );
}

function DesktopSocialLinks({ items }: { items: Array<{ platform: string; url: string }> }) {
  if (items.length === 0) return null;

  return (
    <div className="site-nav__socials" aria-label="Community links">
      {items.map((item) => (
        <a
          key={item.platform}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.platform}
          className="site-nav__socialLink"
        >
          {SOCIAL_SVGS[item.platform] || null}
        </a>
      ))}
    </div>
  );
}

function MobileNavigationDrawer({
  mobileOpen,
  links,
  ctaHref,
  closeMobile,
  isHomepage,
  isLinkActive,
  onNavClick,
  t,
}: NavigationLinkListProps & {
  mobileOpen: boolean;
  ctaHref: string;
  closeMobile: () => void;
}) {
  return (
    <AnimatePresence>
      {mobileOpen ? (
        <>
          <motion.button
            type="button"
            className="site-nav__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPointerDown={closeMobile}
            onClick={closeMobile}
            aria-label="Close menu"
          />

          <motion.div
            className="site-nav__drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="site-nav__drawerLinks">
              {links.map((link) => (
                <CmsLink
                  key={`drawer-${link.href}-${link.sectionId || ''}-${link.labelEn}`}
                  href={buildNavHref(link, isHomepage)}
                  openInNewTab={link.openInNewTab}
                  className={`site-nav__drawerLink ${isLinkActive(link) ? 'is-active' : ''}`}
                  onClick={(event) => onNavClick(link, event)}
                >
                  <span>{t(link.labelTh, link.labelEn)}</span>
                  <span>→</span>
                </CmsLink>
              ))}

              <Link href={ctaHref} className="site-nav__drawerCta" onClick={closeMobile}>
                {t('ลงทะเบียนล่วงหน้า', 'Pre-register')}
              </Link>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function NavigationActions({
  ctaHref,
  lang,
  mobileOpen,
  toggle,
  onToggleMobile,
  t,
}: {
  ctaHref: string;
  lang: 'th' | 'en';
  mobileOpen: boolean;
  toggle: () => void;
  onToggleMobile: () => void;
  t: (th: string, en: string) => string;
}) {
  return (
    <div className="site-nav__actions">
      <Link href={ctaHref} className="home-button home-button--primary">
        {t('ลงทะเบียน', 'Register')}
      </Link>

      <button
        className="site-nav__lang"
        onClick={toggle}
        aria-label={lang === 'th' ? 'Switch to English' : 'Switch to Thai'}
      >
        {lang === 'th' ? 'EN' : 'TH'}
      </button>

      <button
        className={`site-nav__toggle ${mobileOpen ? 'is-open' : ''}`}
        onClick={onToggleMobile}
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        <span className="site-nav__toggleLine" />
        <span className="site-nav__toggleLine" />
        <span className="site-nav__toggleLine" />
      </button>
    </div>
  );
}

export default function Navigation({ links, registrationUrl, logoUrl }: NavigationProps) {
  const { lang, toggle, t } = useLang();
  const {
    logoUrl: cmsLogoUrl,
    navigationLinks: cmsNavigationLinks,
    registrationUrl: cmsRegistrationUrl,
    socialLinks,
  } = useSiteSettings();
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const navigationLinks = useMemo(
    () => normalizeNavigationLinks(links?.length ? links : cmsNavigationLinks),
    [links, cmsNavigationLinks],
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrolled, activeSection, setActiveSection } = useNavigationScrollState(isHomepage, navigationLinks);
  const ctaHref = registrationUrl || cmsRegistrationUrl || DEFAULT_REGISTRATION_URL;
  const brandLogoSrc = logoUrl ?? cmsLogoUrl ?? null;
  const socialItems = useMemo(() => normalizeSocialLinks(socialLinks), [socialLinks]);
  const closeMobile = () => setMobileOpen(false);

  useBodyScrollLock(mobileOpen, closeMobile);
  useHomepageHashSync(isHomepage, setActiveSection);

  const handleNavClick = (link: CMSNavLink, event: MouseEvent<HTMLElement>) => {
    if (isHomepage && link.sectionId && !link.openInNewTab) {
      event.preventDefault();
      scrollToSection(link.sectionId, setActiveSection);
    }

    closeMobile();
  };

  const isLinkActive = (link: CMSNavLink) => {
    if (isHomepage && link.sectionId) {
      return activeSection === link.sectionId;
    }

    if (link.href === '/news') {
      return pathname === '/news' || pathname.startsWith('/news/');
    }

    return pathname === link.href;
  };

  return (
    <header>
      <nav className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
        <div className="site-nav__inner">
          <BrandLink
            brandLogoSrc={brandLogoSrc}
            subtitle={t('เกม RPG บนมือถือ', 'Mobile MMORPG')}
          />

          <DesktopNavigationLinks
            links={navigationLinks}
            isHomepage={isHomepage}
            isLinkActive={isLinkActive}
            onNavClick={handleNavClick}
            t={t}
          />

          <DesktopSocialLinks items={socialItems} />

          <NavigationActions
            ctaHref={ctaHref}
            lang={lang}
            mobileOpen={mobileOpen}
            toggle={toggle}
            onToggleMobile={() => setMobileOpen((open) => !open)}
            t={t}
          />
        </div>
      </nav>

      <MobileNavigationDrawer
        mobileOpen={mobileOpen}
        links={navigationLinks}
        ctaHref={ctaHref}
        closeMobile={closeMobile}
        isHomepage={isHomepage}
        isLinkActive={isLinkActive}
        onNavClick={handleNavClick}
        t={t}
      />
    </header>
  );
}
