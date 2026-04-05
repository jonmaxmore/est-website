'use client';

import { motion } from 'framer-motion';
import RevealSection from '@/components/ui/RevealSection';
import ScrollProgress from '@/components/ui/ScrollProgress';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLang } from '@/lib/lang-context';

interface FAQItem {
  q: { th: string; en: string };
  a: { th: string; en: string };
}

const DEFAULT_FAQ_ITEMS: FAQItem[] = [];

interface FAQPageSettings {
  faqItems?: Array<{
    questionTh: string;
    questionEn: string;
    answerTh: string;
    answerEn: string;
  }>;
}

// eslint-disable-next-line max-lines-per-function -- Page keeps hero, accordion, and CMS fallback logic together
export default function FAQPage() {
  const { t } = useLang();
  const { settings, socialLinks, footer } = useSiteSettings();
  const faqPage = (settings?.faqPage as FAQPageSettings | undefined) || null;

  const faqPageConfig = (settings?.faqPage as { titleEn?: string; titleTh?: string } | undefined) || null;

  const faqItems = faqPage?.faqItems?.length
    ? faqPage.faqItems.map((item) => ({
      q: { th: item.questionTh, en: item.questionEn },
      a: { th: item.answerTh, en: item.answerEn },
    }))
    : DEFAULT_FAQ_ITEMS;

  const heroTitle = faqPageConfig
    ? t(faqPageConfig.titleTh || '', faqPageConfig.titleEn || '')
    : '';

  if (!faqItems.length) {
    return (
      <div className="landing-page">
        <ScrollProgress />
                <main>
          <section className="page-hero">
            <div className="page-hero-bg"><div className="page-hero-overlay" /></div>
            <div className="container-custom">
              <RevealSection>
                <div className="page-hero-content">
                  <span className="section-badge">FAQ</span>
                  <h1 className="page-hero-title">{heroTitle}</h1>
                  <p className="page-hero-subtitle">{t('à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸„à¸³à¸–à¸²à¸¡à¸—à¸µà¹ˆà¸žà¸šà¸šà¹ˆà¸­à¸¢à¹ƒà¸™à¸•à¸­à¸™à¸™à¸µà¹‰', 'No FAQ items available yet.')}</p>
                </div>
              </RevealSection>
            </div>
          </section>
        </main>
        
      </div>
    );
  }

  return (
    <div className="landing-page">
      <ScrollProgress />
      
      <main>
        <section className="page-hero">
          <div className="page-hero-bg">
            <div className="page-hero-overlay" />
          </div>

          <div className="container-custom">
            <RevealSection>
              <div className="page-hero-content">
                <span className="section-badge">FAQ</span>
                <h1 className="page-hero-title">{heroTitle}</h1>
                <p className="page-hero-subtitle">
                  {t('à¸£à¸§à¸¡à¸„à¸³à¸•à¸­à¸šà¸ªà¸³à¸«à¸£à¸±à¸šà¸—à¸¸à¸à¸‚à¹‰à¸­à¸ªà¸‡à¸ªà¸±à¸¢à¹€à¸à¸µà¹ˆà¸¢à¸§à¸à¸±à¸š Eternal Tower Saga', 'Everything you need to know about Eternal Tower Saga')}
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="section-highlights">
          <div className="container-custom faq-container">
            <div className="faq-list">
              {faqItems.map((item, index) => (
                <motion.div
                  key={`${item.q.en}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
                >
                  <details className="faq-detail-card">
                    <summary className="faq-summary">
                      <span className="faq-summary-text">{t(item.q.th, item.q.en)}</span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="faq-chevron"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="faq-answer">{t(item.a.th, item.a.en)}</div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      

      <style jsx global>{`
        .faq-detail-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .faq-detail-card[open] {
          border-color: rgba(212, 168, 67, 0.25);
          box-shadow: 0 8px 32px rgba(212, 168, 67, 0.08);
        }

        .faq-summary {
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--white);
          font-family: var(--font-heading);
          user-select: none;
          transition: color 0.3s ease;
        }

        .faq-summary::-webkit-details-marker {
          display: none;
        }

        .faq-summary::marker {
          display: none;
          content: '';
        }

        .faq-answer {
          padding: 0 1.5rem 1.25rem;
          padding-top: 1.25rem;
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.7;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .faq-chevron {
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        details[open] .faq-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
