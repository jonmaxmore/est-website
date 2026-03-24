'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/lang-context';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Mail, MessageCircle, FileQuestion, BookOpen, Send,
  ExternalLink, Clock, Shield, Headphones,
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import RevealSection from '@/components/ui/RevealSection';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════
   SUPPORT PAGE — /support
   Help center with contact channels, FAQ quick links
   ═══════════════════════════════════════════════════ */

interface SupportChannel {
  icon: React.ReactNode;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  action: { label: string; labelTh: string; href: string; external?: boolean };
  accent: string;
}

const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    icon: <Mail size={28} />,
    titleTh: 'อีเมลซัพพอร์ต',
    titleEn: 'Email Support',
    descTh: 'ส่งคำถามหรือรายงานปัญหาผ่านอีเมล ทีมงานจะตอบกลับภายใน 24-48 ชั่วโมง',
    descEn: 'Send questions or report issues via email. Our team responds within 24-48 hours.',
    action: { label: 'Send Email', labelTh: 'ส่งอีเมล', href: 'mailto:support@eternaltowersaga.com' },
    accent: 'from-amber-500/20 to-amber-700/10',
  },
  {
    icon: <MessageCircle size={28} />,
    titleTh: 'Discord Community',
    titleEn: 'Discord Community',
    descTh: 'เข้าร่วมชุมชน Discord ของเรา พูดคุยกับผู้เล่นอื่นและทีมงาน รับข่าวสารและอัปเดตล่าสุด',
    descEn: 'Join our Discord community. Chat with other players and the dev team. Get the latest news and updates.',
    action: { label: 'Join Discord', labelTh: 'เข้าร่วม Discord', href: 'https://discord.gg/eternaltowersaga', external: true },
    accent: 'from-indigo-500/20 to-indigo-700/10',
  },
  {
    icon: <FileQuestion size={28} />,
    titleTh: 'คำถามที่พบบ่อย',
    titleEn: 'FAQ',
    descTh: 'ค้นหาคำตอบสำหรับคำถามยอดนิยมเกี่ยวกับเกม ระบบ การลงทะเบียน และอื่นๆ',
    descEn: 'Find answers to popular questions about the game, systems, registration, and more.',
    action: { label: 'View FAQ', labelTh: 'ดู FAQ', href: '/faq' },
    accent: 'from-emerald-500/20 to-emerald-700/10',
  },
  {
    icon: <BookOpen size={28} />,
    titleTh: 'คู่มือเกม',
    titleEn: 'Game Guide',
    descTh: 'เรียนรู้ระบบต่างๆ ในเกม ตั้งแต่พื้นฐานไปจนถึงเนื้อหาขั้นสูง',
    descEn: 'Learn game systems from basics to advanced content.',
    action: { label: 'Read Guide', labelTh: 'อ่านคู่มือ', href: '/game-guide' },
    accent: 'from-sky-500/20 to-sky-700/10',
  },
];

const INFO_ITEMS = [
  {
    icon: <Clock size={20} />,
    titleTh: 'เวลาตอบกลับ',
    titleEn: 'Response Time',
    descTh: 'ภายใน 24-48 ชั่วโมงทำการ',
    descEn: 'Within 24-48 business hours',
  },
  {
    icon: <Shield size={20} />,
    titleTh: 'ความปลอดภัย',
    titleEn: 'Account Security',
    descTh: 'อย่าแชร์รหัสผ่านกับผู้อื่น',
    descEn: 'Never share your password',
  },
  {
    icon: <Headphones size={20} />,
    titleTh: 'ภาษาที่รองรับ',
    titleEn: 'Languages',
    descTh: 'ไทย / English',
    descEn: 'Thai / English',
  },
];

// eslint-disable-next-line max-lines-per-function -- Page component with support channels layout
export default function SupportPage() {
  const { t } = useLang();
  const [socialLinks, setSocialLinks] = useState<Record<string, string | null>>({});
  const [footer, setFooter] = useState({
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '/support',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.site?.socialLinks) setSocialLinks(data.site.socialLinks);
        if (data?.site?.footer) setFooter(data.site.footer);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        {/* ═══ Hero Banner ═══ */}
        <section className="page-hero">
          <div className="page-hero-bg">
            <div className="page-hero-overlay" />
          </div>
          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">
                  {t('ช่วยเหลือ', 'SUPPORT')}
                </span>
                <h1 className="page-hero-title">
                  {t('ศูนย์ช่วยเหลือ', 'Support Center')}
                </h1>
                <p className="page-hero-subtitle">
                  {t(
                    'มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานพร้อมดูแลคุณ',
                    'Need help? Our team is here for you.'
                  )}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ═══ Support Channels Grid ═══ */}
        <section className="section-highlights">
          <div className="container-custom" style={{ maxWidth: '960px' }}>
            <AnimatedSection variant="fadeUp">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
                {SUPPORT_CHANNELS.map((channel, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                  >
                    <Card className={cn(
                      'group relative overflow-hidden border-0 rounded-2xl h-full',
                      'bg-gradient-to-br from-white/[0.05] to-white/[0.02]',
                      'ring-1 ring-white/[0.08] hover:ring-amber-500/30',
                      'backdrop-blur-sm',
                      'transition-all duration-500 ease-out',
                      'hover:shadow-[0_8px_32px_rgba(212,168,67,0.1)]',
                      'hover:-translate-y-1',
                    )}>
                      <CardHeader className="pb-2">
                        <div className={cn(
                          'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3',
                          'bg-gradient-to-br', channel.accent,
                          'text-amber-300',
                          'transition-transform duration-400 group-hover:scale-110',
                        )}>
                          {channel.icon}
                        </div>
                        <CardTitle className="text-white text-lg font-display">
                          {t(channel.titleTh, channel.titleEn)}
                        </CardTitle>
                        <CardDescription className="text-white/50 text-sm leading-relaxed">
                          {t(channel.descTh, channel.descEn)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {channel.action.external ? (
                          <a
                            href={channel.action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium',
                              'bg-amber-500/10 text-amber-300 border border-amber-500/20',
                              'hover:bg-amber-500/20 hover:border-amber-400/40',
                              'transition-all duration-300',
                            )}
                          >
                            {t(channel.action.labelTh, channel.action.label)}
                            <ExternalLink size={14} />
                          </a>
                        ) : channel.action.href.startsWith('mailto:') ? (
                          <a
                            href={channel.action.href}
                            className={cn(
                              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium',
                              'bg-amber-500/10 text-amber-300 border border-amber-500/20',
                              'hover:bg-amber-500/20 hover:border-amber-400/40',
                              'transition-all duration-300',
                            )}
                          >
                            {t(channel.action.labelTh, channel.action.label)}
                            <Send size={14} />
                          </a>
                        ) : (
                          <Button
                            render={<Link href={channel.action.href} />}
                            variant="outline"
                            className={cn(
                              'h-10 px-5 rounded-lg text-sm',
                              'border-amber-500/20 text-amber-300',
                              'bg-amber-500/10 hover:bg-amber-500/20',
                              'hover:border-amber-400/40 hover:text-amber-200',
                              'transition-all duration-300',
                            )}
                          >
                            {t(channel.action.labelTh, channel.action.label)}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* ═══ Info Bar ═══ */}
            <AnimatedSection variant="fadeIn" delay={0.3}>
              <div className={cn(
                'rounded-2xl p-6',
                'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
                'ring-1 ring-white/[0.06]',
                'backdrop-blur-sm',
              )}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {INFO_ITEMS.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 text-amber-300 flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium font-display">
                          {t(item.titleTh, item.titleEn)}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {t(item.descTh, item.descEn)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* ═══ Contact Email Highlight ═══ */}
            <AnimatedSection variant="fadeUp" delay={0.4}>
              <div className="text-center mt-12 pb-8">
                <Badge className={cn(
                  'mb-4',
                  'bg-gradient-to-r from-amber-500/15 to-amber-700/10',
                  'text-amber-300 border border-amber-500/20',
                  'font-display text-xs tracking-wider',
                )}>
                  {t('ติดต่อโดยตรง', 'DIRECT CONTACT')}
                </Badge>
                <p className="text-white/50 text-sm mb-2">
                  {t('อีเมลทีมซัพพอร์ต', 'Support team email')}
                </p>
                <a
                  href="mailto:support@eternaltowersaga.com"
                  className="text-amber-300 hover:text-amber-200 text-lg font-display transition-colors duration-300"
                >
                  support@eternaltowersaga.com
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer socialLinks={socialLinks} footer={footer} />
    </div>
  );
}
