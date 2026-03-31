'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  ExternalLink,
  FileQuestion,
  Headphones,
  Mail,
  MessageCircle,
  Send,
  Shield,
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import AnimatedSection from '@/components/ui/AnimatedSection';
import RevealSection from '@/components/ui/RevealSection';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLang } from '@/lib/lang-context';
import { cn } from '@/lib/utils';

interface SupportChannel {
  icon: ReactNode;
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
    descTh: 'เข้าร่วมชุมชน Discord ของเรา พูดคุยกับผู้เล่นและทีมงาน รับข่าวสารและอัปเดตล่าสุด',
    descEn: 'Join our Discord community. Chat with other players and the dev team. Get the latest news and updates.',
    action: { label: 'Join Discord', labelTh: 'เข้าร่วม Discord', href: 'https://discord.gg/eternaltowersaga', external: true },
    accent: 'from-indigo-500/20 to-indigo-700/10',
  },
  {
    icon: <FileQuestion size={28} />,
    titleTh: 'คำถามที่พบบ่อย',
    titleEn: 'FAQ',
    descTh: 'ค้นหาคำตอบสำหรับคำถามยอดนิยมเกี่ยวกับเกม ระบบ การลงทะเบียน และอื่น ๆ',
    descEn: 'Find answers to popular questions about the game, systems, registration, and more.',
    action: { label: 'View FAQ', labelTh: 'ดู FAQ', href: '/faq' },
    accent: 'from-emerald-500/20 to-emerald-700/10',
  },
  {
    icon: <BookOpen size={28} />,
    titleTh: 'คู่มือเกม',
    titleEn: 'Game Guide',
    descTh: 'เรียนรู้ระบบต่าง ๆ ในเกม ตั้งแต่พื้นฐานไปจนถึงเนื้อหาขั้นสูง',
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

// eslint-disable-next-line max-lines-per-function -- Page keeps support channels and shared shell layout together
export default function SupportPage() {
  const { t } = useLang();
  const { settings, socialLinks, footer } = useSiteSettings();
  const spConfig = (settings?.supportPage as Record<string, unknown> | undefined) || null;

  const heroBadge = spConfig ? t((spConfig.badgeTh as string) || '', (spConfig.badgeEn as string) || '') : '';
  const heroTitle = spConfig ? t((spConfig.titleTh as string) || '', (spConfig.titleEn as string) || '') : '';
  const heroSubtitle = spConfig ? t((spConfig.subtitleTh as string) || '', (spConfig.subtitleEn as string) || '') : '';
  const supportEmail = (spConfig?.supportEmail as string) || 'support@eternaltowersaga.com';
  const contactBadge = spConfig ? t((spConfig.contactBadgeTh as string) || '', (spConfig.contactBadgeEn as string) || '') : '';
  const contactLabel = spConfig ? t((spConfig.contactLabelTh as string) || '', (spConfig.contactLabelEn as string) || '') : '';

  const cmsChannels = Array.isArray((spConfig as Record<string, unknown>)?.channels) ? (spConfig as Record<string, unknown>).channels as Array<Record<string, unknown>> : null;
  const channels = cmsChannels?.length ? cmsChannels.map((ch) => ({
    icon: ch.icon as string,
    titleTh: (ch.titleTh as string) || '',
    titleEn: (ch.titleEn as string) || '',
    descTh: (ch.descTh as string) || '',
    descEn: (ch.descEn as string) || '',
    action: {
      label: (ch.actionLabelEn as string) || '',
      labelTh: (ch.actionLabelTh as string) || '',
      href: (ch.actionHref as string) || '#',
      external: Boolean(ch.external),
    },
    accent: 'from-amber-500/20 to-amber-700/10',
  })) : SUPPORT_CHANNELS;

  const cmsInfoItems = Array.isArray((spConfig as Record<string, unknown>)?.infoItems) ? (spConfig as Record<string, unknown>).infoItems as Array<Record<string, unknown>> : null;
  const infoItems = cmsInfoItems?.length ? cmsInfoItems.map((item) => ({
    icon: <span>{item.icon as string}</span>,
    titleTh: (item.titleTh as string) || '',
    titleEn: (item.titleEn as string) || '',
    descTh: (item.descTh as string) || '',
    descEn: (item.descEn as string) || '',
  })) : INFO_ITEMS;

  return (
    <div className="landing-page">
      <ScrollProgress />
      <Navigation />

      <main>
        <section className="page-hero">
          <div className="page-hero-bg">
            <div className="page-hero-overlay" />
          </div>

          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">{heroBadge}</span>
                <h1 className="page-hero-title">{heroTitle}</h1>
                <p className="page-hero-subtitle">
                  {heroSubtitle}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="section-highlights">
          <div className="container-custom support-container">
            <AnimatedSection variant="fadeUp">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-12">
                {channels.map((channel, index) => (
                  <motion.div
                    key={`${channel.titleEn}-${index}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                  >
                    <Card
                      className={cn(
                        'group relative h-full overflow-hidden rounded-2xl border-0',
                        'bg-gradient-to-br from-white/[0.05] to-white/[0.02]',
                        'ring-1 ring-white/[0.08] backdrop-blur-sm',
                        'transition-all duration-500 ease-out',
                        'hover:-translate-y-1 hover:ring-amber-500/30',
                        'hover:shadow-[0_8px_32px_rgba(212,168,67,0.1)]',
                      )}
                    >
                      <CardHeader className="pb-2">
                        <div
                          className={cn(
                            'mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl',
                            'bg-gradient-to-br text-amber-300 transition-transform duration-400 group-hover:scale-110',
                            channel.accent,
                          )}
                        >
                          {channel.icon}
                        </div>
                        <CardTitle className="font-display text-lg text-white">
                          {t(channel.titleTh, channel.titleEn)}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed text-white/50">
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
                              'inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium',
                              'border-amber-500/20 bg-amber-500/10 text-amber-300',
                              'transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-500/20',
                            )}
                          >
                            {t(channel.action.labelTh, channel.action.label)}
                            <ExternalLink size={14} />
                          </a>
                        ) : channel.action.href.startsWith('mailto:') ? (
                          <a
                            href={channel.action.href}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium',
                              'border-amber-500/20 bg-amber-500/10 text-amber-300',
                              'transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-500/20',
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
                              'h-10 rounded-lg px-5 text-sm',
                              'border-amber-500/20 bg-amber-500/10 text-amber-300',
                              'transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-500/20 hover:text-amber-200',
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

            <AnimatedSection variant="fadeIn" delay={0.3}>
              <div
                className={cn(
                  'rounded-2xl p-6',
                  'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
                  'ring-1 ring-white/[0.06] backdrop-blur-sm',
                )}
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {infoItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-display text-sm font-medium text-white">{t(item.titleTh, item.titleEn)}</p>
                        <p className="mt-0.5 text-xs text-white/40">{t(item.descTh, item.descEn)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection variant="fadeUp" delay={0.4}>
              <div className="mt-12 pb-8 text-center">
                <Badge
                  className={cn(
                    'mb-4 border border-amber-500/20 bg-gradient-to-r from-amber-500/15 to-amber-700/10',
                    'font-display text-xs tracking-wider text-amber-300',
                  )}
                >
                  {contactBadge}
                </Badge>
                <p className="mb-2 text-sm text-white/50">{contactLabel}</p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-display text-lg text-amber-300 transition-colors duration-300 hover:text-amber-200"
                >
                  {supportEmail}
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
