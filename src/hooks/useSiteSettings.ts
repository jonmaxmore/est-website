'use client';

import { useEffect, useState } from 'react';
import type { CMSFooterSettings, CMSNavLink } from '@/types/cms';
import { DEFAULT_FOOTER, DEFAULT_NAVIGATION_LINKS, DEFAULT_REGISTRATION_URL } from '@/lib/site-settings-defaults';

interface SiteSettingsResponse {
  site?: {
    name?: string | null;
    description?: string | null;
    logo?: {
      url?: string | null;
      alt?: string | null;
      mimeType?: string | null;
    } | null;
    seo?: {
      ogImage?: {
        url?: string | null;
        alt?: string | null;
      } | null;
    } | null;
    socialLinks?: Record<string, string | null>;
    footer?: Partial<CMSFooterSettings>;
    navigationLinks?: CMSNavLink[];
    registrationUrl?: string;
  };
  hero?: {
    backgroundImage?: {
      url?: string | null;
      alt?: string | null;
    } | null;
    backgroundVideo?: {
      url?: string | null;
      alt?: string | null;
    } | null;
  } | null;
  [key: string]: unknown;
}

let cachedSettings: SiteSettingsResponse | null | undefined
let pendingSettingsRequest: Promise<SiteSettingsResponse | null> | null = null

async function loadSiteSettings() {
  if (cachedSettings !== undefined) {
    return cachedSettings
  }

  if (!pendingSettingsRequest) {
    pendingSettingsRequest = fetch('/api/settings')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load site settings')
        }

        return response.json() as Promise<SiteSettingsResponse>
      })
      .then((data) => {
        cachedSettings = data
        return data
      })
      .catch(() => {
        cachedSettings = null
        return null
      })
      .finally(() => {
        pendingSettingsRequest = null
      })
  }

  return pendingSettingsRequest
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsResponse | null>(cachedSettings ?? null);
  const [loaded, setLoaded] = useState(cachedSettings !== undefined);

  useEffect(() => {
    let active = true;

    async function fetchSettings() {
      const data = await loadSiteSettings()

      if (active) {
        setSettings(data);
        setLoaded(true);
      }
    }

    fetchSettings();

    return () => {
      active = false;
    };
  }, []);

  return {
    settings,
    loaded,
    logoUrl: settings?.site?.logo?.url || null,
    socialLinks: settings?.site?.socialLinks || {},
    navigationLinks: settings?.site?.navigationLinks?.length ? settings.site.navigationLinks : DEFAULT_NAVIGATION_LINKS,
    registrationUrl: settings?.site?.registrationUrl || DEFAULT_REGISTRATION_URL,
    footer: {
      ...DEFAULT_FOOTER,
      ...settings?.site?.footer,
      groups: settings?.site?.footer?.groups?.length ? settings.site.footer.groups : DEFAULT_FOOTER.groups,
    },
  };
}
