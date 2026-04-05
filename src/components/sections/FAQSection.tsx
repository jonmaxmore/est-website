'use client';

import React from 'react';
import { useLang } from '@/lib/lang-context';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import RevealSection from '@/components/ui/RevealSection';

interface FAQPageSettings {
  titleEn?: string;
  titleTh?: string;
  faqItems?: Array<{
    questionTh: string;
    questionEn: string;
    answerTh: string;
    answerEn: string;
  }>;
}

export default function FAQSection() {
  const { t } = useLang();
  const { settings } = useSiteSettings();
  const faqPage = (settings?.faqPage as FAQPageSettings | undefined) || null;

  const faqItems = faqPage?.faqItems?.length
    ? faqPage.faqItems.map((item) => ({
      q: t(item.questionTh, item.questionEn),
      a: t(item.answerTh, item.answerEn),
    }))
    : [];

  if (!faqItems.length) return null;

  return (
    <section id="faq" className="section-faq">
      <div className="container-custom">
        <RevealSection>
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title-gold">{t('Ã Â¸â€žÃ Â¸Â³Ã Â¸â€“Ã Â¸Â²Ã Â¸Â¡Ã Â¸â€”Ã Â¸ÂµÃ Â¹Ë†Ã Â¸Å¾Ã Â¸Å¡Ã Â¸Å¡Ã Â¹Ë†Ã Â¸Â­Ã Â¸Â¢', 'Frequently Asked Questions')}</h2>
            <div className="title-ornament"><span /><span /><span /></div>
          </div>
        </RevealSection>

        <div className="faq-list">
          {faqItems.map((item, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <details className="faq-item">
                <summary className="faq-question">
                  <span>{item.q}</span>
                  <span className="faq-icon">Ã¢â€“Â¾</span>
                </summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
