import type { ReactNode } from 'react';
import Link from 'next/link';

type LegalSection = {
  heading: string;
  content: ReactNode;
};

interface LegalDocumentPageProps {
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
}

export default function LegalDocumentPage({
  title,
  subtitle,
  updatedAt,
  sections,
}: LegalDocumentPageProps) {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">{title}</h1>
        <p className="legal-subtitle">{subtitle}</p>
        <p className="legal-updated">Last updated: {updatedAt}</p>

        {sections.map((section) => (
          <section key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            {section.content}
          </section>
        ))}

        <div className="legal-back">
          <Link href="/">â† Back to Home / à¸à¸¥à¸±à¸šà¸«à¸™à¹‰à¸²à¸«à¸¥à¸±à¸</Link>
        </div>
      </div>
    </div>
  );
}
