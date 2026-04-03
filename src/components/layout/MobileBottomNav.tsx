'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { BookOpen, Home, Newspaper, Swords, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/lang-context';

interface NavItem {
  id: string;
  sectionId: string;
  labelEn: string;
  labelTh: string;
  icon: typeof Home;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', sectionId: 'hero', labelEn: 'Home', labelTh: 'หน้าแรก', icon: Home, href: '/#hero' },
  { id: 'characters', sectionId: 'weapons', labelEn: 'Characters', labelTh: 'ตัวละคร', icon: Swords, href: '/#weapons' },
  { id: 'guide', sectionId: 'guide', labelEn: 'Guide', labelTh: 'คู่มือ', icon: BookOpen, href: '/#guide' },
  { id: 'news', sectionId: 'news', labelEn: 'News', labelTh: 'ข่าว', icon: Newspaper, href: '/#news' },
  { id: 'register', sectionId: '', labelEn: 'Register', labelTh: 'ลงทะเบียน', icon: UserPlus, href: '/event' },
];

function findActiveSection(probe: number): string {
  let current = 'hero';

  for (const item of NAV_ITEMS) {
    if (!item.sectionId) continue;

    const element = document.getElementById(item.sectionId);
    if (element && element.offsetTop <= probe) {
      current = item.sectionId;
    }
  }

  return current;
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: 'smooth' });
}

export default function MobileBottomNav({
  registrationUrl,
}: {
  registrationUrl?: string;
}) {
  const { t } = useLang();
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const [activeSection, setActiveSection] = useState('hero');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Scroll-aware section tracking
  useEffect(() => {
    if (!isHomepage) return;

    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.45;
      setActiveSection(findActiveSection(probe));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomepage]);

  // Detect soft keyboard (hides bottom nav)
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const onResize = () => {
      const keyboardOpen = viewport.height < window.innerHeight * 0.75;
      setIsKeyboardOpen(keyboardOpen);
    };

    viewport.addEventListener('resize', onResize);
    return () => viewport.removeEventListener('resize', onResize);
  }, []);

  if (isKeyboardOpen) return null;

  const handleClick = (item: NavItem, event: MouseEvent) => {
    if (isHomepage && item.sectionId) {
      event.preventDefault();
      scrollToSection(item.sectionId);
    }
  };

  const items = NAV_ITEMS.map((item) => {
    if (item.id === 'register' && registrationUrl) {
      return { ...item, href: registrationUrl };
    }
    return item;
  });

  return (
    <nav className="mobile-bottomNav" aria-label="Mobile navigation">
      {items.map((item) => {
        const isActive = isHomepage && item.sectionId
          ? activeSection === item.sectionId
          : pathname === item.href;
        const Icon = item.icon;
        const label = t(item.labelTh, item.labelEn);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`mobile-bottomNav__item ${isActive ? 'is-active' : ''} ${item.id === 'register' ? 'mobile-bottomNav__item--cta' : ''}`}
            onClick={(event) => handleClick(item, event)}
          >
            <Icon size={20} className="mobile-bottomNav__icon" />
            <span className="mobile-bottomNav__label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
