import { getPayloadClient } from '@/lib/payload';
import Navigation from '@/components/site/Navigation';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient();
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 2 }).catch(() => null) as any;

  const links = siteSettings?.navigationLinks?.filter?.((link: any) => link.visible !== false) || [];
  const registrationUrl = siteSettings?.registrationUrl || '/event';
  const logoUrl = siteSettings?.logo?.url || null;

  return (
    <>
      <Navigation links={links} registrationUrl={registrationUrl} logoUrl={logoUrl} />
      {children}
    </>
  );
}
