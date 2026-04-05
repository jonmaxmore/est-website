import { getPayloadClient } from '@/lib/payload';
import Navigation from '@/components/site/Navigation';
import Footer from '@/components/site/Footer';
import MaintenanceIntercept from '@/components/site/MaintenanceIntercept';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient();
  const siteSettingsTask = payload.findGlobal({ slug: 'site-settings', depth: 2 }).catch(() => null);
  const maintenanceTask = payload.findGlobal({ slug: 'maintenance', depth: 1 }).catch(() => null);

  const [siteSettings, maintenanceSettings] = await Promise.all([siteSettingsTask, maintenanceTask]) as any;

  const links = siteSettings?.navigationLinks?.filter?.((link: any) => link.visible !== false) || [];
  const registrationUrl = siteSettings?.registrationUrl || '/event';
  const logoUrl = siteSettings?.logo?.url || null;
  
  const socialLinks = siteSettings?.socialLinks || {};
  const footerSettings = siteSettings?.footer || {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  };

  const isEmergency = maintenanceSettings?.isActive && maintenanceSettings?.bannerType === 'emergency';

  return (
    <>
      <MaintenanceIntercept settings={maintenanceSettings || {}} />
      {!isEmergency && (
        <>
          <Navigation links={links} registrationUrl={registrationUrl} logoUrl={logoUrl} />
          {children}
          <Footer socialLinks={socialLinks} footer={footerSettings} logoUrl={logoUrl} />
        </>
      )}
    </>
  );
}
