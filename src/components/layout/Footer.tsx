'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang-context';
import SocialIcons from '@/components/ui/SocialIcons';

interface FooterProps {
  socialLinks: Record<string, string | null>;
  footer: {
    copyrightText: string;
    termsUrl: string;
    privacyUrl: string;
    supportUrl: string;
  };
}

export default function Footer({ socialLinks, footer }: FooterProps) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-top-decoration" />

      <div className="footer-inner-enhanced">
        {/* Column 1: Brand */}
        <div className="footer-col footer-brand-col">
          <Image src="/images/logo.png" alt="Eternal Tower Saga" width={180} height={120} className="footer-logo" />
          <p className="footer-brand-desc">
            {t(
              'เกม Casual MMORPG ผจญภัยกับสหายร่วมรบ พิชิตหอคอยนิรันดร์',
              'Casual MMORPG — Adventure with companions, conquer the Eternal Tower',
            )}
          </p>
          <SocialIcons links={socialLinks} className="footer-social" />
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">{t('ลิงก์', 'Links')}</h4>
          <nav className="footer-nav">
            <Link href="/">{t('หน้าหลัก', 'Home')}</Link>
            <Link href="/news">{t('ข่าวสาร', 'News')}</Link>
            <Link href="/event">{t('ลงทะเบียน', 'Pre-Register')}</Link>
            <Link href="/download">{t('ดาวน์โหลด', 'Download')}</Link>
            <Link href="/gallery">{t('แกลเลอรี่', 'Gallery')}</Link>
          </nav>
        </div>

        {/* Column 3: Support */}
        <div className="footer-col">
          <h4 className="footer-col-title">{t('ช่วยเหลือ', 'Support')}</h4>
          <nav className="footer-nav">
            <Link href={footer.termsUrl}>{t('ข้อกำหนดการใช้งาน', 'Terms of Service')}</Link>
            <Link href={footer.privacyUrl}>{t('นโยบายความเป็นส่วนตัว', 'Privacy Policy')}</Link>
            <a href={footer.supportUrl}>{t('ฝ่ายบริการลูกค้า', 'Customer Service')}</a>
            <a href="#faq">{t('คำถามที่พบบ่อย', 'FAQ')}</a>
          </nav>
        </div>

        {/* Column 4: Newsletter */}
        <div className="footer-col">
          <h4 className="footer-col-title">{t('รับข่าวสาร', 'Newsletter')}</h4>
          <p className="footer-newsletter-desc">
            {t('รับข่าวสารและอัพเดตเกมก่อนใคร', 'Get the latest news and game updates first')}
          </p>
          {subscribed ? (
            <motion.div
              className="footer-subscribed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t('สมัครสำเร็จ!', 'Subscribed!')} ✓
            </motion.div>
          ) : (
            <form className="footer-newsletter-form" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder={t('อีเมลของคุณ', 'Your email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-newsletter-input"
                required
              />
              <button type="submit" className="footer-newsletter-btn">
                {t('สมัคร', 'Subscribe')}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Platform Logos */}
      <div className="footer-platforms">
        <span className="footer-platform-label">{t('รองรับแพลตฟอร์ม', 'Available on')}</span>
        <div className="footer-platform-icons">
          <span className="footer-platform-icon" title="iOS">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z"/><path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          </span>
          <span className="footer-platform-icon" title="Android">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814 13.792 12 3.609 22.186a.996.996 0 0 1-.609-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707L15.6 8.9l-8.428-4.883 10.525 6.083zm.689.4 2.5 1.448c.68.394.68 1.036 0 1.43l-2.5 1.448L16.19 12l2.198-2.6z"/></svg>
          </span>
          <span className="footer-platform-icon" title="PC">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
          </span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>{footer.copyrightText.replace('Eternal Tower Saga', 'อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.)')}</p>
      </div>
    </footer>
  );
}
