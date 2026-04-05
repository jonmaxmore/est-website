'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/lib/lang-context';
import { SOCIAL_SVGS } from '@/components/ui/SocialIcons';
import CmsLink from '@/components/ui/CmsLink';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import type { CMSFooterSettings } from '@/types/cms';
import { DEFAULT_FOOTER } from '@/lib/site-settings-defaults';

interface FooterProps {
  socialLinks: Record<string, string | null>;
  footer: CMSFooterSettings;
  logoUrl?: string | null;
}

interface FooterGroupLink {
  href: string;
  label: string;
  openInNewTab?: boolean | null;
}

function getSocialUrl(socialLinks: Record<string, string | null>, key: string) {
  const url = socialLinks[key];
  if (url && url !== '#') return url;
  return null;
}

function buildFooterConfig(footer: CMSFooterSettings) {
  return {
    ...DEFAULT_FOOTER,
    ...footer,
    groups: footer?.groups?.length ? footer.groups : DEFAULT_FOOTER.groups,
  };
}

function FooterBrand({
  brandLogoSrc,
  brandCopy,
  communityLinks,
}: {
  brandLogoSrc: string | null;
  brandCopy: string;
  communityLinks: Array<{ platform: string; url: string }>;
}) {
  return (
    <motion.div
      className="site-footer__brand"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {brandLogoSrc ? (
        <Image
          src={brandLogoSrc}
          alt="Eternal Tower Saga"
          width={220}
          height={120}
          className="site-footer__logo"
        />
      ) : null}

      <p className="site-footer__lead">{brandCopy}</p>

      <div className="site-footer__socials">
        {communityLinks.map((item) => (
          <a
            key={item.platform}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__socialLink"
            aria-label={item.platform}
          >
            {SOCIAL_SVGS[item.platform] || null}
          </a>
        ))}
      </div>
    </motion.div>
  );
}

function FooterGroup({
  title,
  description,
  links,
  index,
}: {
  title: string;
  description?: string;
  links: FooterGroupLink[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <h4 className="site-footer__title">{title}</h4>

      {description ? <p className="site-footer__body">{description}</p> : null}

      <div className="site-footer__links">
        {links.map((link) => (
          <CmsLink
            key={`${link.href}-${link.label}`}
            href={link.href}
            openInNewTab={link.openInNewTab ?? undefined}
          >
            {link.label}
          </CmsLink>
        ))}
      </div>
    </motion.div>
  );
}

export default function Footer({ socialLinks, footer, logoUrl }: FooterProps) {
  const { t } = useLang();
  const { logoUrl: cmsLogoUrl } = useSiteSettings();
  const footerConfig = buildFooterConfig(footer);
  const footerGroups = footerConfig.groups || DEFAULT_FOOTER.groups || [];
  const brandLogoSrc = logoUrl ?? cmsLogoUrl ?? null;
  const brandCopy = t(
    footerConfig.brandCopyTh || DEFAULT_FOOTER.brandCopyTh || '',
    footerConfig.brandCopyEn || DEFAULT_FOOTER.brandCopyEn || '',
  );

  const communityLinks = Object.keys(socialLinks || {}).map((platform) => ({
    platform,
    url: getSocialUrl(socialLinks, platform),
  })).filter(item => item.url !== null) as { platform: string; url: string }[];

  return (
    <footer className="site-footer">
      <div className="site-footer__shell">
        <FooterBrand
          brandLogoSrc={brandLogoSrc}
          brandCopy={brandCopy}
          communityLinks={communityLinks}
        />

        <div className="site-footer__grid">
          {footerGroups.map((group, index) => (
            <FooterGroup
              key={`${group.titleEn}-${index}`}
              title={t(group.titleTh, group.titleEn)}
              description={group.descriptionEn || group.descriptionTh ? t(group.descriptionTh || '', group.descriptionEn || '') : undefined}
              links={group.links.map((link) => ({
                ...link,
                label: t(link.labelTh, link.labelEn),
              }))}
              index={index}
            />
          ))}
        </div>
      </div>

      <div className="site-footer__bar">
        <span className="site-footer__platforms">
          {t(
            footerConfig.platformsLabelTh || DEFAULT_FOOTER.platformsLabelTh || '',
            footerConfig.platformsLabelEn || DEFAULT_FOOTER.platformsLabelEn || '',
          )}
        </span>
        <span>{footerConfig.copyrightText}</span>
      </div>
    </footer>
  );
}
