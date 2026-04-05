'use client';

import { usePathname } from 'next/navigation';
import { LangProvider } from '@/lib/lang-context';
import { BackToTop, CookieConsent } from '@/components/ui-overlays';
import SmoothScroll from '@/components/ui/SmoothScroll';
import { TooltipProvider } from '@/components/ui/tooltip';
import PageViewTracker from '@/components/PageViewTracker';
import PublicMarketingScripts from '@/components/site/PublicMarketingScripts';
import PublicStructuredData from '@/components/site/PublicStructuredData';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/admin-analytics');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <LangProvider>
      <TooltipProvider>
        <PublicStructuredData />
        <PublicMarketingScripts />
        <PageViewTracker />
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <BackToTop />
        <CookieConsent />
      </TooltipProvider>
    </LangProvider>
  );
}
