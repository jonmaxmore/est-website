import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-subtitle">นโยบายความเป็นส่วนตัว</p>
        <p className="legal-updated">Last updated: March 17, 2026</p>

        <section className="legal-section">
          <h2>1. Introduction / บทนำ</h2>
          <p>
            Ultimate Game Co., Ltd. (บริษัท อัลติเมตเกม จำกัด) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and protect your personal data when you
            use the Eternal Tower Saga website and game services.
          </p>
          <p>
            บริษัท อัลติเมตเกม จำกัด มุ่งมั่นปกป้องความเป็นส่วนตัวของท่าน นโยบายนี้อธิบายวิธีการเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของท่าน
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Data We Collect / ข้อมูลที่เราเก็บรวบรวม</h2>
          <ul>
            <li><strong>Registration Data:</strong> Email address, preferred platform (iOS/Android/PC), region</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, actions taken on the website</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            <li><strong>Cookie Data:</strong> Preferences and analytics cookies (with your consent)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Data / วิธีใช้ข้อมูลของท่าน</h2>
          <ul>
            <li>To process your pre-registration and send game launch notifications</li>
            <li>To improve our website and game services</li>
            <li>To track registration milestones and award campaign rewards</li>
            <li>To comply with legal obligations under Thai law (PDPA)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. PDPA Compliance / การปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล</h2>
          <p>
            We comply with the Thailand Personal Data Protection Act (PDPA) B.E. 2562 (2019).
            You have the right to:
          </p>
          <ul>
            <li>Access your personal data / เข้าถึงข้อมูลส่วนบุคคลของท่าน</li>
            <li>Request correction of inaccurate data / ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
            <li>Request deletion of your data / ขอลบข้อมูลของท่าน</li>
            <li>Withdraw consent / เพิกถอนความยินยอม</li>
            <li>Data portability / ขอรับข้อมูลในรูปแบบพกพาได้</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Cookies / คุกกี้</h2>
          <p>
            We use cookies to enhance your browsing experience and collect analytics data.
            You can manage cookie preferences through your browser settings.
            Essential cookies are necessary for the website to function properly.
          </p>
          <p>
            เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การเข้าชมและเก็บข้อมูลวิเคราะห์
            ท่านสามารถจัดการคุกกี้ผ่านการตั้งค่าเบราว์เซอร์
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Data Security / ความปลอดภัยของข้อมูล</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Third-Party Services / บริการของบุคคลที่สาม</h2>
          <p>We may use the following third-party services:</p>
          <ul>
            <li><strong>Google Analytics (GA4):</strong> Website traffic analysis</li>
            <li><strong>Meta Pixel:</strong> Marketing campaign optimization</li>
            <li><strong>Cloudflare:</strong> Website security and CDN</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Contact / ติดต่อ</h2>
          <p>
            Data Protection Officer: Ultimate Game Co., Ltd.
            <br />
            Email: <a href="mailto:privacy@eternaltowersaga.com">privacy@eternaltowersaga.com</a>
          </p>
        </section>

        <div className="legal-back">
          <Link href="/">← Back to Home / กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}
